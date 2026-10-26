import type { BookingFormValues } from "@/lib/validations";

export function whatsappLink(message: string, phone = "") {
  const normalized = phone.replace(/[^\d]/g, "");
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppMessage(values?: Partial<BookingFormValues>) {
  return [
    "Hola M&S Estudio, quiero agendar una cita.",
    "",
    `Nombre: ${values?.fullName ?? ""}`,
    `Servicio: ${values?.serviceSlug ?? ""}`,
    `Fecha deseada: ${values?.preferredDate ?? ""}`,
    `Hora deseada: ${values?.preferredTime ?? ""}`,
    `Instagram: ${values?.instagram ?? ""}`,
    `Comentario: ${values?.note ?? ""}`
  ].join("\n");
}
