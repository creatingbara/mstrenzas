import { BookingsTable } from "@/components/admin/BookingsTable";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard | Panel M&S Trenzas"
};

export default async function AdminDashboardPage() {
  await requireAdminPageAccess("/admin/dashboard", { adminOnly: true });
  const { appointments } = await getAdminAppointmentData();
  const latestAppointments = appointments.slice(0, 5);

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Panel administrativo</p>
        <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">Dashboard</h2>
        <p className="mt-2 text-sm text-muted">Vista general de servicios, solicitudes y contenido de M&S Trenzas.</p>
      </section>
      <DashboardStats appointments={appointments} />
      <section>
        <h2 className="mb-4 text-2xl font-black text-ink">Ultimas solicitudes</h2>
        <BookingsTable appointments={latestAppointments} />
      </section>
    </div>
  );
}
