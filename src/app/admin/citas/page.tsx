import { BookingsTable } from "@/components/admin/BookingsTable";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Citas | Panel M&S Trenzas"
};

export default async function AdminBookingsPage() {
  const session = await requireAdminPageAccess("/admin/citas");
  const { appointments } = await getAdminAppointmentData();
  const visibleAppointments =
    session?.role === "colaborador"
      ? appointments.filter((appointment) => appointment.staffMemberId === session.staffMemberId)
      : appointments;

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Solicitudes de citas</h2>
        <p className="mt-2 text-sm text-muted">Revisa clientas, servicio solicitado, fecha, nota y estado.</p>
      </div>
      <BookingsTable appointments={visibleAppointments} />
    </section>
  );
}
