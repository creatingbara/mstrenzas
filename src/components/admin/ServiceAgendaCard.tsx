"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Edit3, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Service } from "@/types/service";

export function ServiceAgendaCard({
  service,
  assignedStaffCount,
  onToggleStatus
}: {
  service: Service;
  assignedStaffCount: number;
  onToggleStatus: (service: Service) => void;
}) {
  const price = service.priceLabel || formatPrice(service.priceFrom, service.requiresQuote);
  const duration = service.durationLabel || formatDuration(service.durationMinutes);

  return (
    <article className="overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-[0_18px_50px_rgba(101,0,77,0.08)]">
      <div className="relative aspect-[16/9] bg-cream">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-muted">Sin imagen</div>
        )}
        <span className={`absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow-sm ${service.active === false ? "text-rose-700" : "text-emerald-700"}`}>
          {service.active === false ? "Inactivo" : "Activo"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-cocoa shadow-sm">
          {service.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-cocoa/92 px-3 py-1 text-xs font-bold text-white shadow-sm">
          {price}
        </span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-2xl font-black text-ink">{service.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-ink">
            <Clock size={17} />
            {duration}
          </span>
        </div>
        <p className="min-h-12 text-sm leading-6 text-muted">{service.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span className="flex items-center gap-2">
            <CalendarDays size={16} />
            Agenda: {service.bookingEnabled === false ? "Inactiva" : "Activa"}
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} />
            Colaboradores: {assignedStaffCount}
          </span>
        </div>
        {assignedStaffCount === 0 && (
          <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm font-semibold text-cocoa">
            Este servicio no tiene colaboradores asignados.
          </p>
        )}
        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_1.35fr_auto]">
          <Link href={`/admin/servicios-agenda/${service.id}`}>
            <Button variant="outline" className="w-full rounded-lg">
              <Edit3 size={16} />
              Editar
            </Button>
          </Link>
          <Link href={`/admin/calendario?service=${service.slug}`}>
            <Button variant="outline" className="w-full rounded-lg">Ver agenda</Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="rounded-lg px-0"
            aria-label={service.active === false ? "Activar servicio" : "Desactivar servicio"}
            title={service.active === false ? "Activar servicio" : "Desactivar servicio"}
            onClick={() => onToggleStatus(service)}
          >
            <MoreHorizontal size={18} />
          </Button>
        </div>
      </div>
    </article>
  );
}
