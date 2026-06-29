import { appointmentBookings, availabilityExceptions, businessHours } from "@/lib/data";
import type { Database } from "@/types/database";
import type { AppointmentBooking, AvailabilityException, BusinessHour } from "@/types/appointment";

type BusinessHourRow = Database["public"]["Tables"]["business_hours"]["Row"];
type AvailabilityExceptionRow = Database["public"]["Tables"]["availability_exceptions"]["Row"];
type AppointmentBookingRow = Database["public"]["Tables"]["appointment_bookings"]["Row"];

export function normalizeTime(time: string) {
  return time.slice(0, 5);
}

export function mapBusinessHour(row: BusinessHourRow): BusinessHour {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    isActive: row.is_active,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    slotIntervalMinutes: row.slot_interval_minutes,
    bufferMinutes: row.buffer_minutes
  };
}

export function mapAvailabilityException(row: AvailabilityExceptionRow): AvailabilityException {
  return {
    id: row.id,
    exceptionDate: row.exception_date,
    isAvailable: row.is_available,
    startTime: row.start_time ? normalizeTime(row.start_time) : null,
    endTime: row.end_time ? normalizeTime(row.end_time) : null,
    reason: row.reason
  };
}

export function mapAppointmentBooking(row: AppointmentBookingRow): AppointmentBooking {
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    clientName: row.client_name,
    phone: row.phone,
    instagram: row.instagram,
    email: row.email,
    appointmentDate: row.appointment_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    durationMinutes: row.duration_minutes,
    status: row.status,
    notes: row.notes,
    referenceImageUrl: row.reference_image_url,
    createdAt: row.created_at
  };
}

export const fallbackAppointmentData = {
  businessHours,
  exceptions: availabilityExceptions,
  appointments: appointmentBookings
};
