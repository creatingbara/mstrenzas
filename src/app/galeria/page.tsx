import Link from "next/link";
import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { categories } from "@/lib/data";
import { getSiteSettings } from "@/lib/local-db";
import { getAppFooterSettings, getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("galeria");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined }
  };
}

export default async function GalleryPage() {
  const [siteSettings, pageSections, footer] = await Promise.all([
    getSiteSettings(),
    getAppPageSections("galeria", { activeOnly: true }),
    getAppFooterSettings()
  ]);
  const intro = pageSectionsByKey(pageSections).intro;
  const instagram = footer.instagramUrl || siteSettings.instagram;

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{intro?.content || "Galeria"}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{intro?.title || "Galeria e inspiracion desde Instagram"}</h1>
          <p className="mt-4 leading-7 text-muted">
            {intro?.subtitle || "Trabajos destacados, referencias e ideas seleccionadas manualmente para que la pagina siga estable aunque Instagram no cargue."}
          </p>
          {instagram && (
            <Link
              href={intro?.buttonUrl || instagram}
              target="_blank"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-plum"
            >
              <Instagram size={18} />
              {intro?.buttonLabel || "Ver mas trabajos en Instagram"}
            </Link>
          )}
        </div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <span key={category} className="shrink-0 rounded-full border border-cocoa/20 bg-white px-4 py-2 text-sm font-semibold text-cocoa">
              {category}
            </span>
          ))}
        </div>
        <GalleryGrid />
      </div>
    </section>
  );
}
