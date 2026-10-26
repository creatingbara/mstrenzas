import { ServiceAgendaForm } from "@/components/admin/ServiceAgendaForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getStaffMembers } from "@/lib/local-db";
import Link from "next/link";

export const metadata = {
  title: "Nuevo servicio | Panel M&S Estudio"
};

export default async function NewServiceAgendaPage() {
  await requireAdminPageAccess("/admin/servicios-agenda/nuevo", { adminOnly: true });
  const staffMembers = await getStaffMembers({ activeOnly: true });

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Nuevo servicio</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Completa el nombre, categoría, foto, precio y duración. Al guardar, el servicio aparecerá en el catálogo público; después podrás editarlo desde este mismo panel.</p>
        {staffMembers.length === 0 && (
          <p className="mt-3 rounded-lg bg-cream p-3 text-sm leading-6 text-cocoa">
            Para activar las citas, primero agrega una colaboradora y configura su horario en <Link href="/admin/equipo/nuevo" className="font-bold underline">Equipo y Accesos</Link>.
          </p>
        )}
      </div>
      <ServiceAgendaForm mode="create" staffMembers={staffMembers} assignedStaffIds={[]} />
    </section>
  );
}
