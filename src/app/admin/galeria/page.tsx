import { GalleryManager } from "@/components/admin/GalleryManager";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getGalleryItems } from "@/lib/local-db";

export const metadata = {
  title: "Galeria | Panel M&S Trenzas"
};

export default async function AdminGalleryPage() {
  await requireAdminPageAccess("/admin/galeria", { adminOnly: true });
  const items = await getGalleryItems();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Gestion de galeria</h2>
        <p className="mt-2 text-sm text-muted">Sube fotos, asigna categorias y conecta cada trabajo con su publicacion de Instagram.</p>
      </div>
      <GalleryManager initialItems={items} />
    </section>
  );
}
