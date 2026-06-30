import { z } from "zod";

const httpsUrl = z
  .string()
  .url("La URL de referencia no es valida.")
  .refine((value) => value.startsWith("https://"), "La URL de referencia debe usar https.")
  .optional()
  .or(z.literal(""));

export const bookingSchema = z.object({
  fullName: z.string().min(3, "Escribe tu nombre completo."),
  whatsapp: z.string().min(8, "Agrega un WhatsApp valido."),
  instagram: z.string().optional(),
  serviceSlug: z.string().min(1, "Selecciona un servicio."),
  preferredDate: z.string().min(1, "Selecciona una fecha."),
  preferredTime: z.string().min(1, "Selecciona una hora."),
  referenceImageUrl: httpsUrl,
  note: z.string().max(700, "La nota es muy larga.").optional()
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const appointmentBookingSchema = z.object({
  fullName: z.string().min(3, "Escribe tu nombre completo."),
  whatsapp: z.string().min(8, "Agrega un WhatsApp valido."),
  instagram: z.string().optional(),
  email: z.string().email("Escribe un correo valido.").optional().or(z.literal("")),
  referenceImageUrl: httpsUrl,
  note: z.string().max(700, "La nota es muy larga.").optional(),
  website: z.string().max(0, "Solicitud no valida.").optional()
});

export type AppointmentBookingFormValues = z.infer<typeof appointmentBookingSchema>;

export const siteSettingsSchema = z.object({
  whatsapp: z.string().max(40, "WhatsApp demasiado largo.").default(""),
  instagram: z.string().max(200, "Instagram demasiado largo.").default(""),
  zone: z.string().max(200, "Zona demasiado larga.").default(""),
  hours: z.string().max(200, "Horario demasiado largo.").default(""),
  heroTitle: z.string().max(200, "El titulo es muy largo.").default(""),
  heroSubtitle: z.string().max(500, "El subtitulo es muy largo.").default(""),
  bookingPolicy: z.string().max(2000, "La politica es muy larga.").default(""),
  whatsappMessage: z.string().max(500, "El mensaje es muy largo.").default("")
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export const bookingMenuItemSchema = z.object({
  id: z.string().min(1, "Falta la opcion."),
  label: z.string().min(2, "El titulo es muy corto.").max(80, "El titulo es muy largo."),
  href: z
    .string()
    .min(1, "Falta el enlace.")
    .max(180, "El enlace es muy largo.")
    .refine((value) => value.startsWith("/"), "El enlace debe iniciar con /."),
  description: z.string().max(240, "La descripcion es muy larga.").nullable().optional(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(100)
});

export const bookingMenuSchema = z.object({
  items: z.array(bookingMenuItemSchema).min(1, "Debe existir al menos una opcion.")
});

export type BookingMenuFormValues = z.infer<typeof bookingMenuSchema>;

export const agendaPageSchema = z.object({
  pageKey: z.string().min(1),
  eyebrow: z.string().max(80).default(""),
  title: z.string().min(1, "El titulo es obligatorio.").max(160),
  subtitle: z.string().max(700).default(""),
  buttonLabel: z.string().max(80).nullable().optional(),
  buttonHref: z.string().max(260).nullable().optional(),
  sections: z.array(
    z.object({
      title: z.string().min(1).max(140),
      text: z.string().max(700).optional()
    })
  ),
  items: z.array(z.string().min(1).max(240)),
  serviceSlugs: z.array(z.string().min(1).max(120))
});

export const agendaPagesSchema = z.object({
  pages: z.array(agendaPageSchema)
});

export type AgendaPagesFormValues = z.infer<typeof agendaPagesSchema>;

export const serviceOverrideSchema = z.object({
  serviceId: z.string().min(1, "Falta el servicio."),
  slug: z.string().min(2).max(120).optional(),
  name: z.string().min(2, "El nombre es muy corto.").max(120).optional(),
  description: z.string().max(1000, "La descripcion es muy larga.").optional(),
  fullDescription: z.string().max(4000).nullable().optional(),
  category: z.string().min(2, "La categoria es muy corta.").max(120).optional(),
  priceFrom: z.number().int().min(0).max(1000000).nullable().optional(),
  priceTo: z.number().int().min(0).max(1000000).nullable().optional(),
  priceLabel: z.string().max(120).nullable().optional(),
  durationMinutes: z.number().int().min(15, "Minimo 15 minutos.").max(1440).optional(),
  durationLabel: z.string().max(80).nullable().optional(),
  requiresQuote: z.boolean().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  imageUrl: z.string().min(1).max(300).optional(),
  galleryImages: z.array(z.string().min(1).max(300)).optional(),
  bookingEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  showStaffSelector: z.boolean().optional(),
  allowAnyStaff: z.boolean().optional(),
  requiresDeposit: z.boolean().optional(),
  depositAmount: z.number().int().min(0).max(1000000).nullable().optional(),
  showOnHome: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  internalNotes: z.string().max(2000).nullable().optional(),
  beforeCare: z.string().max(2000).nullable().optional(),
  afterCare: z.string().max(2000).nullable().optional(),
  whatsappMessage: z.string().max(500).nullable().optional(),
  prepMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  bufferAfterMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  recommendations: z.array(z.string().min(1).max(180)).optional(),
  includes: z.array(z.string().min(1).max(180)).optional(),
  excludes: z.array(z.string().min(1).max(180)).optional()
});

export type ServiceOverrideFormValues = z.infer<typeof serviceOverrideSchema>;

export const serviceCreateSchema = serviceOverrideSchema.omit({ serviceId: true }).extend({
  name: z.string().min(2, "El nombre es obligatorio.").max(120),
  category: z.string().min(2, "La categoria es obligatoria.").max(120),
  description: z.string().min(2, "La descripcion es obligatoria.").max(1000)
});

export const productCreateSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto.").max(120),
  description: z.string().min(2, "Agrega una descripcion.").max(1000),
  price: z.number().int().min(0).max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000).nullable().optional(),
  imageUrl: z.string().min(1).max(500).optional(),
  active: z.boolean().optional()
});

export const productUpdateSchema = z.object({
  id: z.string().min(1, "Falta el producto."),
  name: z.string().min(2, "El nombre es muy corto.").max(120).optional(),
  description: z.string().min(2, "Agrega una descripcion.").max(1000).optional(),
  price: z.number().int().min(0).max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000).nullable().optional(),
  imageUrl: z.string().min(1).max(500).optional(),
  active: z.boolean().optional()
});

export type ProductCreateValues = z.infer<typeof productCreateSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;

export const serviceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  priceFrom: z.coerce.number().optional(),
  priceTo: z.coerce.number().optional(),
  durationMinutes: z.coerce.number().optional(),
  requiresQuote: z.coerce.boolean().default(true),
  active: z.coerce.boolean().default(true)
});
