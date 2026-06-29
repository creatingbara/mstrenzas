import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import { formatDisplayTime } from "@/lib/booking/availability";
import type { Service } from "@/types/service";

export function BookingSummary({
  service,
  date,
  time,
  staffName
}: {
  service: Service;
  date?: Date | null;
  time?: string | null;
  staffName?: string | null;
}) {
  if (!date || !time) return null;

  return (
    <div className="rounded-lg bg-ink p-5 text-white">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold">
        <CalendarCheck size={18} />
        Resumen de cita
      </p>
      <p className="mt-3 text-2xl font-bold">{service.name}</p>
      {staffName && <p className="mt-1 text-sm font-semibold text-gold">{staffName}</p>}
      <p className="mt-1 text-white/72">
        {format(date, "EEEE d 'de' MMMM", { locale: es })} a las {formatDisplayTime(time)}
      </p>
    </div>
  );
}
