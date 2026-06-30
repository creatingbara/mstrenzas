"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ServiceImageUploader({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/service-images", { method: "POST", body: formData });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "No se pudo subir la imagen.");
      onChange(result.url);
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-cocoa/10 bg-cream">
        {value ? (
          <Image src={value} alt="Imagen del servicio" fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-muted">Sin imagen</div>
        )}
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="/services/imagen.jpg" />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload size={17} />
          {busy ? "Subiendo..." : value ? "Cambiar foto" : "Subir foto"}
        </Button>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
