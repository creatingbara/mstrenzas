"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, EyeOff, ImagePlus, Instagram, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/data";
import type { GalleryItem } from "@/types/gallery";

type Status = { type: "ok" | "error"; message: string } | null;
type GalleryResponse = { item?: GalleryItem; url?: string; imageUrl?: string; action?: string; error?: string; message?: string };

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSizeMb = 20;
const maxFileSize = maxFileSizeMb * 1024 * 1024;

const emptyDraft: GalleryItem = {
  id: "",
  title: "",
  category: categories[0] ?? "Instagram",
  imageUrl: "",
  instagramUrl: "",
  featured: false,
  active: true,
  sortOrder: 0
};

export function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<GalleryItem>({ ...emptyDraft, sortOrder: initialItems.length });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importingInstagram, setImportingInstagram] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const activeCount = useMemo(() => items.filter((item) => item.active !== false).length, [items]);

  function selectFile(nextFile: File | null) {
    if (!nextFile) {
      setFile(null);
      return;
    }
    const error = validateFile(nextFile);
    if (error) {
      setStatus({ type: "error", message: error });
      setFile(null);
      return;
    }
    setFile(nextFile);
    setStatus(null);
  }

  async function createItem() {
    setSaving(true);
    setStatus(null);

    try {
      const normalizedDraft = normalizeGalleryItem(draft);
      const imageUrl = file ? await uploadImage(file) : normalizedDraft.imageUrl?.trim();
      const item = await saveGalleryItem({
        ...normalizedDraft,
        imageUrl,
        sortOrder: draft.sortOrder ?? items.length
      });

      setItems((current) => [...current, item].sort(sortGalleryItems));
      setDraft({ ...emptyDraft, sortOrder: items.length + 1 });
      setFile(null);
      setStatus({ type: "ok", message: "Publicacion guardada correctamente." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar la publicacion." });
    } finally {
      setSaving(false);
    }
  }

  function replaceItem(item: GalleryItem) {
    setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? item : currentItem)).sort(sortGalleryItems));
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((currentItem) => currentItem.id !== itemId));
  }

  async function importInstagramForDraft(value: string) {
    const instagramUrl = value.trim();
    if (!isInstagramUrl(instagramUrl)) return false;

    setDraft((current) => ({ ...current, instagramUrl, imageUrl: "" }));
    setFile(null);
    setImportingInstagram(true);
    setStatus({ type: "ok", message: "Buscando imagen de Instagram..." });

    try {
      const imageUrl = await importInstagramImage(instagramUrl);
      setDraft((current) => (current.instagramUrl?.trim() === instagramUrl ? { ...current, imageUrl } : current));
      setStatus({ type: "ok", message: "Imagen importada desde Instagram." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo importar la imagen de Instagram." });
    } finally {
      setImportingInstagram(false);
    }

    return true;
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-cocoa/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold">Nueva publicacion</h3>
            <p className="mt-1 text-sm text-muted">{activeCount} publicaciones activas en la galeria.</p>
          </div>
          <Button type="button" onClick={createItem} disabled={saving || importingInstagram}>
            <Save size={18} />
            {saving ? "Guardando..." : importingInstagram ? "Importando..." : "Guardar"}
          </Button>
        </div>

        {status && <p className={status.type === "ok" ? "mt-4 text-sm font-semibold text-cocoa" : "mt-4 text-sm font-semibold text-red-600"}>{status.message}</p>}

        <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
          <ImagePicker preview={preview || getImagePreviewUrl(draft.imageUrl) || null} instagramUrl={draft.instagramUrl || null} onFile={selectFile} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={draft.title ?? ""} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo opcional" />
            <CategorySelect value={draft.category} onChange={(category) => setDraft((current) => ({ ...current, category }))} />
            <Input
              value={draft.instagramUrl ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, instagramUrl: event.target.value }))}
              onBlur={(event) => {
                if (!draft.imageUrl) void importInstagramForDraft(event.currentTarget.value);
              }}
              onPaste={(event) => {
                const value = event.clipboardData.getData("text");
                if (!isInstagramUrl(value)) return;
                event.preventDefault();
                void importInstagramForDraft(value);
              }}
              placeholder="URL de Instagram"
            />
            <Input
              value={draft.imageUrl ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                if (isInstagramUrl(value)) {
                  void importInstagramForDraft(value);
                  return;
                }
                setDraft((current) => ({ ...current, imageUrl: value }));
              }}
              placeholder="URL de imagen opcional"
            />
            <Input
              type="number"
              value={draft.sortOrder ?? 0}
              onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              placeholder="Orden"
            />
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <Check label="Destacada" checked={Boolean(draft.featured)} onChange={(featured) => setDraft((current) => ({ ...current, featured }))} />
              <Check label="Activa" checked={draft.active !== false} onChange={(active) => setDraft((current) => ({ ...current, active }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <GalleryEditor key={item.id} item={item} onSaved={replaceItem} onDeleted={removeItem} onStatus={setStatus} />
        ))}
      </div>
    </div>
  );
}

function GalleryEditor({
  item,
  onSaved,
  onDeleted,
  onStatus
}: {
  item: GalleryItem;
  onSaved: (item: GalleryItem) => void;
  onDeleted: (itemId: string) => void;
  onStatus: (status: Status) => void;
}) {
  const [form, setForm] = useState(item);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importingInstagram, setImportingInstagram] = useState(false);

  useEffect(() => {
    setForm(item);
  }, [item]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function selectFile(nextFile: File | null) {
    if (!nextFile) {
      setFile(null);
      return;
    }
    const error = validateFile(nextFile);
    if (error) {
      onStatus({ type: "error", message: error });
      setFile(null);
      return;
    }
    setFile(nextFile);
    onStatus(null);
  }

  async function save() {
    setSaving(true);
    onStatus(null);

    try {
      const normalizedForm = normalizeGalleryItem(form);
      const imageUrl = file ? await uploadImage(file) : normalizedForm.imageUrl?.trim();
      const savedItem = await saveGalleryItem({ ...normalizedForm, imageUrl });
      onSaved(savedItem);
      setFile(null);
      onStatus({ type: "ok", message: "Publicacion actualizada correctamente." });
    } catch (error) {
      onStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo actualizar la publicacion." });
    } finally {
      setSaving(false);
    }
  }

  async function hide() {
    setSaving(true);
    onStatus(null);

    try {
      const response = await fetch(`/api/admin/gallery?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const result = (await response.json()) as GalleryResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo ocultar la publicacion.");
      onSaved(result.item);
      onStatus({ type: "ok", message: result.message || "Publicacion ocultada." });
    } catch (error) {
      onStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo ocultar la publicacion." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    const confirmed = window.confirm("Eliminar esta publicacion definitivamente? Esta accion no se puede deshacer.");
    if (!confirmed) return;

    setSaving(true);
    onStatus(null);

    try {
      const response = await fetch(`/api/admin/gallery?id=${encodeURIComponent(item.id)}&action=delete`, { method: "DELETE" });
      const result = (await response.json()) as GalleryResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo eliminar la publicacion.");
      onDeleted(item.id);
      onStatus({ type: "ok", message: result.message || "Publicacion eliminada." });
    } catch (error) {
      onStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo eliminar la publicacion." });
    } finally {
      setSaving(false);
    }
  }

  async function removeImage() {
    setSaving(true);
    onStatus(null);

    try {
      const normalizedForm = normalizeGalleryItem({ ...form, imageUrl: "" });
      const savedItem = await saveGalleryItem({ ...normalizedForm, imageUrl: "" });
      setFile(null);
      setPreview(null);
      setForm(savedItem);
      onSaved(savedItem);
      onStatus({ type: "ok", message: "Foto quitada correctamente." });
    } catch (error) {
      onStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo quitar la foto." });
    } finally {
      setSaving(false);
    }
  }

  async function importInstagramForForm(value: string) {
    const instagramUrl = value.trim();
    if (!isInstagramUrl(instagramUrl)) return false;

    setForm((current) => ({ ...current, instagramUrl, imageUrl: "" }));
    setFile(null);
    setImportingInstagram(true);
    onStatus({ type: "ok", message: "Buscando imagen de Instagram..." });

    try {
      const imageUrl = await importInstagramImage(instagramUrl);
      setForm((current) => (current.instagramUrl?.trim() === instagramUrl ? { ...current, imageUrl } : current));
      onStatus({ type: "ok", message: "Imagen importada desde Instagram." });
    } catch (error) {
      onStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo importar la imagen de Instagram." });
    } finally {
      setImportingInstagram(false);
    }

    return true;
  }

  const imagePreview = preview || getImagePreviewUrl(form.imageUrl) || null;

  return (
    <article className="overflow-hidden rounded-lg border border-cocoa/10 bg-white">
      <ImagePreview src={imagePreview} title={form.title || form.category} inactive={form.active === false} />
      <div className="grid gap-3 p-4">
        <Input value={form.title ?? ""} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo" />
        <CategorySelect value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} />
        <Input
          value={form.instagramUrl ?? ""}
          onChange={(event) => setForm((current) => ({ ...current, instagramUrl: event.target.value }))}
          onBlur={(event) => {
            if (!form.imageUrl) void importInstagramForForm(event.currentTarget.value);
          }}
          onPaste={(event) => {
            const value = event.clipboardData.getData("text");
            if (!isInstagramUrl(value)) return;
            event.preventDefault();
            void importInstagramForForm(value);
          }}
          placeholder="URL de Instagram"
        />
        <Input
          value={form.imageUrl ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            if (isInstagramUrl(value)) {
              void importInstagramForForm(value);
              return;
            }
            setForm((current) => ({ ...current, imageUrl: value }));
          }}
          placeholder="URL de imagen"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
          <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-cocoa/25 bg-white px-4 text-sm font-semibold text-ink transition hover:border-cocoa hover:bg-cream">
            <ImagePlus size={17} />
            Cambiar foto
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />
          </label>
          <Input
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
            aria-label="Orden"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Check label="Destacada" checked={Boolean(form.featured)} onChange={(featured) => setForm((current) => ({ ...current, featured }))} />
          <Check label="Activa" checked={form.active !== false} onChange={(active) => setForm((current) => ({ ...current, active }))} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={save} disabled={saving || importingInstagram}>
            <Save size={17} />
            {saving ? "Guardando..." : importingInstagram ? "Importando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" onClick={removeImage} disabled={saving || importingInstagram || !form.imageUrl}>
            Quitar foto
          </Button>
          <Button type="button" variant="ghost" onClick={hide} disabled={saving || importingInstagram}>
            <EyeOff size={17} />
            Ocultar
          </Button>
          <Button type="button" variant="ghost" onClick={deleteItem} disabled={saving || importingInstagram} className="text-red-700 hover:bg-red-50">
            <Trash2 size={17} />
            Eliminar
          </Button>
          {form.instagramUrl && (
            <a className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-cocoa hover:bg-cream" href={form.instagramUrl} target="_blank">
              <ExternalLink size={17} />
              Instagram
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ImagePicker({
  preview,
  instagramUrl,
  onFile
}: {
  preview: string | null;
  instagramUrl: string | null;
  onFile: (file: File | null) => void;
}) {
  return (
    <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-cocoa/30 bg-cream p-4 text-center text-sm font-semibold text-cocoa transition hover:border-cocoa">
      {preview ? (
        <img src={preview} alt="Preview" className="h-full max-h-56 w-full rounded-lg object-cover" />
      ) : instagramUrl ? (
        <span className="grid gap-2 text-center">
          <Instagram className="mx-auto" size={34} />
          <span>Publicacion de Instagram vinculada</span>
          <span className="text-xs text-muted">Intentare importar la miniatura publica de Instagram.</span>
        </span>
      ) : (
        <ImagePlus size={34} />
      )}
      <span>Subir jpg, png o webp hasta {maxFileSizeMb}MB</span>
      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
    </label>
  );
}

function ImagePreview({ src, title, inactive }: { src: string | null; title: string; inactive: boolean }) {
  return (
    <div className="relative aspect-[4/3] bg-cream">
      {src ? (
        <img src={src} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center p-4 text-center text-sm font-semibold text-cocoa">Sin foto</div>
      )}
      {inactive && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-cocoa">Oculta</span>}
    </div>
  );
}

function CategorySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      className="min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
      {!categories.includes(value) && <option value={value}>{value}</option>}
    </select>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

async function saveGalleryItem(item: GalleryItem) {
  const response = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  const result = (await response.json()) as GalleryResponse;
  if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar la publicacion.");
  return result.item;
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/admin/gallery-images", {
    method: "POST",
    body: formData
  });
  const result = (await response.json()) as GalleryResponse;
  if (!response.ok || !result.url) throw new Error(result.error || "No se pudo subir la imagen.");
  return result.url;
}

async function importInstagramImage(instagramUrl: string) {
  const response = await fetch("/api/admin/instagram-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instagramUrl })
  });
  const result = (await response.json()) as GalleryResponse;
  if (!response.ok || !result.imageUrl) throw new Error(result.error || "No se pudo importar la imagen de Instagram.");
  return result.imageUrl;
}

function validateFile(file: File) {
  if (!allowedTypes.includes(file.type)) return "Solo se permiten imagenes jpg, png o webp.";
  if (file.size > maxFileSize) return `La imagen no puede superar ${maxFileSizeMb}MB.`;
  return null;
}

function sortGalleryItems(a: GalleryItem, b: GalleryItem) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.category.localeCompare(b.category);
}

function normalizeGalleryItem(item: GalleryItem): GalleryItem {
  const imageUrl = item.imageUrl?.trim() || "";
  const instagramUrl = item.instagramUrl?.trim() || "";

  if (isInstagramUrl(imageUrl)) {
    return {
      ...item,
      instagramUrl: instagramUrl || imageUrl,
      imageUrl: ""
    };
  }

  return {
    ...item,
    imageUrl,
    instagramUrl
  };
}

function getImagePreviewUrl(value?: string | null) {
  const url = value?.trim();
  if (!url || isInstagramUrl(url)) return null;
  return url;
}

function isInstagramUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
