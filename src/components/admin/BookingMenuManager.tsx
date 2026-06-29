"use client";

import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BookingMenuItem } from "@/types/booking-menu";

type BookingMenuResponse = {
  items?: BookingMenuItem[];
  error?: string;
  message?: string;
};

export function BookingMenuManager({ initialItems }: { initialItems: BookingMenuItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function updateItem(id: string, patch: Partial<BookingMenuItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next.map((entry, sortOrder) => ({ ...entry, sortOrder }));
    });
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/agenda-cita", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item, sortOrder) => ({ ...item, sortOrder })) })
      });
      const result = (await response.json()) as BookingMenuResponse;
      if (!response.ok || !result.items) throw new Error(result.error || "No se pudo guardar el submenu.");

      setItems(result.items);
      setStatus({ type: "ok", message: result.message || "Submenu actualizado correctamente." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el submenu." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold">Texto del submenu</h3>
          <p className="mt-1 text-sm text-muted">Este bloque solo cambia los nombres, enlaces y orden del desplegable público.</p>
        </div>
        <Button type="button" onClick={save} disabled={saving}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar submenu"}
        </Button>
      </div>

      {status && (
        <p className={status.type === "ok" ? "text-sm font-semibold text-cocoa" : "text-sm font-semibold text-red-600"}>
          {status.message}
        </p>
      )}

      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-cocoa/10 bg-cream/30 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Opción {index + 1}</p>
                <p className="text-sm text-muted">{item.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={index === 0} onClick={() => moveItem(item.id, -1)} aria-label="Subir opción">
                  <ArrowUp size={16} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(item.id, 1)}
                  aria-label="Bajar opción"
                >
                  <ArrowDown size={16} />
                </Button>
                <label className="flex items-center gap-2 rounded-lg border border-cocoa/10 bg-white px-3 py-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(event) => updateItem(item.id, { active: event.target.checked })}
                  />
                  Activo
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} placeholder="Título visible" />
              <Input value={item.href} onChange={(event) => updateItem(item.id, { href: event.target.value })} placeholder="/agendar/ruta" />
            </div>
            <Textarea
              className="mt-4"
              value={item.description ?? ""}
              onChange={(event) => updateItem(item.id, { description: event.target.value })}
              placeholder="Descripción interna"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
