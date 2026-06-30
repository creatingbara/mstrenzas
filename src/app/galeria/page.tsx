import Link from "next/link";
import { Instagram } from "lucide-react";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { categories } from "@/lib/data";
import { getSiteSettings } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const siteSettings = await getSiteSettings();

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Galeria</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Galeria e inspiracion desde Instagram</h1>
          <p className="mt-4 leading-7 text-muted">
            Trabajos destacados, referencias e ideas seleccionadas manualmente para que la pagina siga estable aunque Instagram no cargue.
          </p>
          {siteSettings.instagram && (
            <Link
              href={siteSettings.instagram}
              target="_blank"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-plum"
            >
              <Instagram size={18} />
              Ver mas trabajos en Instagram
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
