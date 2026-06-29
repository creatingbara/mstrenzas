import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { siteSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  return (
    <Link
      href={whatsappLink(siteSettings.whatsappMessage, siteSettings.whatsapp)}
      target="_blank"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105"
      aria-label="Escribir por WhatsApp"
    >
      <MessageCircle size={26} />
    </Link>
  );
}
