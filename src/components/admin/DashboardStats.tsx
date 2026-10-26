import { CalendarClock, ImageIcon, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getGalleryItems, getServices } from "@/lib/local-db";
import type { AppointmentBooking } from "@/types/appointment";

export async function DashboardStats({ appointments }: { appointments: AppointmentBooking[] }) {
  const services = await getServices();
  const galleryItems = await getGalleryItems({ activeOnly: true });
  const stats = [
    { label: "Servicios activos", value: services.filter((service) => service.active !== false).length, icon: Scissors },
    { label: "Solicitudes pendientes", value: appointments.filter((booking) => booking.status === "pendiente").length, icon: CalendarClock },
    { label: "Imagenes en galeria", value: galleryItems.length, icon: ImageIcon }
  ];

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 shadow-[0_18px_50px_rgba(101,0,77,0.08)] lg:rounded-lg lg:p-6">
          <div className="flex min-w-0 items-center gap-3 lg:block">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream text-cocoa lg:size-12 lg:rounded-lg">
              <stat.icon size={22} />
            </span>
            <span className="min-w-0">
              <p className="text-3xl font-black leading-none text-ink lg:mt-5 lg:text-4xl">{stat.value}</p>
              <p className="mt-1 truncate text-sm font-semibold text-muted">{stat.label}</p>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
