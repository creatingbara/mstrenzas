import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);
const ADMIN_HOST = "admin.mystrenzas.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getRequestHostname(request: NextRequest) {
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const originalHost = request.headers.get("x-original-host");
  const forwarded = request.headers.get("forwarded")?.match(/host=([^;]+)/i)?.[1];
  const candidate = host ?? request.nextUrl.hostname ?? forwardedHost ?? originalHost ?? forwarded;
  return candidate.split(",")[0]?.split(":")[0]?.trim().toLowerCase();
}

function isStaticOrApiPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  );
}

function isAdminApiPath(pathname: string) {
  return pathname.startsWith("/api/admin") || pathname.startsWith("/api/passkeys") || pathname.startsWith("/api/push");
}

function isPublicMutationApiPath(pathname: string) {
  return pathname === "/api/appointments" || pathname === "/api/booking-references";
}

function isAllowedOrigin(request: NextRequest, allowedHosts: Set<string>) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const host = originUrl.hostname.toLowerCase();
    return originUrl.protocol === "https:" && allowedHosts.has(host);
  } catch {
    return false;
  }
}

function isAllowedLocalOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    return LOCAL_HOSTS.has(originUrl.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isLocalHost(hostname?: string) {
  return Boolean(hostname && LOCAL_HOSTS.has(hostname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getRequestHostname(request);
  const isUnsafeMethod = UNSAFE_METHODS.has(request.method.toUpperCase());

  if (isAdminApiPath(pathname) && hostname !== ADMIN_HOST && !isLocalHost(hostname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isUnsafeMethod && isAdminApiPath(pathname) && !isAllowedOrigin(request, new Set([ADMIN_HOST])) && !isAllowedLocalOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  if (isUnsafeMethod && isPublicMutationApiPath(pathname) && !isAllowedOrigin(request, PUBLIC_HOSTS) && !isAllowedLocalOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  if (PUBLIC_HOSTS.has(hostname) && pathname.startsWith("/admin")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.hostname = ADMIN_HOST;
    return NextResponse.redirect(redirectUrl);
  }

  if (hostname === ADMIN_HOST && !pathname.startsWith("/admin") && !isStaticOrApiPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"]
};
