"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvailabilityException } from "@/types/appointment";

export function SpecialHoursManager({ exceptions }: { exceptions: AvailabilityException[] }) {
  const [items, setItems] = useState(exceptions.filter((item) => item.isAvailable));
  const [form, setForm] = useState({ date: "", start: "10:00", end: "14:00", reason: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveSpecialHours() {
    if (!form.date) return;
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/availability-exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exceptionDate: form.date,
          isAvailable: true,
          startTime: form.start,
          endTime: form.end,
          reason: form.reason
        })
      });
      const result = (await response.json()) as { item?: AvailabilityException; error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo guardar el horario especial.");
      if (result.item) {
        const savedItem = result.item;
        setItems((current) => [...current.filter((item) => item.id !== savedItem.id && item.exceptionDate !== savedItem.exceptionDate), savedItem]);
      }
      setForm({ date: "", start: "10:00", end: "14:00", reason: "" });
      setStatus("Horario especial guardado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el horario especial.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-cocoa/10 bg-white p-5">
        <h2 className="font-display text-2xl font-bold">Horario especial</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <Input type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} />
          <Input type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} />
          <Input placeholder="Razon opcional" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          <Button type="button" onClick={saveSpecialHours} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
        {status && <p className="mt-3 text-sm font-semibold text-cocoa">{status}</p>}
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg bg-white p-4 shadow-soft">
            <p className="font-semibold">{item.exceptionDate}: {item.startTime} - {item.endTime}</p>
            <p className="text-sm text-muted">{item.reason || "Horario especial"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
