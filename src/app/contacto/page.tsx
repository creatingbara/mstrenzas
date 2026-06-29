import { Suspense } from "react";
import { ContactSection } from "@/components/public/ContactSection";

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="section-pad container-shell">Cargando formulario...</div>}>
      <ContactSection />
    </Suspense>
  );
}
