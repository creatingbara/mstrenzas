import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { syncProfileAndStaffMember, updateUserPassword, updateUserUsername } from "@/lib/auth/admin-users";
import { requireCriticalPasskey } from "@/lib/auth/critical-passkey";
import { passwordPolicyMessage } from "@/lib/auth/password-policy";
import { canManageUsers } from "@/lib/auth/require-auth";
import { deleteUserProfile, getProfileById, getProfiles, setProfileActive } from "@/lib/local-db";
import { normalizeUsername, validateUsername } from "@/lib/utils/username";
import type { StaffRole } from "@/types/staff";

export const runtime = "nodejs";

type UserPayload = {
  profileId?: string;
  fullName?: string;
  username?: string;
  email?: string | null;
  phone?: string | null;
  role?: StaffRole;
  isActive?: boolean;
  temporaryPassword?: string | null;
};

const staffRoles: StaffRole[] = ["super_admin", "admin", "colaborador"];

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role === "colaborador") {
    return NextResponse.json({ error: "No tienes permiso para gestionar usuarios." }, { status: 403 });
  }

  const body = (await request.json()) as UserPayload;
  const username = normalizeUsername(body.username || "");
  const usernameError = validateUsername(username);
  if (body.role && !staffRoles.includes(body.role)) {
    return NextResponse.json({ error: "Rol invalido." }, { status: 400 });
  }

  if (!body.profileId || usernameError) {
    return NextResponse.json({ error: usernameError || "Falta el usuario." }, { status: 400 });
  }

  const targetProfile = await getProfileById(body.profileId);
  if (!targetProfile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  if (!canManageUsers(session.role, targetProfile)) {
    return NextResponse.json({ error: "No tienes permiso para modificar este usuario." }, { status: 403 });
  }
  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const nextRole = body.role || targetProfile.role;
  if (!canManageUsers(session.role, { ...targetProfile, role: nextRole })) {
    return NextResponse.json({ error: "No tienes permiso para asignar este rol." }, { status: 403 });
  }

  if (session.profileId === body.profileId && body.isActive === false) {
    return NextResponse.json({ error: "No puedes desactivar tu propio usuario." }, { status: 400 });
  }

  if (body.temporaryPassword) {
    const passwordError = passwordPolicyMessage(body.temporaryPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
  }

  try {
    if (username !== targetProfile.username) {
      await updateUserUsername(targetProfile, username);
    }

    const profile = await syncProfileAndStaffMember({
      profileId: body.profileId,
      username,
      fullName: body.fullName?.trim() || targetProfile.fullName,
      email: body.email ?? targetProfile.email,
      phone: body.phone ?? targetProfile.phone,
      role: nextRole,
      isActive: body.isActive ?? targetProfile.isActive
    });

    if (!profile) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (body.temporaryPassword) {
      await updateUserPassword(profile, body.temporaryPassword, { forceChange: true });
    }

    return NextResponse.json({
      item: profile,
      message: body.temporaryPassword ? "Contraseña actualizada correctamente." : "Usuario actualizado correctamente."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el usuario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role === "colaborador") {
    return NextResponse.json({ error: "No tienes permiso para gestionar usuarios." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const action = searchParams.get("action") || "deactivate";

  if (!profileId) {
    return NextResponse.json({ error: "Falta el usuario." }, { status: 400 });
  }
  if (profileId === session.profileId) {
    return NextResponse.json({ error: "No puedes desactivar o eliminar tu propio usuario." }, { status: 400 });
  }

  const targetProfile = await getProfileById(profileId);
  if (!targetProfile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  if (!canManageUsers(session.role, targetProfile)) {
    return NextResponse.json({ error: "No tienes permiso para modificar este usuario." }, { status: 403 });
  }
  const criticalError = requireCriticalPasskey(request, session);
  if (criticalError) return criticalError;

  const activeSuperAdmins = (await getProfiles()).filter((profile) => profile.role === "super_admin" && profile.isActive);
  if (targetProfile.role === "super_admin" && activeSuperAdmins.length <= 1) {
    return NextResponse.json({ error: "No puedes dejar el panel sin un super admin activo." }, { status: 400 });
  }

  try {
    if (action === "delete") {
      const result = await deleteUserProfile(profileId);
      if (!result.ok) {
        return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
      }

      return NextResponse.json({
        ...result,
        message:
          result.action === "deactivated"
            ? "Este usuario tiene citas registradas como colaborador. Por seguridad fue desactivado y se conservó el historial."
            : "Usuario eliminado correctamente."
      });
    }

    const item = await setProfileActive(profileId, action === "activate");
    if (!item) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      item,
      action: action === "activate" ? "activated" : "deactivated",
      message: action === "activate" ? "Usuario activado correctamente." : "Usuario desactivado correctamente."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el usuario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
