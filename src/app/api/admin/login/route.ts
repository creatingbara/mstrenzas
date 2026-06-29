import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/auth/admin-session";
import { getProfileAuthByUsername, getStaffMemberByProfileId, verifyLocalProfilePassword } from "@/lib/local-db";
import { normalizeUsername } from "@/lib/utils/username";

export const runtime = "nodejs";

const GENERIC_ERROR = "Usuario o contraseña incorrectos.";
const RATE_LIMIT_ERROR = "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as { username?: string; password?: string };
  const normalizedUsername = normalizeUsername(username || "");
  const attemptKey = `${getClientKey(request)}:${normalizedUsername}`;

  if (isLoginRateLimited(attemptKey)) {
    return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
  }

  if (!normalizedUsername || !password) {
    registerFailedAttempt(attemptKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const profile = await getProfileAuthByUsername(normalizedUsername);
  const localAdminUsername = normalizeUsername(process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL?.split("@")[0] || "admin");
  const localAdminEmail = process.env.ADMIN_EMAIL || "admin@ms-trenzas.local";

  if (!profile && normalizedUsername !== localAdminUsername) {
    registerFailedAttempt(attemptKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (profile && !profile.is_active) {
    registerFailedAttempt(attemptKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const email = profile?.email || localAdminEmail;
  const authenticated = await authenticateWithSupabase(email, password);
  const authenticatedLocally = profile ? await verifyLocalProfilePassword(profile.id, password) : false;
  const canUseLocalAdminFallback =
    Boolean(process.env.ADMIN_PASSWORD) &&
    safeEqual(password, process.env.ADMIN_PASSWORD) &&
    (normalizedUsername === localAdminUsername || (profile?.role === "super_admin" && profile.email === localAdminEmail));

  if (!authenticated && !authenticatedLocally && !canUseLocalAdminFallback) {
    registerFailedAttempt(attemptKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const staff = profile ? await getStaffMemberByProfileId(profile.id) : null;
  if (profile?.role === "colaborador" && (!staff || !staff.isActive)) {
    registerFailedAttempt(attemptKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  loginAttempts.delete(attemptKey);

  const role = profile?.role || "super_admin";
  const token = await createAdminSessionToken({
    profileId: profile?.id || "local-admin",
    username: normalizedUsername,
    role,
    staffMemberId: staff?.id || null
  });
  const response = NextResponse.json({
    ok: true,
    redirectTo: role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard"
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}

async function authenticateWithSupabase(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return !error;
}

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "local";
}

function isLoginRateLimited(key: string) {
  const current = loginAttempts.get(key);
  if (!current) return false;
  if (current.resetAt <= Date.now()) {
    loginAttempts.delete(key);
    return false;
  }
  return current.count >= MAX_LOGIN_ATTEMPTS;
}

function registerFailedAttempt(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  current.count += 1;
}

function safeEqual(a: string, b?: string) {
  if (!b) return false;
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
