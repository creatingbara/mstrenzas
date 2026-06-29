import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beforeBookingItems, siteSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

const catalogCategories = [
  {
    name: "Recogidos / Diadema",
    description: "Estilos recogidos y detalles tipo diadema para un look femenino, cómodo y elegante.",
    imageUrl: "/services/diseno-personalizado.jpg",
    href: "/agendar/servicio/diseno-personalizado"
  },
  {
    name: "Trenzas pegadas y coletas",
    description: "Diseños definidos al cuero cabelludo combinados con coletas, movimiento y acabado pulido.",
    imageUrl: "/services/trenzas-pegadas.jpg",
    href: "/catalogo/trenzas-pegadas"
  },
  {
    name: "Trenzas sueltas",
    description: "Trenzas versátiles para lucir largo, volumen y un estilo protector con mucha presencia.",
    imageUrl: "/services/trenzas-sueltas.jpg",
    href: "/catalogo/trenzas-sueltas"
  },
  {
    name: "Trenzas Fulani",
    description: "Estilos con lineas frontales, detalles creativos y una terminacion llamativa.",
    imageUrl: "/gallery/gallery-06.jpg",
    href: "/agendar/servicio/diseno-personalizado"
  },
  {
    name: "Box Braids",
    description: "Clásicas, duraderas y fáciles de llevar para un cambio de look práctico y elegante.",
    imageUrl: "/services/box-braids.jpg",
    href: "/catalogo/box-braids"
  },
  {
    name: "Knotless Braids",
    description: "Trenzas ligeras con acabado natural y menor tensión en la raíz.",
    imageUrl: "/services/knotless-braids.jpg",
    href: "/catalogo/knotless-braids"
  },
  {
    name: "Diseños personalizados",
    description: "Ideas creadas según tu referencia, ocasion, personalidad y tipo de cabello.",
    imageUrl: "/gallery/gallery-07.jpg",
    href: "/catalogo/diseno-personalizado"
  },
  {
    name: "Postura de extensiones",
    description: "Aplicación profesional para lograr largo, volumen y un acabado natural.",
    imageUrl: "/services/postura-de-extensiones.jpg",
    href: "/catalogo/postura-de-extensiones"
  }
];

const infoCards = [
  {
    title: "Tu tipo de cabello",
    text: "Cada textura se trabaja con cuidado. Algunos cabellos pueden necesitar desenredado extra, preparación previa o más tiempo para lograr un acabado cómodo y prolijo."
  },
  {
    title: "Color y tipo de extensiones",
    text: "Los tonos, largos y tipos de extensiones deben confirmarse antes de la cita para evitar cambios de último momento y asegurar disponibilidad."
  },
  {
    title: "Depósito",
    text: "Algunas citas pueden requerir depósito para separar el espacio, especialmente estilos largos, personalizados o servicios con extensiones."
  }
];

const policyItems = [
  "La puntualidad ayuda a respetar tu tiempo y el de otras clientas.",
  "Los cambios de fecha deben solicitarse con anticipación.",
  "Las cancelaciones de último momento pueden afectar futuras reservas.",
  "Consulta antes de asistir si puedes llevar acompañantes."
];

export default function BraidCatalogPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Agendar Cita</p>
            <h1 className="mt-3 font-display text-5xl font-bold">Catálogo de trenzas</h1>
            <p className="mt-4 leading-7 text-muted">
              Aquí encontrarás nuestros estilos organizados por categoría. Elige el estilo que más te guste para ver detalles y solicitar tu cita.
            </p>
            <p className="mt-4 rounded-lg bg-cream p-4 text-sm font-semibold text-cocoa">
              El precio final puede variar según largo, volumen, diseño, tipo de cabello y extensiones requeridas.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {catalogCategories.map((category) => (
              <article key={category.name} className="overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-soft">
                <div className="relative aspect-[4/3]">
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 100vw" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa">Catálogo de</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">{category.name}</h2>
                  <p className="mt-2 min-h-20 text-sm leading-6 text-muted">{category.description}</p>
                  <Link href={category.href} className="mt-5 block">
                    <Button variant="outline" className="w-full">
                      Catálogo y agendar
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-cream/65">
        <div className="container-shell grid gap-5 lg:grid-cols-3">
          {infoCards.map((card) => (
            <div key={card.title} className="rounded-lg bg-white p-6 shadow-soft">
              <h2 className="font-display text-3xl font-bold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Referencias</p>
            <h2 className="mt-3 font-display text-4xl font-bold">Inspiración de diseños</h2>
            <p className="mt-4 leading-7 text-muted">
              Si tienes una idea guardada, una foto de referencia o un estilo visto en redes, envíalo antes de reservar. Así podemos orientarte sobre tiempo, materiales y disponibilidad.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={whatsappLink("Hola M&S Trenzas, quiero enviar una referencia para cotizar un diseño.")} target="_blank">
                <Button>
                  <MessageCircle size={18} />
                  Enviar por WhatsApp
                </Button>
              </Link>
              <Link href={siteSettings.instagram} target="_blank">
                <Button variant="outline">
                  <Instagram size={18} />
                  Ver Instagram
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {beforeBookingItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-cocoa/10 bg-white p-4 shadow-soft">
                <CheckCircle2 className="mt-0.5 shrink-0 text-cocoa" size={20} />
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Preparación</p>
            <h2 className="mt-3 font-display text-4xl font-bold">Cómo prepararte antes de la cita</h2>
            <p className="mt-4 leading-7 text-white/72">
              Llega con tiempo, cabello limpio y referencias claras. Si tienes dudas sobre extensiones, largo o color, confirma antes de asistir para que el servicio fluya mejor.
            </p>
          </div>
          <div className="rounded-lg border border-cocoa/10 bg-cream p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Política</p>
            <h2 className="mt-3 font-display text-4xl font-bold">Reservas organizadas y claras</h2>
            <div className="mt-5 grid gap-3">
              {policyItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg bg-white p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-cocoa" size={20} />
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
