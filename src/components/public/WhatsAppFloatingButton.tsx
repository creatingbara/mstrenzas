import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/settings";

export function WhatsAppFloatingButton({ settings }: { settings: SiteSettings }) {
  return (
    <Link
      href={whatsappLink(settings.whatsappMessage, settings.whatsapp)}
      target="_blank"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105"
      aria-label="Escribir por WhatsApp"
    >
      <MessageCircle size={26} />
    </Link>
  );
}
