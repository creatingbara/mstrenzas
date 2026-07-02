import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactSection } from "@/components/public/ContactSection";
import { getSiteSettings } from "@/lib/local-db";
import { getAppFooterSettings, getAppPageSections, getAppSeoSettings, pageSectionsByKey } from "@/lib/super-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getAppSeoSettings("contacto");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined }
  };
}

export default async function ContactPage() {
  const [settings, pageSections, footer] = await Promise.all([
    getSiteSettings(),
    getAppPageSections("contacto", { activeOnly: true }),
    getAppFooterSettings()
  ]);
  const mergedSettings = {
    ...settings,
    whatsapp: footer.whatsapp || settings.whatsapp,
    instagram: footer.instagramUrl || settings.instagram,
    zone: footer.address || settings.zone,
    hours: footer.schedule || settings.hours
  };
  const sections = pageSectionsByKey(pageSections);

  return (
    <Suspense fallback={<div className="section-pad container-shell">Cargando formulario...</div>}>
      <ContactSection settings={mergedSettings} introSection={sections.intro} agendaSection={sections.agenda} />
    </Suspense>
  );
}
