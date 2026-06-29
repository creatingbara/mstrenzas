"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [message, setMessage] = useState<string | null>(null);

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
          <Input type="password" placeholder="Contrasena" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit">Iniciar sesion</Button>
        </form>
        {message && <p className="mt-4 rounded-lg bg-cream p-3 text-sm text-cocoa">{message}</p>}
      </Card>
    </div>
  );
}
