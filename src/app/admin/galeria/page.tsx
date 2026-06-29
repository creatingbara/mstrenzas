import { GalleryManager } from "@/components/admin/GalleryManager";
import { requireAdminPageAccess } from "@/lib/admin-auth";

export const metadata = {
  title: "Galería | Panel M&S Trenzas"
};

export default async function AdminGalleryPage() {
  await requireAdminPageAccess("/admin/galeria", { adminOnly: true });

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Gestión de galería</h2>
        <p className="mt-2 text-sm text-muted">Sube fotos, asigna categorías y marca resultados destacados.</p>
      </div>
      <GalleryManager />
    </section>
  );
}
