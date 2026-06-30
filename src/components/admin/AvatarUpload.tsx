"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export function AvatarUpload({
  currentUrl,
  label,
  disabled,
  uploading,
  onUpload,
  onDelete,
  onSelectedFile,
  initials,
  uploadLabel
}: {
  currentUrl?: string | null;
  label: string;
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  onSelectedFile?: (file: File | null) => void;
  initials?: string;
  uploadLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const displayUrl = previewUrl || currentUrl;
  const actionLabel = uploading ? "Guardando..." : uploadLabel || (currentUrl ? "Guardar cambio" : "Guardar foto");

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function selectFile(file: File | null) {
    setMessage(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Solo se permiten imágenes jpg, png o webp.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage(`La imagen no puede superar ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    onSelectedFile?.(file);
  }

  async function uploadSelected() {
    if (!selectedFile) {
      inputRef.current?.click();
      return;
    }

    await onUpload(selectedFile);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onSelectedFile?.(null);
  }

  async function deleteCurrent() {
    if (!onDelete) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onSelectedFile?.(null);
    await onDelete();
  }

  return (
    <div className="grid gap-3 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {displayUrl ? (
          <img src={displayUrl} alt={label} className="size-24 rounded-full object-cover shadow-soft" />
        ) : (
          <div className="grid size-24 place-items-center rounded-full bg-ink text-xl font-black text-white shadow-soft">
            {initials || <ImagePlus size={28} />}
          </div>
        )}
        <div className="grid flex-1 gap-2">
          <div>
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-muted">JPG, PNG o WEBP. Máximo {MAX_FILE_SIZE_MB}MB.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <ImagePlus size={16} />
              {currentUrl ? "Cambiar foto" : "Elegir foto"}
            </Button>
            {selectedFile && (
              <Button type="button" disabled={disabled || uploading} onClick={uploadSelected}>
                <Upload size={16} />
                {actionLabel}
              </Button>
            )}
            {currentUrl && onDelete && (
              <Button type="button" variant="ghost" disabled={disabled || uploading} onClick={deleteCurrent}>
                <Trash2 size={16} />
                Eliminar foto
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
      />
      {selectedFile && <p className="text-sm font-semibold text-cocoa">Foto lista para guardar: {selectedFile.name}</p>}
      {message && <p className="rounded-lg bg-white p-3 text-sm font-semibold text-cocoa">{message}</p>}
    </div>
  );
}
