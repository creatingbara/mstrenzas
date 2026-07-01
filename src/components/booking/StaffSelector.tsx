"use client";

import { Shuffle } from "lucide-react";
import { StaffCard } from "@/components/booking/StaffCard";
import { cn } from "@/lib/utils";
import type { StaffMember } from "@/types/staff";

export function StaffSelector({
  staffMembers,
  selectedStaffId,
  onSelect
}: {
  staffMembers: StaffMember[];
  selectedStaffId: string | null;
  onSelect: (staffId: string) => void;
}) {
  if (!staffMembers.length) {
    return (
      <div className="rounded-lg border border-cocoa/10 bg-white p-5 text-sm font-semibold text-cocoa shadow-soft">
        No hay colaboradores disponibles para este servicio. Escríbenos por WhatsApp para recibir ayuda.
      </div>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
        <h2 className="font-display text-3xl font-bold">Elige con quién deseas atenderte</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Puedes elegir una colaboradora específica o permitir que asignemos la primera disponibilidad.
        </p>
        <button
          type="button"
          className={cn(
            "mt-4 flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition",
            selectedStaffId === "any" ? "border-ink bg-ink text-white" : "border-cocoa/10 bg-cream text-ink hover:border-cocoa/30"
          )}
          onClick={() => onSelect("any")}
        >
          <span>
            <span className="block font-bold">Continuar con cualquier colaboradora disponible</span>
            <span className={cn("text-sm", selectedStaffId === "any" ? "text-white/70" : "text-muted")}>
              Te mostraremos los horarios libres de todas las colaboradoras.
            </span>
          </span>
          <Shuffle size={20} />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {staffMembers.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            selected={selectedStaffId === staff.id}
            onSelect={() => onSelect(staff.id)}
          />
        ))}
      </div>
    </section>
  );
}
