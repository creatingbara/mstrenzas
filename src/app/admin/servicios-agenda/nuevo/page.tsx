import { ServiceAgendaForm } from "@/components/admin/ServiceAgendaForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getStaffMembers } from "@/lib/local-db";

export const metadata = {
  title: "Nuevo servicio | Panel M&S Trenzas"
};

export default async function NewServiceAgendaPage() {
  await requireAdminPageAccess("/admin/servicios-agenda/nuevo", { adminOnly: true });
  const staffMembers = await getStaffMembers({ activeOnly: true });

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Nuevo servicio</h2>
        <p className="mt-2 text-sm text-muted">Crea un servicio administrable con agenda, precio, imagen y colaboradores.</p>
      </div>
      <ServiceAgendaForm mode="create" staffMembers={staffMembers} assignedStaffIds={[]} />
    </section>
  );
}
