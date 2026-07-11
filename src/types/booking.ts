export type BookingStatus = "pendiente" | "confirmada" | "completada" | "archivada" | "cancelada";

export type BookingRequest = {
  id: string;
  fullName: string;
  whatsapp: string;
  instagram?: string | null;
  serviceSlug: string;
  preferredDate: string;
  preferredTime: string;
  note?: string | null;
  referenceImageUrl?: string | null;
  status: BookingStatus;
  createdAt: string;
};
