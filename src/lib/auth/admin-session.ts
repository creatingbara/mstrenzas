import type { StaffRole } from "@/types/staff";

export const ADMIN_SESSION_COOKIE = "ms_admin_session";

export type AdminSession = {
  profileId: string;
  username: string;
  role: StaffRole;
  staffMemberId?: string | null;
  avatarUrl?: string | null;
  passwordChangeRequired?: boolean;
};

type SessionPayload = AdminSession & {
  exp: number;
};

export async function createAdminSessionToken(session: AdminSession) {
  const payload: SessionPayload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

    return {
      profileId: payload.profileId,
      username: payload.username,
      role: payload.role,
      staffMemberId: payload.staffMemberId ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      passwordChangeRequired: payload.passwordChangeRequired ?? false
    };
  } catch {
    return null;
  }
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }

  return "dev-ms-trenzas-session";
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// btoa/atob solo aceptan Latin-1: con un avatarUrl o username con caracteres
// unicode lanzarían excepción y romperían el login. Se codifica vía UTF-8.
function base64UrlEncode(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}
