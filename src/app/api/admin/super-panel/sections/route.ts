import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAppPageSections, saveAppPageSections } from "@/lib/super-panel";
import type { AppPageSection } from "@/types/super-panel";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get("pageKey") || "home";
  return NextResponse.json({ items: await getAppPageSections(pageKey) });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Solo el super admin puede editar paginas publicas." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { pageKey?: string; sections?: AppPageSection[] };
    if (!body.pageKey || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: "Faltan secciones para guardar." }, { status: 400 });
    }

    const items = await saveAppPageSections(body.pageKey, body.sections);
    return NextResponse.json({ items, message: "Pagina guardada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la pagina.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
