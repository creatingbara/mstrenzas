import { notFound } from "next/navigation";
import { ServiceAgendaForm } from "@/components/admin/ServiceAgendaForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getServiceById, getServiceStaffIds, getStaffMembers } from "@/lib/local-db";

export const metadata = {
  title: "Editar servicio | Panel M&S Trenzas"
};

export default async function EditServiceAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPageAccess(`/admin/servicios-agenda/${id}`, { adminOnly: true });
  const service = await getServiceById(id);
  if (!service) notFound();
  const staffMembers = await getStaffMembers({ activeOnly: true });
  const assignedStaffIds = await getServiceStaffIds(service.id);

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Editar servicio</h2>
        <p className="mt-2 text-sm text-muted">Administra contenido, agenda, precio, imagen y colaboradores.</p>
      </div>
      <ServiceAgendaForm mode="edit" service={service} staffMembers={staffMembers} assignedStaffIds={assignedStaffIds} />
    </section>
  );
}
