import { createHmac, randomUUID } from "node:crypto";
import type { AuthenticatorTransportFuture, Base64URLString, WebAuthnCredential } from "@simplewebauthn/server";
import { execute, query, queryOne } from "@/lib/db/pg";
import type { UserProfile } from "@/types/staff";

export type UserPasskey = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
  deviceName?: string | null;
  createdAt?: string | null;
  lastUsedAt?: string | null;
};

type UserPasskeyRow = {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number | string;
  transports: string | null;
  device_name: string | null;
  created_at: string | null;
  last_used_at: string | null;
};

type ChallengePayload = {
  action: "register" | "login" | "critical";
  challenge: string;
  profileId?: string;
  username?: string;
  exp: number;
};

export const PASSKEY_CHALLENGE_COOKIE = "ms_passkey_challenge";
export const PASSKEY_CRITICAL_COOKIE = "ms_passkey_critical";

let passkeyTablePromise: Promise<void> | null = null;

export function ensurePasskeyTable() {
  passkeyTablePromise ??= execute(
    `create table if not exists user_passkeys (
      id text primary key,
      user_id text not null,
      credential_id text not null unique,
      public_key text not null,
      counter bigint not null default 0,
      transports text not null default '[]',
      device_name text,
      created_at text not null default now()::text,
      last_used_at text,
      foreign key (user_id) references profiles(id) on delete cascade
    )`
  ).then(() => undefined);
  return passkeyTablePromise;
}

export async function getUserPasskeys(userId: string) {
  await ensurePasskeyTable();
  const rows = await query<UserPasskeyRow>("select * from user_passkeys where user_id = $1 order by created_at desc", [userId]);
  return rows.map(mapPasskey);
}

export async function getPasskeyByCredentialId(credentialId: string) {
  await ensurePasskeyTable();
  const row = await queryOne<UserPasskeyRow>("select * from user_passkeys where credential_id = $1", [credentialId]);
  return row ? mapPasskey(row) : null;
}

export async function createUserPasskey(input: {
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  deviceName?: string | null;
}) {
  await ensurePasskeyTable();
  const existing = await getPasskeyByCredentialId(input.credentialId);
  if (existing) throw new Error("Este dispositivo ya esta registrado.");

  const row = await queryOne<UserPasskeyRow>(
    `insert into user_passkeys (id, user_id, credential_id, public_key, counter, transports, device_name)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      randomUUID(),
      input.userId,
      input.credentialId,
      bufferToBase64URL(input.publicKey),
      input.counter,
      JSON.stringify(input.transports || []),
      input.deviceName || null
    ]
  );

  if (!row) throw new Error("No se pudo guardar la passkey.");
  return mapPasskey(row);
}

export async function updatePasskeyCounter(passkeyId: string, counter: number) {
  await ensurePasskeyTable();
  const row = await queryOne<UserPasskeyRow>(
    "update user_passkeys set counter = $1, last_used_at = now()::text where id = $2 returning *",
    [counter, passkeyId]
  );
  return row ? mapPasskey(row) : null;
}

export async function deleteUserPasskey(passkeyId: string, userId: string) {
  await ensurePasskeyTable();
  return execute("delete from user_passkeys where id = $1 and user_id = $2", [passkeyId, userId]);
}

export function passkeyToWebAuthnCredential(passkey: UserPasskey): WebAuthnCredential {
  return {
    id: passkey.credentialId as Base64URLString,
    publicKey: base64URLToBuffer(passkey.publicKey),
    counter: passkey.counter,
    transports: passkey.transports
  };
}

export function getRelyingParty(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || url.host;
  const protocol = forwardedProto || url.protocol.replace(":", "");
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (process.env.NODE_ENV === "production" && protocol !== "https") {
    throw new Error("Passkeys requieren HTTPS en produccion.");
  }

  const rpID = process.env.PASSKEY_RP_ID || (isLocalhost ? "localhost" : host.split(":")[0]);
  const origin = process.env.PASSKEY_ORIGIN || `${isLocalhost ? "http" : "https"}://${host}`;

  return {
    rpName: process.env.PASSKEY_RP_NAME || "M&S Trenzas",
    rpID,
    origin
  };
}

export function createChallengeCookie(payload: Omit<ChallengePayload, "exp">) {
  const body: ChallengePayload = {
    ...payload,
    exp: Date.now() + 5 * 60 * 1000
  };
  return signPayload(body);
}

export function readChallengeCookie(value?: string | null) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || signature !== sign(encoded)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ChallengePayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createCriticalCookie(profileId: string) {
  return signPayload({
    action: "critical",
    profileId,
    challenge: "critical-ok",
    exp: Date.now() + 5 * 60 * 1000
  });
}

export function hasValidCriticalCookie(value: string | null | undefined, profileId: string) {
  const payload = readChallengeCookie(value);
  return payload?.action === "critical" && payload.profileId === profileId;
}

export function hasValidCriticalCookieFromRequest(request: Request, profileId: string) {
  const value = parseCookieHeader(request.headers.get("cookie"))[PASSKEY_CRITICAL_COOKIE];
  return hasValidCriticalCookie(value, profileId);
}

export function makeSessionRedirect(profile: UserProfile, staffMemberId?: string | null) {
  if (profile.forcePasswordChange) return `/admin/equipo/${staffMemberId || profile.id}?password=required`;
  return profile.role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard";
}

function signPayload(payload: ChallengePayload) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function parseCookieHeader(header: string | null) {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index < 0) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-ms-trenzas-session";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function mapPasskey(row: UserPasskeyRow): UserPasskey {
  return {
    id: row.id,
    userId: row.user_id,
    credentialId: row.credential_id,
    publicKey: row.public_key,
    counter: Number(row.counter || 0),
    transports: parseTransports(row.transports),
    deviceName: row.device_name,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at
  };
}

function parseTransports(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is AuthenticatorTransportFuture => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function bufferToBase64URL(value: Uint8Array) {
  return Buffer.from(value).toString("base64url");
}

function base64URLToBuffer(value: string) {
  return new Uint8Array(Buffer.from(value, "base64url"));
}
