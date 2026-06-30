import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { hasPermission } from "@/lib/auth/permissions";
import { getBookingMenuItems, saveBookingMenuItems } from "@/lib/local-db";
import { bookingMenuSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para editar Agenda Cita." }, { status: 403 });
  }

  return NextResponse.json({ items: await getBookingMenuItems() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para editar Agenda Cita." }, { status: 403 });
  }

  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const body = await request.json();
  const parsed = bookingMenuSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Revisa las opciones de Agenda Cita.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const items = await saveBookingMenuItems(parsed.data.items);
    return NextResponse.json({ items, message: "Agenda Cita actualizada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar Agenda Cita.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
