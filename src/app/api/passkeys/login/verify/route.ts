import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/auth/admin-session";
import {
  getPasskeyByCredentialId,
  getRelyingParty,
  makeSessionRedirect,
  passkeyToWebAuthnCredential,
  PASSKEY_CHALLENGE_COOKIE,
  readChallengeCookie,
  updatePasskeyCounter
} from "@/lib/auth/passkeys";
import { getProfileById, getStaffMemberByProfileId } from "@/lib/local-db";

export const runtime = "nodejs";

type LoginVerifyPayload = {
  response?: AuthenticationResponseJSON;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const challenge = readChallengeCookie(cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value);
  if (challenge?.action !== "login" || !challenge.profileId) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  const body = (await request.json()) as LoginVerifyPayload;
  if (!body.response) {
    return NextResponse.json({ error: "No se recibio la respuesta del dispositivo." }, { status: 400 });
  }

  const passkey = await getPasskeyByCredentialId(body.response.id);
  if (!passkey || passkey.userId !== challenge.profileId) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  const profile = await getProfileById(passkey.userId);
  if (!profile?.isActive) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  const staff = await getStaffMemberByProfileId(profile.id);
  if (profile.role === "colaborador" && (!staff || !staff.isActive)) {
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

    const token = await createAdminSessionToken({
      profileId: profile.id,
      username: profile.username,
      role: profile.role,
      staffMemberId: staff?.id || null,
      avatarUrl: profile.avatarUrl || staff?.photoUrl || null,
      passwordChangeRequired: profile.forcePasswordChange ?? false
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: makeSessionRedirect(profile, staff?.id || null)
    });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });
    response.cookies.delete(PASSKEY_CHALLENGE_COOKIE);
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }
}
