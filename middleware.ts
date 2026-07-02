import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);
const ADMIN_HOST = "admin.mystrenzas.com";

function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const originalHost = request.headers.get("x-original-host");
  const host = request.headers.get("host");
  const forwarded = request.headers.get("forwarded")?.match(/host=([^;]+)/i)?.[1];
  const candidate = forwardedHost ?? originalHost ?? forwarded ?? host ?? request.nextUrl.hostname;
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getRequestHostname(request);

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
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"]
};
