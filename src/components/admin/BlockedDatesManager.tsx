"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvailabilityException } from "@/types/appointment";

export function BlockedDatesManager({ exceptions }: { exceptions: AvailabilityException[] }) {
  const [items, setItems] = useState(exceptions.filter((item) => !item.isAvailable));
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addBlockedDate() {
    if (!date) return;
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/availability-exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exceptionDate: date, isAvailable: false, reason })
      });
      const result = (await response.json()) as { item?: AvailabilityException; error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo bloquear el día.");
      if (result.item) {
        const savedItem = result.item;
        setItems((current) => [...current.filter((item) => item.id !== savedItem.id && item.exceptionDate !== savedItem.exceptionDate), savedItem]);
      }
      setDate("");
      setReason("");
      setStatus("Día bloqueado guardado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo bloquear el día.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlockedDate(id: string) {
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/availability-exceptions?id=${id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo eliminar el bloqueo.");
      setItems((current) => current.filter((row) => row.id !== id));
      setStatus("Bloqueo eliminado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar el bloqueo.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-cocoa/10 bg-white p-5">
        <h2 className="font-display text-2xl font-bold">Bloquear día</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input placeholder="Razón" value={reason} onChange={(event) => setReason(event.target.value)} />
          <Button type="button" onClick={addBlockedDate} disabled={saving}>
            {saving ? "Guardando..." : "Bloquear día"}
          </Button>
        </div>
        {status && <p className="mt-3 text-sm font-semibold text-cocoa">{status}</p>}
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-soft">
            <div>
              <p className="font-semibold">{item.exceptionDate}</p>
              <p className="text-sm text-muted">{item.reason || "Día bloqueado"}</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => removeBlockedDate(item.id)}>
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
