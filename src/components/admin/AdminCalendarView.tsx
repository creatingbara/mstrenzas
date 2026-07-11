"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Lock, Phone, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentBooking, AppointmentStatus, AvailabilityException } from "@/types/appointment";

const statuses: AppointmentStatus[] = ["pendiente", "confirmada", "cancelada", "completada", "archivada", "no_asistio"];
const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const statusLabels: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  archivada: "Archivada",
  no_asistio: "No asistio"
};

const statusStyles: Record<AppointmentStatus, { card: string; dot: string; chip: string }> = {
  pendiente: {
    card: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100",
    dot: "bg-amber-400",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-300/20 dark:text-amber-100"
  },
  confirmada: {
    card: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/15 dark:text-emerald-100",
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-300/20 dark:text-emerald-100"
  },
  cancelada: {
    card: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-300/30 dark:bg-rose-300/15 dark:text-rose-100",
    dot: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-300/20 dark:text-rose-100"
  },
  completada: {
    card: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-300/30 dark:bg-sky-300/15 dark:text-sky-100",
    dot: "bg-sky-500",
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-300/20 dark:text-sky-100"
  },
  archivada: {
    card: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-300/30 dark:bg-violet-300/15 dark:text-violet-100",
    dot: "bg-violet-500",
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-300/20 dark:text-violet-100"
  },
  no_asistio: {
    card: "border-slate-200 bg-slate-100 text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white",
    dot: "bg-slate-500",
    chip: "bg-slate-200 text-slate-800 dark:bg-white/15 dark:text-white"
  }
};

const staffPalette = ["#9b1178", "#0f766e", "#b45309", "#2563eb", "#7c3aed", "#be123c", "#15803d", "#a16207"];

export function AdminCalendarView({
  appointments: initialAppointments,
  exceptions
}: {
  appointments: AppointmentBooking[];
  exceptions: AvailabilityException[];
}) {
  const today = new Date();
  const initialDate = initialAppointments[0]?.appointmentDate ? parseDateKey(initialAppointments[0].appointmentDate) : today;
  const [monthDate, setMonthDate] = useState(startOfMonth(initialDate));
  const [selectedDate, setSelectedDate] = useState(toDateKey(initialDate));
  const [items, setItems] = useState(initialAppointments);
  const [notice, setNotice] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthDate]);
  const appointmentsByDate = useMemo(() => groupAppointmentsByDate(items), [items]);
  const blocksByDate = useMemo(() => groupBlocksByDate(exceptions), [exceptions]);
  const selectedAppointments = appointmentsByDate.get(selectedDate) ?? [];
  const selectedBlocks = blocksByDate.get(selectedDate) ?? [];
  const monthAppointments = items.filter((item) => isSameMonth(parseDateKey(item.appointmentDate), monthDate));
  const monthBlockedDays = exceptions.filter((item) => !item.isAvailable && isSameMonth(parseDateKey(item.exceptionDate), monthDate)).length;

  async function updateStatus(id: string, status: AppointmentStatus) {
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/appointment-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = (await response.json()) as { item?: AppointmentBooking; error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo actualizar la cita.");
      if (result.item) {
        setItems((current) => current.map((item) => (item.id === id ? result.item as AppointmentBooking : item)));
      }
      setNotice("Estado actualizado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar la cita.");
    }
  }

  function selectMonth(nextMonth: Date) {
    setMonthDate(startOfMonth(nextMonth));
    const nextSelected = toDateKey(nextMonth);
    if (!isSameMonth(parseDateKey(selectedDate), nextMonth)) setSelectedDate(nextSelected);
  }

  function selectDay(key: string) {
    setSelectedDate(key);
    window.setTimeout(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-cocoa/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-cocoa dark:bg-white/10 dark:text-pink-200">
              <CalendarDays size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-300">Vista mensual</p>
              <h3 className="truncate font-display text-3xl font-bold text-ink dark:text-white">{format(monthDate, "MMMM yyyy")}</h3>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:flex-wrap">
            <Button type="button" variant="outline" className="rounded-lg px-3" onClick={() => selectMonth(subMonths(monthDate, 1))} aria-label="Mes anterior">
              <ChevronLeft size={18} />
            </Button>
            <Button type="button" variant="outline" className="rounded-lg px-3 sm:px-5" onClick={() => selectMonth(today)}>
              Hoy
            </Button>
            <Button type="button" variant="outline" className="rounded-lg px-3" onClick={() => selectMonth(addMonths(monthDate, 1))} aria-label="Mes siguiente">
              <ChevronRight size={18} />
            </Button>
            <input
              className="col-span-3 min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3 text-sm font-semibold text-ink outline-none dark:border-white/15 dark:bg-white/10 dark:text-white sm:col-span-1 sm:w-auto"
              type="month"
              value={format(monthDate, "yyyy-MM")}
              onChange={(event) => {
                if (event.target.value) selectMonth(parseDateKey(`${event.target.value}-01`));
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Stat label="Citas del mes" value={monthAppointments.length} />
          <Stat label="Pendientes" value={monthAppointments.filter((item) => item.status === "pendiente").length} />
          <Stat label="Confirmadas" value={monthAppointments.filter((item) => item.status === "confirmada").length} />
          <Stat label="Dias bloqueados" value={monthBlockedDays} />
        </div>
      </div>

      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa dark:bg-white/10 dark:text-pink-100">{notice}</p>}

      <div className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,440px)]">
        <div className="overflow-hidden rounded-[1.35rem] border border-cocoa/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5 lg:rounded-lg">
          <div className="overflow-x-auto">
            <div className="min-w-0 lg:min-w-[920px]">
              <div className="grid grid-cols-7 border-b border-cocoa/10 bg-cream/70 dark:border-white/10 dark:bg-white/10">
                {weekDays.map((day) => (
                  <div key={day} className="px-1 py-3 text-center text-[0.68rem] font-black uppercase tracking-[0.08em] text-cocoa dark:text-pink-100 sm:px-3 sm:text-xs sm:tracking-[0.12em]">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const key = toDateKey(day);
                  const dayAppointments = appointmentsByDate.get(key) ?? [];
                  const dayBlocks = blocksByDate.get(key) ?? [];
                  const active = selectedDate === key;
                  const outsideMonth = !isSameMonth(day, monthDate);
                  const visibleAppointments = dayAppointments.slice(0, 2);
                  const mobileVisibleAppointments = dayAppointments.slice(0, 1);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn(
                        "min-h-[4.1rem] border-b border-r border-cocoa/10 p-1 text-left align-top transition hover:bg-cream/60 dark:border-white/10 dark:hover:bg-white/10 sm:min-h-[5.5rem] sm:p-2 lg:min-h-[104px] xl:min-h-[112px] xl:p-3 2xl:min-h-[120px]",
                        outsideMonth && "bg-slate-50 text-muted dark:bg-black/15 dark:text-pink-100/45",
                        active && "bg-pink-50 ring-2 ring-inset ring-cocoa/50 dark:bg-white/10 dark:ring-pink-300/70"
                      )}
                      onClick={() => selectDay(key)}
                    >
                      <div className="mb-1 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-full text-[0.68rem] font-black text-ink dark:text-white sm:size-8 sm:text-sm",
                            isSameDay(day, today) && "bg-cocoa text-white dark:bg-pink-300 dark:text-cocoa"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {dayBlocks.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-rose-700 dark:bg-rose-300/20 dark:text-rose-100 sm:px-2 sm:py-1 sm:text-[0.68rem]">
                            <Lock size={12} />
                            <span className="hidden sm:inline">Bloqueado</span>
                          </span>
                        )}
                      </div>

                      <div className="grid gap-0.5 sm:gap-1.5">
                        <span className="grid gap-0.5 sm:hidden">
                          {mobileVisibleAppointments.map((appointment) => (
                            <CalendarEvent key={appointment.id} appointment={appointment} compact mobile />
                          ))}
                        </span>
                        <span className="hidden gap-1.5 sm:grid">
                          {visibleAppointments.map((appointment) => (
                            <CalendarEvent key={appointment.id} appointment={appointment} compact />
                          ))}
                        </span>
                        {dayAppointments.length > visibleAppointments.length && (
                          <span className="hidden truncate rounded-md bg-cocoa/10 px-1.5 py-1 text-[0.64rem] font-bold text-cocoa dark:bg-white/10 dark:text-pink-100 sm:block sm:px-2 sm:text-xs">
                            +{dayAppointments.length - visibleAppointments.length} citas mas
                          </span>
                        )}
                        {dayAppointments.length > mobileVisibleAppointments.length && (
                          <span className="truncate rounded-md bg-cocoa/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-cocoa dark:bg-white/10 dark:text-pink-100 sm:hidden">
                            +{dayAppointments.length - mobileVisibleAppointments.length}
                          </span>
                        )}
                        {!dayAppointments.length && dayBlocks.length === 0 && (
                          <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-cocoa/15 dark:bg-white/15 sm:hidden" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside ref={detailRef} className="scroll-mt-24 min-w-0 max-w-full overflow-hidden rounded-[1.35rem] border border-cocoa/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5 lg:rounded-lg lg:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-300">Detalle del dia</p>
              <h3 className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{format(parseDateKey(selectedDate), "dd/MM/yyyy")}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa dark:bg-white/10 dark:text-pink-100">
              {selectedAppointments.length} citas
            </span>
          </div>

          {selectedBlocks.map((block) => (
            <div key={block.id} className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800 dark:border-rose-300/30 dark:bg-rose-300/15 dark:text-rose-100">
              Dia bloqueado: {block.reason || "Sin razon"}
            </div>
          ))}

          <div className="mt-5 grid min-w-0 gap-3">
            {selectedAppointments.length ? (
              selectedAppointments.map((appointment) => (
                <AppointmentDetail key={appointment.id} appointment={appointment} onStatusChange={updateStatus} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-cocoa/20 bg-cream/50 p-5 text-sm font-semibold text-muted dark:border-white/15 dark:bg-white/5 dark:text-pink-100/75">
                No hay citas para esta fecha.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CalendarEvent({
  appointment,
  compact = false,
  mobile = false
}: {
  appointment: AppointmentBooking;
  compact?: boolean;
  mobile?: boolean;
}) {
  const styles = statusStyles[appointment.status];
  const staffColor = getStaffColor(appointment.staffName);

  return (
    <div className={cn("min-w-0 rounded-md border px-1.5 py-1 shadow-sm sm:px-2 sm:py-1.5", mobile && "border-transparent bg-transparent px-0 py-0 shadow-none", styles.card)}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={cn("h-2.5 w-1 shrink-0 rounded-full", mobile && "size-1.5")} style={{ backgroundColor: staffColor }} />
        <span className={cn("truncate text-[0.62rem] font-black sm:text-xs", mobile && "sr-only")}>{appointment.startTime} {appointment.clientName}</span>
      </div>
      {!compact && <p className="mt-1 truncate text-xs opacity-80">{appointment.serviceName}</p>}
    </div>
  );
}

function AppointmentDetail({
  appointment,
  onStatusChange
}: {
  appointment: AppointmentBooking;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}) {
  const styles = statusStyles[appointment.status];
  const staffColor = getStaffColor(appointment.staffName);

  return (
    <article className="min-w-0 max-w-full overflow-hidden rounded-lg border border-cocoa/10 bg-cream/40 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-black text-ink dark:text-white">
            <Clock size={16} className="shrink-0" />
            {appointment.startTime} - {appointment.endTime}
          </p>
          <h4 className="mt-2 truncate text-lg font-black text-ink dark:text-white">{appointment.clientName}</h4>
          <p className="mt-1 text-sm font-semibold text-cocoa dark:text-pink-200">{appointment.serviceName}</p>
        </div>
        <span className={cn("max-w-[44%] shrink-0 truncate rounded-full px-3 py-1 text-xs font-black", styles.chip)}>{statusLabels[appointment.status]}</span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted dark:text-pink-100/80">
        <span className="flex min-w-0 items-center gap-2">
          <UserRound size={16} className="shrink-0" />
          <span className="truncate">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: staffColor }} /> {appointment.staffName || "Sin colaborador"}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <Phone size={16} className="shrink-0" />
          <span className="truncate">{appointment.phone} - {appointment.instagram || "Sin Instagram"}</span>
        </span>
      </div>

      <select
        className="mt-4 min-h-11 w-full min-w-0 max-w-full rounded-lg border border-cocoa/20 bg-white px-3 text-sm font-semibold text-ink dark:border-white/15 dark:bg-white/10 dark:text-white"
        value={appointment.status}
        onChange={(event) => onStatusChange(appointment.id, event.target.value as AppointmentStatus)}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-cocoa/10 bg-cream/60 p-4 dark:border-white/10 dark:bg-white/10">
      <p className="text-2xl font-black text-ink dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted dark:text-pink-100/75">{label}</p>
    </div>
  );
}

function groupAppointmentsByDate(appointments: AppointmentBooking[]) {
  const grouped = new Map<string, AppointmentBooking[]>();
  for (const appointment of appointments) {
    const current = grouped.get(appointment.appointmentDate) ?? [];
    current.push(appointment);
    grouped.set(appointment.appointmentDate, current);
  }
  for (const [date, dateAppointments] of grouped) {
    grouped.set(date, [...dateAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  }
  return grouped;
}

function groupBlocksByDate(exceptions: AvailabilityException[]) {
  const grouped = new Map<string, AvailabilityException[]>();
  for (const exception of exceptions.filter((item) => !item.isAvailable)) {
    const current = grouped.get(exception.exceptionDate) ?? [];
    current.push(exception);
    grouped.set(exception.exceptionDate, current);
  }
  return grouped;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toDateKey(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function getStaffColor(staffName?: string | null) {
  if (!staffName) return staffPalette[0];
  let hash = 0;
  for (let index = 0; index < staffName.length; index += 1) hash += staffName.charCodeAt(index) * (index + 1);
  return staffPalette[hash % staffPalette.length];
}
