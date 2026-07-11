import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentData } from "@/lib/admin-appointments";
import { getGalleryItems, getProducts, getServices } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard | Panel M&S Trenzas"
};

export default async function AdminDashboardPage() {
  await requireAdminPageAccess("/admin/dashboard", { adminOnly: true });
  const [{ appointments, staffMembers }, services, galleryItems, products] = await Promise.all([
    getAdminAppointmentData(),
    getServices(),
    getGalleryItems({ activeOnly: true }),
    getProducts()
  ]);

  return (
    <div className="grid min-w-0 gap-5 lg:gap-6">
      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Panel administrativo</p>
        <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">Dashboard</h2>
        <p className="mt-2 text-sm text-muted">Vista general de servicios, solicitudes y contenido de M&S Trenzas.</p>
      </section>
      <DashboardOverview appointments={appointments} services={services} staffMembers={staffMembers} galleryItems={galleryItems} products={products} />
    </div>
  );
}
