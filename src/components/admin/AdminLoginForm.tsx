"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Fingerprint, LockKeyhole } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function AdminLoginForm() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [checkingPasskey, setCheckingPasskey] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !window.PublicKeyCredential) {
      setPasskeyAvailable(false);
      setCheckingPasskey(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingPasskey(true);
      try {
        const response = await fetch("/api/passkeys/login/available", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername }),
          signal: controller.signal
        });
        const result = (await response.json()) as { available?: boolean };
        setPasskeyAvailable(Boolean(response.ok && result.available));
      } catch (error) {
        if (!controller.signal.aborted) setPasskeyAvailable(false);
      } finally {
        if (!controller.signal.aborted) setCheckingPasskey(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [username]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const requestedNextPath = searchParams.get("next");

    const localResponse = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (localResponse.ok) {
      const result = (await localResponse.json()) as { redirectTo?: string };
      const nextPath = requestedNextPath || result.redirectTo || "/admin/dashboard";
      window.location.href = nextPath;
      return;
    }

    const result = (await localResponse.json().catch(() => null)) as { error?: string } | null;
    setMessage(result?.error || "Usuario o contrasena incorrectos.");
  }

  async function loginWithPasskey() {
    setMessage(null);

    if (!username.trim()) {
      setMessage("Escribe tu usuario para entrar con Face ID / Touch ID.");
      return;
    }
    if (!window.PublicKeyCredential) {
      setMessage("Este navegador no soporta Face ID / Touch ID. Puedes seguir entrando con tu contrasena.");
      return;
    }

    setPasskeyBusy(true);
    try {
      const optionsResponse = await fetch("/api/passkeys/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const optionsJSON = await optionsResponse.json();
      if (!optionsResponse.ok) throw new Error(optionsJSON.error || "Puedes seguir entrando con tu contrasena.");

      const response = await startAuthentication({ optionsJSON });
      const verifyResponse = await fetch("/api/passkeys/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response })
      });
      const result = (await verifyResponse.json()) as { redirectTo?: string; error?: string };
      if (!verifyResponse.ok) throw new Error(result.error || "No se pudo verificar tu identidad.");

      window.location.href = result.redirectTo || "/admin/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo verificar tu identidad. Puedes seguir entrando con tu contrasena.");
    } finally {
      setPasskeyBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <div className="mb-6 grid size-12 place-items-center rounded-full bg-cream text-cocoa">
          <LockKeyhole size={22} />
        </div>
        <h1 className="font-display text-3xl font-bold">Acceso administrativo</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Entra con tu usuario y contrasena.</p>
        <form onSubmit={login} className="mt-6 grid gap-4">
          <Input placeholder="Usuario" value={username} onChange={(event) => setUsername(event.target.value)} required />
          <PasswordInput placeholder="Contrasena" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit">Iniciar sesion</Button>
        </form>
        {passkeyAvailable && (
          <Button type="button" variant="outline" className="mt-3 w-full" disabled={passkeyBusy || checkingPasskey} onClick={loginWithPasskey}>
            <Fingerprint size={17} />
            {passkeyBusy ? "Verificando..." : "Entrar con Face ID / Touch ID"}
          </Button>
        )}
        {message && <p className="mt-4 rounded-lg bg-cream p-3 text-sm text-cocoa">{message}</p>}
      </Card>
    </div>
  );
}
