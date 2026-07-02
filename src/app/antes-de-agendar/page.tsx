import type { Metadata } from "next";
import { AlertCircle, CalendarClock, CreditCard, RefreshCcw, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { beforeBookingItems } from "@/lib/data";
import { getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";

const policies = [
  {
    title: "Preparacion del cabello",
    icon: Scissors,
    text: "Llega con el cabello limpio, seco y desenredado para aprovechar mejor el tiempo de la cita."
  },
  {
    title: "Puntualidad",
    icon: CalendarClock,
    text: "La puntualidad ayuda a respetar cada agenda. Si llegas tarde, el servicio puede ajustarse o reprogramarse."
  },
  {
    title: "Deposito",
    icon: CreditCard,
    text: "Algunas citas pueden requerir deposito previo para reservar el espacio, especialmente estilos largos o personalizados."
  },
  {
    title: "Cancelaciones y cambios",
    icon: RefreshCcw,
    text: "Los cambios de fecha deben solicitarse con anticipacion para poder reorganizar disponibilidad."
  },
  {
    title: "Extensiones",
    icon: AlertCircle,
    text: "Confirma antes de la cita si las extensiones estan incluidas, si las llevaras o si deseas cotizarlas."
  }
];

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("antes-de-agendar");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined }
  };
}

export default async function BeforeBookingPage() {
  const sections = pageSectionsByKey(await getAppPageSections("antes-de-agendar", { activeOnly: true }));
  const intro = sections.intro;
  const recommendations = sections.recomendaciones;

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{intro?.content || "Antes de agendar"}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{intro?.title || "Informacion para una cita sin sorpresas"}</h1>
          <p className="mt-4 leading-7 text-muted">
            {intro?.subtitle || "Estas pautas nos ayudan a darte una experiencia organizada, clara y con el resultado que esperas."}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <Card key={policy.title}>
              <policy.icon className="text-cocoa" size={26} />
              <h2 className="mt-4 font-display text-2xl font-bold">{policy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{policy.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 rounded-lg bg-cream p-6">
          <h2 className="font-display text-3xl font-bold">{recommendations?.title || "Recomendaciones generales"}</h2>
          {recommendations?.subtitle && <p className="mt-2 text-sm leading-6 text-muted">{recommendations.subtitle}</p>}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {beforeBookingItems.map((item) => (
              <p key={item} className="rounded-lg bg-white p-4 text-sm leading-6 text-muted">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
