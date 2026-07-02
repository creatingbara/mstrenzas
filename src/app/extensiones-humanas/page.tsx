import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { getProducts, getSiteSettings } from "@/lib/local-db";
import { getAppFooterSettings, getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("extensiones-humanas");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined }
  };
}

export default async function HumanHairPage() {
  const [products, settings, pageSections, footer] = await Promise.all([
    getProducts({ activeOnly: true }),
    getSiteSettings(),
    getAppPageSections("extensiones-humanas", { activeOnly: true }),
    getAppFooterSettings()
  ]);
  const whatsappPhone = footer.whatsapp || settings.whatsapp;
  const sections = pageSectionsByKey(pageSections);
  const intro = sections.intro;
  const quote = sections.quote;

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{intro?.content || "Extensiones"}</p>
            <h1 className="mt-3 font-display text-5xl font-bold">{intro?.title || "Extensiones 100% Human Hair"}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              {intro?.subtitle ||
                "Trabajamos extensiones humanas de alta calidad para cambios de look, volumen, largo y estilos personalizados con acabado natural."}
            </p>
          </div>
          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <Sparkles className="text-gold" />
            <p className="mt-3 text-2xl font-semibold">{quote?.title || "Cotiza segun textura, largo, color y disponibilidad."}</p>
            {quote?.subtitle && <p className="mt-3 text-sm leading-6 text-white/75">{quote.subtitle}</p>}
            <Link
              href={quote?.buttonUrl || whatsappLink("Hola M&S Trenzas, quiero cotizar extensiones 100% Human Hair.", whatsappPhone)}
              target="_blank"
              className="mt-5 inline-block"
            >
              <Button variant="secondary">
                <MessageCircle size={18} />
                {quote?.buttonLabel || "Cotizar por WhatsApp"}
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} whatsappPhone={settings.whatsapp} />
          ))}
        </div>
      </div>
    </section>
  );
}
