import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmationPage() {
  return (
    <section className="section-pad">
      <div className="container-shell max-w-2xl text-center">
        <div className="rounded-lg border border-cocoa/10 bg-white p-8 shadow-soft">
          <CheckCircle2 className="mx-auto text-cocoa" size={48} />
          <h1 className="mt-5 font-display text-4xl font-bold">Solicitud recibida</h1>
          <p className="mt-3 leading-7 text-muted">
            Tu solicitud de cita fue enviada correctamente. Te contactaremos por WhatsApp para confirmar los detalles.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
