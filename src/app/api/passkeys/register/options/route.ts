import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createChallengeCookie, getRelyingParty, getUserPasskeys, PASSKEY_CHALLENGE_COOKIE } from "@/lib/auth/passkeys";
import { getProfileById } from "@/lib/local-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const profile = await getProfileById(session.profileId);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }

  try {
    const { rpName, rpID } = getRelyingParty(request);
    const passkeys = await getUserPasskeys(profile.id);
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: profile.username,
      userID: new TextEncoder().encode(profile.id),
      userDisplayName: profile.fullName,
      attestationType: "none",
      excludeCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required"
      }
    });

    const response = NextResponse.json(options);
    response.cookies.set(PASSKEY_CHALLENGE_COOKIE, createChallengeCookie({
      action: "register",
      challenge: options.challenge,
      profileId: profile.id
    }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 300
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar el registro de Face ID / Touch ID.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
