import Link from "next/link";
import { CollaboratorForm } from "@/components/admin/CollaboratorForm";
import { RoleSummary } from "@/components/admin/TeamAccessForm";
import { buttonStyles } from "@/components/ui/button";
import type { StaffMember, StaffRole } from "@/types/staff";

export function TeamMemberForm({
  staff,
  actorRole
}: {
  staff?: StaffMember | null;
  actorRole: StaffRole;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <CollaboratorForm staff={staff} actorRole={actorRole} redirectBasePath="/admin/equipo" />
      <aside className="grid content-start gap-4">
        <RoleSummary role={staff?.role ?? "colaborador"} />
        {staff && (
          <section className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Acciones rapidas</p>
            <div className="mt-4 grid gap-2">
              <Link href={`/admin/equipo/${staff.id}/servicios`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
                Editar servicios
              </Link>
              <Link href={`/admin/equipo/${staff.id}/horario`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
                Editar horario
              </Link>
              <Link href="/admin/equipo" className={buttonStyles({ variant: "ghost", className: "rounded-lg" })}>
                Volver al equipo
              </Link>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
