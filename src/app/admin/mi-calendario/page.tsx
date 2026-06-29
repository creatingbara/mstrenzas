import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Mi calendario | Panel M&S Trenzas"
};

export default async function MyCalendarPage() {
  const session = await requireAdminPageAccess("/admin/mi-calendario");
  const { appointments, exceptions } = await getAdminAppointmentData();
  const visibleAppointments =
    session?.role === "colaborador"
      ? appointments.filter((appointment) => appointment.staffMemberId === session.staffMemberId)
      : appointments;

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Mi calendario</h2>
        <p className="mt-2 text-sm text-muted">Vista de citas asignadas según el usuario autenticado.</p>
      </div>
      <AdminCalendarView appointments={visibleAppointments} exceptions={exceptions} />
    </section>
  );
}
