"use client";

import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgendaPageContent } from "@/types/agenda-page";
import type { Service } from "@/types/service";

type AgendaPagesResponse = {
  pages?: AgendaPageContent[];
  error?: string;
  message?: string;
};

const pageLabels: Record<string, string> = {
  dama: "Damas",
  caballero: "Caballeros",
  "extensiones-humanas": "Extensiones 100% Human",
  "informacion-antes-de-agendar": "Información antes de agendar"
};

const pageRoutes: Record<string, string> = {
  dama: "/agendar/dama",
  caballero: "/agendar/caballero",
  "extensiones-humanas": "/agendar/extensiones-humanas",
  "informacion-antes-de-agendar": "/agendar/informacion-antes-de-agendar"
};

export function AgendaPagesManager({ initialPages, services }: { initialPages: AgendaPageContent[]; services: Service[] }) {
  const [pages, setPages] = useState(initialPages);
  const [activeKey, setActiveKey] = useState(initialPages.find((page) => page.pageKey === "dama")?.pageKey ?? initialPages[0]?.pageKey ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  const activePage = pages.find((page) => page.pageKey === activeKey) ?? pages[0];

  function updatePage(pageKey: string, patch: Partial<AgendaPageContent>) {
    setPages((current) => current.map((page) => (page.pageKey === pageKey ? { ...page, ...patch } : page)));
  }

  function listFromText(value: string) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function sectionsFromText(value: string) {
    return value
      .split("\n")
      .map((line) => {
        const [title, ...rest] = line.split("|");
        return { title: title.trim(), text: rest.join("|").trim() || undefined };
      })
      .filter((item) => item.title);
  }

  function toggleService(slug: string, checked: boolean) {
    const current = activePage.serviceSlugs ?? [];
    const next = checked ? [...current, slug] : current.filter((item) => item !== slug);
    updatePage(activePage.pageKey, { serviceSlugs: next });
  }

  function moveService(slug: string, direction: -1 | 1) {
    const current = [...(activePage.serviceSlugs ?? [])];
    const index = current.indexOf(slug);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;

    const [item] = current.splice(index, 1);
    current.splice(nextIndex, 0, item);
    updatePage(activePage.pageKey, { serviceSlugs: current });
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/agenda-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages })
      });
      const result = (await response.json()) as AgendaPagesResponse;
      if (!response.ok || !result.pages) throw new Error(result.error || "No se pudieron guardar las páginas.");

      setPages(result.pages);
      setStatus({ type: "ok", message: result.message || "Página guardada." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudieron guardar las páginas." });
    } finally {
      setSaving(false);
    }
  }

  if (!activePage) return null;

  const route = pageRoutes[activePage.pageKey] ?? activePage.pageKey;
  const sectionsText = activePage.sections.map((section) => `${section.title}${section.text ? ` | ${section.text}` : ""}`).join("\n");
  const itemsText = activePage.items.join("\n");
  const canEditServiceCards = activePage.pageKey === "dama" || activePage.pageKey === "caballero";
  const selectedServices = (activePage.serviceSlugs ?? [])
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean) as Service[];

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold">Contenido de la página</h3>
          <p className="mt-1 text-sm text-muted">Selecciona una página y edita lo que verá la clienta al abrirla.</p>
        </div>
        <Button type="button" onClick={save} disabled={saving}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar página"}
        </Button>
      </div>

      {status && (
        <p className={status.type === "ok" ? "mt-4 text-sm font-semibold text-cocoa" : "mt-4 text-sm font-semibold text-red-600"}>
          {status.message}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {pages.map((page) => (
          <button
            key={page.pageKey}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              activePage.pageKey === page.pageKey ? "border-cocoa bg-cocoa text-white" : "border-cocoa/20 bg-white text-ink"
            }`}
            onClick={() => setActiveKey(page.pageKey)}
          >
            {pageLabels[page.pageKey] ?? page.pageKey}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-cream p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Editando la página que abre</p>
          <p className="mt-1 font-semibold text-ink">{route}</p>
        </div>
        <Link href={route} target="_blank">
          <Button type="button" variant="outline">
            <ExternalLink size={17} />
            Ver página
          </Button>
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input value={activePage.eyebrow} onChange={(event) => updatePage(activePage.pageKey, { eyebrow: event.target.value })} placeholder="Etiqueta" />
        <Input value={activePage.title} onChange={(event) => updatePage(activePage.pageKey, { title: event.target.value })} placeholder="Título principal" />
      </div>
      <Textarea
        className="mt-4"
        value={activePage.subtitle}
        onChange={(event) => updatePage(activePage.pageKey, { subtitle: event.target.value })}
        placeholder="Texto debajo del título"
      />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          value={activePage.buttonLabel ?? ""}
          onChange={(event) => updatePage(activePage.pageKey, { buttonLabel: event.target.value })}
          placeholder="Texto del botón opcional"
        />
        <Input
          value={activePage.buttonHref ?? ""}
          onChange={(event) => updatePage(activePage.pageKey, { buttonHref: event.target.value })}
          placeholder="Enlace o whatsapp:mensaje"
        />
      </div>
      <Textarea
        className="mt-4"
        value={sectionsText}
        onChange={(event) => updatePage(activePage.pageKey, { sections: sectionsFromText(event.target.value) })}
        placeholder="Secciones de la página: Título | Texto, una por línea"
      />
      <Textarea
        className="mt-4"
        value={itemsText}
        onChange={(event) => updatePage(activePage.pageKey, { items: listFromText(event.target.value) })}
        placeholder="Puntos importantes, uno por línea"
      />

      {canEditServiceCards && (
        <div className="mt-5 rounded-lg border border-cocoa/10 bg-cream/40 p-4">
          <div className="mb-4">
            <h4 className="font-display text-xl font-bold">Servicios visibles en esta página</h4>
            <p className="mt-1 text-sm text-muted">
              Esto controla las tarjetas que aparecen en {route}. El nombre, imagen y descripción de cada tarjeta se editan en Servicios.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Activar o quitar servicios</p>
              <div className="grid gap-2">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center gap-3 rounded-lg border border-cocoa/10 px-3 py-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={(activePage.serviceSlugs ?? []).includes(service.slug)}
                      onChange={(event) => toggleService(service.slug, event.target.checked)}
                    />
                    <span>{service.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Orden en la página</p>
              <div className="grid gap-2">
                {selectedServices.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between gap-3 rounded-lg border border-cocoa/10 px-3 py-2">
                    <span className="text-sm font-semibold">{index + 1}. {service.name}</span>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" disabled={index === 0} onClick={() => moveService(service.slug, -1)}>
                        Subir
                      </Button>
                      <Button type="button" variant="outline" disabled={index === selectedServices.length - 1} onClick={() => moveService(service.slug, 1)}>
                        Bajar
                      </Button>
                    </div>
                  </div>
                ))}
                {!selectedServices.length && <p className="text-sm text-muted">No hay servicios seleccionados.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
