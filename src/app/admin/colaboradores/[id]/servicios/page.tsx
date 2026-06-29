import { notFound } from "next/navigation";
import { CollaboratorServicesManager } from "@/components/admin/CollaboratorServicesManager";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { services } from "@/lib/data";
import { getStaffMember } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CollaboratorServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPageAccess(`/admin/colaboradores/${id}/servicios`, { adminOnly: true });
  const staff = await getStaffMember(id);
  if (!staff) notFound();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Servicios de colaborador</h2>
        <p className="mt-2 text-sm text-muted">{staff.fullName}</p>
      </div>
      <CollaboratorServicesManager staff={staff} services={services} />
    </section>
  );
}
