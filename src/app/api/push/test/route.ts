import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getUserPushSubscriptions, isPushConfigured, sendPushNotification } from "@/lib/push-notifications";

export const runtime = "nodejs";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Las llaves VAPID no estan configuradas." }, { status: 503 });
  }

  const subscriptions = await getUserPushSubscriptions(session.profileId);
  if (!subscriptions.length) {
    return NextResponse.json({ error: "Este usuario no tiene dispositivos con notificaciones activadas." }, { status: 404 });
  }

  const deliveries = await sendPushNotification(subscriptions, {
    title: "Prueba M&S Trenzas",
    body: "Las notificaciones del panel estan funcionando en este dispositivo.",
    url: "/admin/dashboard",
    tag: `push-test-${session.profileId}-${Date.now()}`
  });

  const sent = deliveries.filter((delivery) => delivery.ok).length;
  return NextResponse.json({
    ok: sent > 0,
    sent,
    total: deliveries.length,
    deliveries,
    message: sent > 0 ? "Notificacion de prueba enviada." : "No se pudo entregar la notificacion de prueba."
  });
}
