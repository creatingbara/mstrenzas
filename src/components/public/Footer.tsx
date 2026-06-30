import Link from "next/link";
import { Instagram, MessageCircle, Sparkles } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-cocoa/10 bg-ink text-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-2xl font-bold">
            <Sparkles className="text-gold" size={22} />
            M&S Trenzas
          </div>
          <p className="max-w-md text-sm leading-6 text-white/70">
            Trenzas africanas, estilos protectores y extensiones 100% Human Hair con acabado profesional.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-gold">Explorar</p>
          <div className="grid gap-2 text-sm text-white/70">
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/antes-de-agendar">Antes de agendar</Link>
            <Link href="/galeria">Galería</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-gold">Contacto</p>
          <div className="flex gap-3">
            <Link className="grid size-10 place-items-center rounded-full bg-white/10" href={whatsappLink(settings.whatsappMessage, settings.whatsapp)}>
              <MessageCircle size={18} />
            </Link>
            <Link className="grid size-10 place-items-center rounded-full bg-white/10" href={settings.instagram} target="_blank">
              <Instagram size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
