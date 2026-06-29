import Image from "next/image";
import { CalendarDays, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Service } from "@/types/service";

export function ServicePreviewCard({ service }: { service: Service }) {
  const price = service.priceLabel || formatPrice(service.priceFrom, service.requiresQuote);
  const duration = service.durationLabel || formatDuration(service.durationMinutes);

  return (
    <div className="overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-soft">
      <div className="relative aspect-[4/3] bg-cream">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} fill sizes="360px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">Sin imagen</div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-cocoa">{service.category}</span>
          <span className="text-sm font-bold text-ink">{price}</span>
        </div>
        <h3 className="font-display text-2xl font-bold">{service.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{service.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Clock size={16} />
          {duration}
        </div>
        <div className="mt-5 flex gap-2">
          {service.bookingEnabled !== false && (
            <Button className="flex-1">
              <CalendarDays size={18} />
              Agendar
            </Button>
          )}
          {service.whatsappEnabled !== false && (
            <Button variant="outline" aria-label="WhatsApp">
              <MessageCircle size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
