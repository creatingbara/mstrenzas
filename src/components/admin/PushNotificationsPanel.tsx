"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type PushInfo = {
  configured: boolean;
  publicKey: string;
};

type Notice = {
  type: "ok" | "error" | "muted";
  message: string;
};

export function PushNotificationsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [info, setInfo] = useState<PushInfo | null>(null);
  const [notice, setNotice] = useState<Notice>({ type: "muted", message: "Comprobando notificaciones..." });

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    setLoading(true);

    try {
      if (!isPushSupported()) {
        setNotice({ type: "error", message: "Este navegador no soporta notificaciones push." });
        setEnabled(false);
        return;
      }

      if (Notification.permission === "denied") {
        setNotice({ type: "error", message: "Notificaciones bloqueadas en este navegador." });
        setEnabled(false);
        return;
      }

      const response = await fetch("/api/push/subscribe", { cache: "no-store" });
      const nextInfo = (await response.json()) as PushInfo;
      setInfo(nextInfo);

      if (!nextInfo.configured || !nextInfo.publicKey) {
        setNotice({ type: "error", message: "Las llaves VAPID no estan configuradas." });
        setEnabled(false);
        return;
      }

      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();
      setEnabled(Boolean(subscription));
      setNotice({
        type: subscription ? "ok" : "muted",
        message: subscription ? "Notificaciones activadas." : "Notificaciones disponibles para este dispositivo."
      });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo comprobar las notificaciones." });
    } finally {
      setLoading(false);
    }
  }

  async function activate() {
    setSaving(true);
    setNotice({ type: "muted", message: "Activando notificaciones..." });

    try {
      if (!isPushSupported()) throw new Error("Este navegador no soporta notificaciones push.");
      const nextInfo = info || ((await (await fetch("/api/push/subscribe", { cache: "no-store" })).json()) as PushInfo);
      if (!nextInfo.configured || !nextInfo.publicKey) throw new Error("Las llaves VAPID no estan configuradas.");

      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notificaciones bloqueadas.");

      const registration = await getServiceWorkerRegistration();
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(nextInfo.publicKey)
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          deviceName: getDeviceName()
        })
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo activar las notificaciones.");

      setEnabled(true);
      setNotice({ type: "ok", message: result.message || "Notificaciones activadas." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo activar las notificaciones." });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    setSaving(true);
    setNotice({ type: "muted", message: "Desactivando notificaciones..." });

    try {
      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
      }

      setEnabled(false);
      setNotice({ type: "muted", message: "Notificaciones desactivadas en este dispositivo." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo desactivar las notificaciones." });
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setNotice({ type: "muted", message: "Enviando notificacion de prueba..." });

    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const result = (await response.json()) as { error?: string; message?: string; sent?: number; total?: number };
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la prueba.");

      setNotice({
        type: result.sent ? "ok" : "error",
        message: result.message || `Prueba enviada a ${result.sent ?? 0} de ${result.total ?? 0} dispositivos.`
      });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo enviar la prueba." });
    } finally {
      setTesting(false);
    }
  }

  const blocked = notice.message.includes("bloqueadas");
  const disabled = loading || saving || blocked || !info?.configured;

  return (
    <section className="grid gap-4 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cocoa">Notificaciones</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-ink">Alertas del panel</h3>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" className="rounded-lg" disabled={enabled || disabled} onClick={activate}>
          <Bell size={18} />
          {saving && !enabled ? "Activando..." : "Activar notificaciones en este dispositivo"}
        </Button>
        {enabled && (
          <Button type="button" variant="outline" className="rounded-lg" disabled={saving} onClick={deactivate}>
            <BellOff size={18} />
            Desactivar
          </Button>
        )}
        {enabled && (
          <Button type="button" variant="outline" className="rounded-lg" disabled={saving || testing} onClick={sendTest}>
            <Bell size={18} />
            {testing ? "Enviando..." : "Enviar prueba"}
          </Button>
        )}
      </div>

      <p className={noticeClassName(notice.type)}>{notice.message}</p>
    </section>
  );
}

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    window.isSecureContext
  );
}

async function getServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update().catch(() => undefined);
    return registration;
  }
  return navigator.serviceWorker.register("/sw.js");
}

function getDeviceName() {
  const platform = navigator.platform || "Dispositivo";
  const touch = navigator.maxTouchPoints > 1 ? " tactil" : "";
  return `${platform}${touch}`;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function noticeClassName(type: Notice["type"]) {
  if (type === "ok") return "rounded-lg bg-white p-3 text-sm font-semibold text-cocoa";
  if (type === "error") return "rounded-lg bg-white p-3 text-sm font-semibold text-red-600";
  return "rounded-lg bg-white p-3 text-sm font-semibold text-muted";
}
