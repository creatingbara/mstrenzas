import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { createChallengeCookie, getRelyingParty, getUserPasskeys, PASSKEY_CHALLENGE_COOKIE } from "@/lib/auth/passkeys";
import { getProfileAuthByUsername, getStaffMemberByProfileId } from "@/lib/local-db";
import { normalizeUsername } from "@/lib/utils/username";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { username } = (await request.json().catch(() => ({}))) as { username?: string };
  const normalizedUsername = normalizeUsername(username || "");

  if (!normalizedUsername) {
    return NextResponse.json({ error: "Escribe tu usuario para entrar con Face ID / Touch ID." }, { status: 400 });
  }

  const profile = await getProfileAuthByUsername(normalizedUsername);
  if (!profile || !profile.is_active) {
    return NextResponse.json({ error: "Puedes seguir entrando con tu contrasena." }, { status: 404 });
  }

  const staff = await getStaffMemberByProfileId(profile.id);
  if (profile.role === "colaborador" && (!staff || !staff.isActive)) {
    return NextResponse.json({ error: "Puedes seguir entrando con tu contrasena." }, { status: 404 });
  }

  const passkeys = await getUserPasskeys(profile.id);
  if (!passkeys.length) {
    return NextResponse.json({ error: "Puedes seguir entrando con tu contrasena." }, { status: 404 });
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
      action: "login",
      challenge: options.challenge,
      profileId: profile.id,
      username: normalizedUsername
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
