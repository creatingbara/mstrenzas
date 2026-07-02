"use client";

import {
  FileText,
  Footprints,
  ImagePlus,
  LayoutDashboard,
  Menu as MenuIcon,
  MessageCircle,
  Monitor,
  MousePointerClick,
  Palette,
  Plus,
  Save,
  Search,
  SunMoon,
  Upload
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultThemeSettings, publicPageOptions } from "@/lib/super-panel-defaults";
import { cn } from "@/lib/utils";
import type {
  AppAdminUiSettings,
  AppFooterSettings,
  AppNavigationItem,
  AppPageSection,
  AppSeoSettings,
  AppThemeSettings
} from "@/types/super-panel";

type TabId =
  | "identity"
  | "pages"
  | "navigation"
  | "buttons"
  | "seo"
  | "footer"
  | "whatsapp"
  | "admin"
  | "theme"
  | "preview";

const tabs: Array<{ id: TabId; label: string; icon: typeof Palette; ready?: boolean }> = [
  { id: "identity", label: "Identidad visual", icon: Palette, ready: true },
  { id: "pages", label: "Paginas publicas", icon: FileText, ready: true },
  { id: "navigation", label: "Menu y navegacion", icon: MenuIcon, ready: true },
  { id: "buttons", label: "Botones y llamadas", icon: MousePointerClick, ready: true },
  { id: "seo", label: "SEO", icon: Search, ready: true },
  { id: "footer", label: "Footer", icon: Footprints, ready: true },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ready: true },
  { id: "admin", label: "Panel administrativo", icon: LayoutDashboard, ready: true },
  { id: "theme", label: "Modo claro / oscuro", icon: SunMoon, ready: true },
  { id: "preview", label: "Vista previa", icon: Monitor, ready: true }
];

export function SuperPanelClient({
  initialTheme,
  initialSections,
  initialNavigation,
  initialSeo,
  initialFooter,
  initialAdminUi
}: {
  initialTheme: AppThemeSettings;
  initialSections: Record<string, AppPageSection[]>;
  initialNavigation: AppNavigationItem[];
  initialSeo: Record<string, AppSeoSettings>;
  initialFooter: AppFooterSettings;
  initialAdminUi: AppAdminUiSettings;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [theme, setTheme] = useState<AppThemeSettings>(initialTheme);
  const [sectionsByPage, setSectionsByPage] = useState(initialSections);
  const [selectedPage, setSelectedPage] = useState(publicPageOptions[0].key);
  const [navigation, setNavigation] = useState(initialNavigation);
  const [seoByPage, setSeoByPage] = useState(initialSeo);
  const [footer, setFooter] = useState(initialFooter);
  const [adminUi, setAdminUi] = useState(initialAdminUi);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedSections = sectionsByPage[selectedPage] || [];
  const selectedSeo = seoByPage[selectedPage];

  async function saveTheme() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme)
      });
      const result = (await response.json()) as { item?: AppThemeSettings; error?: string; message?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar la identidad visual.");
      setTheme(result.item);
      setNotice(result.message || "Identidad visual guardada.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar la identidad visual.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSections() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey: selectedPage, sections: selectedSections })
      });
      const result = (await response.json()) as { items?: AppPageSection[]; error?: string; message?: string };
      if (!response.ok || !result.items) throw new Error(result.error || "No se pudo guardar la pagina.");
      setSectionsByPage((current) => ({ ...current, [selectedPage]: result.items || [] }));
      setNotice(result.message || "Pagina guardada.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar la pagina.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNavigation() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: navigation })
      });
      const result = (await response.json()) as { items?: AppNavigationItem[]; error?: string; message?: string };
      if (!response.ok || !result.items) throw new Error(result.error || "No se pudo guardar el menu.");
      setNavigation(result.items);
      setNotice(result.message || "Menu publico guardado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el menu.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSeo() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: Object.values(seoByPage) })
      });
      const result = (await response.json()) as { items?: Record<string, AppSeoSettings>; error?: string; message?: string };
      if (!response.ok || !result.items) throw new Error(result.error || "No se pudo guardar SEO.");
      setSeoByPage(result.items);
      setNotice(result.message || "SEO guardado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar SEO.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFooter() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footer)
      });
      const result = (await response.json()) as { item?: AppFooterSettings; error?: string; message?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar el footer.");
      setFooter(result.item);
      setNotice(result.message || "Footer guardado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el footer.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAdminUi() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/super-panel/admin-ui", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminUi)
      });
      const result = (await response.json()) as { item?: AppAdminUiSettings; error?: string; message?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar el panel administrativo.");
      setAdminUi(result.item);
      setNotice(result.message || "Panel administrativo guardado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el panel administrativo.");
    } finally {
      setSaving(false);
    }
  }

  function updateTheme<K extends keyof AppThemeSettings>(key: K, value: AppThemeSettings[K]) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  function updateSeo<K extends keyof AppSeoSettings>(key: K, value: AppSeoSettings[K]) {
    setSeoByPage((current) => ({
      ...current,
      [selectedPage]: { ...current[selectedPage], [key]: value }
    }));
  }

  function updateFooter<K extends keyof AppFooterSettings>(key: K, value: AppFooterSettings[K]) {
    setFooter((current) => ({ ...current, [key]: value }));
  }

  function updateAdminUi<K extends keyof AppAdminUiSettings>(key: K, value: AppAdminUiSettings[K]) {
    setAdminUi((current) => ({ ...current, [key]: value }));
  }

  function updateSection(sectionId: string, patch: Partial<AppPageSection>) {
    setSectionsByPage((current) => ({
      ...current,
      [selectedPage]: (current[selectedPage] || []).map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      )
    }));
  }

  function updateNavigation(itemId: string, patch: Partial<AppNavigationItem>) {
    setNavigation((current) => current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  function addNavigationItem() {
    setNavigation((current) => [
      ...current,
      {
        id: `nav-${Date.now()}`,
        label: "Nuevo item",
        href: "/",
        parentId: null,
        sortOrder: current.length * 10 + 10,
        isActive: true,
        opensNewTab: false,
        createdAt: null,
        updatedAt: null
      }
    ]);
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-[0_18px_50px_rgba(101,0,77,0.08)]">
        <div className="border-b border-cocoa/10 bg-[radial-gradient(circle_at_top_left,rgba(193,132,168,0.34),transparent_36%),linear-gradient(135deg,#65004d,#2a001f)] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-pink-100/80">Centro de control global</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Super Panel</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-pink-100/82">
            Editor avanzado para preparar cambios visuales y contenido global sin tocar codigo. Los cambios activos usan valores seguros por defecto.
          </p>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-lg border border-cocoa/10 px-4 py-3 text-left text-sm font-black transition",
                activeTab === tab.id ? "bg-cocoa text-white shadow-soft" : "bg-cream/55 text-ink hover:border-cocoa/25 hover:bg-white"
              )}
              onClick={() => {
                setNotice(null);
                setActiveTab(tab.id);
              }}
            >
              <tab.icon size={18} />
              <span className="min-w-0">
                <span className="block truncate">{tab.label}</span>
                {!tab.ready && <span className="mt-1 block text-[0.68rem] font-bold opacity-70">Base preparada</span>}
              </span>
            </button>
          ))}
        </div>
      </section>

      {notice && <p className="rounded-lg border border-cocoa/10 bg-cream p-3 text-sm font-bold text-cocoa">{notice}</p>}

      {activeTab === "identity" && (
        <IdentityTab theme={theme} saving={saving} onChange={updateTheme} onSave={saveTheme} />
      )}
      {activeTab === "pages" && (
        <PagesTab
          selectedPage={selectedPage}
          sections={selectedSections}
          saving={saving}
          onSelectPage={setSelectedPage}
          onChangeSection={updateSection}
          onSave={saveSections}
        />
      )}
      {activeTab === "navigation" && (
        <NavigationTab
          items={navigation}
          saving={saving}
          onAdd={addNavigationItem}
          onChange={updateNavigation}
          onSave={saveNavigation}
        />
      )}
      {activeTab === "buttons" && <ButtonsTab theme={theme} saving={saving} onChange={updateTheme} onSave={saveTheme} />}
      {activeTab === "theme" && <ThemeModeTab theme={theme} saving={saving} onChange={updateTheme} onSave={saveTheme} />}
      {activeTab === "seo" && selectedSeo && (
        <SeoTab
          selectedPage={selectedPage}
          seo={selectedSeo}
          saving={saving}
          onSelectPage={setSelectedPage}
          onChange={updateSeo}
          onSave={saveSeo}
        />
      )}
      {activeTab === "footer" && <FooterTab footer={footer} saving={saving} onChange={updateFooter} onSave={saveFooter} />}
      {activeTab === "whatsapp" && <WhatsappTab footer={footer} saving={saving} onChange={updateFooter} onSave={saveFooter} />}
      {activeTab === "admin" && <AdminUiTab adminUi={adminUi} saving={saving} onChange={updateAdminUi} onSave={saveAdminUi} />}
      {activeTab === "preview" && (
        <PreviewTab theme={theme} footer={footer} navigation={navigation} sectionsByPage={sectionsByPage} seoByPage={seoByPage} adminUi={adminUi} />
      )}
    </div>
  );
}

function IdentityTab({
  theme,
  saving,
  onChange,
  onSave
}: {
  theme: AppThemeSettings;
  saving: boolean;
  onChange: <K extends keyof AppThemeSettings>(key: K, value: AppThemeSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-cocoa/10 bg-white p-5">
        <PanelTitle title="Identidad visual" subtitle="Colores, logos, fuentes y estilos globales." />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AssetField label="Logo principal" value={theme.logoUrl} folder="logos" onChange={(value) => onChange("logoUrl", value)} />
          <AssetField label="Logo modo oscuro" value={theme.logoDarkUrl} folder="logos" onChange={(value) => onChange("logoDarkUrl", value)} />
          <AssetField label="Favicon" value={theme.faviconUrl} folder="favicons" onChange={(value) => onChange("faviconUrl", value)} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ColorField label="Color principal" value={theme.primaryColor} onChange={(value) => onChange("primaryColor", value)} />
          <ColorField label="Color secundario" value={theme.secondaryColor} onChange={(value) => onChange("secondaryColor", value)} />
          <ColorField label="Color de acento" value={theme.accentColor} onChange={(value) => onChange("accentColor", value)} />
          <ColorField label="Color de fondo" value={theme.backgroundColor} onChange={(value) => onChange("backgroundColor", value)} />
          <ColorField label="Color de texto" value={theme.textColor} onChange={(value) => onChange("textColor", value)} />
          <ColorField label="Principal oscuro" value={theme.darkPrimaryColor} onChange={(value) => onChange("darkPrimaryColor", value)} />
          <ColorField label="Fondo oscuro" value={theme.darkBackgroundColor} onChange={(value) => onChange("darkBackgroundColor", value)} />
          <ColorField label="Texto oscuro" value={theme.darkTextColor} onChange={(value) => onChange("darkTextColor", value)} />
          <Field label="Radio de bordes">
            <Input value={theme.borderRadius} onChange={(event) => onChange("borderRadius", event.target.value)} placeholder="8px" />
          </Field>
          <Field label="Fuente de titulos">
            <Input value={theme.fontHeading} onChange={(event) => onChange("fontHeading", event.target.value)} />
          </Field>
          <Field label="Fuente de textos">
            <Input value={theme.fontBody} onChange={(event) => onChange("fontBody", event.target.value)} />
          </Field>
          <Field label="Estilo de botones">
            <select className="min-h-11 rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold" value={theme.buttonStyle} onChange={(event) => onChange("buttonStyle", event.target.value)}>
              <option value="pill">Pill</option>
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
            </select>
          </Field>
          <Field label="Estilo de cards">
            <select className="min-h-11 rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold" value={theme.cardStyle} onChange={(event) => onChange("cardStyle", event.target.value)}>
              <option value="soft">Soft</option>
              <option value="flat">Flat</option>
              <option value="bordered">Bordered</option>
            </select>
          </Field>
        </div>
        <div className="mt-6">
          <Button type="button" disabled={saving} onClick={onSave}>
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar identidad visual"}
          </Button>
        </div>
      </section>
      <ThemePreview theme={theme} />
    </div>
  );
}

function PagesTab({
  selectedPage,
  sections,
  saving,
  onSelectPage,
  onChangeSection,
  onSave
}: {
  selectedPage: string;
  sections: AppPageSection[];
  saving: boolean;
  onSelectPage: (pageKey: string) => void;
  onChangeSection: (sectionId: string, patch: Partial<AppPageSection>) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelTitle title="Paginas publicas" subtitle="Edita textos, imagenes, botones, estado y orden por pagina." />
        <div className="min-w-[240px]">
          <Field label="Pagina">
            <select className="min-h-11 w-full rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold" value={selectedPage} onChange={(event) => onSelectPage(event.target.value)}>
              {publicPageOptions.map((page) => (
                <option key={page.key} value={page.key}>
                  {page.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg border border-cocoa/10 bg-cream/45 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cocoa">{section.sectionKey}</p>
                <h3 className="mt-1 text-lg font-black text-ink">{section.title || "Seccion sin titulo"}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-cocoa">
                <input type="checkbox" checked={section.isActive} onChange={(event) => onChangeSection(section.id, { isActive: event.target.checked })} />
                Activa
              </label>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field label="Titulo">
                <Input value={section.title} onChange={(event) => onChangeSection(section.id, { title: event.target.value })} />
              </Field>
              <Field label="Eyebrow / contenido corto">
                <Input value={section.content} onChange={(event) => onChangeSection(section.id, { content: event.target.value })} />
              </Field>
              <Field label="Subtitulo">
                <Textarea value={section.subtitle} onChange={(event) => onChangeSection(section.id, { subtitle: event.target.value })} />
              </Field>
              <div className="grid gap-4">
                <AssetField label="Imagen" value={section.imageUrl} folder="pages" onChange={(value) => onChangeSection(section.id, { imageUrl: value })} />
                <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
                  <Field label="Texto boton">
                    <Input value={section.buttonLabel} onChange={(event) => onChangeSection(section.id, { buttonLabel: event.target.value })} />
                  </Field>
                  <Field label="Orden">
                    <Input type="number" value={section.sortOrder} onChange={(event) => onChangeSection(section.id, { sortOrder: Number(event.target.value) })} />
                  </Field>
                </div>
                <Field label="URL boton">
                  <Input value={section.buttonUrl} onChange={(event) => onChangeSection(section.id, { buttonUrl: event.target.value })} />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar pagina"}
        </Button>
      </div>
    </section>
  );
}

function NavigationTab({
  items,
  saving,
  onAdd,
  onChange,
  onSave
}: {
  items: AppNavigationItem[];
  saving: boolean;
  onAdd: () => void;
  onChange: (itemId: string, patch: Partial<AppNavigationItem>) => void;
  onSave: () => void;
}) {
  const parentOptions = useMemo(() => items.filter((item) => !item.parentId), [items]);

  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PanelTitle title="Menu y navegacion" subtitle="Crea, ordena, activa y define submenus del menu publico." />
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus size={18} />
          Crear item
        </Button>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-cocoa/10 bg-cream/45 p-4 xl:grid-cols-[1fr_1fr_0.8fr_0.4fr_0.8fr] xl:items-end">
            <Field label="Etiqueta">
              <Input value={item.label} onChange={(event) => onChange(item.id, { label: event.target.value })} />
            </Field>
            <Field label="URL">
              <Input value={item.href} onChange={(event) => onChange(item.id, { href: event.target.value })} />
            </Field>
            <Field label="Submenu de">
              <select
                className="min-h-11 rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold"
                value={item.parentId || ""}
                onChange={(event) => onChange(item.id, { parentId: event.target.value || null })}
              >
                <option value="">Item principal</option>
                {parentOptions
                  .filter((parent) => parent.id !== item.id)
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Orden">
              <Input type="number" value={item.sortOrder} onChange={(event) => onChange(item.id, { sortOrder: Number(event.target.value) })} />
            </Field>
            <div className="flex flex-wrap gap-3 pb-2 text-sm font-bold text-cocoa">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={item.isActive} onChange={(event) => onChange(item.id, { isActive: event.target.checked })} />
                Activo
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={item.opensNewTab} onChange={(event) => onChange(item.id, { opensNewTab: event.target.checked })} />
                Nueva pestana
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar menu"}
        </Button>
      </div>
    </section>
  );
}

function ButtonsTab({
  theme,
  saving,
  onChange,
  onSave
}: {
  theme: AppThemeSettings;
  saving: boolean;
  onChange: <K extends keyof AppThemeSettings>(key: K, value: AppThemeSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="Botones y llamadas" subtitle="Ajusta el estilo visual de botones, acentos y llamadas a la accion." />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ColorField label="Color de boton principal" value={theme.primaryColor} onChange={(value) => onChange("primaryColor", value)} />
        <ColorField label="Color de boton secundario" value={theme.secondaryColor} onChange={(value) => onChange("secondaryColor", value)} />
        <ColorField label="Color hover / acento" value={theme.accentColor} onChange={(value) => onChange("accentColor", value)} />
        <Field label="Forma de botones">
          <select className="min-h-11 rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold" value={theme.buttonStyle} onChange={(event) => onChange("buttonStyle", event.target.value)}>
            <option value="pill">Redondeado completo</option>
            <option value="rounded">Redondeado suave</option>
            <option value="sharp">Mas cuadrado</option>
          </select>
        </Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button">Agendar cita</Button>
        <Button type="button" variant="outline">Ver catalogo</Button>
        <Button type="button" variant="secondary">Cotizar</Button>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar botones"}
        </Button>
      </div>
    </section>
  );
}

function ThemeModeTab({
  theme,
  saving,
  onChange,
  onSave
}: {
  theme: AppThemeSettings;
  saving: boolean;
  onChange: <K extends keyof AppThemeSettings>(key: K, value: AppThemeSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="Modo claro / oscuro" subtitle="Define los colores base para ambos modos visuales de la pagina publica." />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-cocoa/10 bg-cream/45 p-4">
          <h4 className="font-display text-2xl font-bold text-ink">Modo dia</h4>
          <div className="mt-4 grid gap-4">
            <ColorField label="Fondo" value={theme.backgroundColor} onChange={(value) => onChange("backgroundColor", value)} />
            <ColorField label="Texto" value={theme.textColor} onChange={(value) => onChange("textColor", value)} />
            <ColorField label="Principal" value={theme.primaryColor} onChange={(value) => onChange("primaryColor", value)} />
          </div>
        </div>
        <div className="rounded-lg border border-cocoa/10 bg-[#170011] p-4 text-white">
          <h4 className="font-display text-2xl font-bold">Modo oscuro</h4>
          <div className="mt-4 grid gap-4">
            <ColorField label="Fondo oscuro" value={theme.darkBackgroundColor} onChange={(value) => onChange("darkBackgroundColor", value)} />
            <ColorField label="Texto oscuro" value={theme.darkTextColor} onChange={(value) => onChange("darkTextColor", value)} />
            <ColorField label="Principal oscuro" value={theme.darkPrimaryColor} onChange={(value) => onChange("darkPrimaryColor", value)} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar modo claro / oscuro"}
        </Button>
      </div>
    </section>
  );
}

function SeoTab({
  selectedPage,
  seo,
  saving,
  onSelectPage,
  onChange,
  onSave
}: {
  selectedPage: string;
  seo: AppSeoSettings;
  saving: boolean;
  onSelectPage: (pageKey: string) => void;
  onChange: <K extends keyof AppSeoSettings>(key: K, value: AppSeoSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelTitle title="SEO" subtitle="Edita titulo, descripcion, palabras clave e imagen social por pagina publica." />
        <Field label="Pagina">
          <select className="min-h-11 min-w-[240px] rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-semibold" value={selectedPage} onChange={(event) => onSelectPage(event.target.value)}>
            {publicPageOptions.map((page) => (
              <option key={page.key} value={page.key}>{page.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field label="Titulo SEO">
          <Input value={seo.title} onChange={(event) => onChange("title", event.target.value)} />
        </Field>
        <AssetField label="Imagen OG" value={seo.ogImageUrl} folder="seo" onChange={(value) => onChange("ogImageUrl", value)} />
        <Field label="Descripcion">
          <Textarea value={seo.description} onChange={(event) => onChange("description", event.target.value)} />
        </Field>
        <Field label="Keywords">
          <Textarea value={seo.keywords} onChange={(event) => onChange("keywords", event.target.value)} />
        </Field>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar SEO"}
        </Button>
      </div>
    </section>
  );
}

function FooterTab({
  footer,
  saving,
  onChange,
  onSave
}: {
  footer: AppFooterSettings;
  saving: boolean;
  onChange: <K extends keyof AppFooterSettings>(key: K, value: AppFooterSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="Footer" subtitle="Controla textos, datos de contacto y enlaces del pie de pagina." />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field label="Nombre del negocio">
          <Input value={footer.businessName} onChange={(event) => onChange("businessName", event.target.value)} />
        </Field>
        <Field label="Copyright">
          <Input value={footer.copyrightText} onChange={(event) => onChange("copyrightText", event.target.value)} />
        </Field>
        <Field label="Descripcion">
          <Textarea value={footer.description} onChange={(event) => onChange("description", event.target.value)} />
        </Field>
        <div className="grid gap-4">
          <Field label="Direccion">
            <Input value={footer.address} onChange={(event) => onChange("address", event.target.value)} />
          </Field>
          <Field label="Horario">
            <Input value={footer.schedule} onChange={(event) => onChange("schedule", event.target.value)} />
          </Field>
        </div>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar footer"}
        </Button>
      </div>
    </section>
  );
}

function WhatsappTab({
  footer,
  saving,
  onChange,
  onSave
}: {
  footer: AppFooterSettings;
  saving: boolean;
  onChange: <K extends keyof AppFooterSettings>(key: K, value: AppFooterSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="WhatsApp" subtitle="Define el numero principal y el enlace de Instagram que usa el sitio publico cuando hay configuracion avanzada." />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field label="Numero de WhatsApp">
          <Input value={footer.whatsapp} onChange={(event) => onChange("whatsapp", event.target.value)} placeholder="+1 829 000 0000" />
        </Field>
        <Field label="Instagram">
          <Input value={footer.instagramUrl} onChange={(event) => onChange("instagramUrl", event.target.value)} placeholder="https://www.instagram.com/..." />
        </Field>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar WhatsApp"}
        </Button>
      </div>
    </section>
  );
}

function AdminUiTab({
  adminUi,
  saving,
  onChange,
  onSave
}: {
  adminUi: AppAdminUiSettings;
  saving: boolean;
  onChange: <K extends keyof AppAdminUiSettings>(key: K, value: AppAdminUiSettings[K]) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="Panel administrativo" subtitle="Ajusta titulo superior, subtitulo, logo del sidebar y colores base del panel." />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field label="Titulo del panel">
          <Input value={adminUi.adminTitle} onChange={(event) => onChange("adminTitle", event.target.value)} />
        </Field>
        <Field label="Subtitulo del panel">
          <Input value={adminUi.adminSubtitle} onChange={(event) => onChange("adminSubtitle", event.target.value)} />
        </Field>
        <AssetField label="Logo del sidebar" value={adminUi.sidebarLogoUrl} folder="admin" onChange={(value) => onChange("sidebarLogoUrl", value)} />
        <div className="grid gap-4">
          <ColorField label="Color sidebar" value={adminUi.sidebarColor} onChange={(value) => onChange("sidebarColor", value)} />
          <ColorField label="Color acento sidebar" value={adminUi.sidebarAccentColor} onChange={(value) => onChange("sidebarAccentColor", value)} />
        </div>
      </div>
      <div className="mt-6">
        <Button type="button" disabled={saving} onClick={onSave}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar panel administrativo"}
        </Button>
      </div>
    </section>
  );
}

function PreviewTab({
  theme,
  footer,
  navigation,
  sectionsByPage,
  seoByPage,
  adminUi
}: {
  theme: AppThemeSettings;
  footer: AppFooterSettings;
  navigation: AppNavigationItem[];
  sectionsByPage: Record<string, AppPageSection[]>;
  seoByPage: Record<string, AppSeoSettings>;
  adminUi: AppAdminUiSettings;
}) {
  const hero = sectionsByPage.home?.find((section) => section.sectionKey === "hero");

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <ThemePreview theme={theme} />
      <section className="rounded-lg border border-cocoa/10 bg-white p-5">
        <PanelTitle title="Vista previa" subtitle="Resumen de lo que esta configurado actualmente." />
        <div className="mt-5 grid gap-3">
          <Metric label="Menu publico" value={`${navigation.filter((item) => item.isActive).length} activos`} />
          <Metric label="Paginas editables" value={String(Object.keys(sectionsByPage).length)} />
          <Metric label="SEO configurado" value={String(Object.keys(seoByPage).length)} />
        </div>
        <div className="mt-5 rounded-lg border border-cocoa/10 bg-cream/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cocoa">{hero?.content || "Hero"}</p>
          <h4 className="mt-2 font-display text-3xl font-bold text-ink">{hero?.title || "Titulo principal"}</h4>
          <p className="mt-2 text-sm leading-6 text-muted">{hero?.subtitle || "Subtitulo principal"}</p>
        </div>
        <div className="mt-5 rounded-lg border border-cocoa/10 bg-[#170011] p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-200">{adminUi.adminSubtitle}</p>
          <p className="mt-1 text-lg font-black">{adminUi.adminTitle}</p>
          <p className="mt-3 text-sm text-white/70">{footer.businessName} · {footer.schedule || "Horario pendiente"}</p>
        </div>
      </section>
    </div>
  );
}

function PreparedTab({
  tab,
  theme,
  navigation,
  sectionsByPage
}: {
  tab: { label: string; icon: typeof Palette };
  theme: AppThemeSettings;
  navigation: AppNavigationItem[];
  sectionsByPage: Record<string, AppPageSection[]>;
}) {
  const pageCount = Object.keys(sectionsByPage).length;

  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="grid size-14 place-items-center rounded-lg bg-cream text-cocoa">
            <tab.icon size={24} />
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold">{tab.label}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Esta area queda preparada en la estructura del Super Panel. La base de datos ya tiene tabla dedicada para extenderla en la siguiente fase sin tocar las areas actuales.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Color principal" value={theme.primaryColor} />
          <Metric label="Items menu" value={String(navigation.length)} />
          <Metric label="Paginas listas" value={String(pageCount)} />
        </div>
      </div>
    </section>
  );
}

function ThemePreview({ theme }: { theme: AppThemeSettings }) {
  const style = {
    "--preview-primary": theme.primaryColor || defaultThemeSettings.primaryColor,
    "--preview-secondary": theme.secondaryColor || defaultThemeSettings.secondaryColor,
    "--preview-accent": theme.accentColor || defaultThemeSettings.accentColor,
    "--preview-bg": theme.backgroundColor || defaultThemeSettings.backgroundColor,
    "--preview-text": theme.textColor || defaultThemeSettings.textColor,
    "--preview-radius": theme.borderRadius || defaultThemeSettings.borderRadius
  } as CSSProperties;

  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5">
      <PanelTitle title="Vista previa" subtitle="Muestra segura antes de aplicar a toda la experiencia." />
      <div className="mt-5 overflow-hidden border border-cocoa/10 p-5 shadow-soft" style={{ ...style, borderRadius: "var(--preview-radius)", background: "var(--preview-bg)", color: "var(--preview-text)" }}>
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center overflow-hidden rounded-full border bg-white">
            {theme.logoUrl ? <img src={theme.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : <ImagePlus size={22} />}
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--preview-primary)" }}>
              M&S Trenzas
            </p>
            <h3 className="font-display text-3xl font-bold">Identidad premium</h3>
          </div>
        </div>
        <p className="mt-4 max-w-lg text-sm leading-6 opacity-75">Los cambios se guardan como variables globales con fallback al diseno actual.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: "var(--preview-primary)" }}>
            Boton principal
          </span>
          <span className="rounded-full px-5 py-2 text-sm font-bold" style={{ background: "var(--preview-secondary)" }}>
            Boton secundario
          </span>
          <span className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: "var(--preview-accent)" }}>
            Acento
          </span>
        </div>
      </div>
    </section>
  );
}

function AssetField({ label, value, folder, onChange }: { label: string; value: string; folder: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const response = await fetch("/api/admin/super-panel/assets", { method: "POST", body: formData });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "No se pudo subir el archivo.");
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-cocoa/10 bg-cream/45 p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cocoa">{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[76px_1fr] sm:items-center">
        <span className="grid size-16 place-items-center overflow-hidden rounded-lg border border-cocoa/10 bg-white">
          {value ? <img src={value} alt={label} className="h-full w-full object-cover" /> : <ImagePlus size={22} />}
        </span>
        <div className="min-w-0">
          <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL del archivo" />
          <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-cocoa/20 bg-white px-4 text-sm font-bold text-ink">
            <Upload size={16} />
            {uploading ? "Subiendo..." : "Subir"}
            <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon" disabled={uploading} onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }} />
          </label>
          {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-[48px_1fr] gap-2">
        <input type="color" className="h-11 w-12 rounded-lg border border-cocoa/15 bg-white p-1" value={value || "#65004d"} onChange={(event) => onChange(event.target.value)} />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      {children}
    </label>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cocoa">Super Panel</p>
      <h3 className="mt-2 font-display text-3xl font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cocoa/10 bg-cream/55 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cocoa">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
