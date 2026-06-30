"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AppointmentBooking, AppointmentStatus } from "@/types/appointment";

const statuses: AppointmentStatus[] = ["pendiente", "confirmada", "cancelada", "completada", "no_asistio"];

export function BookingsTable({ appointments }: { appointments: AppointmentBooking[] }) {
  const [items, setItems] = useState(appointments);
  const [notice, setNotice] = useState<string | null>(null);

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

  async function deleteBooking(booking: AppointmentBooking) {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la cita de ${booking.clientName}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setNotice(null);

    try {
      const response = await fetch(`/api/admin/appointment-bookings/${booking.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; message?: string };

      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo eliminar la cita.");
      setItems((current) => current.filter((item) => item.id !== booking.id));
      setNotice(result.message || "Cita eliminada correctamente.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo eliminar la cita.");
    }
  }

  return (
    <div className="grid gap-3">
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
      <div className="grid gap-3 md:hidden">
        {items.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-cocoa/10 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-ink">{booking.clientName}</p>
                <p className="mt-1 text-sm font-semibold text-cocoa">{booking.appointmentDate} - {booking.startTime}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa">{booking.status}</span>
            </div>
            <div className="mt-3 grid gap-1 text-sm text-muted">
              <p><span className="font-semibold text-ink">Servicio:</span> {booking.serviceName}</p>
              <p><span className="font-semibold text-ink">Colaborador:</span> {booking.staffName || "Sin asignar"}</p>
              <p><span className="font-semibold text-ink">WhatsApp:</span> {booking.phone}</p>
              <p><span className="font-semibold text-ink">Instagram:</span> {booking.instagram || "No indicado"}</p>
            </div>
            <select
              className="mt-4 min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3"
              value={booking.status}
              onChange={(event) => updateStatus(booking.id, event.target.value as AppointmentStatus)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={() => updateStatus(booking.id, "confirmada")}>Confirmar</Button>
              <Button type="button" variant="ghost" onClick={() => updateStatus(booking.id, "cancelada")}>Cancelar</Button>
              {booking.status === "cancelada" && (
                <Button type="button" variant="ghost" onClick={() => deleteBooking(booking)}>
                  Eliminar
                </Button>
              )}
              <Link href={`/admin/citas/${booking.id}`} className="contents">
                <Button type="button" variant="ghost">Ver</Button>
              </Link>
            </div>
          </article>
        ))}
        {!items.length && <p className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">No hay citas registradas.</p>}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-cocoa/10 bg-white md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-cocoa">
            <tr>
              <th className="p-4">Clienta</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4">Instagram</th>
              <th className="p-4">Servicio</th>
              <th className="p-4">Colaborador</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((booking) => (
              <tr key={booking.id} className="border-t border-cocoa/10">
                <td className="p-4 font-semibold">{booking.clientName}</td>
                <td className="p-4">{booking.phone}</td>
                <td className="p-4">{booking.instagram || "No indicado"}</td>
                <td className="p-4">{booking.serviceName}</td>
                <td className="p-4">{booking.staffName || "Sin asignar"}</td>
                <td className="p-4">{booking.appointmentDate} {booking.startTime}</td>
                <td className="p-4">
                  <select
                    className="rounded-lg border border-cocoa/20 bg-white px-3 py-2"
                    value={booking.status}
                    onChange={(event) => updateStatus(booking.id, event.target.value as AppointmentStatus)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="flex gap-2 p-4">
                  <Button type="button" variant="outline" onClick={() => updateStatus(booking.id, "confirmada")}>Confirmar</Button>
                  <Button type="button" variant="ghost" onClick={() => updateStatus(booking.id, "cancelada")}>Cancelar</Button>
                  {booking.status === "cancelada" && (
                    <Button type="button" variant="ghost" onClick={() => deleteBooking(booking)}>
                      Eliminar
                    </Button>
                  )}
                  <Link href={`/admin/citas/${booking.id}`}>
                    <Button type="button" variant="ghost">Ver</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="p-4 text-sm text-muted">No hay citas registradas.</p>}
      </div>
    </div>
  );
}
