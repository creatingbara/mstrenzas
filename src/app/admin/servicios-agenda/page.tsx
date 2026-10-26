import { ServiceAgendaGrid } from "@/components/admin/ServiceAgendaGrid";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getServiceStaffIds, getServices, getStaffMembers } from "@/lib/local-db";

export const metadata = {
  title: "Servicios y Agenda | Panel M&S Estudio"
};

export default async function ServicesAgendaPage() {
  await requireAdminPageAccess("/admin/servicios-agenda", { adminOnly: true });
  const services = await getServices();
  const staffMembers = await getStaffMembers({ activeOnly: true });
  const staffByService = Object.fromEntries(await Promise.all(services.map(async (service) => {
    const assignedIds = await getServiceStaffIds(service.id);
    const eligibleIds = service.allowAnyStaff
      ? staffMembers.map((staff) => staff.id)
      : assignedIds;
    return [service.id, eligibleIds] as const;
  })));

  return <ServiceAgendaGrid services={services} staffMembers={staffMembers} staffByService={staffByService} />;
}
