import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

export function ProductCard({ product, whatsappPhone }: { product: Product; whatsappPhone: string }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] bg-cream">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-bold">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{product.description}</p>
        <p className="mt-4 text-sm font-bold text-cocoa">{formatPrice(product.price, !product.price)}</p>
        <Link href={whatsappLink(`Hola M&S Trenzas, quiero cotizar: ${product.name}`, whatsappPhone)} target="_blank" className="mt-5 block">
          <Button className="w-full">
            <MessageCircle size={18} />
            Cotizar por WhatsApp
          </Button>
        </Link>
      </div>
    </Card>
  );
}
