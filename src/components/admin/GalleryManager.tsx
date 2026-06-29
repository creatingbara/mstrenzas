"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { galleryItems } from "@/lib/data";

export function GalleryManager() {
  const [items, setItems] = useState(galleryItems);

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-cocoa/10 bg-white p-5">
        <h2 className="font-display text-2xl font-bold">Subir imagen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input placeholder="Título opcional" />
          <Input placeholder="Categoría" />
          <Input type="file" accept="image/*" />
        </div>
        <p className="mt-3 text-sm text-muted">Conecta el almacenamiento configurado para guardar archivos reales desde este formulario.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-cocoa/10 bg-white">
            <div className="relative aspect-[4/3]">
              <Image src={item.imageUrl} alt={item.title ?? item.category} fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-4">
              <Input defaultValue={item.title ?? ""} placeholder="Título" />
              <Input className="mt-3" defaultValue={item.category} placeholder="Categoría" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" defaultChecked={item.featured} />
                  Destacada
                </label>
                <Button type="button" variant="ghost" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
