import { NextResponse } from "next/server";
import type { AdminSession } from "@/lib/auth/admin-session";
import { hasValidCriticalCookieFromRequest } from "@/lib/auth/passkeys";

export function requireCriticalPasskey(request: Request, session: AdminSession) {
  if (session.role !== "super_admin") return null;
  if (hasValidCriticalCookieFromRequest(request, session.profileId)) return null;

  return NextResponse.json(
    {
      error: "Confirma tu identidad con Face ID / Touch ID antes de continuar.",
      passkeyRequired: true
    },
    { status: 428 }
  );
}
