import type { Metadata } from "next";
import Link from "next/link";
import { ServicesGrid, serviceCategoryAnchor } from "@/components/public/ServicesGrid";
import { getServices, getSiteSettings } from "@/lib/local-db";
import { getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("catalogo");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined }
  };
}

export default async function CatalogPage() {
  const [rawServices, settings, pageSections] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getAppPageSections("catalogo", { activeOnly: true })
  ]);
  const services = rawServices.filter((service) => service.active !== false);
  const categories = Array.from(new Set(services.map((service) => service.category.trim()).filter(Boolean)));
  const intro = pageSectionsByKey(pageSections).intro;

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{intro?.content || "Catalogo"}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{intro?.title || "Catalogo de estilos y servicios"}</h1>
          <p className="mt-4 leading-7 text-muted">
            {intro?.subtitle || "Explora servicios por categoría y revisa su precio y duración antes de agendar."}
          </p>
        </div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link key={category} href={`#${serviceCategoryAnchor(category)}`} className="shrink-0 rounded-full border border-cocoa/20 bg-white px-4 py-2 text-sm font-semibold text-cocoa">
              {category}
            </Link>
          ))}
        </div>
        <ServicesGrid services={services} whatsappPhone={settings.whatsapp} groupByCategory />
      </div>
    </section>
  );
}
