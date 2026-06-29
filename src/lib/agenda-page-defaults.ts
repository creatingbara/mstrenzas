import { beforeBookingItems } from "@/lib/data";
import type { AgendaPageContent } from "@/types/agenda-page";

export const defaultAgendaPages: AgendaPageContent[] = [
  {
    pageKey: "dama",
    eyebrow: "Agendar Cita",
    title: "Agenda tu cita para trenzas y extensiones",
    subtitle: "Elige el servicio que deseas realizarte y envíanos tu solicitud para confirmar disponibilidad.",
    buttonLabel: null,
    buttonHref: null,
    sections: [],
    items: [],
    serviceSlugs: [
      "trenzas-africanas",
      "box-braids",
      "knotless-braids",
      "trenzas-sueltas",
      "trenzas-pegadas",
      "diseno-personalizado",
      "postura-de-extensiones"
    ]
  },
  {
    pageKey: "caballero",
    eyebrow: "Agendar Cita",
    title: "Agenda tu estilo para caballero",
    subtitle: "Diseños de trenzas masculinas, estilos pegados y peinados personalizados.",
    buttonLabel: null,
    buttonHref: null,
    sections: [],
    items: [],
    serviceSlugs: ["trenzas-pegadas", "diseno-personalizado"]
  },
  {
    pageKey: "extensiones-humanas",
    eyebrow: "Agendar Cita",
    title: "Extensiones 100% Human Hair",
    subtitle: "Extensiones humanas de alta calidad para un resultado natural, elegante y duradero.",
    buttonLabel: "Cotizar extensiones por WhatsApp",
    buttonHref: "whatsapp:Hola M&S Trenzas, quiero cotizar extensiones 100% Human Hair.",
    sections: [
      {
        title: "Qué son las extensiones 100% Human Hair",
        text: "Son extensiones de cabello humano pensadas para lograr un acabado natural, elegante y fácil de estilizar."
      },
      {
        title: "Beneficios",
        text: "Permiten agregar largo, volumen y movimiento sin perder una apariencia suave y realista."
      },
      {
        title: "Cuidados",
        text: "Requieren lavado delicado, hidratación adecuada y manejo cuidadoso con calor para conservar su calidad."
      },
      {
        title: "Duración aproximada",
        text: "La duración depende del método de postura, mantenimiento, textura, rutina de cuidado y uso diario."
      },
      {
        title: "Servicios disponibles",
        text: "Asesoría, cotización de cabello, postura de extensiones y recomendaciones para mantener el resultado."
      }
    ],
    items: [],
    serviceSlugs: []
  },
  {
    pageKey: "informacion-antes-de-agendar",
    eyebrow: "Agendar Cita",
    title: "Información antes de agendar",
    subtitle:
      "Antes de reservar tu cita, es importante leer estas recomendaciones para que podamos brindarte un servicio organizado, cómodo y profesional.",
    buttonLabel: null,
    buttonHref: null,
    sections: [
      { title: "Cómo preparar tu cabello" },
      { title: "Depósito o separación de cita" },
      { title: "Puntualidad" },
      { title: "Cancelaciones" },
      { title: "Cambios de fecha" },
      { title: "Acompañantes" },
      { title: "Extensiones" },
      { title: "Fotos de referencia" },
      { title: "Confirmación por WhatsApp" }
    ],
    items: beforeBookingItems,
    serviceSlugs: []
  }
];
