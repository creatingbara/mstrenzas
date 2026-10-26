import type { BusinessHour } from "@/types/appointment";
import type { Service } from "@/types/service";
import catalogData from "@/data/catalogo-2026.json";

type CatalogEntry = Pick<Service, "slug" | "name" | "category" | "imageUrl" | "priceFrom" | "priceLabel" | "durationMinutes" | "durationLabel">;
const catalogEntries = catalogData as CatalogEntry[];

export const categories = Array.from(new Set(catalogEntries.map((entry) => entry.category)));

const featuredCategories = new Set<string>();
export const services: Service[] = catalogEntries.map((entry, index) => {
  const featured = !featuredCategories.has(entry.category);
  featuredCategories.add(entry.category);

  return {
    ...entry,
    id: `catalogo-2026-${entry.slug}`,
    description: "",
    priceTo: null,
    requiresQuote: false,
    featured,
    active: true,
    bookingEnabled: true,
    whatsappEnabled: true,
    showStaffSelector: true,
    allowAnyStaff: true,
    requiresDeposit: false,
    showOnHome: featured,
    sortOrder: index,
    recommendations: [],
    includes: [],
    excludes: [],
    source: "base"
  };
});

export const businessHours: BusinessHour[] = [
  { id: "bh-0", dayOfWeek: 0, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-1", dayOfWeek: 1, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-2", dayOfWeek: 2, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-3", dayOfWeek: 3, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-4", dayOfWeek: 4, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-5", dayOfWeek: 5, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 },
  { id: "bh-6", dayOfWeek: 6, isActive: false, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 0 }
];

export const beforeBookingItems = [
  "Llegar con el cabello limpio y desenredado.",
  "Enviar una foto de referencia del estilo deseado.",
  "Confirmar si el servicio incluye extensiones o si deben cotizarse aparte.",
  "Llegar puntual a la cita.",
  "Algunas citas pueden requerir depósito previo.",
  "Los precios pueden variar según largo, volumen, diseño y tipo de cabello.",
  "Para estilos personalizados, se recomienda consultar disponibilidad por WhatsApp."
];

export const siteSettings = {
  whatsapp: "",
  instagram: "",
  zone: "",
  hours: "",
  heroTitle: "Agenda tu próxima transformación",
  heroSubtitle:
    "Estilos protectores creados con detalle, técnica y amor por el arte del cabello.",
  whatsappMessage: "Hola M&S Estudio, quiero agendar una cita."
};
