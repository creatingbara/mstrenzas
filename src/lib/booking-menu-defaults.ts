import type { BookingMenuItem } from "@/types/booking-menu";

export const defaultBookingMenuItems: BookingMenuItem[] = [
  {
    id: "agendar-dama",
    label: "Agendar Dama",
    href: "/agendar/dama",
    description: "Flujo de agenda para servicios de dama.",
    active: true,
    sortOrder: 0
  },
  {
    id: "agendar-caballero",
    label: "Agendar Caballero",
    href: "/agendar/caballero",
    description: "Flujo de agenda para servicios de caballero.",
    active: true,
    sortOrder: 1
  },
  {
    id: "catalogo-trenzas",
    label: "Catálogo de Trenzas",
    href: "/agendar/catalogo-trenzas",
    description: "Categorías de estilos para ver detalles y agendar.",
    active: true,
    sortOrder: 2
  },
  {
    id: "extensiones-humanas",
    label: "Extensiones 100% Human",
    href: "/agendar/extensiones-humanas",
    description: "Información y agenda para extensiones Human Hair.",
    active: true,
    sortOrder: 3
  },
  {
    id: "informacion-antes-de-agendar",
    label: "Información antes de agendar",
    href: "/agendar/informacion-antes-de-agendar",
    description: "Recomendaciones, políticas y preparación antes de la cita.",
    active: true,
    sortOrder: 4
  }
];
