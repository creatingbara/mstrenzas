import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { getServiceStaffIds, saveServiceStaff } from "@/lib/local-db";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para ver colaboradores del servicio." }, { status: 403 });
  }

  const { id } = await params;
  return NextResponse.json({ staffIds: await getServiceStaffIds(id) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para asignar colaboradores." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { staffIds?: string[] };
  const staffIds = Array.isArray(body.staffIds) ? body.staffIds.filter((item) => typeof item === "string") : [];

  try {
    return NextResponse.json({ staffIds: await saveServiceStaff(id, staffIds), message: "Colaboradores asignados." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron asignar colaboradores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
