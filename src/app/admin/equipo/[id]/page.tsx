import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamAccessForm } from "@/components/admin/TeamAccessForm";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { buttonStyles } from "@/components/ui/button";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getProfileById, getStaffMember } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Editar miembro | Panel M&S Trenzas"
};

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminPageAccess(`/admin/equipo/${id}`, { adminOnly: true });
  const staff = await getStaffMember(id);
  const profile = staff?.profileId ? await getProfileById(staff.profileId) : await getProfileById(id);

  if (!staff && !profile) notFound();

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Equipo y Accesos</p>
          <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">{staff ? "Editar miembro" : "Editar acceso"}</h2>
          <p className="mt-2 text-sm text-muted">{staff?.fullName || profile?.fullName}</p>
        </div>
        <Link href="/admin/equipo" className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
          Volver
        </Link>
      </div>

      {staff ? (
        <TeamMemberForm staff={staff} actorRole={session.role} />
      ) : profile ? (
        <TeamAccessForm profile={profile} actorRole={session.role} actorProfileId={session.profileId} />
      ) : null}
    </section>
  );
}
