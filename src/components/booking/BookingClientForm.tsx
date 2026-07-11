"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, ImagePlus, Send, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appointmentBookingSchema, type AppointmentBookingFormValues } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
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
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AppointmentBookingFormValues>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      depositPolicyAccepted: false
    }
  });
  const referenceImageUrl = watch("referenceImageUrl") || "";
  const depositMessage =
    service.requiresDeposit && service.depositAmount
      ? `Para asegurar tu espacio, este servicio tiene un anticipo configurado de ${formatPrice(service.depositAmount, false).replace("Desde ", "")}.`
      : "Para asegurar tu espacio, la cita se confirma con un anticipo del 20%.";

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
      `Referencia: ${values.referenceImageUrl ?? ""}`,
      `Comentario: ${values.note ?? ""}`,
      "",
      "Entiendo que la cita se confirma con el anticipo del 20%.",
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

  async function uploadReferenceImage(file: File) {
    setUploadNotice(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadNotice("Solo se permiten imagenes jpg, png o webp.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadNotice("La imagen no puede superar 10MB.");
      return;
    }

    setIsUploadingReference(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/booking-references", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error || "No se pudo subir la imagen.");
      }

      setValue("referenceImageUrl", result.url, { shouldDirty: true, shouldValidate: true });
      setUploadNotice("Imagen de referencia subida correctamente.");
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setIsUploadingReference(false);
    }
  }

  function clearReferenceImage() {
    setValue("referenceImageUrl", "", { shouldDirty: true, shouldValidate: true });
    setUploadNotice(null);
  }

  if (successLink) return <BookingSuccess whatsappUrl={successLink} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      <h2 className="font-display text-3xl font-bold">Completa tus datos</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.fullName?.message} required>
          <Input
            {...register("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            className={errors.fullName ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100" : undefined}
            placeholder="Tu nombre"
          />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message} required>
          <Input
            {...register("whatsapp")}
            aria-invalid={Boolean(errors.whatsapp)}
            className={errors.whatsapp ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100" : undefined}
            placeholder="809 000 0000"
          />
        </Field>
        <Field label="Instagram (opcional)" error={errors.instagram?.message}>
          <Input {...register("instagram")} placeholder="@usuario" />
        </Field>
        <Field label="Correo (opcional)" error={errors.email?.message}>
          <Input
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            className={errors.email ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100" : undefined}
            placeholder="correo@ejemplo.com"
          />
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
        <Field label="Imagen o publicación (opcional)" error={errors.referenceImageUrl?.message}>
          <div className="grid gap-3 rounded-lg border border-cocoa/10 bg-cream/40 p-3">
            {isImageUrl(referenceImageUrl) ? (
              <img
                src={referenceImageUrl}
                alt="Referencia subida"
                className="h-36 w-full rounded-lg object-cover sm:h-44"
              />
            ) : (
              <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-cocoa/20 bg-white text-center text-sm text-muted">
                Sube una foto desde tu celular o pega el enlace de una publicacion.
              </div>
            )}
            <Input
              {...register("referenceImageUrl")}
              aria-invalid={Boolean(errors.referenceImageUrl)}
              className={errors.referenceImageUrl ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100" : undefined}
              placeholder="Enlace de imagen o publicacion"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-plum">
                <ImagePlus size={18} />
                {isUploadingReference ? "Subiendo..." : "Subir foto"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploadingReference || isSubmitting}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadReferenceImage(file);
                  }}
                />
              </label>
              {referenceImageUrl && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cocoa/20 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cocoa hover:bg-cream"
                  onClick={clearReferenceImage}
                >
                  <X size={18} />
                  Quitar referencia
                </button>
              )}
            </div>
            {uploadNotice && <p className="text-xs font-semibold text-cocoa">{uploadNotice}</p>}
          </div>
        </Field>
        <Field label="Detalles del peinado" error={errors.note?.message} required>
          <Textarea
            {...register("note")}
            aria-invalid={Boolean(errors.note)}
            className={errors.note ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100" : undefined}
            placeholder="Cuentanos largo, color, volumen, estilo o cualquier detalle importante."
          />
        </Field>
      </div>
      <div
        className={`mt-5 rounded-lg border p-4 ${
          errors.depositPolicyAccepted ? "border-red-500 bg-red-50" : "border-cocoa/15 bg-cream"
        }`}
      >
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-cocoa" size={20} />
          <div className="grid gap-2 text-sm text-ink">
            <p className="font-semibold">Anticipo para confirmar tu cita</p>
            <p className="leading-6 text-muted">
              {depositMessage} El monto final puede variar segun el servicio, largo, volumen o estilo.
            </p>
            <label className="flex items-start gap-2 font-semibold">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-cocoa/30 text-cocoa focus:ring-cocoa/30"
                {...register("depositPolicyAccepted")}
              />
              Entiendo que debo realizar el anticipo para confirmar mi cita.
            </label>
            {errors.depositPolicyAccepted && (
              <span className="text-xs font-medium text-red-600">{errors.depositPolicyAccepted.message}</span>
            )}
          </div>
        </div>
      </div>
      <Button className="mt-5 w-full" type="submit" disabled={isSubmitting || isUploadingReference}>
        <Send size={18} />
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
      {notice && <p className="mt-4 rounded-lg bg-cream p-3 text-sm text-cocoa">{notice}</p>}
    </form>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function isImageUrl(value: string) {
  return /^https:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(value);
}
