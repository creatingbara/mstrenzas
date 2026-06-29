import { ServiceAgendaGrid } from "@/components/admin/ServiceAgendaGrid";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getServiceStaffIds, getServices, getStaffMembers } from "@/lib/local-db";

export const metadata = {
  title: "Servicios y Agenda | Panel M&S Trenzas"
};

export default async function ServicesAgendaPage() {
  await requireAdminPageAccess("/admin/servicios-agenda", { adminOnly: true });
  const services = await getServices();
  const staffMembers = await getStaffMembers({ activeOnly: true });
  const staffByService = Object.fromEntries(
    await Promise.all(services.map(async (service) => [service.id, await getServiceStaffIds(service.id)] as const))
  );

  return <ServiceAgendaGrid services={services} staffMembers={staffMembers} staffByService={staffByService} />;
}
