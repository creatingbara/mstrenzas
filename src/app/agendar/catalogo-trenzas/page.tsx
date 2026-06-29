import { redirect } from "next/navigation";

// Unificado con el catálogo principal: esta ruta ahora redirige a /catalogo.
export default function BraidCatalogPage() {
  redirect("/catalogo");
}
