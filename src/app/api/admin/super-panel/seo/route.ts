import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAllSeoSettings, saveAppSeoSettings } from "@/lib/super-panel";
import type { AppSeoSettings } from "@/types/super-panel";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ items: await getAllSeoSettings() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Solo el super admin puede editar SEO." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { items?: AppSeoSettings[] };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "Faltan configuraciones SEO." }, { status: 400 });
    }

    const items = await saveAppSeoSettings(body.items);
    return NextResponse.json({ items, message: "SEO guardado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar SEO.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
