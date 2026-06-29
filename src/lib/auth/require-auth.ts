import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import {
  canAccessAdminPath,
  canManageCollaborators as canManageCollaboratorsByRole,
  canManageSettings as canManageSettingsByRole,
  canManageUsers as canManageUsersByRole,
  canViewAppointment as canViewAppointmentByRole,
  hasPermission,
  type Permission
} from "@/lib/auth/permissions";
import type { AppointmentBooking } from "@/types/appointment";
import type { StaffRole, UserProfile } from "@/types/staff";

export async function getCurrentUserProfile() {
  return getAdminSession();
}

export async function requireAuth(pathname = "/admin") {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect(`/admin?next=${encodeURIComponent(pathname)}`);
  }

  return session;
}

export async function requireRole(roles: StaffRole[], pathname = "/admin") {
  const session = await requireAuth(pathname);

  if (!roles.includes(session.role)) {
    if (session.role === "colaborador") redirect("/admin/mi-calendario");
    redirect("/admin/dashboard");
  }

  return session;
}

export function requireRoleForApi(session: { role: StaffRole } | null, roles: StaffRole[]) {
  return Boolean(session && roles.includes(session.role));
}

export async function requireAdmin(pathname = "/admin") {
  return requireRole(["admin", "super_admin"], pathname);
}

export async function requireSuperAdmin(pathname = "/admin") {
  return requireRole(["super_admin"], pathname);
}

export async function requirePermission(permission: Permission, pathname = "/admin") {
  const session = await requireAuth(pathname);

  if (!hasPermission(session.role, permission)) {
    if (session.role === "colaborador") redirect("/admin/mi-calendario");
    redirect("/admin/dashboard");
  }

  return session;
}

export async function requireAdminPath(pathname: string) {
  const session = await requireAuth(pathname);

  if (!canAccessAdminPath(session.role, pathname)) {
    if (session.role === "colaborador") redirect("/admin/mi-calendario");
    redirect("/admin/dashboard");
  }

  return session;
}

export function canManageUsers(actorRole: StaffRole, target?: UserProfile | null) {
  return canManageUsersByRole(actorRole, target);
}

export function canManageCollaborators(actorRole: StaffRole, targetRole?: StaffRole | null) {
  return canManageCollaboratorsByRole(actorRole, targetRole);
}

export function canManageSettings(actorRole: StaffRole) {
  return canManageSettingsByRole(actorRole);
}

export function canViewAppointment(
  session: { role: StaffRole; staffMemberId?: string | null },
  appointment: AppointmentBooking | null
) {
  return canViewAppointmentByRole(session, appointment);
}
