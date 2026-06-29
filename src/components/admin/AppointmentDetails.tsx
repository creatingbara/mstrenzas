import type { AppointmentBooking } from "@/types/appointment";

export function AppointmentDetails({ appointment }: { appointment: AppointmentBooking | null }) {
  if (!appointment) {
    return <div className="rounded-lg bg-white p-5 shadow-soft">Cita no encontrada.</div>;
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-6 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Detalle de cita</p>
      <h2 className="mt-3 font-display text-4xl font-bold">{appointment.clientName}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label="Servicio" value={appointment.serviceName} />
        <Info label="Colaborador" value={appointment.staffName ?? "Sin asignar"} />
        <Info label="Estado" value={appointment.status} />
        <Info label="Fecha" value={appointment.appointmentDate} />
        <Info label="Hora" value={`${appointment.startTime} - ${appointment.endTime}`} />
        <Info label="WhatsApp" value={appointment.phone} />
        <Info label="Instagram" value={appointment.instagram ?? "No indicado"} />
        <Info label="Correo" value={appointment.email ?? "No indicado"} />
        <Info label="Notas" value={appointment.notes ?? "Sin notas"} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
