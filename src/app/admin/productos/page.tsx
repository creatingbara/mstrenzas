import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getProducts } from "@/lib/local-db";

export const metadata = {
  title: "Productos | Panel M&S Trenzas"
};

export default async function AdminProductsPage() {
  await requireAdminPageAccess("/admin/productos", { adminOnly: true });
  const products = await getProducts();

  return <AdminProductsClient initialProducts={products} />;
}
