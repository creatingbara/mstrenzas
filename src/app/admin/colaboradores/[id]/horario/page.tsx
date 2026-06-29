import { notFound } from "next/navigation";
import { CollaboratorScheduleEditor } from "@/components/admin/CollaboratorScheduleEditor";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getStaffMember, getStaffScheduleData } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CollaboratorSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPageAccess(`/admin/colaboradores/${id}/horario`, { adminOnly: true });
  const staff = await getStaffMember(id);
  if (!staff) notFound();
  const schedule = await getStaffScheduleData(id);

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Horario individual</h2>
        <p className="mt-2 text-sm text-muted">{staff.fullName}</p>
      </div>
      <CollaboratorScheduleEditor staffId={id} businessHours={schedule.businessHours} />
    </section>
  );
}
