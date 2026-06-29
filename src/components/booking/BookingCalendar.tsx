"use client";

import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { getAvailableDaysForServiceMonth, getCalendarWeeks, isCalendarSameDay } from "@/lib/booking/availability";
import { cn } from "@/lib/utils";
import type { StaffMember, StaffScheduleData } from "@/types/staff";

export function BookingCalendar({
  serviceId,
  staffMemberId,
  durationMinutes,
  staffMembers,
  schedulesByStaff,
  selectedDate,
  onSelectDate
}: {
  serviceId: string;
  staffMemberId?: string | null;
  durationMinutes: number;
  staffMembers: StaffMember[];
  schedulesByStaff: Record<string, StaffScheduleData>;
  selectedDate?: Date | null;
  onSelectDate: (date: Date) => void;
}) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const availableDays = useMemo(() => {
    return getAvailableDaysForServiceMonth({
      serviceId,
      staffMemberId,
      month,
      durationMinutes,
      staffMembers,
      schedulesByStaff
    });
  }, [durationMinutes, month, schedulesByStaff, serviceId, staffMemberId, staffMembers]);
  const weeks = getCalendarWeeks(month);
  const hasMonthAvailability = availableDays.length > 0;

  function isAvailable(date: Date) {
    return availableDays.some((day) => isCalendarSameDay(day, date));
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-cocoa/20"
          onClick={() => setMonth(addMonths(month, -1))}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display text-2xl font-bold capitalize">{format(month, "MMMM yyyy", { locale: es })}</h2>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-cocoa/20"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-[0.12em] text-cocoa">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <span key={day} className="py-2">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-2 grid gap-1">
        {weeks.map((week, index) => (
          <div key={index} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const available = isAvailable(day);
              const selected = selectedDate ? isCalendarSameDay(day, selectedDate) : false;
              const currentMonth = isSameMonth(day, month);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={!available}
                  className={cn(
                    "aspect-square rounded-full text-sm font-bold transition",
                    !currentMonth && "text-muted/30",
                    available && "bg-cream text-ink hover:bg-nude",
                    selected && "bg-ink text-white hover:bg-ink",
                    !available && "cursor-not-allowed text-muted/25"
                  )}
                  onClick={() => onSelectDate(day)}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {!hasMonthAvailability && (
        <p className="mt-5 rounded-lg bg-cream p-4 text-sm font-semibold text-cocoa">
          No hay horarios disponibles este mes. Puedes revisar el próximo mes o escribirnos por WhatsApp.
        </p>
      )}
    </div>
  );
}
