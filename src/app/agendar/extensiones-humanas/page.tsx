import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAgendaPage } from "@/lib/local-db";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function resolveHref(value?: string | null) {
  if (!value) return null;
  if (value.startsWith("whatsapp:")) return whatsappLink(value.replace("whatsapp:", ""));
  return value;
}

export default async function BookHumanHairPage() {
  const page = await getAgendaPage("extensiones-humanas");
  const href = resolveHref(page.buttonHref);

  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">{page.eyebrow}</p>
            <h1 className="mt-3 font-display text-5xl font-bold">{page.title}</h1>
            <p className="mt-4 leading-7 text-muted">{page.subtitle}</p>
            {href && page.buttonLabel && (
              <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} className="mt-7 inline-block">
                <Button>
                  <MessageCircle size={18} />
                  {page.buttonLabel}
                </Button>
              </Link>
            )}
          </div>
          <div className="grid gap-4">
            {page.sections.map((section) => (
              <div key={section.title} className="flex gap-3 rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
                <CheckCircle2 className="mt-1 shrink-0 text-cocoa" size={22} />
                <div>
                  <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                  {section.text && <p className="mt-2 text-sm leading-6 text-muted">{section.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
