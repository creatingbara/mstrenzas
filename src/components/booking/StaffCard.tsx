"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StaffMember } from "@/types/staff";

export function StaffCard({
  staff,
  selected,
  onSelect
}: {
  staff: StaffMember;
  selected: boolean;
  onSelect: () => void;
}) {
  const initials = staff.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      className={cn(
        "grid gap-4 rounded-lg border bg-white p-5 text-left shadow-soft transition hover:border-cocoa/40",
        selected ? "border-ink ring-2 ring-ink/10" : "border-cocoa/10"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {staff.photoUrl ? (
          <img src={staff.photoUrl} alt={staff.fullName} className="size-14 shrink-0 rounded-full object-cover" />
        ) : (
          <div
            className="grid size-14 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: staff.calendarColor || "#65004d" }}
          >
            {initials}
          </div>
        )}
        <div>
          <h3 className="font-display text-2xl font-bold">{staff.fullName}</h3>
          <p className="text-sm font-semibold text-cocoa">{staff.specialty || "Colaboradora M&S Trenzas"}</p>
          {staff.bio && <p className="mt-2 text-sm leading-6 text-muted">{staff.bio}</p>}
        </div>
      </div>
      <Button type="button" variant={selected ? "primary" : "outline"} className="w-full">
        {selected ? "Seleccionada" : "Elegir"}
      </Button>
    </button>
  );
}
