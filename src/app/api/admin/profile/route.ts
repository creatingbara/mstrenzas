import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getProfileById, updateProfileAccess } from "@/lib/local-db";

export const runtime = "nodejs";

type ProfilePayload = {
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
};

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const profile = await getProfileById(session.profileId);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as ProfilePayload;
  const email = body.email?.trim() || profile.email;
  const phone = body.phone?.trim() || profile.phone || "";
  const instagram = body.instagram?.trim() || null;

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Escribe un correo valido." }, { status: 400 });
  }

  try {
    const item = await updateProfileAccess({
      profileId: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      email,
      phone,
      instagram,
      avatarUrl: profile.avatarUrl || null,
      role: profile.role,
      isActive: profile.isActive
    });

    if (!item) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ item, message: "Perfil actualizado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el perfil.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
