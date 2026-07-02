import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getVapidPublicKey, isPushConfigured, upsertPushSubscription } from "@/lib/push-notifications";

export const runtime = "nodejs";

type SubscribeBody = {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  deviceName?: string;
};

export async function GET() {
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey()
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (session.profileId === "local-admin") {
    return NextResponse.json({ error: "Usa un usuario real del panel para activar notificaciones." }, { status: 403 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Las llaves VAPID no estan configuradas." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as SubscribeBody;
    if (!body.subscription) {
      return NextResponse.json({ error: "Falta la suscripcion del navegador." }, { status: 400 });
    }

    const item = await upsertPushSubscription({
      userId: session.profileId,
      subscription: body.subscription,
      userAgent: request.headers.get("user-agent"),
      deviceName: body.deviceName || null
    });

    return NextResponse.json({ item, message: "Notificaciones activadas en este dispositivo." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo activar las notificaciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
