"use client";

import { useEffect, useState } from "react";
import { Fingerprint, Trash2 } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasskeyItem = {
  id: string;
  deviceName?: string | null;
  createdAt?: string | null;
  lastUsedAt?: string | null;
  transports?: string[];
};

export function PasskeySecurityPanel() {
  const [items, setItems] = useState<PasskeyItem[]>([]);
  const [deviceName, setDeviceName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadPasskeys();
  }, []);

  async function loadPasskeys() {
    const response = await fetch("/api/passkeys");
    const result = (await response.json().catch(() => ({}))) as { items?: PasskeyItem[] };
    if (response.ok) setItems(result.items || []);
  }

  async function registerPasskey() {
    setBusy(true);
    setMessage(null);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error("Este navegador no soporta Face ID / Touch ID. Puedes seguir entrando con tu contrasena.");
      }

      const optionsResponse = await fetch("/api/passkeys/register/options", { method: "POST" });
      const optionsJSON = await optionsResponse.json();
      if (!optionsResponse.ok) throw new Error(optionsJSON.error || "No se pudo iniciar Face ID / Touch ID.");

      const response = await startRegistration({ optionsJSON });
      const verifyResponse = await fetch("/api/passkeys/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response,
          deviceName: deviceName.trim() || null
        })
      });
      const result = (await verifyResponse.json()) as { error?: string; message?: string };
      if (!verifyResponse.ok) throw new Error(result.error || "No se pudo verificar tu identidad.");

      setMessage(result.message || "Face ID / Touch ID activado correctamente.");
      setDeviceName("");
      await loadPasskeys();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo verificar tu identidad.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePasskey(id: string) {
    if (!window.confirm("Eliminar este dispositivo de Face ID / Touch ID?")) return;
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/passkeys/${id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar la passkey.");

      setMessage(result.message || "Passkey eliminada correctamente.");
      await loadPasskeys();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la passkey.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
      <div>
        <h3 className="font-display text-2xl font-bold text-ink">Seguridad</h3>
        <p className="mt-1 text-sm text-muted">Activa Face ID, Touch ID, huella, PIN o bloqueo del dispositivo.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={deviceName}
          onChange={(event) => setDeviceName(event.target.value)}
          placeholder="Nombre del dispositivo opcional"
        />
        <Button type="button" className="rounded-lg" disabled={busy} onClick={registerPasskey}>
          <Fingerprint size={17} />
          Activar Face ID / Touch ID
        </Button>
      </div>

      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cocoa/10 bg-white p-3">
            <span>
              <span className="block text-sm font-bold text-ink">{item.deviceName || "Dispositivo seguro"}</span>
              <span className="block text-xs text-muted">
                {item.lastUsedAt ? `Ultimo uso: ${formatDate(item.lastUsedAt)}` : `Creado: ${formatDate(item.createdAt)}`}
              </span>
            </span>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => deletePasskey(item.id)}>
              <Trash2 size={16} />
              Eliminar
            </Button>
          </div>
        ))}
      </div>

      {!items.length && <p className="text-sm text-muted">No tienes dispositivos registrados. Puedes seguir entrando con tu contrasena.</p>}
      {message && <p className="rounded-lg bg-white p-3 text-sm font-semibold text-cocoa">{message}</p>}
    </section>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
