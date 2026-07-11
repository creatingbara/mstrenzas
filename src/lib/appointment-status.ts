import type { AppointmentBooking, AppointmentStatus } from "@/types/appointment";

export const appointmentStatuses: AppointmentStatus[] = [
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
  "archivada",
  "no_asistio"
];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  archivada: "Archivada",
  no_asistio: "No asistio"
};

export function getAppointmentPrimaryAction(status: AppointmentStatus): { label: string; nextStatus: AppointmentStatus } | null {
  if (status === "pendiente") return { label: "Confirmar", nextStatus: "confirmada" };
  if (status === "confirmada") return { label: "Completar", nextStatus: "completada" };
  if (status === "completada") return { label: "Archivar", nextStatus: "archivada" };
  if (status === "cancelada") return { label: "Confirmar", nextStatus: "confirmada" };
  return null;
}

export function isActiveAppointmentForBookings(booking: AppointmentBooking) {
  return !["completada", "archivada"].includes(booking.status);
}
