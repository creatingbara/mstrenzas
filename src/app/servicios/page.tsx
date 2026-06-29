import { ServicesGrid } from "@/components/public/ServicesGrid";

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Servicios</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Servicios de M&S Trenzas</h1>
          <p className="mt-4 leading-7 text-muted">
            Mira los estilos disponibles, duración aproximada y detalles antes de solicitar tu cita.
          </p>
        </div>
        <ServicesGrid />
      </div>
    </section>
  );
}
