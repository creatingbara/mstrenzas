import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { upsertSupabaseAuthUser } from "@/lib/auth/admin-users";
import { passwordPolicyMessage } from "@/lib/auth/password-policy";
import { canManageCollaborators } from "@/lib/auth/require-auth";
import {
  deleteStaffMember,
  getStaffAppointmentCount,
  getStaffMember,
  saveStaffMember,
  setStaffActive,
  updateProfilePassword,
  updateStaffAuthUserId
} from "@/lib/local-db";
import { internalEmailForUsername, normalizeUsername, validateUsername } from "@/lib/utils/username";
import type { StaffRole } from "@/types/staff";

export const runtime = "nodejs";

type StaffPayload = {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string | null;
  phone?: string;
  instagram?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  role?: StaffRole;
  isActive?: boolean;
  specialty?: string | null;
  calendarColor?: string | null;
  temporaryPassword?: string | null;
};

const staffRoles: StaffRole[] = ["super_admin", "admin", "colaborador"];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role === "colaborador") {
    return NextResponse.json({ error: "No tienes permiso para gestionar colaboradores." }, { status: 403 });
  }

  const body = (await request.json()) as StaffPayload;
  const username = normalizeUsername(body.username || "");
  const usernameError = validateUsername(username);
  const currentStaff = body.id ? await getStaffMember(body.id) : null;
  if (body.role && !staffRoles.includes(body.role)) {
    return NextResponse.json({ error: "Rol invalido." }, { status: 400 });
  }
  const desiredRole = body.role || currentStaff?.role || "colaborador";

  if (currentStaff && !canManageCollaborators(session.role, currentStaff.role)) {
    return NextResponse.json({ error: "No tienes permiso para editar este colaborador." }, { status: 403 });
  }

  if (!canManageCollaborators(session.role, desiredRole)) {
    return NextResponse.json({ error: "No tienes permiso para asignar este rol." }, { status: 403 });
  }

  if (currentStaff?.profileId === session.profileId && body.isActive === false) {
    return NextResponse.json({ error: "No puedes desactivar tu propio usuario." }, { status: 400 });
  }

  if (!body.fullName || !body.phone || usernameError) {
    return NextResponse.json({ error: usernameError || "Nombre, usuario y teléfono son requeridos." }, { status: 400 });
  }

  if (body.temporaryPassword) {
    const passwordError = passwordPolicyMessage(body.temporaryPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
  }

  try {
    const email = body.email?.trim() || internalEmailForUsername(username);
    const item = await saveStaffMember({
      id: body.id,
      profileId: currentStaff?.profileId || null,
      username,
      fullName: body.fullName,
      email,
      phone: body.phone,
      instagram: body.instagram ?? currentStaff?.instagram ?? null,
      photoUrl: body.photoUrl || null,
      bio: body.bio || null,
      role: desiredRole,
      isActive: body.isActive ?? true,
      specialty: body.specialty || null,
      calendarColor: body.calendarColor || null
    });

    let savedItem = item;

    if (body.temporaryPassword) {
      if (item.profileId) {
        await updateProfilePassword(item.profileId, body.temporaryPassword, { forceChange: true });
      }
      const authUserId = await upsertSupabaseAuthUser({
        email: item.email,
        password: body.temporaryPassword,
        username: item.username,
        fullName: item.fullName
      });
      savedItem = (await updateStaffAuthUserId(item.id, authUserId)) || item;
    }

    return NextResponse.json({
      item: savedItem,
      message: body.temporaryPassword
        ? "Colaborador guardado correctamente. Entrará con su usuario y contraseña temporal."
        : "Colaborador guardado correctamente."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el colaborador.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role === "colaborador") {
    return NextResponse.json({ error: "No tienes permiso para gestionar colaboradores." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action") || "deactivate";

  if (!id) {
    return NextResponse.json({ error: "Falta el colaborador." }, { status: 400 });
  }

  try {
    const currentStaff = await getStaffMember(id);
    if (!currentStaff) {
      return NextResponse.json({ error: "Colaborador no encontrado." }, { status: 404 });
    }
    if (!canManageCollaborators(session.role, currentStaff.role)) {
      return NextResponse.json({ error: "No tienes permiso para modificar este colaborador." }, { status: 403 });
    }
    if (currentStaff.profileId === session.profileId) {
      return NextResponse.json({ error: "No puedes desactivar o eliminar tu propio usuario." }, { status: 400 });
    }

    const appointmentCount = await getStaffAppointmentCount(id);

    if (action === "delete") {
      if (appointmentCount > 0) {
        const item = await setStaffActive(id, false);
        return NextResponse.json({
          item,
          action: "deactivated",
          appointmentCount,
          message: "Este colaborador tiene citas registradas. Por seguridad será desactivado junto con su acceso y se conservará el historial."
        });
      }

      return NextResponse.json({
        ok: await deleteStaffMember(id),
        action: "deleted",
        appointmentCount,
        message: "Colaborador y acceso de usuario eliminados definitivamente."
      });
    }

    if (action === "activate") {
      return NextResponse.json({
        item: await setStaffActive(id, true),
        action: "activated",
        appointmentCount,
        message: "Colaborador y acceso de usuario activados."
      });
    }

    return NextResponse.json({
      item: await setStaffActive(id, false),
      action: "deactivated",
      appointmentCount,
      message: "Colaborador y acceso de usuario desactivados."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el colaborador.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
