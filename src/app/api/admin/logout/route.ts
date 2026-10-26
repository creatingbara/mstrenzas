import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session";
import { requireAdminOrigin } from "@/lib/security/origin-guard";

export async function POST(request: Request) {
  const originError = requireAdminOrigin(request);
  if (originError) return originError;

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
