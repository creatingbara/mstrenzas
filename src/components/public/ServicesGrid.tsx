import { ServiceCard } from "@/components/public/ServiceCard";
import { getServices, getSiteSettings } from "@/lib/local-db";

export async function ServicesGrid({ featured = false }: { featured?: boolean }) {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);
  const activeServices = services.filter((service) => service.active !== false);
  const list = featured ? activeServices.filter((service) => service.featured).slice(0, 6) : activeServices;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.map((service) => (
        <ServiceCard key={service.id} service={service} whatsappPhone={settings.whatsapp} />
      ))}
    </div>
  );
}
