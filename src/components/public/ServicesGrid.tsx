import { ServiceCard } from "@/components/public/ServiceCard";
import { getServices, getSiteSettings } from "@/lib/local-db";
import type { Service } from "@/types/service";

export async function ServicesGrid({
  featured = false,
  groupByCategory = false,
  services: providedServices,
  whatsappPhone: providedWhatsappPhone
}: {
  featured?: boolean;
  groupByCategory?: boolean;
  services?: Service[];
  whatsappPhone?: string;
}) {
  const [services, settings] = await Promise.all([
    providedServices ? Promise.resolve(providedServices) : getServices(),
    providedWhatsappPhone ? Promise.resolve({ whatsapp: providedWhatsappPhone }) : getSiteSettings()
  ]);
  const activeServices = services.filter((service) => service.active !== false);
  const list = featured ? activeServices.filter((service) => service.featured).slice(0, 6) : activeServices;

  if (!list.length) {
    return <p className="rounded-lg bg-white p-6 text-sm font-semibold text-muted shadow-soft">Pronto agregaremos nuevos servicios.</p>;
  }

  if (groupByCategory) {
    const grouped = new Map<string, Service[]>();
    for (const service of list) {
      const category = service.category.trim() || "Otros servicios";
      grouped.set(category, [...(grouped.get(category) ?? []), service]);
    }

    return (
      <div className="grid gap-10">
        {Array.from(grouped.entries()).map(([category, categoryServices]) => (
          <section key={category} id={serviceCategoryAnchor(category)} className="scroll-mt-24">
            <h2 className="mb-5 font-display text-3xl font-bold">{category}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map((service) => (
                <ServiceCard key={service.id} service={service} whatsappPhone={settings.whatsapp} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.map((service) => (
        <ServiceCard key={service.id} service={service} whatsappPhone={settings.whatsapp} />
      ))}
    </div>
  );
}

export function serviceCategoryAnchor(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
