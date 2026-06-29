import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { canManageSettings } from "@/lib/auth/permissions";
import { getSiteSettings, saveSiteSettings } from "@/lib/local-db";
import { siteSettingsSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!canManageSettings(session.role)) {
    return NextResponse.json({ error: "No tienes permiso para ver la configuración." }, { status: 403 });
  }

  try {
    return NextResponse.json({ item: await getSiteSettings() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la configuracion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!canManageSettings(session.role)) {
    return NextResponse.json({ error: "No tienes permiso para editar la configuración." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON valido." }, { status: 400 });
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Revisa los datos de configuración.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const item = await saveSiteSettings(parsed.data);
    return NextResponse.json({ item, message: "Configuración guardada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la configuración.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
