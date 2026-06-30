import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/lib/admin-auth";
import { updateUserPassword } from "@/lib/auth/admin-users";
import { passwordPolicyMessage } from "@/lib/auth/password-policy";
import { getProfileById, updateProfileAccess, verifyLocalProfilePassword } from "@/lib/local-db";

export const runtime = "nodejs";

type ProfilePayload = {
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  currentPassword?: string | null;
  newPassword?: string | null;
  confirmPassword?: string | null;
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
  const wantsPasswordChange = Boolean(body.currentPassword || body.newPassword || body.confirmPassword);

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Escribe un correo valido." }, { status: 400 });
  }

  if (profile.forcePasswordChange && !wantsPasswordChange) {
    return NextResponse.json({ error: "Debes cambiar tu contrasena para continuar." }, { status: 400 });
  }

  if (wantsPasswordChange) {
    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      return NextResponse.json({ error: "Completa la contrasena anterior, la nueva y la confirmacion." }, { status: 400 });
    }
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ error: "La nueva contrasena y la confirmacion no coinciden." }, { status: 400 });
    }
    const passwordError = passwordPolicyMessage(body.newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    if (body.currentPassword === body.newPassword) {
      return NextResponse.json({ error: "Esa contrasena ya fue utilizada. Elige una diferente." }, { status: 400 });
    }

    const passwordMatches =
      (await verifyLocalProfilePassword(profile.id, body.currentPassword)) ||
      (await authenticateWithSupabase(profile.email, body.currentPassword));

    if (!passwordMatches) {
      return NextResponse.json({ error: "La contrasena anterior no es correcta." }, { status: 400 });
    }
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

    if (wantsPasswordChange && body.newPassword) {
      await updateUserPassword(item, body.newPassword);
    }

    return NextResponse.json({
      item,
      message: wantsPasswordChange ? "Perfil y contrasena actualizados correctamente." : "Perfil actualizado correctamente."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el perfil.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function authenticateWithSupabase(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return !error;
}
