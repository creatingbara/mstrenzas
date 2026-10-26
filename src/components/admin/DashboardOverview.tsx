import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ImageIcon,
  Package,
  Scissors,
  UsersRound
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import type { AppointmentBooking, AppointmentStatus } from "@/types/appointment";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

const statusLabels: Record<AppointmentStatus, string> = {
  pendiente: "Pendientes",
  confirmada: "Confirmadas",
  cancelada: "Canceladas",
  completada: "Completadas",
  archivada: "Archivadas",
  no_asistio: "No asistio"
};

const statusOrder: AppointmentStatus[] = ["pendiente", "confirmada", "completada", "archivada", "cancelada", "no_asistio"];

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function sortUpcoming(a: AppointmentBooking, b: AppointmentBooking) {
  return `${a.appointmentDate} ${a.startTime}`.localeCompare(`${b.appointmentDate} ${b.startTime}`);
}

export function DashboardOverview({
  appointments,
  services,
  staffMembers,
  galleryItems,
  products
}: {
  appointments: AppointmentBooking[];
  services: Service[];
  staffMembers: StaffMember[];
  galleryItems: GalleryItem[];
  products: Product[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const activeServices = services.filter((service) => service.active !== false);
  const activeStaff = staffMembers.filter((staff) => staff.isActive);
  const activeProducts = products.filter((product) => product.active);
  const pendingAppointments = appointments.filter((booking) => booking.status === "pendiente");
  const confirmedAppointments = appointments.filter((booking) => booking.status === "confirmada");
  const completedStatuses: AppointmentStatus[] = ["completada", "archivada"];
  const currentMonthKey = today.slice(0, 7);
  const completedThisMonth = appointments.filter(
    (booking) => completedStatuses.includes(booking.status) && booking.appointmentDate.startsWith(currentMonthKey)
  );
  const completedByService = Object.entries(
    completedThisMonth.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.serviceName] = (acc[booking.serviceName] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);
  const upcomingAppointments = appointments
    .filter((booking) => ["pendiente", "confirmada"].includes(booking.status) && booking.appointmentDate >= today)
    .sort(sortUpcoming)
    .slice(0, 5);
  const todayAppointments = appointments.filter((booking) => booking.appointmentDate === today);
  const totalAppointments = appointments.length || 1;

  const stats = [
    { label: "Servicios activos", value: activeServices.length, icon: Scissors, href: "/admin/servicios-agenda" },
    { label: "Solicitudes pendientes", value: pendingAppointments.length, icon: CalendarClock, href: "/admin/citas" },
    { label: "Citas confirmadas", value: confirmedAppointments.length, icon: CalendarCheck, href: "/admin/calendario" },
    { label: "Servicios realizados", value: completedThisMonth.length, icon: CalendarCheck, href: "/admin/dashboard" },
    { label: "Citas de hoy", value: todayAppointments.length, icon: CalendarDays, href: "/admin/calendario" },
    { label: "Equipo activo", value: activeStaff.length, icon: UsersRound, href: "/admin/equipo" },
    { label: "Productos activos", value: activeProducts.length, icon: Package, href: "/admin/productos" },
    { label: "Galeria activa", value: galleryItems.length, icon: ImageIcon, href: "/admin/galeria" }
  ];

  return (
    <div className="grid min-w-0 gap-4 lg:gap-6">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="min-w-0">
            <Card className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 shadow-[0_18px_50px_rgba(101,0,77,0.08)] transition hover:-translate-y-0.5 hover:border-cocoa/25 dark:border-white/10 dark:bg-white/5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream text-cocoa dark:bg-white/10 dark:text-pink-100">
                  <stat.icon size={21} />
                </span>
                <span className="min-w-0">
                  <p className="text-3xl font-black leading-none text-ink dark:text-white">{stat.value}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-muted dark:text-pink-100/70">{stat.label}</p>
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:p-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-200">Estadisticas</p>
            <h3 className="mt-1 text-xl font-black text-ink dark:text-white">Servicios realizados este mes</h3>
            <p className="mt-1 text-sm font-semibold text-muted dark:text-pink-100/70">
              Citas completadas o archivadas durante {currentMonthKey}.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-xl bg-cream/60 p-4 dark:bg-white/10">
              <p className="text-4xl font-black text-ink dark:text-white">{completedThisMonth.length}</p>
              <p className="mt-1 text-sm font-semibold text-muted dark:text-pink-100/70">Servicios finalizados</p>
            </div>
            {completedByService.map(([serviceName, count]) => (
              <div key={serviceName} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-cocoa/10 p-3 dark:border-white/10">
                <span className="truncate text-sm font-bold text-ink dark:text-white">{serviceName}</span>
                <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-black text-cocoa dark:bg-white/10 dark:text-pink-100">
                  {count}
                </span>
              </div>
            ))}
            {!completedByService.length && (
              <p className="rounded-xl bg-cream/60 p-4 text-sm font-semibold text-muted dark:bg-white/5 dark:text-pink-100/70">
                Aun no hay servicios completados este mes.
              </p>
            )}
          </div>
        </Card>

        <Card className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:p-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-200">Estado general</p>
              <h3 className="mt-1 text-xl font-black text-ink dark:text-white">Solicitudes por estado</h3>
            </div>
            <Link href="/admin/citas" className={buttonStyles({ variant: "outline", className: "hidden rounded-lg px-4 sm:inline-flex" })}>
              Ver citas
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {statusOrder.map((status) => {
              const count = appointments.filter((booking) => booking.status === status).length;
              const width = Math.round((count / totalAppointments) * 100);

              return (
                <div key={status} className="min-w-0">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-ink dark:text-white">{statusLabels[status]}</span>
                    <span className="font-semibold text-muted dark:text-pink-100/70">{count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream dark:bg-white/10">
                    <div className="h-full rounded-full bg-cocoa dark:bg-pink-300" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:p-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-200">Agenda</p>
              <h3 className="mt-1 text-xl font-black text-ink dark:text-white">Proximas citas</h3>
            </div>
            <Link href="/admin/calendario" className={buttonStyles({ variant: "outline", className: "hidden rounded-lg px-4 sm:inline-flex" })}>
              Calendario
            </Link>
          </div>

          <div className="mt-4 grid gap-3">
            {upcomingAppointments.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/citas/${booking.id}`}
                className="grid min-w-0 gap-2 rounded-xl border border-cocoa/10 bg-cream/45 p-3 transition hover:border-cocoa/25 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-ink dark:text-white">{booking.clientName}</span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-cocoa dark:text-pink-200">{booking.serviceName}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-cocoa dark:bg-white/10 dark:text-pink-100">
                    {booking.status}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-muted dark:text-pink-100/70">
                  {formatDate(booking.appointmentDate)} · {booking.startTime} · {booking.staffName || "Sin asignar"}
                </p>
              </Link>
            ))}
            {!upcomingAppointments.length && (
              <p className="rounded-xl bg-cream/60 p-4 text-sm font-semibold text-muted dark:bg-white/5 dark:text-pink-100/70">
                No hay citas proximas pendientes o confirmadas.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="min-w-0 rounded-[1.15rem] border-cocoa/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-200">Accesos rapidos</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Revisar solicitudes", "/admin/citas"],
            ["Abrir calendario", "/admin/calendario"],
            ["Gestionar servicios", "/admin/servicios-agenda"],
            ["Equipo y accesos", "/admin/equipo"],
            ["Galeria", "/admin/galeria"],
            ["Productos", "/admin/productos"]
          ].map(([label, href]) => (
            <Link key={href} href={href} className={buttonStyles({ variant: "outline", className: "w-full rounded-lg" })}>
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
