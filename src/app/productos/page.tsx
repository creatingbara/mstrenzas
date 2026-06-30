import Link from "next/link";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { getProducts, getSiteSettings } from "@/lib/local-db";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Productos | M&S Trenzas",
  description: "Productos y extensiones disponibles por cotización para M&S Trenzas."
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts({ activeOnly: true }), getSiteSettings()]);

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Productos</p>
            <h1 className="mt-3 font-display text-5xl font-bold">Productos y extensiones</h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Explora productos disponibles por cotización, incluyendo extensiones y opciones de asesoría para elegir textura, largo y color.
            </p>
          </div>
          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <ShoppingBag className="text-gold" />
            <p className="mt-3 text-2xl font-semibold">Confirma disponibilidad antes de reservar o comprar.</p>
            <Link href={whatsappLink("Hola M&S Trenzas, quiero información sobre productos y extensiones.", settings.whatsapp)} target="_blank" className="mt-5 inline-block">
              <Button variant="secondary">
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} whatsappPhone={settings.whatsapp} />
          ))}
        </div>
      </div>
    </section>
  );
}
