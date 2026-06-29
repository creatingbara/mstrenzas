import {
  getAdminAppointmentById as getLocalAdminAppointmentById,
  getAdminAppointmentData as getLocalAdminAppointmentData
} from "@/lib/local-db";

export function getAdminAppointmentData() {
  return getLocalAdminAppointmentData();
}

export function getAdminAppointmentById(id: string) {
  return getLocalAdminAppointmentById(id);
}
