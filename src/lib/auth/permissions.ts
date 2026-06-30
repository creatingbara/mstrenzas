import type { AppointmentBooking } from "@/types/appointment";
import type { StaffRole, UserProfile } from "@/types/staff";

export type Permission =
  | "all"
  | "manage_bookings"
  | "manage_staff"
  | "manage_services"
  | "manage_gallery"
  | "manage_products"
  | "manage_availability"
  | "view_own_calendar"
  | "view_own_bookings";

export const rolePermissions: Record<StaffRole, Permission[]> = {
  super_admin: ["all"],
  admin: [
    "manage_bookings",
    "manage_staff",
    "manage_services",
    "manage_gallery",
    "manage_products",
    "manage_availability"
  ],
  colaborador: ["view_own_calendar", "view_own_bookings"]
};

export function hasPermission(role: StaffRole, permission: Permission) {
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes("all") || permissions.includes(permission);
}

export function canAccessAdminPath(role: StaffRole, pathname: string) {
  if (role === "super_admin") return true;

  if (role === "admin") {
    if (pathname === "/admin") return true;
    if (pathname.startsWith("/admin/citas")) return hasPermission(role, "manage_bookings");
    if (pathname.startsWith("/admin/calendario")) return hasPermission(role, "manage_bookings");
    if (pathname.startsWith("/admin/disponibilidad")) return hasPermission(role, "manage_availability");
    if (pathname.startsWith("/admin/agenda-cita")) return hasPermission(role, "manage_services");
    if (pathname.startsWith("/admin/servicios-agenda")) return hasPermission(role, "manage_services");
    if (pathname.startsWith("/admin/equipo")) return hasPermission(role, "manage_staff");
    if (pathname.startsWith("/admin/colaboradores")) return hasPermission(role, "manage_staff");
    if (pathname.startsWith("/admin/servicios")) return hasPermission(role, "manage_services");
    if (pathname.startsWith("/admin/galeria")) return hasPermission(role, "manage_gallery");
    if (pathname.startsWith("/admin/productos")) return hasPermission(role, "manage_products");
    if (pathname.startsWith("/admin/usuarios")) return hasPermission(role, "manage_staff");
    if (pathname.startsWith("/admin/configuracion")) return false;
    if (pathname.startsWith("/admin/dashboard")) return true;
    return false;
  }

  return pathname === "/admin/mi-calendario" || pathname.startsWith("/admin/equipo/");
}

export function canManageUsers(actorRole: StaffRole, target?: UserProfile | null) {
  if (actorRole === "super_admin") return true;
  if (actorRole !== "admin") return false;
  return target?.role === "colaborador";
}

export function canManageCollaborators(actorRole: StaffRole, targetRole?: StaffRole | null) {
  if (actorRole === "super_admin") return true;
  if (actorRole !== "admin") return false;
  return targetRole === "colaborador";
}

export function canManageSettings(actorRole: StaffRole) {
  return actorRole === "super_admin";
}

export function canViewAppointment(
  session: { role: StaffRole; staffMemberId?: string | null },
  appointment: AppointmentBooking | null
) {
  if (!appointment) return false;
  if (session.role === "super_admin" || session.role === "admin") return true;
  return Boolean(session.staffMemberId && appointment.staffMemberId === session.staffMemberId);
}
