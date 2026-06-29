import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/local-db";

export const metadata = {
  title: "Configuración | Panel M&S Trenzas"
};

export default async function AdminSettingsPage() {
  await requireAdminPageAccess("/admin/configuracion", { adminOnly: true });
  const settings = await getSiteSettings();

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold">Configuración</h2>
        <p className="mt-2 text-sm text-muted">Edita textos, contacto, políticas y mensajes automatizados.</p>
      </div>
      <SettingsForm settings={settings} />
    </section>
  );
}
