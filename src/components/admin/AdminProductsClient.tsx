"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types/product";

type ProductResponse = { item?: Product; ok?: boolean; url?: string; error?: string; message?: string };

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [items, setItems] = useState(initialProducts);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");

  async function createProduct() {
    if (!newName.trim() || !newDescription.trim()) {
      setStatus({ type: "error", message: "Nombre y descripción son requeridos." });
      return;
    }
    setCreating(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          price: newPrice === "" ? null : Number(newPrice),
          stock: newStock === "" ? null : Number(newStock),
          imageUrl: newImageUrl || undefined
        })
      });
      const result = (await response.json()) as ProductResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo crear el producto.");

      setItems((current) => [...current, result.item as Product]);
      setNewName("");
      setNewPrice("");
      setNewStock("");
      setNewImageUrl("");
      setNewDescription("");
      setStatus({ type: "ok", message: result.message || "Producto creado." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo crear el producto." });
    } finally {
      setCreating(false);
    }
  }

  async function applyUpdate(id: string, patch: Record<string, unknown>) {
    setStatus(null);
    try {
      const response = await fetch("/api/admin/productos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch })
      });
      const result = (await response.json()) as ProductResponse;
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo actualizar el producto.");

      const savedItem = result.item;
      setItems((current) => current.map((item) => (item.id === savedItem.id ? savedItem : item)));
      setStatus({ type: "ok", message: result.message || "Producto actualizado." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo actualizar el producto." });
    }
  }

  async function removeProduct(id: string) {
    setStatus(null);
    try {
      const response = await fetch(`/api/admin/productos?id=${id}`, { method: "DELETE" });
      const result = (await response.json()) as ProductResponse;
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar el producto.");

      setItems((current) => current.filter((item) => item.id !== id));
      setStatus({ type: "ok", message: result.message || "Producto eliminado." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No se pudo eliminar el producto." });
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Productos y extensiones</h2>
        <p className="mt-2 text-sm text-muted">Crea y administra extensiones 100% Human Hair y productos relacionados.</p>
      </div>

      {status && (
        <p className={status.type === "ok" ? "text-sm font-semibold text-cocoa" : "text-sm font-semibold text-red-600"}>
          {status.message}
        </p>
      )}

      <div className="rounded-lg border border-cocoa/10 bg-white p-5">
        <h3 className="font-display text-2xl font-bold">Crear producto</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nombre" />
          <Input value={newPrice} onChange={(event) => setNewPrice(event.target.value)} placeholder="Precio opcional" type="number" />
          <Input value={newStock} onChange={(event) => setNewStock(event.target.value)} placeholder="Stock opcional" type="number" />
        </div>
        <Textarea
          className="mt-4"
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
          placeholder="Descripción"
        />
        <div className="mt-4">
          <ProductImageUploader value={newImageUrl} onChange={setNewImageUrl} />
        </div>
        <p className="mt-2 text-xs text-muted">Deja el precio vacio para mostrarlo como &quot;a cotizar&quot;.</p>
        <div className="mt-4">
          <Button type="button" onClick={createProduct} disabled={creating}>
            {creating ? "Guardando..." : "Guardar producto"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((product) => (
          <ProductEditor key={product.id} product={product} onSave={applyUpdate} onDelete={removeProduct} />
        ))}
      </div>
    </section>
  );
}

function ProductEditor({
  product,
  onSave,
  onDelete
}: {
  product: Product;
  onSave: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price?.toString() ?? "");
  const [stock, setStock] = useState(product.stock?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl);

  return (
    <div className="overflow-hidden rounded-lg border border-cocoa/10 bg-white">
      <div className="grid gap-3 p-4">
        <ProductImageUploader value={imageUrl} onChange={setImageUrl} />
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" />
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={price} onChange={(event) => setPrice(event.target.value)} type="number" placeholder="Precio" />
          <Input value={stock} onChange={(event) => setStock(event.target.value)} type="number" placeholder="Stock" />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(event) => onSave(product.id, { active: event.target.checked })}
          />
          Activo
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() =>
              onSave(product.id, {
                name: name.trim(),
                description: description.trim(),
                price: price === "" ? null : Number(price),
                stock: stock === "" ? null : Number(stock),
                imageUrl
              })
            }
          >
            Guardar cambios
          </Button>
          <Button type="button" variant="ghost" onClick={() => onDelete(product.id)}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductImageUploader({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/product-images", { method: "POST", body: formData });
      const result = (await response.json()) as ProductResponse;
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
          <Image src={value} alt="Imagen del producto" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-muted">Sin imagen</div>
        )}
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL de imagen del producto" />
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
