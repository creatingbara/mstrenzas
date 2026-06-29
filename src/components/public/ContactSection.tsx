import Link from "next/link";
import { CalendarDays, Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export function ContactSection() {
  return (
    <section className="section-pad">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Contacto</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Hablemos de tu próximo estilo</h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Escríbenos por WhatsApp para consultas rápidas o entra al calendario para seleccionar servicio, fecha y hora disponible.
          </p>
          <div className="mt-8 grid gap-3">
            <Info icon={<MessageCircle size={20} />} label="WhatsApp" value="Cotizaciones y citas" href={whatsappLink(siteSettings.whatsappMessage)} />
            <Info icon={<Instagram size={20} />} label="Instagram" value="@mystrenzas_mechyrd" href={siteSettings.instagram} />
            <Info icon={<MapPin size={20} />} label="Zona" value={siteSettings.zone} />
            <Info icon={<Clock size={20} />} label="Horarios" value={siteSettings.hours} />
          </div>
        </div>
        <Card className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Agenda online</p>
          <h3 className="mt-3 font-display text-4xl font-bold">Reserva desde el calendario</h3>
          <p className="mt-4 leading-7 text-muted">
            Elige el estilo que deseas, revisa los horarios disponibles y envía tu solicitud de cita desde el flujo actualizado.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/agendar/catalogo-trenzas">
              <Button className="w-full">
                <CalendarDays size={18} />
                Ver catálogo y agendar
              </Button>
            </Link>
            <Link href={whatsappLink(siteSettings.whatsappMessage)} target="_blank">
              <Button variant="outline" className="w-full">
                <MessageCircle size={18} />
                WhatsApp
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
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
