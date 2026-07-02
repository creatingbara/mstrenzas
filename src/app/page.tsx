import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { BeforeBookingSection } from "@/components/public/BeforeBookingSection";
import { ContactSection } from "@/components/public/ContactSection";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { HeroSection } from "@/components/public/HeroSection";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/local-db";
import { getAppFooterSettings, getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("home");
  return buildSeoMetadata(seo);
}

export default async function HomePage() {
  const [settings, pageSections, footer] = await Promise.all([
    getSiteSettings(),
    getAppPageSections("home", { activeOnly: true }),
    getAppFooterSettings()
  ]);
  const whatsappPhone = footer.whatsapp || settings.whatsapp;
  const sections = pageSectionsByKey(pageSections);
  const servicesSection = sections.servicios;
  const humanHairSection = sections.human_hair;
  const gallerySection = sections.galeria;

  return (
    <>
      <HeroSection settings={settings} section={sections.hero} />
      <section className="section-pad">
        <div className="container-shell">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{servicesSection?.content || "Servicios"}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              {servicesSection?.title || "Servicios disenados para resaltar tu belleza"}
            </h2>
            <p className="mt-4 leading-7 text-muted">
              {servicesSection?.subtitle ||
                "Desde trenzas africanas hasta extensiones 100% Human Hair, trabajamos cada estilo con dedicacion, detalle y amor por el arte del cabello."}
            </p>
          </div>
          <ServicesGrid featured />
          <div className="mt-8">
            <Link href={servicesSection?.buttonUrl || "/catalogo"}>
              <Button variant="outline">
                {servicesSection?.buttonLabel || "Ver catalogo completo"}
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="section-pad bg-white">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{humanHairSection?.content || "Human Hair"}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{humanHairSection?.title || "Extensiones 100% Human Hair"}</h2>
            <p className="mt-4 leading-7 text-muted">
              {humanHairSection?.subtitle ||
                "Trabajamos extensiones humanas de alta calidad para lograr un resultado natural, elegante y duradero. Ideales para cambios de look, volumen, largo y estilos personalizados."}
            </p>
            <Link
              href={humanHairSection?.buttonUrl || whatsappLink("Hola M&S Trenzas, quiero cotizar extensiones 100% Human Hair.", whatsappPhone)}
              target="_blank"
              className="mt-7 inline-block"
            >
              <Button>
                <MessageCircle size={18} />
                {humanHairSection?.buttonLabel || "Cotizar extensiones por WhatsApp"}
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{gallerySection?.content || "Galeria"}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{gallerySection?.title || "Resultados que hablan por si solos"}</h2>
            <p className="mt-4 leading-7 text-muted">
              {gallerySection?.subtitle || "Explora algunos de nuestros trabajos y descubre estilos creados con detalle, amor y profesionalismo."}
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

function buildSeoMetadata(seo: Awaited<ReturnType<typeof getAppSeoSettings>>): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined
    }
  };
}
