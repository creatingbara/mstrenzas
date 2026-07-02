import Link from "next/link";
import { Clock, Instagram, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/settings";
import type { AppFooterSettings, AppNavigationItem } from "@/types/super-panel";

export function Footer({
  settings,
  footer,
  navigation
}: {
  settings: SiteSettings;
  footer: AppFooterSettings;
  navigation: AppNavigationItem[];
}) {
  const businessName = footer.businessName || "M&S Trenzas";
  const description = footer.description || "Trenzas africanas, estilos protectores y extensiones 100% Human Hair con acabado profesional.";
  const whatsapp = footer.whatsapp || settings.whatsapp;
  const instagram = footer.instagramUrl || settings.instagram;
  const links = navigation.filter((item) => item.isActive && !item.parentId && item.href !== "#").slice(0, 5);

  return (
    <footer className="border-t border-cocoa/10 bg-ink text-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-2xl font-bold">
            <Sparkles className="text-gold" size={22} />
            {businessName}
          </div>
          <p className="max-w-md text-sm leading-6 text-white/70">{description}</p>
          {(footer.address || footer.schedule) && (
            <div className="mt-4 grid gap-2 text-sm text-white/65">
              {footer.address && (
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 shrink-0 text-gold" size={16} />
                  {footer.address}
                </p>
              )}
              {footer.schedule && (
                <p className="flex gap-2">
                  <Clock className="mt-0.5 shrink-0 text-gold" size={16} />
                  {footer.schedule}
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-gold">Explorar</p>
          <div className="grid gap-2 text-sm text-white/70">
            {links.length ? (
              links.map((item) => (
                <Link key={item.id} href={item.href} target={item.opensNewTab ? "_blank" : undefined} rel={item.opensNewTab ? "noreferrer" : undefined}>
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/catalogo">Catalogo</Link>
                <Link href="/antes-de-agendar">Antes de agendar</Link>
                <Link href="/galeria">Galeria</Link>
              </>
            )}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-gold">Contacto</p>
          <div className="flex gap-3">
            <Link className="grid size-10 place-items-center rounded-full bg-white/10" href={whatsappLink(settings.whatsappMessage, whatsapp)}>
              <MessageCircle size={18} />
            </Link>
            {instagram && (
              <Link className="grid size-10 place-items-center rounded-full bg-white/10" href={instagram} target="_blank">
                <Instagram size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="container-shell border-t border-white/10 py-4 text-xs text-white/50">{footer.copyrightText}</div>
    </footer>
  );
}
