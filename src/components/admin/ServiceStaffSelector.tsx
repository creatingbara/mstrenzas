"use client";

import Image from "next/image";
import type { StaffMember } from "@/types/staff";

export function ServiceStaffSelector({
  staffMembers,
  selectedIds,
  onChange
}: {
  staffMembers: StaffMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id));
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {staffMembers.map((staff) => {
        const initials = staff.fullName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <label key={staff.id} className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-white p-3">
            <input type="checkbox" checked={selectedIds.includes(staff.id)} onChange={(event) => toggle(staff.id, event.target.checked)} />
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-sm font-bold text-cocoa">
              {staff.photoUrl ? <Image src={staff.photoUrl} alt={staff.fullName} fill sizes="48px" className="object-cover" /> : initials}
            </span>
            <span>
              <span className="block text-sm font-bold">{staff.fullName}</span>
              <span className="block text-xs text-muted">{staff.specialty || "Sin especialidad"}</span>
            </span>
          </label>
        );
      })}
      {!staffMembers.length && <p className="text-sm text-muted">No hay colaboradores activos disponibles.</p>}
    </div>
  );
}
