import { CalendarClock, ImageIcon, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { galleryItems } from "@/lib/data";
import { getServices } from "@/lib/local-db";
import type { AppointmentBooking } from "@/types/appointment";

export async function DashboardStats({ appointments }: { appointments: AppointmentBooking[] }) {
  const services = await getServices();
  const stats = [
    { label: "Servicios activos", value: services.filter((service) => service.active !== false).length, icon: Scissors },
    { label: "Solicitudes pendientes", value: appointments.filter((booking) => booking.status === "pendiente").length, icon: CalendarClock },
    { label: "Imagenes en galeria", value: galleryItems.length, icon: ImageIcon }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-lg border-cocoa/10 bg-white shadow-[0_18px_50px_rgba(101,0,77,0.08)]">
          <span className="grid size-12 place-items-center rounded-lg bg-cream text-cocoa">
            <stat.icon size={24} />
          </span>
          <p className="mt-5 text-4xl font-black text-ink">{stat.value}</p>
          <p className="mt-1 text-sm font-semibold text-muted">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
