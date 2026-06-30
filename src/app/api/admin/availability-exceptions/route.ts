import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { hasPermission } from "@/lib/auth/permissions";
import { deleteAvailabilityException, saveAvailabilityException } from "@/lib/local-db";

export const runtime = "nodejs";

type ExceptionPayload = {
  exceptionDate?: string;
  isAvailable?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_availability")) {
    return NextResponse.json({ error: "No tienes permiso para gestionar disponibilidad." }, { status: 403 });
  }
  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const body = (await request.json()) as ExceptionPayload;

  if (!body.exceptionDate) {
    return NextResponse.json({ error: "Selecciona una fecha." }, { status: 400 });
  }

  try {
    const isAvailable = Boolean(body.isAvailable);
    const item = await saveAvailabilityException({
      exceptionDate: body.exceptionDate,
      isAvailable,
      startTime: isAvailable ? body.startTime ?? null : null,
      endTime: isAvailable ? body.endTime ?? null : null,
      reason: body.reason || null
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la excepcion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_availability")) {
    return NextResponse.json({ error: "No tienes permiso para gestionar disponibilidad." }, { status: 403 });
  }
  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  }

  try {
    await deleteAvailabilityException(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar la excepcion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
