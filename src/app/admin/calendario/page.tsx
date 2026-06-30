import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Calendario | Panel M&S Trenzas"
};

export default async function AdminCalendarPage() {
  await requireAdminPageAccess("/admin/calendario", { adminOnly: true });
  const { appointments, exceptions } = await getAdminAppointmentData();

  return (
    <section className="admin-full-width w-full max-w-none">
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Calendario administrativo</h2>
        <p className="mt-2 text-sm text-muted">Vista mensual visual de citas, estados, colaboradores y bloqueos.</p>
      </div>
      <AdminCalendarView appointments={appointments} exceptions={exceptions} />
    </section>
  );
}
