import type { Service } from "@/types/service";

export function getAgendaServicesForAudience(
  serviceSlugs: string[],
  services: Service[],
  audience: "dama" | "caballero"
) {
  const activeServices = services.filter((service) => service.active !== false);
  const configuredServices = serviceSlugs
    .map((slug) => activeServices.find((service) => service.slug === slug))
    .filter((service): service is Service => Boolean(service));

  if (configuredServices.length) return configuredServices;

  return activeServices.filter((service) => {
    const isMenService = service.category.toLowerCase().includes("caballero");
    return audience === "caballero" ? isMenService : !isMenService;
  });
}
