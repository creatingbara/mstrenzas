import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deletePushSubscription } from "@/lib/push-notifications";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
    if (!body.endpoint) {
      return NextResponse.json({ error: "Falta el dispositivo a desactivar." }, { status: 400 });
    }

    await deletePushSubscription(session.profileId, body.endpoint);
    return NextResponse.json({ ok: true, message: "Notificaciones desactivadas en este dispositivo." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo desactivar las notificaciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
