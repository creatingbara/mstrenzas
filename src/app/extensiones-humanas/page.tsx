import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { getProducts, getSiteSettings } from "@/lib/local-db";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HumanHairPage() {
  const [products, settings] = await Promise.all([getProducts({ activeOnly: true }), getSiteSettings()]);

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Extensiones</p>
            <h1 className="mt-3 font-display text-5xl font-bold">Extensiones 100% Human Hair</h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Trabajamos extensiones humanas de alta calidad para cambios de look, volumen, largo y estilos personalizados con acabado natural.
            </p>
          </div>
          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <Sparkles className="text-gold" />
            <p className="mt-3 text-2xl font-semibold">Cotiza según textura, largo, color y disponibilidad.</p>
            <Link href={whatsappLink("Hola M&S Trenzas, quiero cotizar extensiones 100% Human Hair.", settings.whatsapp)} target="_blank" className="mt-5 inline-block">
              <Button variant="secondary">
                <MessageCircle size={18} />
                Cotizar por WhatsApp
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
