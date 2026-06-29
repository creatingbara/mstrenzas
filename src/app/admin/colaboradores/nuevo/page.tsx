import { CollaboratorForm } from "@/components/admin/CollaboratorForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Nuevo colaborador | Panel M&S Trenzas"
};

export default async function NewCollaboratorPage() {
  const session = await requireAdminPageAccess("/admin/colaboradores/nuevo", { adminOnly: true });

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Nuevo colaborador</h2>
        <p className="mt-2 text-sm text-muted">Crea una persona del equipo para asignarle servicios y horario.</p>
      </div>
      <CollaboratorForm actorRole={session.role} />
    </section>
  );
}
