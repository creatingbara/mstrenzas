"use client";

import { useMemo, useState, type ReactNode } from "react";
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
    requiresQuote: service?.requiresQuote ?? true,
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

    const payload = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      category: form.category,
      description: form.description,
      fullDescription: form.fullDescription || null,
      imageUrl: form.imageUrl || "/services/trenzas-africanas.jpg",
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

      await fetch(`/api/admin/servicios/${result.item.id}/staff`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });

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

        <Section title="Informacion basica">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nombre del servicio" />
            <Input value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="slug-del-servicio" />
            <Input value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Categoria" />
            <Input value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} type="number" placeholder="Orden" />
          </div>
          <Textarea className="mt-4" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Descripcion corta" />
          <Textarea className="mt-4" value={form.fullDescription} onChange={(event) => update("fullDescription", event.target.value)} placeholder="Descripcion completa" />
          <div className="mt-4">
            <ServiceImageUploader value={form.imageUrl} onChange={(value) => update("imageUrl", value)} />
          </div>
          <Textarea className="mt-4" value={form.galleryImages} onChange={(event) => update("galleryImages", event.target.value)} placeholder="Galeria opcional, una imagen por linea" />
          <CheckboxGrid>
            <Check label="Servicio activo" checked={form.active} onChange={(value) => update("active", value)} />
            <Check label="Mostrar en home" checked={form.showOnHome} onChange={(value) => update("showOnHome", value)} />
            <Check label="Destacado" checked={form.featured} onChange={(value) => update("featured", value)} />
          </CheckboxGrid>
        </Section>

        <Section title="Precio y duracion">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={form.priceFrom} onChange={(event) => update("priceFrom", event.target.value)} type="number" placeholder="Precio desde" />
            <Input value={form.priceTo} onChange={(event) => update("priceTo", event.target.value)} type="number" placeholder="Precio hasta" />
            <Input value={form.priceLabel} onChange={(event) => update("priceLabel", event.target.value)} placeholder="Texto visible de precio" />
            <Input value={form.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)} type="number" placeholder="Duracion en minutos" />
            <Input value={form.durationLabel} onChange={(event) => update("durationLabel", event.target.value)} placeholder="Duracion visible, ej. 3 h" />
            <Input value={form.depositAmount} onChange={(event) => update("depositAmount", event.target.value)} type="number" placeholder="Monto de deposito" />
          </div>
          <CheckboxGrid>
            <Check label="Requiere cotizacion" checked={form.requiresQuote} onChange={(value) => update("requiresQuote", value)} />
            <Check label="Requiere deposito" checked={form.requiresDeposit} onChange={(value) => update("requiresDeposit", value)} />
          </CheckboxGrid>
        </Section>

        <Section title="Agenda">
          <CheckboxGrid>
            <Check label="Permitir agendar" checked={form.bookingEnabled} onChange={(value) => update("bookingEnabled", value)} />
            <Check label="Cualquier colaborador disponible" checked={form.allowAnyStaff} onChange={(value) => update("allowAnyStaff", value)} />
            <Check label="Mostrar selector de colaborador" checked={form.showStaffSelector} onChange={(value) => update("showStaffSelector", value)} />
            <Check label="Permitir WhatsApp alternativo" checked={form.whatsappEnabled} onChange={(value) => update("whatsappEnabled", value)} />
          </CheckboxGrid>
          <Textarea className="mt-4" value={form.whatsappMessage} onChange={(event) => update("whatsappMessage", event.target.value)} placeholder="Mensaje personalizado de WhatsApp" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input value={form.prepMinutes} onChange={(event) => update("prepMinutes", event.target.value)} type="number" placeholder="Preparacion antes, minutos" />
            <Input value={form.bufferAfterMinutes} onChange={(event) => update("bufferAfterMinutes", event.target.value)} type="number" placeholder="Descanso despues, minutos" />
          </div>
        </Section>

        <Section title="Colaboradores">
          <ServiceStaffSelector staffMembers={staffMembers} selectedIds={selectedStaffIds} onChange={setSelectedStaffIds} />
        </Section>

        <Section title="Contenido adicional">
          <div className="grid gap-4 md:grid-cols-3">
            <Textarea value={form.includes} onChange={(event) => update("includes", event.target.value)} placeholder="Que incluye, una linea por punto" />
            <Textarea value={form.excludes} onChange={(event) => update("excludes", event.target.value)} placeholder="Que no incluye, una linea por punto" />
            <Textarea value={form.recommendations} onChange={(event) => update("recommendations", event.target.value)} placeholder="Recomendaciones, una linea por punto" />
          </div>
          <Textarea className="mt-4" value={form.beforeCare} onChange={(event) => update("beforeCare", event.target.value)} placeholder="Cuidados antes del servicio" />
          <Textarea className="mt-4" value={form.afterCare} onChange={(event) => update("afterCare", event.target.value)} placeholder="Cuidados despues del servicio" />
          <Textarea className="mt-4" value={form.internalNotes} onChange={(event) => update("internalNotes", event.target.value)} placeholder="Notas internas para admin" />
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
