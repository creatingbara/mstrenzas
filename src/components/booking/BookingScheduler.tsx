"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingClientForm } from "@/components/booking/BookingClientForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { StaffSelector } from "@/components/booking/StaffSelector";
import { Button } from "@/components/ui/button";
import { formatDisplayTime, getServiceAvailability } from "@/lib/booking/availability";
import { cn } from "@/lib/utils";
import type { AppointmentBooking } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { ServiceBookingData } from "@/types/staff";

type StaffSlot = {
  id: string;
  staffId: string;
  staffName: string;
  time: string;
  label: string;
};

export function BookingScheduler({
  service,
  bookingData,
  whatsappPhone
}: {
  service: Service;
  bookingData: ServiceBookingData;
  whatsappPhone: string;
}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<StaffSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<Record<string, AppointmentBooking[]>>(
    Object.fromEntries(
      Object.entries(bookingData.schedulesByStaff).map(([staffId, schedule]) => [staffId, schedule.appointments])
    )
  );

  const schedulesByStaff = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(bookingData.schedulesByStaff).map(([staffId, schedule]) => [
          staffId,
          {
            ...schedule,
            appointments: bookedAppointments[staffId] ?? []
          }
        ])
      ),
    [bookedAppointments, bookingData.schedulesByStaff]
  );

  const selectedCalendarStaffId = selectedStaffId === "any" ? null : selectedStaffId;
  const selectedStaff = selectedSlot
    ? bookingData.staffMembers.find((staff) => staff.id === selectedSlot.staffId)
    : selectedCalendarStaffId
      ? bookingData.staffMembers.find((staff) => staff.id === selectedCalendarStaffId)
      : null;

  const slots = useMemo<StaffSlot[]>(() => {
    if (!selectedDate || !selectedStaffId) return [];

    return getServiceAvailability({
      serviceId: service.id,
      staffMemberId: selectedCalendarStaffId,
      date: selectedDate,
      durationMinutes: service.durationMinutes,
      staffMembers: bookingData.staffMembers,
      schedulesByStaff
    }).flatMap((group) =>
      group.slots.map((time) => ({
        id: `${group.staffMemberId}-${time}`,
        staffId: group.staffMemberId,
        staffName: group.staffName,
        time,
        label: selectedStaffId === "any" ? `${formatDisplayTime(time)} - ${group.staffName}` : formatDisplayTime(time)
      }))
    );
  }, [
    bookingData.staffMembers,
    schedulesByStaff,
    selectedCalendarStaffId,
    selectedDate,
    selectedStaffId,
    service.durationMinutes,
    service.id
  ]);

  function chooseStaff(staffId: string) {
    setSelectedStaffId(staffId);
    setSelectedDate(null);
    setSelectedSlot(null);
    setShowForm(false);
  }

  return (
    <div className="grid gap-6">
      <StaffSelector staffMembers={bookingData.staffMembers} selectedStaffId={selectedStaffId} onSelect={chooseStaff} />

      {selectedStaffId && (
        <>
          <div className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-3xl font-bold">Selecciona fecha y hora</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selectedStaff
                ? `Mostrando horarios disponibles para ${selectedStaff.fullName}.`
                : "Mostrando horarios agrupados por colaboradora disponible."}
            </p>
          </div>
          <BookingCalendar
            serviceId={service.id}
            staffMemberId={selectedCalendarStaffId}
            durationMinutes={service.durationMinutes}
            staffMembers={bookingData.staffMembers}
            schedulesByStaff={schedulesByStaff}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
              setShowForm(false);
            }}
          />
        </>
      )}

      {selectedDate && selectedStaffId && (
        <div className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
          <h3 className="mb-4 font-display text-2xl font-bold">Horarios para {format(selectedDate, "dd/MM/yyyy")}</h3>
          {slots.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-bold transition",
                    selectedSlot?.id === slot.id
                      ? "border-ink bg-ink text-white"
                      : "border-cocoa/20 bg-white text-ink hover:border-cocoa hover:bg-cream"
                  )}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowForm(false);
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-cream p-4 text-sm font-semibold text-cocoa">
              No hay horarios disponibles con esta seleccion para esta fecha.
            </p>
          )}
        </div>
      )}

      <BookingSummary service={service} date={selectedDate} time={selectedSlot?.time} staffName={selectedStaff?.fullName ?? selectedSlot?.staffName} />

      {selectedDate && selectedSlot && !showForm && (
        <Button type="button" onClick={() => setShowForm(true)}>
          Continuar
        </Button>
      )}

      {selectedDate && selectedSlot && showForm && (
        <BookingClientForm
          service={service}
          staffId={selectedSlot.staffId}
          staffName={selectedSlot.staffName}
          selectedDate={selectedDate}
          selectedTime={selectedSlot.time}
          whatsappPhone={whatsappPhone}
          onBooked={(appointment) => {
            setBookedAppointments((current) => ({
              ...current,
              [selectedSlot.staffId]: [...(current[selectedSlot.staffId] ?? []), appointment]
            }));
          }}
        />
      )}
    </div>
  );
}
