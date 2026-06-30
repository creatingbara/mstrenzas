import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  createUserPasskey,
  getRelyingParty,
  PASSKEY_CHALLENGE_COOKIE,
  readChallengeCookie
} from "@/lib/auth/passkeys";

export const runtime = "nodejs";

type RegisterVerifyPayload = {
  response?: RegistrationResponseJSON;
  deviceName?: string | null;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const challenge = readChallengeCookie(cookieStore.get(PASSKEY_CHALLENGE_COOKIE)?.value);
  if (challenge?.action !== "register" || challenge.profileId !== session.profileId) {
    return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
  }

  const body = (await request.json()) as RegisterVerifyPayload;
  if (!body.response) {
    return NextResponse.json({ error: "No se recibio la respuesta del dispositivo." }, { status: 400 });
  }

  try {
    const { origin, rpID } = getRelyingParty(request);
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "No se pudo verificar tu identidad." }, { status: 400 });
    }

    const credential = verification.registrationInfo.credential;
    const item = await createUserPasskey({
      userId: session.profileId,
      credentialId: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports,
      deviceName: body.deviceName || deviceLabel(body.response)
    });

    const response = NextResponse.json({ item, message: "Face ID / Touch ID activado correctamente." });
    response.cookies.delete(PASSKEY_CHALLENGE_COOKIE);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo verificar tu identidad.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function deviceLabel(response: RegistrationResponseJSON) {
  const transports = response.response.transports?.join(", ");
  return transports ? `Dispositivo ${transports}` : "Dispositivo seguro";
}
