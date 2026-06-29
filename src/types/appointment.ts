export type AppointmentStatus = "pendiente" | "confirmada" | "cancelada" | "completada" | "no_asistio";

export type BusinessHour = {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  slotIntervalMinutes: number;
  bufferMinutes: number;
};

export type AvailabilityException = {
  id: string;
  exceptionDate: string;
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
};

export type AppointmentBooking = {
  id: string;
  serviceId?: string | null;
  staffMemberId?: string | null;
  staffName?: string | null;
  serviceName: string;
  clientName: string;
  phone: string;
  instagram?: string | null;
  email?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string | null;
  referenceImageUrl?: string | null;
  createdAt: string;
};
