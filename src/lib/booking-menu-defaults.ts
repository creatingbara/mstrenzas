import type { BookingMenuItem } from "@/types/booking-menu";

export const defaultBookingMenuItems: BookingMenuItem[] = [
  {
    id: "catalogo-servicios",
    label: "Catálogo de servicios",
    href: "/catalogo",
    description: "Explora todos los servicios y agenda desde el catálogo.",
    active: true,
    sortOrder: 0
  },
  {
    id: "informacion-antes-de-agendar",
    label: "Información antes de agendar",
    href: "/agendar/informacion-antes-de-agendar",
    description: "Recomendaciones, políticas y preparación antes de la cita.",
    active: true,
    sortOrder: 1
  },
  {
    id: "extensiones-humanas",
    label: "Extensiones 100% Human",
    href: "/agendar/extensiones-humanas",
    description: "Información y agenda para extensiones Human Hair.",
    active: true,
    sortOrder: 2
  }
];
