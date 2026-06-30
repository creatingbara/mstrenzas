"use client";

import { useEffect } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import type { AdminSession } from "@/lib/auth/admin-session";

export function CriticalPasskeyGate({ session }: { session: AdminSession }) {
  useEffect(() => {
    if (session.role !== "super_admin") return;

    const originalFetch = window.fetch.bind(window);
    let verifying = false;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      if (verifying || response.status !== 428 || !isRetryableRequest(input, init)) return response;

      const clone = response.clone();
      const body = (await clone.json().catch(() => null)) as { passkeyRequired?: boolean } | null;
      if (!body?.passkeyRequired) return response;

      verifying = true;
      try {
        await confirmCriticalPasskey(originalFetch);
        return originalFetch(input, init);
      } catch {
        return response;
      } finally {
        verifying = false;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [session.role]);

  return null;
}

async function confirmCriticalPasskey(fetcher: typeof window.fetch) {
  if (!window.PublicKeyCredential) {
    throw new Error("Este navegador no soporta Face ID / Touch ID.");
  }

  const optionsResponse = await fetcher("/api/passkeys/critical/options", { method: "POST" });
  const optionsJSON = await optionsResponse.json();
  if (!optionsResponse.ok) throw new Error(optionsJSON.error || "No se pudo iniciar Face ID / Touch ID.");

  const response = await startAuthentication({ optionsJSON });
  const verifyResponse = await fetcher("/api/passkeys/critical/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response })
  });
  if (!verifyResponse.ok) throw new Error("No se pudo verificar tu identidad.");
}

function isRetryableRequest(input: RequestInfo | URL, init?: RequestInit) {
  const method = init?.method || (input instanceof Request ? input.method : "GET");
  return method.toUpperCase() !== "GET";
}
