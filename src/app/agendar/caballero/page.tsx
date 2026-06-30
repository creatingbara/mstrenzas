import { ServiceCard } from "@/components/public/ServiceCard";
import { getAgendaPage, getServices, getSiteSettings } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function BookMenPage() {
  const [page, services, settings] = await Promise.all([getAgendaPage("caballero"), getServices(), getSiteSettings()]);
  const activeServices = services.filter((service) => service.active !== false);
  const items = page.serviceSlugs
    .map((slug) => activeServices.find((service) => service.slug === slug))
    .filter(Boolean) as typeof activeServices;

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{page.eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{page.title}</h1>
          <p className="mt-4 leading-7 text-muted">{page.subtitle}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <ServiceCard key={service.id} service={service} whatsappPhone={settings.whatsapp} />
          ))}
        </div>
      </div>
    </section>
  );
}
