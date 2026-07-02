-- M&S Trenzas - Esquema Postgres (Supabase)
-- Espejo del esquema que usa la app. Seguro de re-ejecutar (create ... if not exists).
--
-- Este esquema replica el modelo que la aplicación espera: ids de texto, flags
-- enteros (0/1) y horas/fechas como texto. Los datos por defecto (colaboradoras,
-- horarios, productos, menús y páginas de agenda) los siembra la propia app la
-- primera vez que arranca contra una base vacía, así que aquí solo se crean las
-- tablas.
--
-- Cómo usarlo: SQL Editor de Supabase -> pegar este archivo -> Run.

create extension if not exists "pgcrypto";

-- HORARIO GENERAL DEL NEGOCIO
create table if not exists public.business_hours (
  id text primary key,
  day_of_week integer not null unique check (day_of_week >= 0 and day_of_week <= 6),
  is_active integer not null default 1,
  start_time text not null default '09:00',
  end_time text not null default '17:00',
  slot_interval_minutes integer not null default 60,
  buffer_minutes integer not null default 0,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- EXCEPCIONES DE DISPONIBILIDAD (general)
create table if not exists public.availability_exceptions (
  id text primary key,
  exception_date text not null unique,
  is_available integer not null default 0,
  start_time text,
  end_time text,
  reason text,
  created_at text not null default now()::text
);

-- CITAS
create table if not exists public.appointment_bookings (
  id text primary key,
  service_id text,
  staff_member_id text,
  staff_name text,
  service_name text not null,
  client_name text not null,
  phone text not null,
  instagram text,
  email text,
  appointment_date text not null,
  start_time text not null,
  end_time text not null,
  duration_minutes integer not null,
  status text not null default 'pendiente',
  notes text,
  reference_image_url text,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

create index if not exists idx_appointment_bookings_date_status
  on public.appointment_bookings (appointment_date, status, start_time, end_time);

-- PERFILES (acceso / usuarios)
create table if not exists public.profiles (
  id text primary key,
  username text unique,
  full_name text not null,
  email text not null unique,
  password_hash text,
  password_history text not null default '[]',
  force_password_change integer not null default 0,
  password_updated_at text,
  phone text,
  instagram text,
  role text not null default 'colaborador',
  avatar_url text,
  is_active integer not null default 1,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- COLABORADORES
create table if not exists public.staff_members (
  id text primary key,
  profile_id text,
  auth_user_id text,
  username text unique,
  full_name text not null,
  email text not null unique,
  phone text not null,
  instagram text,
  photo_url text,
  avatar_url text,
  bio text,
  role text not null default 'colaborador',
  is_active integer not null default 1,
  specialty text,
  calendar_color text,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- PASSKEYS / WEBAUTHN (solo claves publicas; no almacena biometria)
create table if not exists public.user_passkeys (
  id text primary key,
  user_id text not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text not null default '[]',
  device_name text,
  created_at text not null default now()::text,
  last_used_at text,
  foreign key (user_id) references public.profiles(id) on delete cascade
);

-- PUSH WEB (suscripciones por dispositivo; no almacena datos del cliente)
create table if not exists public.push_subscriptions (
  id text primary key,
  user_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  device_name text,
  created_at text not null default now()::text,
  last_used_at text,
  foreign key (user_id) references public.profiles(id) on delete cascade
);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);

-- LOGS DE ENTREGA PUSH (diagnostico operacional, no contiene datos biometricos)
create table if not exists public.push_notification_logs (
  id text primary key,
  event_type text not null,
  appointment_id text,
  recipient_count integer not null default 0,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  deliveries_json text not null default '[]',
  created_at text not null default now()::text
);

create index if not exists idx_push_notification_logs_appointment
  on public.push_notification_logs (appointment_id, created_at);

-- SERVICIOS QUE OFRECE CADA COLABORADOR
create table if not exists public.staff_services (
  staff_id text not null,
  service_id text not null,
  is_active integer not null default 1,
  created_at text,
  primary key (staff_id, service_id),
  foreign key (staff_id) references public.staff_members(id) on delete cascade
);

-- HORARIO POR COLABORADOR
create table if not exists public.staff_business_hours (
  id text primary key,
  staff_id text not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  is_active integer not null default 1,
  start_time text not null default '09:00',
  end_time text not null default '17:00',
  slot_interval_minutes integer not null default 60,
  buffer_minutes integer not null default 0,
  created_at text not null default now()::text,
  updated_at text not null default now()::text,
  unique (staff_id, day_of_week),
  foreign key (staff_id) references public.staff_members(id) on delete cascade
);

-- EXCEPCIONES POR COLABORADOR
create table if not exists public.staff_availability_exceptions (
  id text primary key,
  staff_id text not null,
  exception_date text not null,
  is_available integer not null default 0,
  start_time text,
  end_time text,
  reason text,
  created_at text not null default now()::text,
  unique (staff_id, exception_date),
  foreign key (staff_id) references public.staff_members(id) on delete cascade
);

create index if not exists idx_appointment_bookings_staff_date
  on public.appointment_bookings (staff_member_id, appointment_date, status, start_time, end_time);

-- AJUSTES DEL SITIO (una sola fila, id = 1)
create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  whatsapp text not null default '',
  instagram text not null default '',
  zone text not null default '',
  hours text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  booking_policy text not null default '',
  whatsapp_message text not null default '',
  updated_at text not null default now()::text
);

-- MENÚ DE AGENDAR
-- GALERIA (fotos manuales y enlaces a Instagram sin scraping)
create table if not exists public.gallery_items (
  id text primary key,
  title text,
  category text not null default '',
  image_url text,
  instagram_url text,
  featured integer not null default 0,
  is_active integer not null default 1,
  sort_order integer not null default 0,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

create table if not exists public.booking_menu_items (
  id text primary key,
  label text not null,
  href text not null,
  description text,
  is_active integer not null default 1,
  sort_order integer not null default 0,
  updated_at text not null default now()::text
);

-- PÁGINAS DE AGENDAR (contenido editable)
create table if not exists public.agenda_pages (
  page_key text primary key,
  eyebrow text not null default '',
  title text not null default '',
  subtitle text not null default '',
  button_label text,
  button_href text,
  sections_json text not null default '[]',
  items_json text not null default '[]',
  service_slugs_json text not null default '[]',
  updated_at text not null default now()::text
);

-- OVERRIDES DE SERVICIOS BASE (los servicios base viven en el código)
create table if not exists public.service_overrides (
  service_id text primary key,
  name text not null,
  description text not null,
  category text not null,
  price_from integer,
  price_to integer,
  duration_minutes integer not null,
  requires_quote integer not null default 1,
  featured integer not null default 0,
  active integer not null default 1,
  image_url text,
  full_description text,
  gallery_images_json text not null default '[]',
  price_label text,
  duration_label text,
  booking_enabled integer not null default 1,
  whatsapp_enabled integer not null default 1,
  show_staff_selector integer not null default 1,
  allow_any_staff integer not null default 1,
  requires_deposit integer not null default 0,
  deposit_amount integer,
  show_on_home integer not null default 1,
  sort_order integer not null default 0,
  internal_notes text,
  before_care text,
  after_care text,
  whatsapp_message text,
  prep_minutes integer,
  buffer_after_minutes integer,
  recommendations_json text,
  includes_json text,
  excludes_json text,
  updated_at text not null default now()::text
);

-- SERVICIOS CUSTOM (creados desde el panel)
create table if not exists public.custom_services (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  full_description text,
  category text not null,
  image_url text not null default '/services/trenzas-africanas.jpg',
  gallery_images_json text not null default '[]',
  price_from integer,
  price_to integer,
  price_label text,
  duration_minutes integer not null default 120,
  duration_label text,
  requires_quote integer not null default 1,
  featured integer not null default 0,
  active integer not null default 1,
  booking_enabled integer not null default 1,
  whatsapp_enabled integer not null default 1,
  show_staff_selector integer not null default 1,
  allow_any_staff integer not null default 1,
  requires_deposit integer not null default 0,
  deposit_amount integer,
  show_on_home integer not null default 1,
  sort_order integer not null default 0,
  internal_notes text,
  before_care text,
  after_care text,
  whatsapp_message text,
  prep_minutes integer,
  buffer_after_minutes integer,
  recommendations_json text not null default '[]',
  includes_json text not null default '[]',
  excludes_json text not null default '[]',
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- PRODUCTOS / EXTENSIONES
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price integer,
  stock integer,
  image_url text not null default '/services/extensiones-human-hair.jpg',
  active integer not null default 1,
  sort_order integer not null default 0,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- Índices únicos parciales para usuarios (coinciden con la app)
create unique index if not exists idx_profiles_username_unique
  on public.profiles (username)
  where username is not null;

create unique index if not exists idx_staff_members_username_unique
  on public.staff_members (username)
  where username is not null;

-- STORAGE: buckets públicos para imágenes (servicios, galería, productos,
-- referencias de citas y fotos de colaboradores).
-- SUPER PANEL / EDITOR GLOBAL
create table if not exists public.app_theme_settings (
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
);

create table if not exists public.app_navigation_items (
  id text primary key,
  label text not null,
  href text not null default '#',
  parent_id text,
  sort_order integer not null default 0,
  is_active integer not null default 1,
  opens_new_tab integer not null default 0,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

create table if not exists public.app_page_sections (
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
);

create table if not exists public.app_seo_settings (
  id text primary key,
  page_key text not null unique,
  title text,
  description text,
  keywords text,
  og_image_url text,
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

create table if not exists public.app_footer_settings (
  id text primary key,
  business_name text,
  description text,
  whatsapp text,
  instagram_url text,
  address text,
  schedule text,
  copyright_text text,
  updated_at text not null default now()::text
);

create table if not exists public.app_admin_ui_settings (
  id text primary key,
  admin_title text,
  admin_subtitle text,
  sidebar_logo_url text,
  sidebar_color text,
  sidebar_accent_color text,
  updated_at text not null default now()::text
);

alter table public.app_theme_settings enable row level security;
alter table public.app_navigation_items enable row level security;
alter table public.app_page_sections enable row level security;
alter table public.app_seo_settings enable row level security;
alter table public.app_footer_settings enable row level security;
alter table public.app_admin_ui_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_theme_settings' and policyname = 'app_theme_settings_public_read') then
    create policy app_theme_settings_public_read on public.app_theme_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_navigation_items' and policyname = 'app_navigation_items_public_read') then
    create policy app_navigation_items_public_read on public.app_navigation_items for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_page_sections' and policyname = 'app_page_sections_public_read') then
    create policy app_page_sections_public_read on public.app_page_sections for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_seo_settings' and policyname = 'app_seo_settings_public_read') then
    create policy app_seo_settings_public_read on public.app_seo_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_footer_settings' and policyname = 'app_footer_settings_public_read') then
    create policy app_footer_settings_public_read on public.app_footer_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_admin_ui_settings' and policyname = 'app_admin_ui_settings_public_read') then
    create policy app_admin_ui_settings_public_read on public.app_admin_ui_settings for select to anon, authenticated using (true);
  end if;
end $$;

create or replace function public.ms_current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
    from public.profiles p
   where p.id = auth.uid()::text
      or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
   limit 1
$$;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'app_theme_settings',
    'app_navigation_items',
    'app_page_sections',
    'app_seo_settings',
    'app_footer_settings',
    'app_admin_ui_settings'
  ]
  loop
    policy_name := table_name || '_super_admin_write';
    if not exists (
      select 1
        from pg_policies
       where schemaname = 'public'
         and tablename = table_name
         and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.ms_current_role() = %L) with check (public.ms_current_role() = %L)',
        policy_name,
        table_name,
        'super_admin',
        'super_admin'
      );
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values
  ('services', 'services', true),
  ('gallery', 'gallery', true),
  ('products', 'products', true),
  ('booking-references', 'booking-references', true),
  ('staff-avatars', 'staff-avatars', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do update set public = excluded.public;
