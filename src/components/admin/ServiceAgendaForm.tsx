"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServiceImageUploader } from "@/components/admin/ServiceImageUploader";
import { ServicePreviewCard } from "@/components/admin/ServicePreviewCard";
import { ServiceStaffSelector } from "@/components/admin/ServiceStaffSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

type ServiceResponse = { item?: Service; error?: string; message?: string };

function textFromList(items?: string[]) {
  return (items ?? []).join("\n");
}

function listFromText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumberOrNull(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServiceAgendaForm({
  service,
  staffMembers,
  assignedStaffIds,
  mode
}: {
  service?: Service;
  staffMembers: StaffMember[];
  assignedStaffIds: string[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState(assignedStaffIds);

  const [form, setForm] = useState({
    slug: service?.slug ?? "",
    name: service?.name ?? "",
    category: service?.category ?? "",
    description: service?.description ?? "",
    fullDescription: service?.fullDescription ?? "",
    imageUrl: service?.imageUrl ?? "",
    galleryImages: textFromList(service?.galleryImages),
    active: service?.active !== false,
    featured: Boolean(service?.featured),
    showOnHome: service?.showOnHome !== false,
    sortOrder: String(service?.sortOrder ?? 0),
    priceFrom: service?.priceFrom?.toString() ?? "",
    priceTo: service?.priceTo?.toString() ?? "",
    priceLabel: service?.priceLabel ?? "",
    durationMinutes: String(service?.durationMinutes ?? 120),
    durationLabel: service?.durationLabel ?? "",
    requiresQuote: service?.requiresQuote ?? false,
    requiresDeposit: Boolean(service?.requiresDeposit),
    depositAmount: service?.depositAmount?.toString() ?? "",
    bookingEnabled: service?.bookingEnabled !== false,
    allowAnyStaff: service?.allowAnyStaff !== false,
    showStaffSelector: service?.showStaffSelector !== false,
    whatsappEnabled: service?.whatsappEnabled !== false,
    whatsappMessage: service?.whatsappMessage ?? "",
    prepMinutes: service?.prepMinutes?.toString() ?? "",
    bufferAfterMinutes: service?.bufferAfterMinutes?.toString() ?? "",
    includes: textFromList(service?.includes),
    excludes: textFromList(service?.excludes),
    recommendations: textFromList(service?.recommendations),
    beforeCare: service?.beforeCare ?? "",
    afterCare: service?.afterCare ?? "",
    internalNotes: service?.internalNotes ?? ""
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const preview = useMemo<Service>(
    () => ({
      id: service?.id ?? "preview",
      slug: form.slug || slugify(form.name) || "nuevo-servicio",
      name: form.name || "Nuevo servicio",
      category: form.category || "Servicios",
      description: form.description || "Descripcion corta del servicio.",
      fullDescription: form.fullDescription,
      imageUrl: form.imageUrl,
      galleryImages: listFromText(form.galleryImages),
      priceFrom: toNumberOrNull(form.priceFrom),
      priceTo: toNumberOrNull(form.priceTo),
      priceLabel: form.priceLabel || null,
      durationMinutes: Number(form.durationMinutes) || 120,
      durationLabel: form.durationLabel || null,
      requiresQuote: form.requiresQuote,
      featured: form.featured,
      active: form.active,
      bookingEnabled: form.bookingEnabled,
      whatsappEnabled: form.whatsappEnabled,
      showStaffSelector: form.showStaffSelector,
      allowAnyStaff: form.allowAnyStaff,
      requiresDeposit: form.requiresDeposit,
      depositAmount: toNumberOrNull(form.depositAmount),
      showOnHome: form.showOnHome,
      sortOrder: Number(form.sortOrder) || 0,
      internalNotes: form.internalNotes || null,
      beforeCare: form.beforeCare || null,
      afterCare: form.afterCare || null,
      whatsappMessage: form.whatsappMessage || null,
      prepMinutes: toNumberOrNull(form.prepMinutes),
      bufferAfterMinutes: toNumberOrNull(form.bufferAfterMinutes),
      recommendations: listFromText(form.recommendations),
      includes: listFromText(form.includes),
      excludes: listFromText(form.excludes)
    }),
    [form, service?.id]
  );

  async function save() {
    setSaving(true);
    setStatus(null);

    const imageUrl = form.imageUrl.trim();
    if (!imageUrl) {
      setStatus({ type: "error", message: "Agrega una imagen o sube una foto antes de guardar el servicio." });
      setSaving(false);
      return;
    }

    const payload = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      category: form.category,
      description: form.description,
      fullDescription: form.fullDescription || null,
      imageUrl,
      galleryImages: listFromText(form.galleryImages),
      active: form.active,
      featured: form.featured,
      showOnHome: form.showOnHome,
      sortOrder: Number(form.sortOrder) || 0,
      priceFrom: form.requiresQuote ? null : toNumberOrNull(form.priceFrom),
      priceTo: form.requiresQuote ? null : toNumberOrNull(form.priceTo),
      priceLabel: form.priceLabel || null,
      durationMinutes: Number(form.durationMinutes) || 120,
      durationLabel: form.durationLabel || null,
      requiresQuote: form.requiresQuote,
      requiresDeposit: form.requiresDeposit,
      depositAmount: toNumberOrNull(form.depositAmount),
      bookingEnabled: form.bookingEnabled,
      allowAnyStaff: form.allowAnyStaff,
      showStaffSelector: form.showStaffSelector,
      whatsappEnabled: form.whatsappEnabled,
      whatsappMessage: form.whatsappMessage || null,
      prepMinutes: toNumberOrNull(form.prepMinutes),
      bufferAfterMinutes: toNumberOrNull(form.bufferAfterMinutes),
      includes: listFromText(form.includes),
      excludes: listFromText(form.excludes),
      recommendations: listFromText(form.recommendations),
      beforeCare: form.beforeCare || null,
      afterCare: form.afterCare || null,
      internalNotes: form.internalNotes || null
    };

    try {
      const response = await fetch("/api/admin/servicios", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? payload : { serviceId: service?.id, ...payload })
      });
      const result = (await response.json()) as ServiceResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar el servicio.");

      const staffResponse = await fetch(`/api/admin/servicios/${result.item.id}/staff`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      const staffResult = (await staffResponse.json()) as { error?: string };
      if (!staffResponse.ok) {
        throw new Error(staffResult.error || "El servicio se guardó, pero no se pudo actualizar el equipo asignado.");
      }

      setStatus({ type: "ok", message: result.message || "Servicio guardado." });
      if (mode === "create") router.push(`/admin/servicios-agenda/${result.item.id}`);
      router.refresh();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el servicio." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-6">
        {status && (
          <p className={status.type === "ok" ? "rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa" : "rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"}>
            {status.message}
          </p>
        )}

        <Section title="Información básica">
          <div className="grid gap-4 md:grid-cols-2">
            <Input aria-label="Nombre del servicio" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nombre del servicio" />
            <Input aria-label="Categoría" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Categoría" />
          </div>
          <Textarea className="mt-4" aria-label="Descripción breve" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Descripción breve (opcional)" />
          <div className="mt-4">
            <ServiceImageUploader value={form.imageUrl} onChange={(value) => update("imageUrl", value)} />
          </div>
          <CheckboxGrid>
            <Check label="Servicio activo" checked={form.active} onChange={(value) => update("active", value)} />
            <Check label="Mostrar en home" checked={form.showOnHome} onChange={(value) => update("showOnHome", value)} />
            <Check label="Destacado" checked={form.featured} onChange={(value) => update("featured", value)} />
          </CheckboxGrid>
          <details className="mt-4 rounded-lg border border-cocoa/10 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-cocoa">Opciones adicionales de contenido</summary>
            <div className="mt-4 grid gap-4">
              <Input aria-label="Dirección web del servicio" value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="URL del servicio (se genera a partir del nombre)" />
              <Input aria-label="Orden en el catálogo" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} type="number" placeholder="Orden en el catálogo" />
              <Textarea aria-label="Descripción completa" value={form.fullDescription} onChange={(event) => update("fullDescription", event.target.value)} placeholder="Descripción completa (opcional)" />
              <Textarea aria-label="Fotos adicionales" value={form.galleryImages} onChange={(event) => update("galleryImages", event.target.value)} placeholder="Fotos adicionales: un enlace por línea (opcional)" />
            </div>
          </details>
        </Section>

        <Section title="Precio y duración">
          <div className="grid gap-4 md:grid-cols-2">
            <Input aria-label="Precio en pesos dominicanos" value={form.priceFrom} onChange={(event) => update("priceFrom", event.target.value)} type="number" min="0" disabled={form.requiresQuote} placeholder="Precio en RD$" />
            <Input aria-label="Duración en minutos" value={form.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)} type="number" min="1" placeholder="Duración en minutos" />
          </div>
          <CheckboxGrid>
            <Check label="Mostrar precio como “Cotizar”" checked={form.requiresQuote} onChange={(value) => update("requiresQuote", value)} />
            <Check label="Solicitar depósito" checked={form.requiresDeposit} onChange={(value) => update("requiresDeposit", value)} />
          </CheckboxGrid>
          <details className="mt-4 rounded-lg border border-cocoa/10 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-cocoa">Precio por rango y etiquetas visibles</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input aria-label="Precio máximo" value={form.priceTo} onChange={(event) => update("priceTo", event.target.value)} type="number" min="0" disabled={form.requiresQuote} placeholder="Precio máximo (opcional)" />
              <Input aria-label="Etiqueta de precio" value={form.priceLabel} onChange={(event) => update("priceLabel", event.target.value)} placeholder="Texto de precio (opcional)" />
              <Input aria-label="Etiqueta de duración" value={form.durationLabel} onChange={(event) => update("durationLabel", event.target.value)} placeholder="Duración visible, por ejemplo 3 h" />
              <Input aria-label="Monto del depósito" value={form.depositAmount} onChange={(event) => update("depositAmount", event.target.value)} type="number" min="0" disabled={!form.requiresDeposit} placeholder="Monto del depósito" />
            </div>
          </details>
        </Section>

        <Section title="Agenda">
          <CheckboxGrid>
            <Check label="Permitir agendar" checked={form.bookingEnabled} onChange={(value) => update("bookingEnabled", value)} />
            <Check label="Cualquier colaboradora activa" checked={form.allowAnyStaff} onChange={(value) => update("allowAnyStaff", value)} />
          </CheckboxGrid>
          <p className="mt-3 text-sm leading-6 text-muted">Al activar esta opción, cualquier integrante activo con horario configurado podrá atender este servicio.</p>
          <details className="mt-4 rounded-lg border border-cocoa/10 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-cocoa">Más opciones de agenda</summary>
            <div className="mt-4 grid gap-4">
              <CheckboxGrid>
                <Check label="Mostrar selector de colaborador" checked={form.showStaffSelector} onChange={(value) => update("showStaffSelector", value)} />
                <Check label="Permitir WhatsApp alternativo" checked={form.whatsappEnabled} onChange={(value) => update("whatsappEnabled", value)} />
              </CheckboxGrid>
              <Textarea aria-label="Mensaje para WhatsApp" value={form.whatsappMessage} onChange={(event) => update("whatsappMessage", event.target.value)} placeholder="Mensaje personalizado para WhatsApp (opcional)" />
              <div className="grid gap-4 md:grid-cols-2">
                <Input aria-label="Preparación antes del servicio en minutos" value={form.prepMinutes} onChange={(event) => update("prepMinutes", event.target.value)} type="number" min="0" placeholder="Preparación antes, minutos" />
                <Input aria-label="Descanso después del servicio en minutos" value={form.bufferAfterMinutes} onChange={(event) => update("bufferAfterMinutes", event.target.value)} type="number" min="0" placeholder="Descanso después, minutos" />
              </div>
            </div>
          </details>
        </Section>

        <Section title="Colaboradoras">
          {form.allowAnyStaff ? (
            staffMembers.length ? (
              <p className="text-sm leading-6 text-muted">No necesitas asignar personas. Este servicio estará disponible para las {staffMembers.length} colaboradoras activas del equipo.</p>
            ) : (
              <p className="text-sm leading-6 text-muted">No hay colaboradoras activas todavía. <Link href="/admin/equipo/nuevo" className="font-semibold text-cocoa underline">Agrega una persona al equipo</Link> para que pueda recibir citas.</p>
            )
          ) : (
            <ServiceStaffSelector staffMembers={staffMembers} selectedIds={selectedStaffIds} onChange={setSelectedStaffIds} />
          )}
        </Section>

        <Section title="Información opcional">
          <details className="rounded-lg border border-cocoa/10 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-cocoa">Qué incluye, recomendaciones y cuidados</summary>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Textarea aria-label="Qué incluye" value={form.includes} onChange={(event) => update("includes", event.target.value)} placeholder="Qué incluye, un punto por línea" />
                <Textarea aria-label="Qué no incluye" value={form.excludes} onChange={(event) => update("excludes", event.target.value)} placeholder="Qué no incluye, un punto por línea" />
                <Textarea aria-label="Recomendaciones" value={form.recommendations} onChange={(event) => update("recommendations", event.target.value)} placeholder="Recomendaciones, un punto por línea" />
              </div>
              <Textarea aria-label="Cuidados antes del servicio" value={form.beforeCare} onChange={(event) => update("beforeCare", event.target.value)} placeholder="Cuidados antes del servicio" />
              <Textarea aria-label="Cuidados después del servicio" value={form.afterCare} onChange={(event) => update("afterCare", event.target.value)} placeholder="Cuidados después del servicio" />
              <Textarea aria-label="Notas internas" value={form.internalNotes} onChange={(event) => update("internalNotes", event.target.value)} placeholder="Notas internas para administración" />
            </div>
          </details>
        </Section>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar servicio"}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/servicios-agenda")}>Volver</Button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <h3 className="mb-3 font-display text-2xl font-bold">Vista previa</h3>
        <ServicePreviewCard service={preview} />
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <h2 className="mb-4 font-display text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function CheckboxGrid({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-cream/40 px-4 py-3 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
