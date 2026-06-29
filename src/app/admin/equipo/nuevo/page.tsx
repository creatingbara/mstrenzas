import Link from "next/link";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { buttonStyles } from "@/components/ui/button";
import { requireAdminPageAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Nuevo miembro | Panel M&S Trenzas"
};

export default async function NewTeamMemberPage() {
  const session = await requireAdminPageAccess("/admin/equipo/nuevo", { adminOnly: true });

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Equipo y Accesos</p>
          <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">Nuevo miembro</h2>
          <p className="mt-2 text-sm text-muted">Crea colaboradores o administradores y define su acceso al panel.</p>
        </div>
        <Link href="/admin/equipo" className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
          Volver
        </Link>
      </div>
      <TeamMemberForm actorRole={session.role} />
    </section>
  );
}
