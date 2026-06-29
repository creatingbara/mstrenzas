import { notFound } from "next/navigation";
import { CollaboratorForm } from "@/components/admin/CollaboratorForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getStaffMember } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Editar colaborador | Panel M&S Trenzas"
};

export default async function EditCollaboratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminPageAccess(`/admin/colaboradores/${id}`, { adminOnly: true });
  const staff = await getStaffMember(id);
  if (!staff) notFound();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Editar colaborador</h2>
        <p className="mt-2 text-sm text-muted">{staff.fullName}</p>
      </div>
      <CollaboratorForm staff={staff} actorRole={session.role} />
    </section>
  );
}
