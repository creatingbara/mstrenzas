"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services, siteSettings } from "@/lib/data";
import { bookingSchema, type BookingFormValues } from "@/lib/validations";
import { bookingWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";

export function BookingForm() {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("servicio") ?? "";
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const defaultValues = useMemo<Partial<BookingFormValues>>(
    () => ({ serviceSlug: requestedService, preferredDate: "", preferredTime: "" }),
    [requestedService]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues
  });

  async function onSubmit(values: BookingFormValues) {
    setFormNotice(null);
    const link = whatsappLink(bookingWhatsAppMessage(values), siteSettings.whatsapp);

    setFormNotice("Tu mensaje está listo para WhatsApp. Para reservar con calendario, usa el botón Agendar de un servicio.");
    setSuccessLink(link);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.fullName?.message}>
          <Input placeholder="Tu nombre" {...register("fullName")} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <Input placeholder="809 000 0000" {...register("whatsapp")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Instagram" error={errors.instagram?.message}>
          <Input placeholder="@usuario" {...register("instagram")} />
        </Field>
        <Field label="Servicio deseado" error={errors.serviceSlug?.message}>
          <select
            className="min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10"
            {...register("serviceSlug")}
          >
            <option value="">Selecciona un servicio</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha deseada" error={errors.preferredDate?.message}>
          <Input type="date" {...register("preferredDate")} />
        </Field>
        <Field label="Hora deseada" error={errors.preferredTime?.message}>
          <Input type="time" {...register("preferredTime")} />
        </Field>
      </div>
      <Field label="Imagen de referencia opcional" error={errors.referenceImageUrl?.message}>
        <Input placeholder="Pega un enlace de imagen o publicación" {...register("referenceImageUrl")} />
      </Field>
      <Field label="Comentario o nota" error={errors.note?.message}>
        <Textarea placeholder="Cuéntanos largo, color, volumen, estilo o cualquier detalle importante." {...register("note")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <Send size={18} />
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
      {formNotice && <p className="rounded-lg bg-cream p-3 text-sm text-cocoa">{formNotice}</p>}
      {successLink && (
        <a className="text-sm font-semibold text-cocoa underline" href={successLink} target="_blank">
          Continuar conversación por WhatsApp
        </a>
      )}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      {children}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

