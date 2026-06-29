import Image from "next/image";
import { Clock, MapPin, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Service } from "@/types/service";

export function BookingServiceInfo({ service }: { service: Service }) {
  return (
    <aside className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft lg:sticky lg:top-24">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream">
        <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="(min-width: 1024px) 36vw, 100vw" />
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-cocoa">
        <Sparkles size={17} />
        M&S Trenzas
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold">{service.name}</h1>
      <p className="mt-3 leading-7 text-muted">{service.description}</p>
      <div className="mt-5 grid gap-3">
        <Info icon={<Clock size={18} />} label="Duración" value={formatDuration(service.durationMinutes)} />
        <Info label="Precio" value={formatPrice(service.priceFrom, service.requiresQuote)} />
        <Info icon={<MapPin size={18} />} label="Ubicación" value="La ubicación exacta será confirmada por WhatsApp" />
      </div>
      <div className="mt-6">
        <h2 className="font-display text-2xl font-bold">Incluye</h2>
        <div className="mt-3 grid gap-2">
          {service.includes.map((item) => (
            <p key={item} className="rounded-lg bg-cream px-3 py-2 text-sm text-muted">
              {item}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-cocoa/10 bg-cream/60 p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cocoa">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
