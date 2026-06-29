"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppointmentBooking, AppointmentStatus, AvailabilityException } from "@/types/appointment";

const statuses: AppointmentStatus[] = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"];

export function AdminCalendarView({
  appointments: initialAppointments,
  exceptions
}: {
  appointments: AppointmentBooking[];
  exceptions: AvailabilityException[];
}) {
  const [selectedDate, setSelectedDate] = useState(initialAppointments[0]?.appointmentDate ?? "");
  const [items, setItems] = useState(initialAppointments);
  const [notice, setNotice] = useState<string | null>(null);
  const appointments = items.filter((item) => item.appointmentDate === selectedDate);
  const blocks = exceptions.filter((item) => item.exceptionDate === selectedDate && !item.isAvailable);

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

  return (
    <div className="grid gap-5">
      <div className="rounded-lg bg-white p-5 shadow-soft">
        <label className="grid gap-2 text-sm font-semibold">
          Vista por día
          <input className="min-h-11 rounded-lg border border-cocoa/20 px-3" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
      </div>
      {blocks.map((block) => (
        <div key={block.id} className="rounded-lg bg-cream p-4 text-sm font-semibold text-cocoa">
          Día bloqueado: {block.reason || "Sin razón"}
        </div>
      ))}
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
      <div className="grid gap-3">
        {appointments.length ? appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="font-display text-2xl font-bold">{appointment.startTime} - {appointment.endTime}</p>
                <p className="font-semibold">{appointment.clientName} - {appointment.serviceName}</p>
                <p className="text-sm text-muted">{appointment.staffName || "Sin colaborador"} - {appointment.phone} - {appointment.instagram || "Sin Instagram"}</p>
              </div>
              <select
                className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3"
                value={appointment.status}
                onChange={(event) => updateStatus(appointment.id, event.target.value as AppointmentStatus)}
              >
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        )) : (
          <div className="rounded-lg bg-white p-5 text-sm text-muted shadow-soft">No hay citas para esta fecha.</div>
        )}
      </div>
      <Button variant="outline">Vista semanal próximamente</Button>
    </div>
  );
}
