"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/types/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = (await response.json()) as { item?: SiteSettings; error?: string; message?: string };

      if (!response.ok) throw new Error(result.error || "No se pudo guardar la configuración.");
      if (!result.item) throw new Error("Supabase no devolvio la configuracion guardada.");
      setForm(result.item);
      router.refresh();
      setStatus({ type: "ok", message: result.message || "Configuración guardada correctamente." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar la configuración." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-5">
      <h2 className="font-display text-2xl font-bold">Configuración general</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="Numero de WhatsApp" />
        <Input value={form.instagram} onChange={(event) => update("instagram", event.target.value)} placeholder="Instagram" />
        <Input value={form.zone} onChange={(event) => update("zone", event.target.value)} placeholder="Direccion o zona" />
        <Input value={form.hours} onChange={(event) => update("hours", event.target.value)} placeholder="Horarios" />
      </div>
      <Textarea
        className="mt-4"
        value={form.heroTitle}
        onChange={(event) => update("heroTitle", event.target.value)}
        placeholder="Texto del hero"
      />
      <Textarea
        className="mt-4"
        value={form.heroSubtitle}
        onChange={(event) => update("heroSubtitle", event.target.value)}
        placeholder="Subtitulo del hero"
      />
      <Textarea
        className="mt-4"
        value={form.bookingPolicy}
        onChange={(event) => update("bookingPolicy", event.target.value)}
        placeholder="Política antes de agendar"
      />
      <Textarea
        className="mt-4"
        value={form.whatsappMessage}
        onChange={(event) => update("whatsappMessage", event.target.value)}
        placeholder="Mensaje automatico de WhatsApp"
      />
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuracion"}
        </Button>
        {status && (
          <p className={status.type === "ok" ? "text-sm font-semibold text-cocoa" : "text-sm font-semibold text-red-600"}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
