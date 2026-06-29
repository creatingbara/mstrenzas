import { ServiceCard } from "@/components/public/ServiceCard";
import { getServices } from "@/lib/local-db";

export async function ServicesGrid({ featured = false }: { featured?: boolean }) {
  const services = (await getServices()).filter((service) => service.active !== false);
  const list = featured ? services.filter((service) => service.featured).slice(0, 6) : services;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
