import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { getAgendaPages, saveAgendaPages } from "@/lib/local-db";
import { agendaPagesSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para editar páginas de agenda." }, { status: 403 });
  }

  return NextResponse.json({ pages: await getAgendaPages() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_services")) {
    return NextResponse.json({ error: "No tienes permiso para editar páginas de agenda." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = agendaPagesSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Revisa las páginas de agenda.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const pages = await saveAgendaPages(parsed.data.pages);
    return NextResponse.json({ pages, message: "Páginas de agenda actualizadas correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron guardar las páginas de agenda.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
