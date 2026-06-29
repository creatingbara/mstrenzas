import { TeamAccessGrid } from "@/components/admin/TeamAccessGrid";
import type { TeamAccessMember } from "@/components/admin/TeamAccessCard";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getProfiles, getServices, getStaffMembers } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Equipo y Accesos | Panel M&S Trenzas"
};

export default async function TeamAccessPage() {
  await requireAdminPageAccess("/admin/equipo", { adminOnly: true });
  const staffMembers = await getStaffMembers();
  const profiles = await getProfiles();
  const services = await getServices();
  const serviceNameById = new Map(services.map((service) => [service.id, service.name]));
  const staffProfileIds = new Set(staffMembers.map((staff) => staff.profileId).filter(Boolean));

  const staffCards: TeamAccessMember[] = staffMembers.map((staff) => ({
    id: staff.id,
    profileId: staff.profileId,
    staffId: staff.id,
    fullName: staff.fullName,
    username: staff.username,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    isActive: staff.isActive,
    avatarUrl: staff.photoUrl,
    specialty: staff.specialty,
    calendarColor: staff.calendarColor,
    serviceIds: staff.services,
    serviceNames: staff.services.map((serviceId) => serviceNameById.get(serviceId)).filter((name): name is string => Boolean(name)),
    upcomingAppointments: staff.upcomingAppointments,
    appointmentCount: staff.appointmentCount
  }));

  const profileCards: TeamAccessMember[] = profiles
    .filter((profile) => !staffProfileIds.has(profile.id))
    .map((profile) => ({
      id: profile.id,
      profileId: profile.id,
      staffId: null,
      fullName: profile.fullName,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      isActive: profile.isActive,
      avatarUrl: profile.avatarUrl,
      specialty: profile.role === "super_admin" ? "Acceso completo del sistema" : "Administracion",
      calendarColor: profile.role === "super_admin" ? "#65004d" : "#9b1178",
      serviceIds: [],
      serviceNames: [],
      upcomingAppointments: 0,
      appointmentCount: 0,
      createdAt: profile.createdAt
    }));

  const members = [...staffCards, ...profileCards].sort((a, b) => {
    const roleWeight = roleOrder(a.role) - roleOrder(b.role);
    return roleWeight || a.fullName.localeCompare(b.fullName);
  });

  return <TeamAccessGrid members={members} services={services.map(({ id, name, category }) => ({ id, name, category }))} />;
}

function roleOrder(role: TeamAccessMember["role"]) {
  if (role === "super_admin") return 0;
  if (role === "admin") return 1;
  return 2;
}
