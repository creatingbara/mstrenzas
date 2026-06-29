import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingSuccess({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <div className="rounded-lg border border-cocoa/10 bg-white p-6 text-center shadow-soft">
      <CheckCircle2 className="mx-auto text-cocoa" size={42} />
      <h2 className="mt-4 font-display text-3xl font-bold">Tu solicitud de cita fue enviada correctamente</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Te contactaremos por WhatsApp para confirmar los detalles.</p>
      <Link href={whatsappUrl} target="_blank" className="mt-6 inline-block">
        <Button>
          <MessageCircle size={18} />
          Confirmar por WhatsApp
        </Button>
      </Link>
    </div>
  );
}
