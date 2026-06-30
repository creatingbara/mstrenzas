import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { getGalleryItems } from "@/lib/local-db";

export async function GalleryGrid({ featured = false }: { featured?: boolean }) {
  const list = await getGalleryItems({ activeOnly: true, featuredOnly: featured });

  if (!list.length) {
    return <p className="rounded-lg bg-white p-6 text-sm font-semibold text-muted shadow-soft">Pronto agregaremos nuevos trabajos destacados.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((item) => (
        <figure key={item.id} className="group overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-soft">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title ?? item.category}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center text-sm font-semibold text-cocoa">
                Inspiracion disponible en Instagram
              </div>
            )}
            {item.featured && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-cocoa">
                Destacada
              </span>
            )}
          </div>
          <figcaption className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cocoa">{item.category}</p>
            {item.title && <p className="mt-1 text-lg font-semibold text-ink">{item.title}</p>}
            {item.instagramUrl && (
              <Link
                href={item.instagramUrl}
                target="_blank"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-cocoa/20 px-4 text-sm font-semibold text-cocoa transition hover:border-cocoa hover:bg-cream"
              >
                <Instagram size={16} />
                Ver en Instagram
              </Link>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
