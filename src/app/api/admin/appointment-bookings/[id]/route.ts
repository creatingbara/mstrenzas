import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { canViewAppointment } from "@/lib/auth/require-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { deleteAppointmentBooking, getAdminAppointmentById, updateAppointmentStatus } from "@/lib/local-db";
import type { AppointmentStatus } from "@/types/appointment";

export const runtime = "nodejs";

const statuses: AppointmentStatus[] = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: AppointmentStatus };

  if (!body.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  try {
    const current = await getAdminAppointmentById(id);
    if (!current) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }
    if (!canViewAppointment(session, current)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
    const criticalResponse = requireCriticalPasskey(request, session);
    if (criticalResponse) {
      return criticalResponse;
    }

    const item = await updateAppointmentStatus(id, body.status);
    if (!item) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la cita.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_bookings")) {
    return NextResponse.json({ error: "No tienes permiso para eliminar citas." }, { status: 403 });
  }
  const criticalResponse = requireCriticalPasskey(request, session);
  if (criticalResponse) {
    return criticalResponse;
  }

  const { id } = await params;

  try {
    const current = await getAdminAppointmentById(id);
    if (!current) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    const deleted = await deleteAppointmentBooking(id);
    if (!deleted) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Cita eliminada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar la cita.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
