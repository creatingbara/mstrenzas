import { AvailabilitySettings } from "@/components/admin/AvailabilitySettings";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Disponibilidad | Panel M&S Trenzas"
};

export default async function AdminAvailabilityPage() {
  await requireAdminPageAccess("/admin/disponibilidad", { adminOnly: true });
  const { businessHours, exceptions } = await getAdminAppointmentData();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Disponibilidad</h2>
        <p className="mt-2 text-sm text-muted">Configura horario semanal, días bloqueados y horarios especiales.</p>
      </div>
      <AvailabilitySettings businessHours={businessHours} exceptions={exceptions} />
    </section>
  );
}
