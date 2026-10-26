import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, getDay, isBefore, isSameDay, parse, startOfDay, startOfMonth } from "date-fns";
import type { AppointmentBooking, AvailabilityException, BusinessHour } from "@/types/appointment";
import type { StaffMember, StaffScheduleData } from "@/types/staff";

export type AvailabilityInput = {
  date: Date;
  durationMinutes: number;
  prepMinutes?: number | null;
  bufferAfterMinutes?: number | null;
  businessHours: BusinessHour[];
  exceptions: AvailabilityException[];
  appointments: AppointmentBooking[];
};

export type ServiceAvailabilityInput = {
  serviceId: string;
  staffMemberId?: string | null;
  date: Date;
  durationMinutes: number;
  prepMinutes?: number | null;
  bufferAfterMinutes?: number | null;
  staffMembers: StaffMember[];
  schedulesByStaff: Record<string, StaffScheduleData>;
};

export type StaffAvailabilityGroup = {
  staffMemberId: string;
  staffName: string;
  slots: string[];
};

export function generateAvailableSlots({
  date,
  durationMinutes,
  prepMinutes = 0,
  bufferAfterMinutes = 0,
  businessHours,
  exceptions,
  appointments
}: AvailabilityInput) {
  if (isBefore(startOfDay(date), startOfDay(new Date()))) return [];

  const dateKey = format(date, "yyyy-MM-dd");
  const exception = exceptions.find((item) => item.exceptionDate === dateKey);

  if (exception && !exception.isAvailable) return [];

  const weeklyHours = businessHours.find((item) => item.dayOfWeek === getDay(date));
  const startTime = exception?.isAvailable ? exception.startTime : weeklyHours?.startTime;
  const endTime = exception?.isAvailable ? exception.endTime : weeklyHours?.endTime;
  const slotIntervalMinutes = weeklyHours?.slotIntervalMinutes ?? 60;
  const bufferMinutes = weeklyHours?.bufferMinutes ?? 0;
  const dayIsOpen = exception?.isAvailable || weeklyHours?.isActive;

  if (!dayIsOpen || !startTime || !endTime) return [];

  const dayAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === dateKey &&
      (appointment.status === "pendiente" || appointment.status === "confirmada")
  );

  const slots: string[] = [];
  let cursor = parseTimeForDate(date, startTime);
  const closeTime = parseTimeForDate(date, endTime);
  const preparationMinutes = Math.max(0, prepMinutes ?? 0);
  const serviceBufferMinutes = Math.max(0, bufferAfterMinutes ?? 0);

  while (addMinutes(cursor, durationMinutes + serviceBufferMinutes + bufferMinutes) <= closeTime) {
    const slotStart = addMinutes(cursor, -preparationMinutes);
    const slotEnd = addMinutes(cursor, durationMinutes + serviceBufferMinutes + bufferMinutes);
    if (slotStart < parseTimeForDate(date, startTime)) {
      cursor = addMinutes(cursor, slotIntervalMinutes);
      continue;
    }
    const clashes = dayAppointments.some((appointment) => {
      const appointmentStart = parseTimeForDate(date, appointment.startTime);
      const appointmentEnd = parseTimeForDate(date, appointment.endTime);
      return slotStart < appointmentEnd && slotEnd > appointmentStart;
    });

    if (!clashes) slots.push(format(cursor, "HH:mm"));
    cursor = addMinutes(cursor, slotIntervalMinutes);
  }

  return slots;
}

export function getServiceAvailability({
  serviceId,
  staffMemberId,
  date,
  durationMinutes,
  prepMinutes,
  bufferAfterMinutes,
  staffMembers,
  schedulesByStaff
}: ServiceAvailabilityInput): StaffAvailabilityGroup[] {
  const candidates = staffMembers.filter((staff) => {
    if (!staff.isActive || !staff.services.includes(serviceId)) return false;
    return staffMemberId ? staff.id === staffMemberId : true;
  });

  return candidates.map((staff) => {
    const schedule = schedulesByStaff[staff.id];
    const slots = schedule
      ? generateAvailableSlots({
          date,
          durationMinutes,
          prepMinutes,
          bufferAfterMinutes,
          businessHours: schedule.businessHours,
          exceptions: schedule.exceptions,
          appointments: schedule.appointments
        })
      : [];

    return {
      staffMemberId: staff.id,
      staffName: staff.fullName,
      slots
    };
  });
}

export function getAvailableDaysForServiceMonth(input: Omit<ServiceAvailabilityInput, "date"> & { month: Date }) {
  const monthStart = startOfMonth(input.month);
  const monthEnd = endOfMonth(input.month);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).filter((date) =>
    getServiceAvailability({ ...input, date }).some((group) => group.slots.length > 0)
  );
}

export function getAvailableDaysForMonth(input: Omit<AvailabilityInput, "date"> & { month: Date }) {
  const monthStart = startOfMonth(input.month);
  const monthEnd = endOfMonth(input.month);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).filter((date) =>
    generateAvailableSlots({ ...input, date }).length > 0
  );
}

export function getCalendarWeeks(month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = addDays(monthStart, -getDay(monthStart));
  const calendarEnd = addDays(monthEnd, 6 - getDay(monthEnd));
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

export function formatDisplayTime(time: string) {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

export function getAppointmentEndTime(startTime: string, durationMinutes: number) {
  return format(addMinutes(parse(startTime, "HH:mm", new Date()), durationMinutes), "HH:mm");
}

export function getAppointmentBlockStartTime(startTime: string, prepMinutes: number) {
  return format(addMinutes(parse(startTime, "HH:mm", new Date()), -Math.max(0, prepMinutes)), "HH:mm");
}

export function addBookingMonths(date: Date, count: number) {
  return addMonths(date, count);
}

export function isCalendarSameDay(a: Date, b: Date) {
  return isSameDay(a, b);
}

function parseTimeForDate(date: Date, time: string) {
  return parse(`${format(date, "yyyy-MM-dd")} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
