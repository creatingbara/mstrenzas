import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAppNavigationItems, saveAppNavigationItems } from "@/lib/super-panel";
import type { AppNavigationItem } from "@/types/super-panel";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ items: await getAppNavigationItems() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Solo el super admin puede editar el menu publico." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { items?: AppNavigationItem[] };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "Faltan items de navegacion." }, { status: 400 });
    }

    const items = await saveAppNavigationItems(body.items);
    return NextResponse.json({ items, message: "Menu publico guardado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el menu publico.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
