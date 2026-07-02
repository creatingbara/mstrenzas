import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAppThemeSettings, saveAppThemeSettings } from "@/lib/super-panel";
import type { AppThemeSettings } from "@/types/super-panel";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session || (session.role !== "super_admin" && session.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ item: await getAppThemeSettings() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Solo el super admin puede editar la identidad visual." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as AppThemeSettings;
    const item = await saveAppThemeSettings(body);
    return NextResponse.json({ item, message: "Identidad visual guardada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la identidad visual.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
