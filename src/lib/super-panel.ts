import { execute, query, queryOne } from "@/lib/db/pg";
import {
  defaultAdminUiSettings,
  defaultFooterSettings,
  defaultNavigationItems,
  defaultPageSections,
  defaultSeoSettings,
  defaultThemeSettings,
  publicPageOptions
} from "@/lib/super-panel-defaults";
import type {
  AppAdminUiSettings,
  AppFooterSettings,
  AppNavigationItem,
  AppPageSection,
  AppSeoSettings,
  AppThemeSettings
} from "@/types/super-panel";

type ThemeRow = {
  id: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  dark_primary_color: string | null;
  dark_background_color: string | null;
  dark_text_color: string | null;
  font_heading: string | null;
  font_body: string | null;
  border_radius: string | null;
  button_style: string | null;
  card_style: string | null;
  updated_at: string | null;
};

type NavigationRow = {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
  sort_order: number;
  is_active: number | boolean;
  opens_new_tab: number | boolean;
  created_at: string | null;
  updated_at: string | null;
};

type PageSectionRow = {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  sort_order: number;
  is_active: number | boolean;
  metadata: Record<string, unknown> | string | null;
  created_at: string | null;
  updated_at: string | null;
};

type SeoRow = {
  id: string;
  page_key: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FooterRow = {
  id: string;
  business_name: string | null;
  description: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  address: string | null;
  schedule: string | null;
  copyright_text: string | null;
  updated_at: string | null;
};

type AdminUiRow = {
  id: string;
  admin_title: string | null;
  admin_subtitle: string | null;
  sidebar_logo_url: string | null;
  sidebar_color: string | null;
  sidebar_accent_color: string | null;
  updated_at: string | null;
};

let schemaPromise: Promise<void> | null = null;

export function ensureSuperPanelTables() {
  schemaPromise ??= (async () => {
    await execute(`
      create table if not exists app_theme_settings (
        id text primary key,
        logo_url text,
        logo_dark_url text,
        favicon_url text,
        primary_color text,
        secondary_color text,
        accent_color text,
        background_color text,
        text_color text,
        dark_primary_color text,
        dark_background_color text,
        dark_text_color text,
        font_heading text,
        font_body text,
        border_radius text,
        button_style text,
        card_style text,
        updated_at text not null default now()::text
      )
    `);
    await execute(`
      create table if not exists app_navigation_items (
        id text primary key,
        label text not null,
        href text not null default '#',
        parent_id text,
        sort_order integer not null default 0,
        is_active integer not null default 1,
        opens_new_tab integer not null default 0,
        created_at text not null default now()::text,
        updated_at text not null default now()::text
      )
    `);
    await execute(`
      create table if not exists app_page_sections (
        id text primary key,
        page_key text not null,
        section_key text not null,
        title text,
        subtitle text,
        content text,
        image_url text,
        button_label text,
        button_url text,
        sort_order integer not null default 0,
        is_active integer not null default 1,
        metadata jsonb not null default '{}'::jsonb,
        created_at text not null default now()::text,
        updated_at text not null default now()::text,
        unique(page_key, section_key)
      )
    `);
    await execute(`
      create table if not exists app_seo_settings (
        id text primary key,
        page_key text not null unique,
        title text,
        description text,
        keywords text,
        og_image_url text,
        created_at text not null default now()::text,
        updated_at text not null default now()::text
      )
    `);
    await execute(`
      create table if not exists app_footer_settings (
        id text primary key,
        business_name text,
        description text,
        whatsapp text,
        instagram_url text,
        address text,
        schedule text,
        copyright_text text,
        updated_at text not null default now()::text
      )
    `);
    await execute(`
      create table if not exists app_admin_ui_settings (
        id text primary key,
        admin_title text,
        admin_subtitle text,
        sidebar_logo_url text,
        sidebar_color text,
        sidebar_accent_color text,
        updated_at text not null default now()::text
      )
    `);

    await Promise.all([
      enablePublicReadPolicy("app_theme_settings"),
      enablePublicReadPolicy("app_navigation_items"),
      enablePublicReadPolicy("app_page_sections"),
      enablePublicReadPolicy("app_seo_settings"),
      enablePublicReadPolicy("app_footer_settings"),
      enablePublicReadPolicy("app_admin_ui_settings")
    ]);
  })();

  return schemaPromise;
}

async function enablePublicReadPolicy(tableName: string) {
  const policyName = `${tableName}_public_read`;
  await execute(`alter table ${tableName} enable row level security`);
  await execute(`
    do $$
    begin
      if not exists (
        select 1
          from pg_policies
         where schemaname = 'public'
           and tablename = '${tableName}'
           and policyname = '${policyName}'
      ) then
        create policy ${policyName}
          on ${tableName}
          for select
          to anon, authenticated
          using (true);
      end if;
    end $$;
  `);
}

export async function getAppThemeSettings(): Promise<AppThemeSettings> {
  await ensureSuperPanelTables();
  const row = await queryOne<ThemeRow>("select * from app_theme_settings where id = 'default'");
  return row ? mapTheme(row) : defaultThemeSettings;
}

export async function saveAppThemeSettings(input: AppThemeSettings): Promise<AppThemeSettings> {
  await ensureSuperPanelTables();
  const row = await queryOne<ThemeRow>(
    `insert into app_theme_settings (
      id, logo_url, logo_dark_url, favicon_url, primary_color, secondary_color, accent_color,
      background_color, text_color, dark_primary_color, dark_background_color, dark_text_color,
      font_heading, font_body, border_radius, button_style, card_style, updated_at
    )
    values ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now()::text)
    on conflict (id) do update set
      logo_url = excluded.logo_url,
      logo_dark_url = excluded.logo_dark_url,
      favicon_url = excluded.favicon_url,
      primary_color = excluded.primary_color,
      secondary_color = excluded.secondary_color,
      accent_color = excluded.accent_color,
      background_color = excluded.background_color,
      text_color = excluded.text_color,
      dark_primary_color = excluded.dark_primary_color,
      dark_background_color = excluded.dark_background_color,
      dark_text_color = excluded.dark_text_color,
      font_heading = excluded.font_heading,
      font_body = excluded.font_body,
      border_radius = excluded.border_radius,
      button_style = excluded.button_style,
      card_style = excluded.card_style,
      updated_at = now()::text
    returning *`,
    [
      input.logoUrl,
      input.logoDarkUrl,
      input.faviconUrl,
      input.primaryColor,
      input.secondaryColor,
      input.accentColor,
      input.backgroundColor,
      input.textColor,
      input.darkPrimaryColor,
      input.darkBackgroundColor,
      input.darkTextColor,
      input.fontHeading,
      input.fontBody,
      input.borderRadius,
      input.buttonStyle,
      input.cardStyle
    ]
  );

  if (!row) throw new Error("No se pudo guardar la identidad visual.");
  return mapTheme(row);
}

export async function getAppNavigationItems({ activeOnly = false } = {}): Promise<AppNavigationItem[]> {
  await ensureSuperPanelTables();
  const rows = await query<NavigationRow>(
    `select * from app_navigation_items${activeOnly ? " where is_active = 1" : ""} order by parent_id nulls first, sort_order, label`
  );

  if (!rows.length) {
    return defaultNavigationItems.filter((item) => !activeOnly || item.isActive);
  }

  return rows.map(mapNavigation);
}

export async function saveAppNavigationItems(items: AppNavigationItem[]) {
  await ensureSuperPanelTables();
  const normalized = items.map(normalizeNavigationItem);

  for (const item of normalized) {
    await queryOne<NavigationRow>(
      `insert into app_navigation_items (id, label, href, parent_id, sort_order, is_active, opens_new_tab, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now()::text)
       on conflict (id) do update set
        label = excluded.label,
        href = excluded.href,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active,
        opens_new_tab = excluded.opens_new_tab,
        updated_at = now()::text
       returning *`,
      [item.id, item.label, item.href, item.parentId, item.sortOrder, item.isActive ? 1 : 0, item.opensNewTab ? 1 : 0]
    );
  }

  return getAppNavigationItems();
}

export async function getAppPageSections(pageKey: string, { activeOnly = false } = {}): Promise<AppPageSection[]> {
  await ensureSuperPanelTables();
  const rows = await query<PageSectionRow>(
    `select * from app_page_sections where page_key = $1${activeOnly ? " and is_active = 1" : ""} order by sort_order, section_key`,
    [pageKey]
  );

  if (!rows.length) {
    return (defaultPageSections[pageKey] || []).filter((section) => !activeOnly || section.isActive);
  }

  return rows.map(mapPageSection);
}

export async function getAllEditablePageSections() {
  const entries = await Promise.all(
    Object.keys(defaultPageSections).map(async (pageKey) => [pageKey, await getAppPageSections(pageKey)] as const)
  );
  return Object.fromEntries(entries);
}

export async function saveAppPageSections(pageKey: string, sections: AppPageSection[]) {
  await ensureSuperPanelTables();
  const normalized = sections.map((section) => normalizePageSection({ ...section, pageKey }));

  for (const section of normalized) {
    await queryOne<PageSectionRow>(
      `insert into app_page_sections (
        id, page_key, section_key, title, subtitle, content, image_url, button_label, button_url,
        sort_order, is_active, metadata, updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, now()::text)
      on conflict (page_key, section_key) do update set
        title = excluded.title,
        subtitle = excluded.subtitle,
        content = excluded.content,
        image_url = excluded.image_url,
        button_label = excluded.button_label,
        button_url = excluded.button_url,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active,
        metadata = excluded.metadata,
        updated_at = now()::text
      returning *`,
      [
        section.id,
        section.pageKey,
        section.sectionKey,
        section.title,
        section.subtitle,
        section.content,
        section.imageUrl,
        section.buttonLabel,
        section.buttonUrl,
        section.sortOrder,
        section.isActive ? 1 : 0,
        JSON.stringify(section.metadata || {})
      ]
    );
  }

  return getAppPageSections(pageKey);
}

export async function getAppSeoSettings(pageKey: string): Promise<AppSeoSettings> {
  await ensureSuperPanelTables();
  const row = await queryOne<SeoRow>("select * from app_seo_settings where page_key = $1", [pageKey]);
  return row ? mapSeo(row) : defaultSeoSettings[pageKey] || defaultSeoSettings.home;
}

export async function getAllSeoSettings(): Promise<Record<string, AppSeoSettings>> {
  const rows = await Promise.all(publicPageOptions.map(async (page) => [page.key, await getAppSeoSettings(page.key)] as const));
  return Object.fromEntries(rows);
}

export async function saveAppSeoSettings(items: AppSeoSettings[]) {
  await ensureSuperPanelTables();
  const normalized = items.map(normalizeSeo);

  for (const item of normalized) {
    await queryOne<SeoRow>(
      `insert into app_seo_settings (id, page_key, title, description, keywords, og_image_url, updated_at)
       values ($1, $2, $3, $4, $5, $6, now()::text)
       on conflict (page_key) do update set
        title = excluded.title,
        description = excluded.description,
        keywords = excluded.keywords,
        og_image_url = excluded.og_image_url,
        updated_at = now()::text
       returning *`,
      [item.id, item.pageKey, item.title, item.description, item.keywords, item.ogImageUrl]
    );
  }

  return getAllSeoSettings();
}

export async function getAppFooterSettings(): Promise<AppFooterSettings> {
  await ensureSuperPanelTables();
  const row = await queryOne<FooterRow>("select * from app_footer_settings where id = 'default'");
  return row ? mapFooter(row) : defaultFooterSettings;
}

export async function saveAppFooterSettings(input: AppFooterSettings): Promise<AppFooterSettings> {
  await ensureSuperPanelTables();
  const item = normalizeFooter(input);
  const row = await queryOne<FooterRow>(
    `insert into app_footer_settings (
      id, business_name, description, whatsapp, instagram_url, address, schedule, copyright_text, updated_at
    )
    values ('default', $1, $2, $3, $4, $5, $6, $7, now()::text)
    on conflict (id) do update set
      business_name = excluded.business_name,
      description = excluded.description,
      whatsapp = excluded.whatsapp,
      instagram_url = excluded.instagram_url,
      address = excluded.address,
      schedule = excluded.schedule,
      copyright_text = excluded.copyright_text,
      updated_at = now()::text
    returning *`,
    [item.businessName, item.description, item.whatsapp, item.instagramUrl, item.address, item.schedule, item.copyrightText]
  );

  if (!row) throw new Error("No se pudo guardar el footer.");
  return mapFooter(row);
}

export async function getAppAdminUiSettings(): Promise<AppAdminUiSettings> {
  await ensureSuperPanelTables();
  const row = await queryOne<AdminUiRow>("select * from app_admin_ui_settings where id = 'default'");
  return row ? mapAdminUi(row) : defaultAdminUiSettings;
}

export async function saveAppAdminUiSettings(input: AppAdminUiSettings): Promise<AppAdminUiSettings> {
  await ensureSuperPanelTables();
  const item = normalizeAdminUi(input);
  const row = await queryOne<AdminUiRow>(
    `insert into app_admin_ui_settings (
      id, admin_title, admin_subtitle, sidebar_logo_url, sidebar_color, sidebar_accent_color, updated_at
    )
    values ('default', $1, $2, $3, $4, $5, now()::text)
    on conflict (id) do update set
      admin_title = excluded.admin_title,
      admin_subtitle = excluded.admin_subtitle,
      sidebar_logo_url = excluded.sidebar_logo_url,
      sidebar_color = excluded.sidebar_color,
      sidebar_accent_color = excluded.sidebar_accent_color,
      updated_at = now()::text
    returning *`,
    [item.adminTitle, item.adminSubtitle, item.sidebarLogoUrl, item.sidebarColor, item.sidebarAccentColor]
  );

  if (!row) throw new Error("No se pudo guardar el panel administrativo.");
  return mapAdminUi(row);
}

export function pageSectionsByKey(sections: AppPageSection[]) {
  return Object.fromEntries(sections.map((section) => [section.sectionKey, section]));
}

export function themeCssVariables(theme: AppThemeSettings) {
  return {
    "--app-primary-color": theme.primaryColor || defaultThemeSettings.primaryColor,
    "--app-secondary-color": theme.secondaryColor || defaultThemeSettings.secondaryColor,
    "--app-accent-color": theme.accentColor || defaultThemeSettings.accentColor,
    "--app-background-color": theme.backgroundColor || defaultThemeSettings.backgroundColor,
    "--app-text-color": theme.textColor || defaultThemeSettings.textColor,
    "--app-dark-primary-color": theme.darkPrimaryColor || defaultThemeSettings.darkPrimaryColor,
    "--app-dark-background-color": theme.darkBackgroundColor || defaultThemeSettings.darkBackgroundColor,
    "--app-dark-text-color": theme.darkTextColor || defaultThemeSettings.darkTextColor,
    "--app-font-heading": theme.fontHeading || defaultThemeSettings.fontHeading,
    "--app-font-body": theme.fontBody || defaultThemeSettings.fontBody,
    "--app-border-radius": theme.borderRadius || defaultThemeSettings.borderRadius,
    "--app-button-radius":
      theme.buttonStyle === "sharp" ? "4px" : theme.buttonStyle === "rounded" ? "12px" : "999px",
    "--app-card-shadow":
      theme.cardStyle === "flat"
        ? "none"
        : theme.cardStyle === "bordered"
          ? "0 0 0 rgba(0, 0, 0, 0)"
          : `0 18px 50px color-mix(in srgb, ${theme.primaryColor || defaultThemeSettings.primaryColor} 10%, transparent)`
  } as Record<string, string>;
}

function mapTheme(row: ThemeRow): AppThemeSettings {
  return {
    id: row.id,
    logoUrl: row.logo_url || defaultThemeSettings.logoUrl,
    logoDarkUrl: row.logo_dark_url || defaultThemeSettings.logoDarkUrl,
    faviconUrl: row.favicon_url || defaultThemeSettings.faviconUrl,
    primaryColor: row.primary_color || defaultThemeSettings.primaryColor,
    secondaryColor: row.secondary_color || defaultThemeSettings.secondaryColor,
    accentColor: row.accent_color || defaultThemeSettings.accentColor,
    backgroundColor: row.background_color || defaultThemeSettings.backgroundColor,
    textColor: row.text_color || defaultThemeSettings.textColor,
    darkPrimaryColor: row.dark_primary_color || defaultThemeSettings.darkPrimaryColor,
    darkBackgroundColor: row.dark_background_color || defaultThemeSettings.darkBackgroundColor,
    darkTextColor: row.dark_text_color || defaultThemeSettings.darkTextColor,
    fontHeading: row.font_heading || defaultThemeSettings.fontHeading,
    fontBody: row.font_body || defaultThemeSettings.fontBody,
    borderRadius: row.border_radius || defaultThemeSettings.borderRadius,
    buttonStyle: row.button_style || defaultThemeSettings.buttonStyle,
    cardStyle: row.card_style || defaultThemeSettings.cardStyle,
    updatedAt: row.updated_at
  };
}

function mapNavigation(row: NavigationRow): AppNavigationItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    parentId: row.parent_id,
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
    opensNewTab: Boolean(row.opens_new_tab),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPageSection(row: PageSectionRow): AppPageSection {
  return {
    id: row.id,
    pageKey: row.page_key,
    sectionKey: row.section_key,
    title: row.title || "",
    subtitle: row.subtitle || "",
    content: row.content || "",
    imageUrl: row.image_url || "",
    buttonLabel: row.button_label || "",
    buttonUrl: row.button_url || "",
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSeo(row: SeoRow): AppSeoSettings {
  const fallback = defaultSeoSettings[row.page_key] || defaultSeoSettings.home;
  return {
    id: row.id,
    pageKey: row.page_key,
    title: row.title || fallback.title,
    description: row.description || fallback.description,
    keywords: row.keywords || fallback.keywords,
    ogImageUrl: row.og_image_url || fallback.ogImageUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapFooter(row: FooterRow): AppFooterSettings {
  return {
    id: row.id,
    businessName: row.business_name || defaultFooterSettings.businessName,
    description: row.description || defaultFooterSettings.description,
    whatsapp: row.whatsapp || defaultFooterSettings.whatsapp,
    instagramUrl: row.instagram_url || defaultFooterSettings.instagramUrl,
    address: row.address || defaultFooterSettings.address,
    schedule: row.schedule || defaultFooterSettings.schedule,
    copyrightText: row.copyright_text || defaultFooterSettings.copyrightText,
    updatedAt: row.updated_at
  };
}

function mapAdminUi(row: AdminUiRow): AppAdminUiSettings {
  return {
    id: row.id,
    adminTitle: row.admin_title || defaultAdminUiSettings.adminTitle,
    adminSubtitle: row.admin_subtitle || defaultAdminUiSettings.adminSubtitle,
    sidebarLogoUrl: row.sidebar_logo_url || defaultAdminUiSettings.sidebarLogoUrl,
    sidebarColor: row.sidebar_color || defaultAdminUiSettings.sidebarColor,
    sidebarAccentColor: row.sidebar_accent_color || defaultAdminUiSettings.sidebarAccentColor,
    updatedAt: row.updated_at
  };
}

function normalizeNavigationItem(item: AppNavigationItem): AppNavigationItem {
  return {
    ...item,
    id: item.id.trim(),
    label: item.label.trim() || "Nuevo item",
    href: item.href.trim() || "#",
    parentId: item.parentId?.trim() || null,
    sortOrder: Number(item.sortOrder || 0),
    isActive: Boolean(item.isActive),
    opensNewTab: Boolean(item.opensNewTab)
  };
}

function normalizePageSection(section: AppPageSection): AppPageSection {
  return {
    ...section,
    id: section.id.trim() || `${section.pageKey}-${section.sectionKey}`,
    pageKey: section.pageKey.trim(),
    sectionKey: section.sectionKey.trim(),
    title: section.title.trim(),
    subtitle: section.subtitle.trim(),
    content: section.content.trim(),
    imageUrl: section.imageUrl.trim(),
    buttonLabel: section.buttonLabel.trim(),
    buttonUrl: section.buttonUrl.trim(),
    sortOrder: Number(section.sortOrder || 0),
    isActive: Boolean(section.isActive),
    metadata: section.metadata || {}
  };
}

function normalizeSeo(item: AppSeoSettings): AppSeoSettings {
  const fallback = defaultSeoSettings[item.pageKey] || defaultSeoSettings.home;
  return {
    ...item,
    id: item.id.trim() || `seo-${item.pageKey}`,
    pageKey: item.pageKey.trim() || fallback.pageKey,
    title: item.title.trim() || fallback.title,
    description: item.description.trim() || fallback.description,
    keywords: item.keywords.trim(),
    ogImageUrl: item.ogImageUrl.trim()
  };
}

function normalizeFooter(item: AppFooterSettings): AppFooterSettings {
  return {
    ...item,
    id: "default",
    businessName: item.businessName.trim() || defaultFooterSettings.businessName,
    description: item.description.trim() || defaultFooterSettings.description,
    whatsapp: item.whatsapp.trim(),
    instagramUrl: item.instagramUrl.trim(),
    address: item.address.trim(),
    schedule: item.schedule.trim(),
    copyrightText: item.copyrightText.trim() || defaultFooterSettings.copyrightText
  };
}

function normalizeAdminUi(item: AppAdminUiSettings): AppAdminUiSettings {
  return {
    ...item,
    id: "default",
    adminTitle: item.adminTitle.trim() || defaultAdminUiSettings.adminTitle,
    adminSubtitle: item.adminSubtitle.trim() || defaultAdminUiSettings.adminSubtitle,
    sidebarLogoUrl: item.sidebarLogoUrl.trim() || defaultAdminUiSettings.sidebarLogoUrl,
    sidebarColor: item.sidebarColor.trim() || defaultAdminUiSettings.sidebarColor,
    sidebarAccentColor: item.sidebarAccentColor.trim() || defaultAdminUiSettings.sidebarAccentColor
  };
}

function parseMetadata(value: PageSectionRow["metadata"]) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return value;
}
