"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appointmentBookingSchema, type AppointmentBookingFormValues } from "@/lib/validations";
import { whatsappLink } from "@/lib/whatsapp";
import type { AppointmentBooking } from "@/types/appointment";
import type { Service } from "@/types/service";

export function BookingClientForm({
  service,
  staffId,
  staffName,
  selectedDate,
  selectedTime,
  whatsappPhone,
  onBooked
}: {
  service: Service;
  staffId: string;
  staffName: string;
  selectedDate: Date;
  selectedTime: string;
  whatsappPhone: string;
  onBooked: (appointment: AppointmentBooking) => void;
}) {
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AppointmentBookingFormValues>({
    resolver: zodResolver(appointmentBookingSchema)
  });

  async function onSubmit(values: AppointmentBookingFormValues) {
    setNotice(null);
    const appointmentDate = format(selectedDate, "yyyy-MM-dd");
    const whatsappMessage = [
      "Hola M&S Trenzas, acabo de solicitar una cita.",
      "",
      `Nombre: ${values.fullName}`,
      `Servicio: ${service.name}`,
      `Colaborador: ${staffName}`,
      `Fecha: ${appointmentDate}`,
      `Hora: ${selectedTime}`,
      `Instagram: ${values.instagram ?? ""}`,
      `Comentario: ${values.note ?? ""}`,
      "",
      "Quedo atenta a la confirmación."
    ].join("\n");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceKey: service.slug || service.id,
          staffMemberId: staffId,
          appointmentDate,
          selectedTime,
          form: values
        })
      });
      const result = (await response.json()) as { item?: AppointmentBooking; error?: string };

      if (!response.ok || !result.item) {
        throw new Error(result.error || "No se pudo guardar la cita.");
      }

      onBooked(result.item);
      setNotice("Horario reservado provisionalmente. Te contactaremos para confirmar.");
      setSuccessLink(whatsappLink(whatsappMessage, whatsappPhone));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar la cita.");
    }
  }

  if (successLink) return <BookingSuccess whatsappUrl={successLink} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      <h2 className="font-display text-3xl font-bold">Completa tus datos</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.fullName?.message}>
          <Input {...register("fullName")} placeholder="Tu nombre" />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <Input {...register("whatsapp")} placeholder="809 000 0000" />
        </Field>
        <Field label="Instagram" error={errors.instagram?.message}>
          <Input {...register("instagram")} placeholder="@usuario" />
        </Field>
        <Field label="Correo opcional" error={errors.email?.message}>
          <Input {...register("email")} placeholder="correo@ejemplo.com" />
        </Field>
      </div>
      <div className="mt-4 grid gap-4">
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          {...register("website")}
        />
        <Field label="Imagen de referencia opcional" error={errors.referenceImageUrl?.message}>
          <Input {...register("referenceImageUrl")} placeholder="Enlace de imagen o publicación" />
        </Field>
        <Field label="Nota o comentario" error={errors.note?.message}>
          <Textarea {...register("note")} placeholder="Cuéntanos largo, color, volumen, estilo o cualquier detalle importante." />
        </Field>
      </div>
      <Button className="mt-5 w-full" type="submit" disabled={isSubmitting}>
        <Send size={18} />
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
      {notice && <p className="mt-4 rounded-lg bg-cream p-3 text-sm text-cocoa">{notice}</p>}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      {children}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
