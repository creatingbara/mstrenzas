import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { canAccessAdminPath } from "@/lib/auth/permissions";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ms-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname === "/admin/login";

  if (!isAdminRoute) return response;

  const session = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session && !isAdminLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAdminLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = session.role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (session && !canAccessAdminPath(session.role, request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = session.role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
