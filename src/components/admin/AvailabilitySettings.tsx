"use client";

import { useState } from "react";
import { BlockedDatesManager } from "@/components/admin/BlockedDatesManager";
import { SpecialHoursManager } from "@/components/admin/SpecialHoursManager";
import { WeeklyScheduleEditor } from "@/components/admin/WeeklyScheduleEditor";
import { cn } from "@/lib/utils";
import type { AvailabilityException, BusinessHour } from "@/types/appointment";

const tabs = ["Horario semanal", "Días bloqueados", "Horarios especiales"] as const;

export function AvailabilitySettings({
  businessHours,
  exceptions
}: {
  businessHours: BusinessHour[];
  exceptions: AvailabilityException[];
}) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Horario semanal");

  return (
    <div className="grid gap-5">
      <div className="flex gap-2 overflow-x-auto rounded-lg bg-white p-2 shadow-soft">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", active === tab ? "bg-ink text-white" : "text-muted hover:bg-cream")}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {active === "Horario semanal" && <WeeklyScheduleEditor businessHours={businessHours} />}
      {active === "Días bloqueados" && <BlockedDatesManager exceptions={exceptions} />}
      {active === "Horarios especiales" && <SpecialHoursManager exceptions={exceptions} />}
    </div>
  );
}
