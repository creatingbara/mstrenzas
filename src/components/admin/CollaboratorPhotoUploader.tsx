"use client";

import { useEffect, useState } from "react";
import { AvatarUpload } from "@/components/admin/AvatarUpload";

export function CollaboratorPhotoUploader({
  staffId,
  fullName,
  currentUrl,
  onChange,
  onPendingFile
}: {
  staffId?: string;
  fullName: string;
  currentUrl?: string | null;
  onChange: (avatarUrl: string | null) => void;
  onPendingFile?: (file: File | null) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const disabled = !staffId;
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setAvatarUrl(currentUrl || null);
  }, [currentUrl]);

  async function upload(file: File) {
    if (!staffId) return;
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/staff/${staffId}/avatar`, {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { avatarUrl?: string | null; error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo subir la foto.");

      setAvatarUrl(result.avatarUrl || null);
      onChange(result.avatarUrl || null);
      setMessage(result.message || "Foto actualizada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  async function remove() {
    if (!staffId) return;
    if (!window.confirm("Eliminar la foto de este colaborador?")) return;
    setUploading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/staff/${staffId}/avatar`, {
        method: "DELETE"
      });
      const result = (await response.json()) as { avatarUrl?: string | null; error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar la foto.");

      setAvatarUrl(null);
      onChange(null);
      setMessage(result.message || "Foto eliminada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <AvatarUpload
        currentUrl={avatarUrl}
        label={`Foto de ${fullName || "colaborador"}`}
        disabled={disabled}
        uploading={uploading}
        onUpload={upload}
        onDelete={avatarUrl ? remove : undefined}
        onSelectedFile={onPendingFile}
        initials={initials}
        uploadLabel={disabled ? "Se guardara al guardar" : undefined}
      />
      {disabled && <p className="text-sm text-muted">Elige una foto para previsualizarla. Se subira cuando guardes el colaborador.</p>}
      {message && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{message}</p>}
    </div>
  );
}
