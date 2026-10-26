"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { appointmentStatusLabels, getAppointmentPrimaryAction, isActiveAppointmentForBookings } from "@/lib/appointment-status";
import type { AppointmentBooking, AppointmentStatus } from "@/types/appointment";

export function AppointmentDetails({ appointment }: { appointment: AppointmentBooking | null }) {
  const router = useRouter();
  const [item, setItem] = useState(appointment);
  const [notice, setNotice] = useState<string | null>(null);

  if (!item) {
    return <div className="rounded-lg bg-white p-5 shadow-soft dark:bg-white/5">Cita no encontrada.</div>;
  }

  const primaryAction = getAppointmentPrimaryAction(item.status);

  async function updateStatus(status: AppointmentStatus) {
    if (!item) return;
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/appointment-bookings/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = (await response.json()) as { item?: AppointmentBooking; error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo actualizar la cita.");
      if (result.item) setItem(result.item);

      setNotice(
        status === "archivada"
          ? "Cita archivada correctamente."
          : status === "completada"
            ? "Cita marcada como completada."
            : "Estado actualizado."
      );

      if (status === "completada" || status === "archivada") {
        router.refresh();
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar la cita.");
    }
  }

  async function deleteBooking() {
    if (!item) return;
    const confirmed = window.confirm(`Eliminar definitivamente la cita de ${item.clientName}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setNotice(null);

    try {
      const response = await fetch(`/api/admin/appointment-bookings/${item.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo eliminar la cita.");
      router.push("/admin/citas");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo eliminar la cita.");
    }
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa dark:text-pink-200">Detalle de cita</p>
      <h2 className="mt-3 font-display text-4xl font-bold text-ink dark:text-white">{item.clientName}</h2>
      {notice && <p className="mt-4 rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa dark:bg-white/10 dark:text-pink-100">{notice}</p>}
      {!isActiveAppointmentForBookings(item) && (
        <p className="mt-4 rounded-lg bg-cream/70 p-3 text-sm font-semibold text-muted dark:bg-white/10 dark:text-pink-100/80">
          Esta cita ya no aparece en la bandeja de Citas. Se conserva para estadisticas e historial.
        </p>
      )}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label="Servicio" value={item.serviceName} />
        <Info label="Colaborador" value={item.staffName ?? "Sin asignar"} />
        <Info label="Estado" value={appointmentStatusLabels[item.status]} />
        <Info label="Fecha" value={item.appointmentDate} />
        <Info label="Hora" value={`${item.startTime} - ${item.endTime}`} />
        <Info label="WhatsApp" value={item.phone} />
        <Info label="Instagram" value={item.instagram ?? "No indicado"} />
        <Info label="Correo" value={item.email ?? "No indicado"} />
        <Info label="Notas" value={item.notes ?? "Sin notas"} />
      </div>
      <ReferencePreview url={item.referenceImageUrl} />

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {primaryAction && (
          <Button type="button" variant="outline" className="rounded-lg" onClick={() => updateStatus(primaryAction.nextStatus)}>
            {primaryAction.label}
          </Button>
        )}
        {item.status === "cancelada" ? (
          <Button type="button" variant="outline" className="rounded-lg text-rose-700" onClick={deleteBooking}>
            Eliminar
          </Button>
        ) : (
          <Button type="button" variant="outline" className="rounded-lg" onClick={() => updateStatus("cancelada")}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream p-4 dark:bg-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa dark:text-pink-200">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink dark:text-white">{value}</p>
    </div>
  );
}

function ReferencePreview({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div className="mt-5 rounded-lg bg-cream p-4 dark:bg-white/10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa dark:text-pink-200">Referencia</p>
        <p className="mt-1 text-sm font-semibold text-muted dark:text-white/70">Sin imagen o publicacion.</p>
      </div>
    );
  }

  const looksLikeImage = /^https:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url);

  return (
    <div className="mt-5 rounded-lg bg-cream p-4 dark:bg-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa dark:text-pink-200">Referencia</p>
      {looksLikeImage && (
        <a href={url} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-cocoa/10 dark:border-white/10">
          <img src={url} alt="Referencia de la cita" className="max-h-[28rem] w-full object-cover" />
        </a>
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex text-sm font-bold text-cocoa underline dark:text-pink-100"
      >
        Abrir referencia
      </a>
    </div>
  );
}
