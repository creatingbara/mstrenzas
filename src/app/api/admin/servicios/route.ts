import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { hasPermission } from "@/lib/auth/permissions";
import { createCustomService, deleteService, getServices, updateServiceOverride } from "@/lib/local-db";
import { serviceCreateSchema, serviceOverrideSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para ver los servicios." }, { status: 403 });
  }

  return NextResponse.json({ items: await getServices() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para editar servicios." }, { status: 403 });
  }

  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const body = await request.json();
  const parsed = serviceOverrideSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Revisa los datos del servicio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { serviceId, ...patch } = parsed.data;

  try {
    const item = await updateServiceOverride(serviceId, patch);
    if (!item) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ item, message: "Servicio guardado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el servicio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para crear servicios." }, { status: 403 });
  }

  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const body = await request.json();
  const parsed = serviceCreateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Revisa los datos del servicio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const item = await createCustomService(parsed.data);
    return NextResponse.json({ item, message: "Servicio creado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el servicio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para eliminar servicios." }, { status: 403 });
  }

  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "Falta el servicio." }, { status: 400 });
  }

  try {
    const item = await deleteService(serviceId);
    if (!item) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    return NextResponse.json({ item, message: "Servicio eliminado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el servicio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
