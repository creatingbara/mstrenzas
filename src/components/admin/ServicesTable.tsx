"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Service } from "@/types/service";

type ServiceResponse = { item?: Service; error?: string; message?: string };

export function ServicesTable({ initialServices }: { initialServices: Service[] }) {
  const [items, setItems] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(initialServices[0]?.id ?? null);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const editing = items.find((item) => item.id === editingId) ?? items[0] ?? null;

  async function persist(serviceId: string, patch: Record<string, unknown>) {
    setBusyId(serviceId);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/servicios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, ...patch })
      });
      const result = (await response.json()) as ServiceResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar el servicio.");

      const savedItem = result.item;
      setItems((current) => current.map((item) => (item.id === savedItem.id ? savedItem : item)));
      setStatus({ type: "ok", message: result.message || "Servicio guardado." });
      return true;
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el servicio." });
      return false;
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5">
      {status && (
        <p className={status.type === "ok" ? "text-sm font-semibold text-cocoa" : "text-sm font-semibold text-red-600"}>
          {status.message}
        </p>
      )}
      <div className="grid gap-3 md:hidden">
        {items.map((service) => (
          <article key={service.id} className="rounded-lg border border-cocoa/10 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-1 text-lg font-black text-ink">{service.name}</p>
                <p className="mt-1 text-sm font-semibold text-cocoa">{service.category}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa">
                {service.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Info label="Precio" value={formatPrice(service.priceFrom, service.requiresQuote)} />
              <Info label="Duracion" value={formatDuration(service.durationMinutes)} />
              <Info label="Destacado" value={service.featured ? "Si" : "No"} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={() => setEditingId(service.id)}>
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busyId === service.id}
                onClick={() => persist(service.id, { active: !service.active })}
              >
                {busyId === service.id ? "..." : service.active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-cocoa/10 bg-white md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-cocoa">
            <tr>
              <th className="p-4">Servicio</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Duracion</th>
              <th className="p-4">Destacado</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((service) => (
              <tr key={service.id} className="border-t border-cocoa/10">
                <td className="p-4 font-semibold">{service.name}</td>
                <td className="p-4">{service.category}</td>
                <td className="p-4">{formatPrice(service.priceFrom, service.requiresQuote)}</td>
                <td className="p-4">{formatDuration(service.durationMinutes)}</td>
                <td className="p-4">{service.featured ? "Si" : "No"}</td>
                <td className="p-4">{service.active ? "Activo" : "Inactivo"}</td>
                <td className="flex gap-2 p-4">
                  <Button type="button" variant="outline" onClick={() => setEditingId(service.id)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busyId === service.id}
                    onClick={() => persist(service.id, { active: !service.active })}
                  >
                    {busyId === service.id ? "..." : service.active ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <ServiceEditor
          key={editing.id}
          service={editing}
          saving={busyId === editing.id}
          onSave={(patch) => persist(editing.id, patch)}
        />
      )}
    </div>
  );
}

function ServiceEditor({
  service,
  saving,
  onSave
}: {
  service: Service;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(service.name);
  const [category, setCategory] = useState(service.category);
  const [durationMinutes, setDurationMinutes] = useState(String(service.durationMinutes));
  const [priceFrom, setPriceFrom] = useState(service.priceFrom?.toString() ?? "");
  const [priceTo, setPriceTo] = useState(service.priceTo?.toString() ?? "");
  const [description, setDescription] = useState(service.description);
  const [imageUrl, setImageUrl] = useState(service.imageUrl);
  const [active, setActive] = useState(service.active !== false);
  const [featured, setFeatured] = useState(Boolean(service.featured));
  const [requiresQuote, setRequiresQuote] = useState(service.requiresQuote);
  const [includes, setIncludes] = useState(service.includes.join("\n"));
  const [recommendations, setRecommendations] = useState(service.recommendations.join("\n"));
  const [excludes, setExcludes] = useState(service.excludes.join("\n"));

  function listFromText(value: string) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function save() {
    onSave({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      durationMinutes: Number(durationMinutes) || service.durationMinutes,
      priceFrom: requiresQuote || priceFrom === "" ? null : Number(priceFrom),
      priceTo: requiresQuote || priceTo === "" ? null : Number(priceTo),
      requiresQuote,
      active,
      featured,
      includes: listFromText(includes),
      recommendations: listFromText(recommendations),
      excludes: listFromText(excludes)
    });
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Editar servicio</h2>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cocoa">{service.slug}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" />
        <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Categoria" />
        <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Imagen del servicio" />
        <Input
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
          type="number"
          placeholder="Duracion en minutos"
        />
        <Input value={priceFrom} onChange={(event) => setPriceFrom(event.target.value)} type="number" placeholder="Precio desde" />
        <Input value={priceTo} onChange={(event) => setPriceTo(event.target.value)} type="number" placeholder="Precio hasta" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-cream/40 px-4 py-3 text-sm font-semibold">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Servicio activo
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-cream/40 px-4 py-3 text-sm font-semibold">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Destacado
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-cocoa/10 bg-cream/40 px-4 py-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={requiresQuote}
            onChange={(event) => {
              setRequiresQuote(event.target.checked);
              if (event.target.checked) {
                setPriceFrom("");
                setPriceTo("");
              }
            }}
          />
          Mostrar como cotizar
        </label>
      </div>
      <Textarea
        className="mt-4"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion"
      />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Textarea value={includes} onChange={(event) => setIncludes(event.target.value)} placeholder="Incluye, una linea por punto" />
        <Textarea
          value={recommendations}
          onChange={(event) => setRecommendations(event.target.value)}
          placeholder="Recomendaciones, una linea por punto"
        />
        <Textarea value={excludes} onChange={(event) => setExcludes(event.target.value)} placeholder="No incluye, una linea por punto" />
      </div>
      <p className="mt-3 text-sm text-muted">
        Puedes editar todo lo visible en las tarjetas y en la pagina individual del servicio. Para imagen usa una ruta como /services/box-braids.jpg.
      </p>
      <div className="mt-4">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar servicio"}
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-cream/60 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-cocoa">{label}</span>
      <span className="mt-1 block truncate font-semibold text-ink">{value}</span>
    </span>
  );
}
