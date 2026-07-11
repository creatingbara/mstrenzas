-- M&S Trenzas - RLS hardening
-- Safe to re-run. It enables RLS without FORCE RLS so the server-side Worker/
-- Hyperdrive connection can keep operating while Supabase anon/authenticated API
-- access is constrained by explicit policies.

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

create or replace function public.ms_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.ms_current_role() in ('super_admin', 'admin'), false)
$$;

create or replace function public.ms_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.ms_current_role() = 'super_admin', false)
$$;

create or replace function public.ms_is_own_profile(profile_id text, profile_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    profile_id = auth.uid()::text
    or lower(profile_email) = lower(coalesce(auth.jwt() ->> 'email', '')),
    false
  )
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_hours',
    'availability_exceptions',
    'appointment_bookings',
    'profiles',
    'staff_members',
    'staff_services',
    'staff_business_hours',
    'staff_availability_exceptions',
    'site_settings',
    'gallery_items',
    'booking_menu_items',
    'agenda_pages',
    'service_overrides',
    'custom_services',
    'products',
    'user_passkeys',
    'push_subscriptions',
    'push_notification_logs',
    'app_theme_settings',
    'app_navigation_items',
    'app_page_sections',
    'app_seo_settings',
    'app_footer_settings',
    'app_admin_ui_settings'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end $$;

-- Public content needed to render the client-facing website.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'business_hours',
    'availability_exceptions',
    'site_settings',
    'gallery_items',
    'booking_menu_items',
    'agenda_pages',
    'service_overrides',
    'custom_services',
    'products',
    'app_theme_settings',
    'app_navigation_items',
    'app_page_sections',
    'app_seo_settings',
    'app_footer_settings',
    'app_admin_ui_settings'
  ]
  loop
    continue when to_regclass(format('public.%I', table_name)) is null;

    policy_name := table_name || '_public_read';
    if not exists (
      select 1
        from pg_policies
       where schemaname = 'public'
         and tablename = table_name
         and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for select to anon, authenticated using (true)',
        policy_name,
        table_name
      );
    end if;
  end loop;
end $$;

-- Admin users can manage operational/public-content tables through Supabase
-- authenticated API if that path is used later. The current Worker connection
-- continues to work without depending on these policies.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'business_hours',
    'availability_exceptions',
    'appointment_bookings',
    'staff_members',
    'staff_services',
    'staff_business_hours',
    'staff_availability_exceptions',
    'site_settings',
    'gallery_items',
    'booking_menu_items',
    'agenda_pages',
    'service_overrides',
    'custom_services',
    'products',
    'push_notification_logs'
  ]
  loop
    continue when to_regclass(format('public.%I', table_name)) is null;

    policy_name := table_name || '_admin_all';
    if not exists (
      select 1
        from pg_policies
       where schemaname = 'public'
         and tablename = table_name
         and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.ms_is_admin()) with check (public.ms_is_admin())',
        policy_name,
        table_name
      );
    end if;
  end loop;
end $$;

-- Profiles are sensitive: no anonymous reads. Users can see/update their own
-- basic profile via Supabase Auth identity; admins can manage all profiles.
do $$
begin
  if to_regclass('public.profiles') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_self_read'
  ) then
    create policy profiles_self_read
      on public.profiles
      for select
      to authenticated
      using (public.ms_is_own_profile(id, email) or public.ms_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_self_update'
  ) then
    create policy profiles_self_update
      on public.profiles
      for update
      to authenticated
      using (public.ms_is_own_profile(id, email) or public.ms_is_admin())
      with check (public.ms_is_own_profile(id, email) or public.ms_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_admin_insert'
  ) then
    create policy profiles_admin_insert
      on public.profiles
      for insert
      to authenticated
      with check (public.ms_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_super_admin_delete'
  ) then
    create policy profiles_super_admin_delete
      on public.profiles
      for delete
      to authenticated
      using (public.ms_is_super_admin());
  end if;
end $$;

-- Passkeys and push subscriptions belong to the signed-in user, with admin read
-- access for support/diagnostics. No anonymous direct access.
do $$
begin
  if to_regclass('public.user_passkeys') is not null and not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'user_passkeys' and policyname = 'user_passkeys_owner_all'
  ) then
    create policy user_passkeys_owner_all
      on public.user_passkeys
      for all
      to authenticated
      using (user_id = auth.uid()::text or public.ms_is_admin())
      with check (user_id = auth.uid()::text or public.ms_is_admin());
  end if;

  if to_regclass('public.push_subscriptions') is not null and not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'push_subscriptions' and policyname = 'push_subscriptions_owner_all'
  ) then
    create policy push_subscriptions_owner_all
      on public.push_subscriptions
      for all
      to authenticated
      using (user_id = auth.uid()::text or public.ms_is_admin())
      with check (user_id = auth.uid()::text or public.ms_is_admin());
  end if;
end $$;

-- Appointment bookings are intentionally not readable by anon. Reservations are
-- created through the server/API; admins can manage them through authenticated API.
do $$
begin
  if to_regclass('public.appointment_bookings') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'appointment_bookings' and policyname = 'appointment_bookings_admin_all'
  ) then
    create policy appointment_bookings_admin_all
      on public.appointment_bookings
      for all
      to authenticated
      using (public.ms_is_admin())
      with check (public.ms_is_admin());
  end if;
end $$;
