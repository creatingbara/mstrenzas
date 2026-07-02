import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/types/settings";
import type { AppPageSection } from "@/types/super-panel";

export function HeroSection({ settings, section }: { settings: SiteSettings; section?: AppPageSection }) {
  const title = section?.title || settings.heroTitle;
  const subtitle = section?.subtitle || settings.heroSubtitle;
  const badge = section?.content || "Belleza protectora con acabado premium";
  const imageUrl = section?.imageUrl || "/brand/hero-ms-trenzas.jpg";
  const buttonLabel = section?.buttonLabel || "Agendar cita";
  const buttonUrl = section?.buttonUrl || "/catalogo";

  return (
    <section className="overflow-hidden">
      <div className="container-shell grid min-h-[calc(100vh-64px)] items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cocoa/15 bg-white px-4 py-2 text-sm font-semibold text-cocoa">
            <Sparkles size={16} />
            {badge}
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-normal text-ink md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={buttonUrl}>
              <Button className="w-full sm:w-auto">
                <CalendarDays size={18} />
                {buttonLabel}
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="outline" className="w-full sm:w-auto">
                Ver catalogo
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-cream shadow-soft lg:min-h-[620px]">
          <img
            src={imageUrl}
            alt="Trabajo de trenzas realizado por M&S Trenzas"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/78 to-transparent p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">M&S Trenzas</p>
            <p className="mt-2 max-w-sm text-2xl font-semibold">Estilos pensados para cuidarte y hacerte brillar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
