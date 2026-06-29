import type { BookingRequest } from "@/types/booking";
import type { AppointmentBooking, AvailabilityException, BusinessHour } from "@/types/appointment";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";

export const categories = [
  "Trenzas africanas",
  "Trenzas sueltas",
  "Trenzas pegadas",
  "Extensiones",
  "Diseños personalizados",
  "Human Hair"
];

export const services: Service[] = [
  {
    id: "1",
    slug: "trenzas-africanas",
    name: "Trenzas africanas",
    description: "Estilos protectores elaborados con técnica, detalle y acabado profesional.",
    category: "Trenzas africanas",
    imageUrl: "/services/trenzas-africanas.jpg",
    priceFrom: null,
    durationMinutes: 180,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Cabello limpio y desenredado", "Traer o enviar foto de referencia"],
    includes: ["Consulta de estilo", "Preparación básica", "Acabado final"],
    excludes: ["Extensiones no cotizadas", "Lavado profundo"]
  },
  {
    id: "8",
    slug: "trenzas-sueltas",
    name: "Trenzas sueltas",
    description: "Estilos sueltos protectores con acabado limpio, versatil y personalizado.",
    category: "Trenzas sueltas",
    imageUrl: "/services/trenzas-sueltas.jpg",
    priceFrom: null,
    durationMinutes: 180,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Confirmar largo y volumen deseado", "Enviar foto de referencia"],
    includes: ["Orientación de estilo", "Acabado profesional"],
    excludes: ["Extensiones no confirmadas previamente"]
  },
  {
    id: "2",
    slug: "box-braids",
    name: "Box Braids",
    description: "Trenzas clásicas, versátiles y duraderas, ideales para un look elegante y práctico.",
    category: "Trenzas africanas",
    imageUrl: "/services/box-braids.jpg",
    priceFrom: null,
    durationMinutes: 240,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Definir largo deseado antes de reservar", "Consultar cantidad de paquetes"],
    includes: ["Separación uniforme", "Sellado y acabado"],
    excludes: ["Retiro de trenzas anteriores"]
  },
  {
    id: "3",
    slug: "knotless-braids",
    name: "Knotless Braids",
    description: "Trenzas ligeras con acabado natural y menor tensión en la raíz.",
    category: "Trenzas africanas",
    imageUrl: "/services/knotless-braids.jpg",
    priceFrom: null,
    durationMinutes: 240,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Ideal si buscas menos tensión", "Enviar referencia de tamaño"],
    includes: ["Técnica sin nudo", "Acabado natural"],
    excludes: ["Extensiones premium"]
  },
  {
    id: "4",
    slug: "trenzas-pegadas",
    name: "Trenzas pegadas",
    description: "Diseños pegados al cuero cabelludo, ideales para estilos creativos y protectores.",
    category: "Trenzas pegadas",
    imageUrl: "/services/trenzas-pegadas.jpg",
    priceFrom: null,
    durationMinutes: 120,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Enviar diseño deseado", "Evitar aceites pesados antes de la cita"],
    includes: ["Diseño base", "Acabado pulido"],
    excludes: ["Diseños muy complejos sin cotización previa"]
  },
  {
    id: "5",
    slug: "postura-de-extensiones",
    name: "Postura de extensiones",
    description: "Aplicación profesional de extensiones para lograr volumen, largo y un acabado natural.",
    category: "Extensiones",
    imageUrl: "/services/postura-de-extensiones.jpg",
    priceFrom: null,
    durationMinutes: 120,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Consultar método recomendado", "Confirmar si traes tus extensiones"],
    includes: ["Orientación de colocación", "Acabado natural"],
    excludes: ["Venta de cabello si no fue cotizado"]
  },
  {
    id: "6",
    slug: "extensiones-human-hair",
    name: "Extensiones 100% Human Hair",
    description: "Extensiones humanas de alta calidad para un resultado natural, elegante y duradero.",
    category: "Human Hair",
    imageUrl: "/services/extensiones-human-hair.jpg",
    priceFrom: null,
    durationMinutes: 120,
    requiresQuote: true,
    featured: true,
    active: true,
    recommendations: ["Cotizar textura, largo y color", "Confirmar disponibilidad"],
    includes: ["Asesoría de compra", "Recomendación de cuidado"],
    excludes: ["Instalación si no fue solicitada"]
  },
  {
    id: "7",
    slug: "diseno-personalizado",
    name: "Diseño personalizado",
    description: "Estilo creado según tu inspiración, tipo de cabello y ocasión especial.",
    category: "Diseños personalizados",
    imageUrl: "/services/diseno-personalizado.jpg",
    priceFrom: null,
    durationMinutes: 180,
    requiresQuote: true,
    featured: false,
    active: true,
    recommendations: ["Enviar varias referencias", "Consultar disponibilidad por WhatsApp"],
    includes: ["Evaluación del estilo", "Cotización personalizada"],
    excludes: ["Materiales especiales no confirmados"]
  }
];

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

export const bookingRequests: BookingRequest[] = [
  {
    id: "b1",
    fullName: "Cliente de ejemplo",
    whatsapp: "8090000000",
    instagram: "@cliente",
    serviceSlug: "box-braids",
    preferredDate: "2026-07-05",
    preferredTime: "10:00",
    note: "Quiere cotizar largo medio.",
    status: "pendiente",
    createdAt: "2026-06-27T10:00:00Z"
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
  whatsapp: "18090000000",
  instagram: "https://www.instagram.com/mystrenzas_mechyrd/",
  zone: "República Dominicana",
  hours: "Lunes a sábado, con cita previa",
  heroTitle: "Trenzas africanas y extensiones con acabado profesional",
  heroSubtitle:
    "En M&S Trenzas creamos estilos protectores, elegantes y personalizados para que luzcas segura, hermosa y auténtica.",
  whatsappMessage: "Hola M&S Trenzas, quiero agendar una cita."
};
