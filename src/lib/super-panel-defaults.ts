import type {
  AppAdminUiSettings,
  AppFooterSettings,
  AppNavigationItem,
  AppPageSection,
  AppSeoSettings,
  AppThemeSettings
} from "@/types/super-panel";

export const defaultThemeSettings: AppThemeSettings = {
  id: "default",
  logoUrl: "/brand/ms-estudio-logo.png",
  logoDarkUrl: "/brand/ms-estudio-logo-negativo.png",
  faviconUrl: "/brand/ms-estudio-app-icon.png",
  primaryColor: "#310032",
  secondaryColor: "#330428",
  accentColor: "#330428",
  backgroundColor: "#fff8fc",
  textColor: "#171217",
  darkPrimaryColor: "#fff8fc",
  darkBackgroundColor: "#1b071b",
  darkTextColor: "#f8edf5",
  fontHeading: "var(--font-cormorant), 'Cormorant Garamond', serif",
  fontBody: "var(--font-dm-sans), 'DM Sans', sans-serif",
  borderRadius: "8px",
  buttonStyle: "rounded",
  cardStyle: "soft",
  updatedAt: null
};

export const defaultNavigationItems: AppNavigationItem[] = [
  navItem("nav-home", "Inicio", "/", null, 10),
  navItem("nav-booking", "Agendar Cita", "#", null, 20),
  navItem("nav-booking-catalog", "Catalogo de servicios", "/catalogo", "nav-booking", 10),
  navItem("nav-booking-info", "Informacion antes de agendar", "/antes-de-agendar", "nav-booking", 20),
  navItem("nav-booking-human", "Extensiones 100% Human", "/extensiones-humanas", "nav-booking", 30),
  navItem("nav-products", "Productos", "/productos", null, 30),
  navItem("nav-gallery", "Galeria", "/galeria", null, 40),
  navItem("nav-contact", "Contacto", "/contacto", null, 50)
];

export const publicPageOptions = [
  { key: "home", label: "Home" },
  { key: "catalogo", label: "Catalogo" },
  { key: "galeria", label: "Galeria" },
  { key: "contacto", label: "Contacto" },
  { key: "antes-de-agendar", label: "Informacion antes de agendar" },
  { key: "extensiones-humanas", label: "Extensiones 100% Human" }
];

export const defaultSeoSettings: Record<string, AppSeoSettings> = Object.fromEntries(
  publicPageOptions.map((page) => [
    page.key,
    {
      id: `seo-${page.key}`,
      pageKey: page.key,
      title: `${page.label} | M&S Estudio`,
      description: "M&S Estudio: trenzas africanas, extensiones y estilos protectores con atención profesional.",
      keywords: "M&S Trenzas, trenzas africanas, extensiones, beauty salon",
      ogImageUrl: "/brand/ms-estudio-logo.png",
      createdAt: null,
      updatedAt: null
    }
  ])
);

export const defaultFooterSettings: AppFooterSettings = {
  id: "default",
  businessName: "M&S Estudio",
  description: "El arte de transformar.",
  whatsapp: "",
  instagramUrl: "",
  address: "",
  schedule: "",
  copyrightText: `© ${new Date().getFullYear()} M&S Estudio. Todos los derechos reservados.`,
  updatedAt: null
};

export const defaultAdminUiSettings: AppAdminUiSettings = {
  id: "default",
  adminTitle: "Gestion de M&S Estudio",
  adminSubtitle: "Panel administrativo",
  sidebarLogoUrl: "/brand/ms-estudio-simbolo-negativo.png",
  sidebarColor: "#310032",
  sidebarAccentColor: "#330428",
  updatedAt: null
};

export const defaultPageSections: Record<string, AppPageSection[]> = {
  home: [
    pageSection("home", "hero", "Agenda tu próxima transformación", "Estilos protectores creados con detalle, técnica y amor por el arte del cabello.", "El arte de transformar", "/brand/ms-estudio-logo.png", "Agendar cita", "/catalogo", 10),
    pageSection("home", "servicios", "Servicios disenados para resaltar tu belleza", "Desde trenzas africanas hasta extensiones 100% Human Hair, trabajamos cada estilo con dedicacion, detalle y amor por el arte del cabello.", "Servicios", "", "Ver catalogo completo", "/catalogo", 20),
    pageSection("home", "human_hair", "Extensiones 100% Human Hair", "Trabajamos extensiones humanas de alta calidad para lograr un resultado natural, elegante y duradero.", "Human Hair", "", "Cotizar extensiones por WhatsApp", "", 30),
    pageSection("home", "galeria", "Resultados que hablan por si solos", "Explora algunos de nuestros trabajos y descubre estilos creados con detalle, amor y profesionalismo.", "Galeria", "", "Ver galeria", "/galeria", 40),
    pageSection("home", "cta_final", "Lista para tu proximo estilo?", "Agenda desde el catalogo o escribenos por WhatsApp para una orientacion rapida.", "M&S Estudio", "", "Agendar ahora", "/catalogo", 50)
  ],
  catalogo: [
    pageSection("catalogo", "intro", "Catálogo de estilos y servicios", "Explora los estilos por categoría, revisa su precio y duración, y solicita tu cita desde el servicio que elijas.", "Catálogo", "", "", "", 10)
  ],
  galeria: [
    pageSection("galeria", "intro", "Galeria e inspiracion desde Instagram", "Trabajos destacados, referencias e ideas seleccionadas manualmente para que la pagina siga estable aunque Instagram no cargue.", "Galeria", "", "Ver mas trabajos en Instagram", "", 10)
  ],
  contacto: [
    pageSection("contacto", "intro", "Hablemos de tu proximo estilo", "Escribenos por WhatsApp para consultas rapidas o entra al calendario para seleccionar servicio, fecha y hora disponible.", "Contacto", "", "Ver catalogo y agendar", "/catalogo", 10),
    pageSection("contacto", "agenda", "Reserva desde el calendario", "Elige el estilo que deseas, revisa los horarios disponibles y envia tu solicitud de cita desde el flujo actualizado.", "Agenda online", "", "WhatsApp", "", 20)
  ],
  "antes-de-agendar": [
    pageSection("antes-de-agendar", "intro", "Informacion para una cita sin sorpresas", "Estas pautas nos ayudan a darte una experiencia organizada, clara y con el resultado que esperas.", "Antes de agendar", "", "", "", 10),
    pageSection("antes-de-agendar", "recomendaciones", "Recomendaciones generales", "Consejos utiles antes de reservar tu cita.", "M&S Estudio", "", "", "", 20)
  ],
  "extensiones-humanas": [
    pageSection("extensiones-humanas", "intro", "Extensiones 100% Human Hair", "Trabajamos extensiones humanas de alta calidad para cambios de look, volumen, largo y estilos personalizados con acabado natural.", "Extensiones", "", "Cotizar por WhatsApp", "", 10),
    pageSection("extensiones-humanas", "quote", "Cotiza segun textura, largo, color y disponibilidad.", "Te orientamos por WhatsApp antes de confirmar el servicio.", "M&S Estudio", "", "Cotizar por WhatsApp", "", 20)
  ]
};

function navItem(
  id: string,
  label: string,
  href: string,
  parentId: string | null,
  sortOrder: number,
  opensNewTab = false
): AppNavigationItem {
  return {
    id,
    label,
    href,
    parentId,
    sortOrder,
    isActive: true,
    opensNewTab,
    createdAt: null,
    updatedAt: null
  };
}

function pageSection(
  pageKey: string,
  sectionKey: string,
  title: string,
  subtitle: string,
  content: string,
  imageUrl: string,
  buttonLabel: string,
  buttonUrl: string,
  sortOrder: number
): AppPageSection {
  return {
    id: `${pageKey}-${sectionKey}`,
    pageKey,
    sectionKey,
    title,
    subtitle,
    content,
    imageUrl,
    buttonLabel,
    buttonUrl,
    sortOrder,
    isActive: true,
    metadata: {},
    createdAt: null,
    updatedAt: null
  };
}
