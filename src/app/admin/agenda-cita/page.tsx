import { AgendaPagesManager } from "@/components/admin/AgendaPagesManager";
import { BookingMenuManager } from "@/components/admin/BookingMenuManager";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAgendaPages, getBookingMenuItems, getServices } from "@/lib/local-db";

export const metadata = {
  title: "Agenda Cita | Panel M&S Trenzas"
};

export default async function AdminBookingMenuPage() {
  await requireAdminPageAccess("/admin/agenda-cita", { adminOnly: true });
  const items = await getBookingMenuItems();
  const pages = await getAgendaPages();
  const services = await getServices();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Agenda Cita</h2>
        <p className="mt-2 text-sm text-muted">Edita el contenido de las páginas que abre el menú Agendar Cita.</p>
      </div>
      <div className="grid gap-6">
        <AgendaPagesManager initialPages={pages} services={services} />
        <BookingMenuManager initialItems={items} />
      </div>
    </section>
  );
}
