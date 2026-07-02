import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAppFooterSettings, saveAppFooterSettings } from "@/lib/super-panel";
import type { AppFooterSettings } from "@/types/super-panel";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session || (session.role !== "super_admin" && session.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ item: await getAppFooterSettings() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Solo el super admin puede editar el footer." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as AppFooterSettings;
    const item = await saveAppFooterSettings(body);
    return NextResponse.json({ item, message: "Footer guardado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el footer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
