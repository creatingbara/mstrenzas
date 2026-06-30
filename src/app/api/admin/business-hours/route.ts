import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { hasPermission } from "@/lib/auth/permissions";
import { saveBusinessHours } from "@/lib/local-db";
import type { BusinessHour } from "@/types/appointment";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_availability")) {
    return NextResponse.json({ error: "No tienes permiso para gestionar disponibilidad." }, { status: 403 });
  }
  const criticalResponse = requireCriticalPasskey(request, session);
  if (criticalResponse) {
    return criticalResponse;
  }

  const body = (await request.json()) as { items?: BusinessHour[] };
  const items = body.items ?? [];

  if (!items.length) {
    return NextResponse.json({ error: "No hay horarios para guardar." }, { status: 400 });
  }

  try {
    return NextResponse.json({ items: await saveBusinessHours(items) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el horario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
