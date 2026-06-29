import { GalleryGrid } from "@/components/public/GalleryGrid";
import { categories } from "@/lib/data";

export default function GalleryPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Galería</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Resultados que hablan por sí solos</h1>
          <p className="mt-4 leading-7 text-muted">
            Fotos administrables por categoría para mostrar trabajos, inspiración y estilos destacados.
          </p>
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
