import type { AppointmentBooking, AvailabilityException, BusinessHour } from "@/types/appointment";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
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

export const galleryItems: GalleryItem[] = [
  { id: "g1", title: "Trenzas con acabado M&S", category: "Trenzas africanas", imageUrl: "/gallery/gallery-01.jpg", featured: true },
  { id: "g2", title: "Box braids largas", category: "Trenzas africanas", imageUrl: "/gallery/gallery-02.jpg", featured: true },
  { id: "g3", title: "Estilo protector", category: "Trenzas africanas", imageUrl: "/gallery/gallery-03.jpg", featured: true },
  { id: "g4", title: "Knotless braids", category: "Trenzas africanas", imageUrl: "/gallery/gallery-04.jpg", featured: false },
  { id: "g5", title: "Trenzas pegadas", category: "Trenzas pegadas", imageUrl: "/gallery/gallery-05.jpg", featured: false },
  { id: "g6", title: "Trenzas sueltas", category: "Trenzas sueltas", imageUrl: "/gallery/gallery-06.jpg", featured: false },
  { id: "g7", title: "Butterfly locs", category: "Diseños personalizados", imageUrl: "/gallery/gallery-07.jpg", featured: false },
  { id: "g8", title: "Postura de extensiones", category: "Extensiones", imageUrl: "/gallery/gallery-08.jpg", featured: false }
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Extensiones Human Hair",
    description: "Cabello humano de alta calidad disponible por cotización según largo, textura y color.",
    price: null,
    stock: null,
    imageUrl: "/services/extensiones-human-hair.jpg",
    active: true
  },
  {
    id: "p2",
    name: "Asesoría de extensiones",
    description: "Orientación para escoger textura, largo, color y método de colocación.",
    price: null,
    stock: null,
    imageUrl: "/services/postura-de-extensiones.jpg",
    active: true
  }
];

export const businessHours: BusinessHour[] = [
  { id: "bh-0", dayOfWeek: 0, isActive: false, startTime: "10:00", endTime: "14:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-1", dayOfWeek: 1, isActive: true, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-2", dayOfWeek: 2, isActive: true, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-3", dayOfWeek: 3, isActive: true, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-4", dayOfWeek: 4, isActive: true, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-5", dayOfWeek: 5, isActive: true, startTime: "09:00", endTime: "17:00", slotIntervalMinutes: 60, bufferMinutes: 15 },
  { id: "bh-6", dayOfWeek: 6, isActive: true, startTime: "09:00", endTime: "15:00", slotIntervalMinutes: 60, bufferMinutes: 15 }
];

export const availabilityExceptions: AvailabilityException[] = [
  { id: "ex-1", exceptionDate: "2026-07-12", isAvailable: false, reason: "Día bloqueado de ejemplo" },
  { id: "ex-2", exceptionDate: "2026-07-19", isAvailable: true, startTime: "10:00", endTime: "14:00", reason: "Horario especial" }
];

export const appointmentBookings: AppointmentBooking[] = [
  {
    id: "apt-1",
    serviceName: "Box Braids",
    clientName: "Cliente de ejemplo",
    phone: "8090000000",
    instagram: "@cliente",
    email: "cliente@example.com",
    appointmentDate: "2026-07-05",
    startTime: "10:00",
    endTime: "14:00",
    durationMinutes: 240,
    status: "pendiente",
    notes: "Quiere cotizar largo medio.",
    createdAt: "2026-06-27T10:00:00Z"
  }
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
  whatsapp: "18296779644",
  instagram: "https://www.instagram.com/mystrenzas_mechyrd/",
  zone: "República Dominicana",
  hours: "Lunes a sábado, con cita previa",
  heroTitle: "Trenzas africanas y extensiones con acabado profesional",
  heroSubtitle:
    "En M&S Trenzas creamos estilos protectores, elegantes y personalizados para que luzcas segura, hermosa y auténtica.",
  whatsappMessage: "Hola M&S Trenzas, quiero agendar una cita."
};
