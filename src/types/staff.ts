import type { AppointmentBooking, AvailabilityException, BusinessHour } from "@/types/appointment";

export type StaffRole = "super_admin" | "admin" | "colaborador";

export type StaffMember = {
  id: string;
  profileId?: string | null;
  authUserId?: string | null;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  bio?: string | null;
  role: StaffRole;
  isActive: boolean;
  specialty?: string | null;
  calendarColor?: string | null;
  services: string[];
  upcomingAppointments?: number;
  appointmentCount?: number;
};

export type UserProfile = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type StaffScheduleData = {
  businessHours: BusinessHour[];
  exceptions: AvailabilityException[];
  appointments: AppointmentBooking[];
};

export type ServiceBookingData = {
  staffMembers: StaffMember[];
  schedulesByStaff: Record<string, StaffScheduleData>;
};
