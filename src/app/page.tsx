import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { BeforeBookingSection } from "@/components/public/BeforeBookingSection";
import { ContactSection } from "@/components/public/ContactSection";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { HeroSection } from "@/components/public/HeroSection";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/local-db";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HeroSection settings={settings} />
      <section className="section-pad">
        <div className="container-shell">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Servicios</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Servicios diseñados para resaltar tu belleza</h2>
            <p className="mt-4 leading-7 text-muted">
              Desde trenzas africanas hasta extensiones 100% Human Hair, trabajamos cada estilo con dedicación, detalle y amor por el arte del cabello.
            </p>
          </div>
          <ServicesGrid featured />
          <div className="mt-8">
            <Link href="/catalogo">
              <Button variant="outline">
                Ver catálogo completo
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="section-pad bg-white">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Human Hair</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Extensiones 100% Human Hair</h2>
            <p className="mt-4 leading-7 text-muted">
              Trabajamos extensiones humanas de alta calidad para lograr un resultado natural, elegante y duradero. Ideales para cambios de look, volumen, largo y estilos personalizados.
            </p>
            <Link href={whatsappLink("Hola M&S Trenzas, quiero cotizar extensiones 100% Human Hair.", settings.whatsapp)} target="_blank" className="mt-7 inline-block">
              <Button>
                <MessageCircle size={18} />
                Cotizar extensiones por WhatsApp
              </Button>
            </Link>
          </div>
          <GalleryGrid featured />
        </div>
      </section>
      <BeforeBookingSection />
      <section className="section-pad">
        <div className="container-shell">
          <div className="mb-9 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Galería</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Resultados que hablan por sí solos</h2>
            <p className="mt-4 leading-7 text-muted">
              Explora algunos de nuestros trabajos y descubre estilos creados con detalle, amor y profesionalismo.
            </p>
          </div>
          <GalleryGrid featured />
        </div>
      </section>
      <Suspense fallback={<div className="section-pad container-shell">Cargando formulario...</div>}>
        <ContactSection settings={settings} />
      </Suspense>
    </>
  );
}
