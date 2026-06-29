import Link from "next/link";
import { categories } from "@/lib/data";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { getServices } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const services = (await getServices()).filter((service) => service.active !== false);

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Catálogo</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Catálogo de estilos y servicios</h1>
          <p className="mt-4 leading-7 text-muted">
            Explora servicios por categoría. Los precios finales se cotizan según largo, volumen, diseño y tipo de cabello.
          </p>
        </div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link key={category} href={`#${category}`} className="shrink-0 rounded-full border border-cocoa/20 bg-white px-4 py-2 text-sm font-semibold text-cocoa">
              {category}
            </Link>
          ))}
        </div>
        <ServicesGrid />
        <div className="mt-12 grid gap-10">
          {categories.map((category) => {
            const items = services.filter((service) => service.category === category);
            if (!items.length) return null;
            return (
              <section key={category} id={category} className="scroll-mt-24">
                <h2 className="mb-4 font-display text-3xl font-bold">{category}</h2>
                <div className="grid gap-3">
                  {items.map((service) => (
                    <Link key={service.slug} href={`/catalogo/${service.slug}`} className="rounded-lg border border-cocoa/10 bg-white p-4 font-semibold transition hover:border-cocoa hover:bg-cream">
                      {service.name}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
