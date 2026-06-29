"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

export function CollaboratorServicesManager({ staff, services }: { staff: StaffMember; services: Service[] }) {
  const [selected, setSelected] = useState(staff.services);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/staff/${staff.id}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: selected })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
      setNotice("Servicios asignados guardados.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <label key={service.id} className="flex items-center gap-3 rounded-lg border border-cocoa/10 p-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={selected.includes(service.id)}
              onChange={(event) => {
                setSelected((current) =>
                  event.target.checked ? [...current, service.id] : current.filter((id) => id !== service.id)
                );
              }}
            />
            {service.name}
          </label>
        ))}
      </div>
      <Button type="button" onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar servicios"}</Button>
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
    </div>
  );
}
