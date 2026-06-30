"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessHour } from "@/types/appointment";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const intervals = [30, 45, 60, 90, 120];

export function WeeklyScheduleEditor({ businessHours }: { businessHours: BusinessHour[] }) {
  const [items, setItems] = useState(businessHours);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveSchedule() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const result = (await response.json()) as { items?: BusinessHour[]; error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo guardar el horario.");
      if (result.items) setItems(result.items);
      setStatus("Horario semanal guardado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el horario.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white">
      <div className="grid gap-3 p-4 md:hidden">
        {items.map((item) => (
          <ScheduleCard
            key={item.id}
            item={item}
            label={days[item.dayOfWeek]}
            onChange={(patch) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, ...patch } : row))}
          />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-cocoa">
          <tr>
            <th className="p-4">Día</th>
            <th className="p-4">Activo</th>
            <th className="p-4">Inicio</th>
            <th className="p-4">Cierre</th>
            <th className="p-4">Bloque</th>
            <th className="p-4">Descanso</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-cocoa/10">
              <td className="p-4 font-semibold">{days[item.dayOfWeek]}</td>
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={() => setItems((current) => current.map((row) => row.id === item.id ? { ...row, isActive: !row.isActive } : row))}
                />
              </td>
              <td className="p-4"><Input type="time" value={item.startTime} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, startTime: event.target.value } : row))} /></td>
              <td className="p-4"><Input type="time" value={item.endTime} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, endTime: event.target.value } : row))} /></td>
              <td className="p-4">
                <select className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3" value={item.slotIntervalMinutes} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, slotIntervalMinutes: Number(event.target.value) } : row))}>
                  {intervals.map((interval) => <option key={interval} value={interval}>{interval} min</option>)}
                </select>
              </td>
              <td className="p-4"><Input type="number" value={item.bufferMinutes} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, bufferMinutes: Number(event.target.value) } : row))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-cocoa/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Estos campos se guardan en la tabla business_hours.</p>
        <Button type="button" onClick={saveSchedule} disabled={saving}>
          {saving ? "Guardando..." : "Guardar horario"}
        </Button>
      </div>
      {status && <p className="border-t border-cocoa/10 p-4 text-sm font-semibold text-cocoa">{status}</p>}
    </div>
  );
}

function ScheduleCard({
  item,
  label,
  onChange
}: {
  item: BusinessHour;
  label: string;
  onChange: (patch: Partial<BusinessHour>) => void;
}) {
  return (
    <article className="rounded-lg border border-cocoa/10 bg-cream/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-black text-ink">{label}</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
          <input type="checkbox" checked={item.isActive} onChange={(event) => onChange({ isActive: event.target.checked })} />
          Activo
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-sm font-semibold">
          Inicio
          <Input type="time" value={item.startTime} onChange={(event) => onChange({ startTime: event.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Cierre
          <Input type="time" value={item.endTime} onChange={(event) => onChange({ endTime: event.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Bloque
          <select
            className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3"
            value={item.slotIntervalMinutes}
            onChange={(event) => onChange({ slotIntervalMinutes: Number(event.target.value) })}
          >
            {intervals.map((interval) => <option key={interval} value={interval}>{interval} min</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Descanso
          <Input type="number" value={item.bufferMinutes} onChange={(event) => onChange({ bufferMinutes: Number(event.target.value) })} />
        </label>
      </div>
    </article>
  );
}
