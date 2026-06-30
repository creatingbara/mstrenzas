import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createChallengeCookie, getRelyingParty, getUserPasskeys, PASSKEY_CHALLENGE_COOKIE } from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const passkeys = await getUserPasskeys(session.profileId);
  if (!passkeys.length) {
    return NextResponse.json({ error: "Activa Face ID / Touch ID antes de realizar esta accion critica." }, { status: 428 });
  }

  try {
    const { rpID } = getRelyingParty(request);
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports
      })),
      userVerification: "required"
    });

    const response = NextResponse.json(options);
    response.cookies.set(PASSKEY_CHALLENGE_COOKIE, createChallengeCookie({
      action: "critical",
      challenge: options.challenge,
      profileId: session.profileId
    }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 300
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar Face ID / Touch ID.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
