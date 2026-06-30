import { Suspense } from "react";
import { ContactSection } from "@/components/public/ContactSection";
import { getSiteSettings } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <Suspense fallback={<div className="section-pad container-shell">Cargando formulario...</div>}>
      <ContactSection settings={settings} />
    </Suspense>
  );
}
