import { CheckCircle2 } from "lucide-react";
import { getAgendaPage } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function BookingInfoPage() {
  const page = await getAgendaPage("informacion-antes-de-agendar");

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{page.eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{page.title}</h1>
          <p className="mt-4 leading-7 text-muted">{page.subtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {page.sections.map((section) => (
            <div key={section.title} className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
              <h2 className="font-display text-2xl font-bold">{section.title}</h2>
              {section.text && <p className="mt-2 text-sm leading-6 text-muted">{section.text}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg bg-cream p-6">
          <h2 className="font-display text-3xl font-bold">Puntos importantes</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {page.items.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg bg-white p-4">
                <CheckCircle2 className="mt-0.5 shrink-0 text-cocoa" size={20} />
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
