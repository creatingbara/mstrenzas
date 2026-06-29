import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteSettings } from "@/lib/data";
import { getServiceById } from "@/lib/local-db";
import { formatDuration, formatPrice } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceById(slug);
  if (!service) notFound();

  const message = `Hola M&S Trenzas, quiero agendar o cotizar: ${service.name}.`;
  const bookingHref = `/agendar/servicio/${service.slug || service.id}`;

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream shadow-soft">
            <Image src={service.imageUrl} alt={service.name} fill className="object-cover" priority sizes="(min-width: 1024px) 55vw, 100vw" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{service.category}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{service.name}</h1>
          <p className="mt-4 leading-7 text-muted">{service.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Precio" value={formatPrice(service.priceFrom, service.requiresQuote)} />
            <Info label="Duración" value={formatDuration(service.durationMinutes)} />
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={bookingHref}>
              <Button className="w-full sm:w-auto">
                <CalendarDays size={18} />
                Agendar
              </Button>
            </Link>
            <Link href={whatsappLink(message, siteSettings.whatsapp)} target="_blank">
              <Button variant="outline" className="w-full sm:w-auto">
                <MessageCircle size={18} />
                WhatsApp
              </Button>
            </Link>
          </div>
          <DetailList title="Recomendaciones" icon="check" items={service.recommendations} />
          <DetailList title="Qué incluye" icon="check" items={service.includes} />
          <DetailList title="Qué no incluye" icon="x" items={service.excludes} />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function DetailList({ title, items, icon }: { title: string; items: string[]; icon: "check" | "x" }) {
  return (
    <div className="mt-7">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-lg bg-white p-3 text-sm text-muted">
            {icon === "check" ? <CheckCircle2 className="text-cocoa" size={18} /> : <XCircle className="text-cocoa" size={18} />}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
