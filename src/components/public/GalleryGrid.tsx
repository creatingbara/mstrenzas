import Image from "next/image";
import { galleryItems } from "@/lib/data";

export function GalleryGrid({ featured = false }: { featured?: boolean }) {
  const list = featured ? galleryItems.filter((item) => item.featured) : galleryItems;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((item) => (
        <figure key={item.id} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-cream shadow-soft">
          <Image src={item.imageUrl} alt={item.title ?? item.category} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{item.category}</p>
            {item.title && <p className="mt-1 text-lg font-semibold">{item.title}</p>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
