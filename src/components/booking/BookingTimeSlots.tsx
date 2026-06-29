"use client";

import { cn } from "@/lib/utils";
import { formatDisplayTime } from "@/lib/booking/availability";

export function BookingTimeSlots({
  slots,
  selectedTime,
  onSelect
}: {
  slots: string[];
  selectedTime?: string | null;
  onSelect: (time: string) => void;
}) {
  if (!slots.length) {
    return <p className="rounded-lg bg-cream p-4 text-sm font-semibold text-cocoa">No hay horarios disponibles para esta fecha.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm font-bold transition",
            selectedTime === slot
              ? "border-ink bg-ink text-white"
              : "border-cocoa/20 bg-white text-ink hover:border-cocoa hover:bg-cream"
          )}
          onClick={() => onSelect(slot)}
        >
          {formatDisplayTime(slot)}
        </button>
      ))}
    </div>
  );
}
