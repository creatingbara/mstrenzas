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
  logoUrl: "/brand/logo-ms-trenzas.jpg",
  logoDarkUrl: "/brand/logo-ms-trenzas.jpg",
  faviconUrl: "/icons/icon.svg",
  primaryColor: "#65004d",
  secondaryColor: "#c8a45d",
  accentColor: "#9b1178",
  backgroundColor: "#fff8fc",
  textColor: "#171217",
  darkPrimaryColor: "#f0a9d9",
  darkBackgroundColor: "#15000f",
  darkTextColor: "#f8edf5",
  fontHeading: "var(--font-playfair), 'Playfair Display', serif",
  fontBody: "var(--font-inter), Inter, sans-serif",
  borderRadius: "8px",
  buttonStyle: "pill",
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
      title: `${page.label} | M&S Trenzas`,
      description: "M&S Trenzas: trenzas africanas, extensiones y estilos protectores con acabado profesional.",
      keywords: "M&S Trenzas, trenzas africanas, extensiones, beauty salon",
      ogImageUrl: "/brand/hero-ms-trenzas.jpg",
      createdAt: null,
      updatedAt: null
    }
  ])
);

export const defaultFooterSettings: AppFooterSettings = {
  id: "default",
  businessName: "M&S Trenzas",
  description: "Trenzas africanas, estilos protectores y extensiones 100% Human Hair con acabado profesional.",
  whatsapp: "",
  instagramUrl: "",
  address: "",
  schedule: "",
  copyrightText: `© ${new Date().getFullYear()} M&S Trenzas. Todos los derechos reservados.`,
  updatedAt: null
};

export const defaultAdminUiSettings: AppAdminUiSettings = {
  id: "default",
  adminTitle: "Gestion de M&S Trenzas",
  adminSubtitle: "Panel administrativo",
  sidebarLogoUrl: "/brand/logo-ms-trenzas.jpg",
  sidebarColor: "#320024",
  sidebarAccentColor: "#9b1178",
  updatedAt: null
};

export const defaultPageSections: Record<string, AppPageSection[]> = {
  home: [
    pageSection("home", "hero", "Trenzas africanas y extensiones con acabado profesional.", "En M&S Trenzas creamos estilos protectores, elegantes y personalizados para que luzcas segura, hermosa y autentica.", "Belleza protectora con acabado premium", "/brand/hero-ms-trenzas.jpg", "Agendar cita", "/catalogo", 10),
    pageSection("home", "servicios", "Servicios disenados para resaltar tu belleza", "Desde trenzas africanas hasta extensiones 100% Human Hair, trabajamos cada estilo con dedicacion, detalle y amor por el arte del cabello.", "Servicios", "", "Ver catalogo completo", "/catalogo", 20),
    pageSection("home", "human_hair", "Extensiones 100% Human Hair", "Trabajamos extensiones humanas de alta calidad para lograr un resultado natural, elegante y duradero.", "Human Hair", "", "Cotizar extensiones por WhatsApp", "", 30),
    pageSection("home", "galeria", "Resultados que hablan por si solos", "Explora algunos de nuestros trabajos y descubre estilos creados con detalle, amor y profesionalismo.", "Galeria", "", "Ver galeria", "/galeria", 40),
    pageSection("home", "cta_final", "Lista para tu proximo estilo?", "Agenda desde el catalogo o escribenos por WhatsApp para una orientacion rapida.", "M&S Trenzas", "", "Agendar ahora", "/catalogo", 50)
  ],
  catalogo: [
    pageSection("catalogo", "intro", "Catalogo de estilos y servicios", "Explora servicios por categoria. Los precios finales se cotizan segun largo, volumen, diseno y tipo de cabello.", "Catalogo", "", "", "", 10)
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
    pageSection("antes-de-agendar", "recomendaciones", "Recomendaciones generales", "Consejos utiles antes de reservar tu cita.", "M&S Trenzas", "", "", "", 20)
  ],
  "extensiones-humanas": [
    pageSection("extensiones-humanas", "intro", "Extensiones 100% Human Hair", "Trabajamos extensiones humanas de alta calidad para cambios de look, volumen, largo y estilos personalizados con acabado natural.", "Extensiones", "", "Cotizar por WhatsApp", "", 10),
    pageSection("extensiones-humanas", "quote", "Cotiza segun textura, largo, color y disponibilidad.", "Te orientamos por WhatsApp antes de confirmar el servicio.", "M&S Trenzas", "", "Cotizar por WhatsApp", "", 20)
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
