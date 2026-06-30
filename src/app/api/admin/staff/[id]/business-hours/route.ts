import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { canManageCollaborators } from "@/lib/auth/require-auth";
import { getStaffMember, saveStaffBusinessHours } from "@/lib/local-db";
import type { BusinessHour } from "@/types/appointment";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role === "colaborador") {
    return NextResponse.json({ error: "No tienes permiso para gestionar colaboradores." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { items?: BusinessHour[] };

  try {
    const staff = await getStaffMember(id);
    if (!staff) {
      return NextResponse.json({ error: "Colaborador no encontrado." }, { status: 404 });
    }
    if (!canManageCollaborators(session.role, staff.role)) {
      return NextResponse.json({ error: "No tienes permiso para modificar este colaborador." }, { status: 403 });
    }
    const criticalError = requireCriticalPasskey(request, session);
    if (criticalError) return criticalError;

    const items = await saveStaffBusinessHours(id, body.items ?? []);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el horario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
