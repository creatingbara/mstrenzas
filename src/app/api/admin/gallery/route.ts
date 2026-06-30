import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { deleteGalleryItem, getGalleryItems, hideGalleryItem, saveGalleryItem } from "@/lib/local-db";
import type { GalleryItem } from "@/types/gallery";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_gallery")) {
    return NextResponse.json({ error: "No tienes permiso para ver la galeria." }, { status: 403 });
  }

  try {
    return NextResponse.json({ items: await getGalleryItems() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la galeria.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_gallery")) {
    return NextResponse.json({ error: "No tienes permiso para guardar la galeria." }, { status: 403 });
  }

  let body: GalleryItem;
  try {
    body = (await request.json()) as GalleryItem;
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON valido." }, { status: 400 });
  }

  try {
    const item = await saveGalleryItem(body);
    return NextResponse.json({ item, message: "Publicacion guardada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la publicacion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_gallery")) {
    return NextResponse.json({ error: "No tienes permiso para ocultar publicaciones." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action") || "hide";
  if (!id) {
    return NextResponse.json({ error: "Falta la publicacion." }, { status: 400 });
  }

  try {
    if (action === "delete") {
      const item = await deleteGalleryItem(id);
      if (!item) return NextResponse.json({ error: "Publicacion no encontrada." }, { status: 404 });
      return NextResponse.json({ item, action: "deleted", message: "Publicacion eliminada correctamente." });
    }

    const item = await hideGalleryItem(id);
    if (!item) return NextResponse.json({ error: "Publicacion no encontrada." }, { status: 404 });
    return NextResponse.json({ item, action: "hidden", message: "Publicacion ocultada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la publicacion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
