import Link from "next/link";
import { notFound } from "next/navigation";
import { CollaboratorScheduleEditor } from "@/components/admin/CollaboratorScheduleEditor";
import { buttonStyles } from "@/components/ui/button";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getStaffMember, getStaffScheduleData } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Horario del miembro | Panel M&S Trenzas"
};

export default async function TeamMemberSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPageAccess(`/admin/equipo/${id}/horario`, { adminOnly: true });
  const staff = await getStaffMember(id);
  if (!staff) notFound();
  const schedule = await getStaffScheduleData(id);

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Equipo y Accesos</p>
          <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">Horario individual</h2>
          <p className="mt-2 text-sm text-muted">{staff.fullName}</p>
        </div>
        <Link href={`/admin/equipo/${staff.id}`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
          Volver al miembro
        </Link>
      </div>
      <CollaboratorScheduleEditor staffId={id} businessHours={schedule.businessHours} />
    </section>
  );
}
