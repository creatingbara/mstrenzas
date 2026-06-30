import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDuration, formatPrice } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import type { Service } from "@/types/service";

export function ServiceCard({ service, whatsappPhone }: { service: Service; whatsappPhone: string }) {
  const serviceKey = service.slug || service.id;
  const bookingHref = `/agendar/servicio/${serviceKey}`;
  const message = service.whatsappMessage || `Hola M&S Trenzas, quiero consultar por el servicio: ${service.name}.`;
  const priceText = service.priceLabel || formatPrice(service.priceFrom, service.requiresQuote);
  const durationText = service.durationLabel || formatDuration(service.durationMinutes);
  const canBook = service.bookingEnabled !== false;
  const canWhatsApp = service.whatsappEnabled !== false;

  return (
    <Card className="overflow-hidden p-0">
      <Link href={`/catalogo/${service.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream">
        <Image src={service.imageUrl} alt={service.name} fill className="object-cover transition duration-500 hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
      </Link>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-cocoa">{service.category}</span>
          <span className="text-sm font-bold text-ink">{priceText}</span>
        </div>
        <h3 className="font-display text-2xl font-bold">{service.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{service.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Clock size={16} />
          {durationText}
        </div>
        <div className="mt-5 grid gap-2">
          <div className="flex gap-2">
            {canBook && (
              <Link href={bookingHref} className="flex-1">
                <Button className="w-full">
                  <CalendarDays size={18} />
                  Agendar
                </Button>
              </Link>
            )}
            {canWhatsApp && (
              <Link href={whatsappLink(message, whatsappPhone)} target="_blank" className={canBook ? undefined : "flex-1"}>
                <Button variant={canBook ? "outline" : "primary"} className={canBook ? undefined : "w-full"} aria-label="Consultar por WhatsApp">
                  <MessageCircle size={18} />
                  {!canBook && "Cotizar por WhatsApp"}
                </Button>
              </Link>
            )}
          </div>
          <Link href={`/catalogo/${service.slug}`}>
            <Button variant="ghost" className="w-full">Ver detalle</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
