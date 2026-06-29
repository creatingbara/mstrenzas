import { CheckCircle2 } from "lucide-react";
import { beforeBookingItems } from "@/lib/data";

export function BeforeBookingSection() {
  return (
    <section className="section-pad bg-cream/65">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Información importante</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Antes de agendar tu cita</h2>
          <p className="mt-4 text-muted">
            Para brindarte un mejor servicio, toma en cuenta estas recomendaciones antes de reservar.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {beforeBookingItems.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg bg-white p-4 shadow-soft">
              <CheckCircle2 className="mt-0.5 shrink-0 text-cocoa" size={20} />
              <p className="text-sm leading-6 text-muted">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
