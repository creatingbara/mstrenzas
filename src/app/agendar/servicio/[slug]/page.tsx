import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { BookingServiceInfo } from "@/components/booking/BookingServiceInfo";
import { Button } from "@/components/ui/button";
import { getServiceBookingData, getServiceById } from "@/lib/local-db";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ServiceBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceById(slug);

  if (!service || service.active === false) notFound();

  const bookingData = await getServiceBookingData(service.id);
  const requiresWhatsApp = service.bookingEnabled === false || !bookingData.staffMembers.length;

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <BookingServiceInfo service={service} />
        {requiresWhatsApp ? (
          <div className="rounded-lg border border-cocoa/10 bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold">Confirmación por WhatsApp</h2>
            <p className="mt-3 leading-7 text-muted">
              Este servicio requiere confirmación por WhatsApp antes de reservar. Escríbenos para revisar disponibilidad, precio y detalles.
            </p>
            <Link href={whatsappLink(service.whatsappMessage || `Hola M&S Trenzas, quiero consultar por el servicio: ${service.name}.`)} target="_blank" className="mt-6 inline-block">
              <Button>
                <MessageCircle size={18} />
                Cotizar por WhatsApp
              </Button>
            </Link>
          </div>
        ) : (
          <BookingScheduler
            service={service}
            bookingData={bookingData}
          />
        )}
      </div>
    </section>
  );
}
