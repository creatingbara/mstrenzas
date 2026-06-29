import type { BookingFormValues } from "@/lib/validations";

export const DEFAULT_WHATSAPP = "18090000000";

export function whatsappLink(message: string, phone = DEFAULT_WHATSAPP) {
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppMessage(values?: Partial<BookingFormValues>) {
  return [
    "Hola M&S Trenzas, quiero agendar una cita.",
    "",
    `Nombre: ${values?.fullName ?? ""}`,
    `Servicio: ${values?.serviceSlug ?? ""}`,
    `Fecha deseada: ${values?.preferredDate ?? ""}`,
    `Hora deseada: ${values?.preferredTime ?? ""}`,
    `Instagram: ${values?.instagram ?? ""}`,
    `Comentario: ${values?.note ?? ""}`
  ].join("\n");
}
