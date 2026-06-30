import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  createCriticalCookie,
  getPasskeyByCredentialId,
  getRelyingParty,
  passkeyToWebAuthnCredential,
  PASSKEY_CHALLENGE_COOKIE,
  PASSKEY_CRITICAL_COOKIE,
  readChallengeCookie,
  updatePasskeyCounter
} from "@/lib/auth/passkeys";

export const runtime = "nodejs";

type CriticalVerifyPayload = {
  response?: AuthenticationResponseJSON;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const challenge = readChallengeCookie(cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value);
  if (challenge?.action !== "critical" || challenge.profileId !== session.profileId) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  const body = (await request.json()) as CriticalVerifyPayload;
  if (!body.response) {
    return NextResponse.json({ error: "No se recibio la respuesta del dispositivo." }, { status: 400 });
  }

  const passkey = await getPasskeyByCredentialId(body.response.id);
  if (!passkey || passkey.userId !== session.profileId) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  try {
    const { origin, rpID } = getRelyingParty(request);
    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: passkeyToWebAuthnCredential(passkey),
      requireUserVerification: true
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
    }

    await updatePasskeyCounter(passkey.id, verification.authenticationInfo.newCounter);

    const response = NextResponse.json({ ok: true, message: "Identidad verificada correctamente." });
    response.cookies.set(PASSKEY_CRITICAL_COOKIE, createCriticalCookie(session.profileId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 300
    });
    response.cookies.delete(PASSKEY_CHALLENGE_COOKIE);
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }
}
