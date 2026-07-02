import Link from "next/link";
import { CalendarDays, Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { whatsappLink } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/settings";
import type { AppPageSection } from "@/types/super-panel";

export function ContactSection({
  settings,
  introSection,
  agendaSection
}: {
  settings: SiteSettings;
  introSection?: AppPageSection;
  agendaSection?: AppPageSection;
}) {
  const instagramValue = formatInstagramHandle(settings.instagram);

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{introSection?.content || "Contacto"}</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{introSection?.title || "Hablemos de tu proximo estilo"}</h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            {introSection?.subtitle ||
              "Escribenos por WhatsApp para consultas rapidas o entra al calendario para seleccionar servicio, fecha y hora disponible."}
          </p>
          <div className="mt-8 grid gap-3">
            <Info icon={<MessageCircle size={20} />} label="WhatsApp" value="Cotizaciones y citas" href={whatsappLink(settings.whatsappMessage, settings.whatsapp)} />
            <Info icon={<Instagram size={20} />} label="Instagram" value={instagramValue} href={settings.instagram} />
            <Info icon={<MapPin size={20} />} label="Zona" value={settings.zone} />
            <Info icon={<Clock size={20} />} label="Horarios" value={settings.hours} />
          </div>
        </div>
        <Card className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{agendaSection?.content || "Agenda online"}</p>
          <h3 className="mt-3 font-display text-4xl font-bold">{agendaSection?.title || "Reserva desde el calendario"}</h3>
          <p className="mt-4 leading-7 text-muted">
            {agendaSection?.subtitle ||
              "Elige el estilo que deseas, revisa los horarios disponibles y envia tu solicitud de cita desde el flujo actualizado."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={introSection?.buttonUrl || "/catalogo"}>
              <Button className="w-full">
                <CalendarDays size={18} />
                {introSection?.buttonLabel || "Ver catalogo y agendar"}
              </Button>
            </Link>
            <Link href={whatsappLink(settings.whatsappMessage, settings.whatsapp)} target="_blank">
              <Button variant="outline" className="w-full">
                <MessageCircle size={18} />
                {agendaSection?.buttonLabel || "WhatsApp"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}

function formatInstagramHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Instagram";
  if (trimmed.startsWith("@")) return trimmed;

  try {
    const url = new URL(trimmed);
    const handle = url.pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : trimmed;
  } catch {
    return trimmed;
  }
}

function Info({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-white p-4">
      <span className="grid size-10 place-items-center rounded-full bg-cream text-cocoa">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target="_blank">
        {content}
      </Link>
    );
  }

  return content;
}
