import { AlertCircle, CalendarClock, CreditCard, RefreshCcw, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { beforeBookingItems } from "@/lib/data";

const policies = [
  {
    title: "Preparación del cabello",
    icon: Scissors,
    text: "Llega con el cabello limpio, seco y desenredado para aprovechar mejor el tiempo de la cita."
  },
  {
    title: "Puntualidad",
    icon: CalendarClock,
    text: "La puntualidad ayuda a respetar cada agenda. Si llegas tarde, el servicio puede ajustarse o reprogramarse."
  },
  {
    title: "Depósito",
    icon: CreditCard,
    text: "Algunas citas pueden requerir depósito previo para reservar el espacio, especialmente estilos largos o personalizados."
  },
  {
    title: "Cancelaciones y cambios",
    icon: RefreshCcw,
    text: "Los cambios de fecha deben solicitarse con anticipación para poder reorganizar disponibilidad."
  },
  {
    title: "Extensiones",
    icon: AlertCircle,
    text: "Confirma antes de la cita si las extensiones están incluidas, si las llevarás o si deseas cotizarlas."
  }
];

export default function BeforeBookingPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Antes de agendar</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Información para una cita sin sorpresas</h1>
          <p className="mt-4 leading-7 text-muted">
            Estas pautas nos ayudan a darte una experiencia organizada, clara y con el resultado que esperas.
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
          <h2 className="font-display text-3xl font-bold">Recomendaciones generales</h2>
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
