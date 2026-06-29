import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateProfileAvatar } from "@/lib/auth/staff-avatars";
import { canManageUsers } from "@/lib/auth/require-auth";
import { getProfileById } from "@/lib/local-db";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  if (!canManageUsers(session.role, profile)) {
    return NextResponse.json({ error: "No tienes permiso para cambiar esta foto." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecciona una imagen valida." }, { status: 400 });
  }

  try {
    const result = await updateProfileAvatar(id, file);
    return NextResponse.json({ ...result, message: "Foto actualizada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la foto.";
    return NextResponse.json({ error: message }, { status: avatarErrorStatus(message) });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  if (!canManageUsers(session.role, profile)) {
    return NextResponse.json({ error: "No tienes permiso para cambiar esta foto." }, { status: 403 });
  }

  try {
    const result = await updateProfileAvatar(id, null);
    return NextResponse.json({ ...result, message: "Foto eliminada correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar la foto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function avatarErrorStatus(message: string) {
  if (message.includes("jpg") || message.includes("5MB") || message.includes("imagen valida")) return 400;
  if (message.includes("no esta configurado")) return 503;
  return 500;
}
