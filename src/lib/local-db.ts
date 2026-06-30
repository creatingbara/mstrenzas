import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { defaultAgendaPages } from "@/lib/agenda-page-defaults";
import { fallbackAppointmentData, normalizeTime } from "@/lib/appointments";
import { defaultBookingMenuItems } from "@/lib/booking-menu-defaults";
import { generateAvailableSlots, getAppointmentEndTime } from "@/lib/booking/availability";
import { galleryItems as seedGalleryItems, products as seedProducts, services, siteSettings } from "@/lib/data";
import { execute, query, queryOne, withTransaction } from "@/lib/db/pg";
import { internalEmailForUsername, isInternalUsernameEmail, normalizeUsername, usernameFromName, validateUsername } from "@/lib/utils/username";
import type { AppointmentBookingFormValues } from "@/lib/validations";
import type { AppointmentBooking, AppointmentStatus, AvailabilityException, BusinessHour } from "@/types/appointment";
import type { AgendaPageContent } from "@/types/agenda-page";
import type { BookingMenuItem } from "@/types/booking-menu";
import type { GalleryItem } from "@/types/gallery";
import type { Product } from "@/types/product";
import type { Service } from "@/types/service";
import type { SiteSettings } from "@/types/settings";
import type { ServiceBookingData, StaffMember, StaffRole, StaffScheduleData, UserProfile } from "@/types/staff";

type BusinessHourRow = {
  id: string;
  day_of_week: number;
  is_active: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
};

type AvailabilityExceptionRow = {
  id: string;
  exception_date: string;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

type AppointmentBookingRow = {
  id: string;
  service_id: string | null;
  staff_member_id: string | null;
  staff_name: string | null;
  service_name: string;
  client_name: string;
  phone: string;
  instagram: string | null;
  email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  reference_image_url: string | null;
  created_at: string;
};

type StaffMemberRow = {
  id: string;
  profile_id: string | null;
  auth_user_id: string | null;
  username: string | null;
  full_name: string;
  email: string;
  phone: string;
  instagram: string | null;
  photo_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: StaffRole;
  is_active: number;
  specialty: string | null;
  calendar_color: string | null;
};

async function ensureStaffAvatarColumns() {
  await execute("alter table staff_members add column if not exists avatar_url text");
  await execute("alter table staff_members add column if not exists photo_url text");
  await execute("alter table staff_members add column if not exists instagram text");
  await execute("alter table profiles add column if not exists avatar_url text");
  await execute("alter table profiles add column if not exists instagram text");
}

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string;
  email: string;
  password_hash: string | null;
  phone: string | null;
  instagram: string | null;
  role: StaffRole;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type GalleryItemRow = {
  id: string;
  title: string | null;
  category: string;
  image_url: string | null;
  instagram_url: string | null;
  featured: number;
  is_active: number;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

// --------------------------------------------------------------------------
// Seeding idempotente: la primera vez que se usa la base de datos contra un
// Supabase vacío se cargan los datos por defecto (colaboradoras, horarios,
// productos, menús y páginas de agenda). Memorizado por proceso.
// --------------------------------------------------------------------------

let seedPromise: Promise<void> | null = null;

function ready() {
  if (!seedPromise) {
    seedPromise = seedDatabase().catch((error) => {
      // Si falla el seeding, reseteamos para reintentar en la próxima llamada.
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function seedDatabase() {
  await seedBusinessHours();
  await seedAdminProfile();
  await seedStaffMembers();
  await ensureSiteSettingsTable();
  await seedSiteSettings();
  await seedBookingMenu();
  await seedAgendaPages();
  await seedGalleryDefaults();
  await seedProductDefaults();
}

async function countRows(table: string) {
  const row = await queryOne<{ count: number }>(`select count(*)::int as count from ${table}`);
  return row?.count ?? 0;
}

async function seedBusinessHours() {
  if ((await countRows("business_hours")) > 0) return;

  await withTransaction(async (client) => {
    for (const item of fallbackAppointmentData.businessHours) {
      await client.query(
        `insert into business_hours (id, day_of_week, is_active, start_time, end_time, slot_interval_minutes, buffer_minutes)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (day_of_week) do nothing`,
        [
          randomUUID(),
          item.dayOfWeek,
          item.isActive ? 1 : 0,
          item.startTime,
          item.endTime,
          item.slotIntervalMinutes,
          item.bufferMinutes
        ]
      );
    }
  });
}

async function seedAdminProfile() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ms-trenzas.local";
  const existing = await queryOne<{ id: string }>("select id from profiles where email = $1", [adminEmail]);
  if (existing) return;

  const preferredUsername = normalizeUsername(process.env.ADMIN_USERNAME || adminEmail.split("@")[0] || "admin");
  const adminUsername = await makeUniqueUsername(preferredUsername);

  await execute(
    `insert into profiles (id, username, full_name, email, phone, role, avatar_url, is_active)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (email) do nothing`,
    [randomUUID(), adminUsername, "Administrador M&S Trenzas", adminEmail, null, "super_admin", null, 1]
  );
}

async function seedStaffMembers() {
  if ((await countRows("staff_members")) > 0) return;

  const mariaProfileId = randomUUID();
  const anaProfileId = randomUUID();
  const mariaId = randomUUID();
  const anaId = randomUUID();

  const mariaServices = ["box-braids", "knotless-braids", "trenzas-sueltas", "diseno-personalizado"];
  const anaServices = ["trenzas-pegadas", "postura-de-extensiones", "extensiones-human-hair", "trenzas-africanas"];

  await withTransaction(async (client) => {
    await client.query(
      `insert into profiles (id, username, full_name, email, phone, role, avatar_url, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (email) do nothing`,
      [mariaProfileId, "maria", "Maria - M&S Trenzas", "maria@ms-trenzas.local", "8090000001", "colaborador", null, 1]
    );
    await client.query(
      `insert into profiles (id, username, full_name, email, phone, role, avatar_url, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (email) do nothing`,
      [anaProfileId, "ana", "Ana - M&S Trenzas", "ana@ms-trenzas.local", "8090000002", "colaborador", null, 1]
    );

    await client.query(
      `insert into staff_members (id, profile_id, username, full_name, email, phone, bio, role, is_active, specialty, calendar_color)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) on conflict (id) do nothing`,
      [
        mariaId,
        mariaProfileId,
        "maria",
        "Maria - M&S Trenzas",
        "maria@ms-trenzas.local",
        "8090000001",
        "Especialista en trenzas sueltas, box braids y acabados protectores.",
        "colaborador",
        1,
        "Box Braids y Knotless",
        "#C49A5A"
      ]
    );
    await client.query(
      `insert into staff_members (id, profile_id, username, full_name, email, phone, bio, role, is_active, specialty, calendar_color)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) on conflict (id) do nothing`,
      [
        anaId,
        anaProfileId,
        "ana",
        "Ana - M&S Trenzas",
        "ana@ms-trenzas.local",
        "8090000002",
        "Especialista en trenzas pegadas, extensiones y estilos personalizados.",
        "colaborador",
        1,
        "Trenzas pegadas y extensiones",
        "#8B5E3C"
      ]
    );

    for (const slug of mariaServices) {
      const service = services.find((item) => item.slug === slug);
      if (service) {
        await client.query(
          "insert into staff_services (staff_id, service_id, is_active, created_at) values ($1, $2, 1, now()::text) on conflict do nothing",
          [mariaId, service.id]
        );
      }
    }
    for (const slug of anaServices) {
      const service = services.find((item) => item.slug === slug);
      if (service) {
        await client.query(
          "insert into staff_services (staff_id, service_id, is_active, created_at) values ($1, $2, 1, now()::text) on conflict do nothing",
          [anaId, service.id]
        );
      }
    }

    for (let day = 0; day <= 6; day += 1) {
      await client.query(
        `insert into staff_business_hours (id, staff_id, day_of_week, is_active, start_time, end_time, slot_interval_minutes, buffer_minutes)
         values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (staff_id, day_of_week) do nothing`,
        [randomUUID(), mariaId, day, [1, 3, 5].includes(day) ? 1 : 0, "09:00", "17:00", 60, 15]
      );
      await client.query(
        `insert into staff_business_hours (id, staff_id, day_of_week, is_active, start_time, end_time, slot_interval_minutes, buffer_minutes)
         values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (staff_id, day_of_week) do nothing`,
        [randomUUID(), anaId, day, [2, 4, 6].includes(day) ? 1 : 0, "09:00", day === 6 ? "15:00" : "17:00", 60, 15]
      );
    }
  });
}

async function seedSiteSettings() {
  const existing = await queryOne<{ id: number }>("select id from site_settings where id = 1");
  if (existing) return;

  await execute(
    `insert into site_settings (id, whatsapp, instagram, zone, hours, hero_title, hero_subtitle, booking_policy, whatsapp_message)
     values (1, $1, $2, $3, $4, $5, $6, $7, $8) on conflict (id) do nothing`,
    [
      siteSettings.whatsapp,
      siteSettings.instagram,
      siteSettings.zone,
      siteSettings.hours,
      siteSettings.heroTitle,
      siteSettings.heroSubtitle,
      "",
      siteSettings.whatsappMessage
    ]
  );
}

async function ensureSiteSettingsTable() {
  await execute(
    `create table if not exists site_settings (
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
    )`
  );

  await execute("alter table site_settings add column if not exists whatsapp text not null default ''");
  await execute("alter table site_settings add column if not exists instagram text not null default ''");
  await execute("alter table site_settings add column if not exists zone text not null default ''");
  await execute("alter table site_settings add column if not exists hours text not null default ''");
  await execute("alter table site_settings add column if not exists hero_title text not null default ''");
  await execute("alter table site_settings add column if not exists hero_subtitle text not null default ''");
  await execute("alter table site_settings add column if not exists booking_policy text not null default ''");
  await execute("alter table site_settings add column if not exists whatsapp_message text not null default ''");
  await execute("alter table site_settings add column if not exists updated_at text not null default now()::text");
}

async function seedBookingMenu() {
  await withTransaction(async (client) => {
    for (const item of defaultBookingMenuItems) {
      await client.query(
        `insert into booking_menu_items (id, label, href, description, is_active, sort_order, updated_at)
         values ($1, $2, $3, $4, $5, $6, now()::text)
         on conflict (id) do update set
           label = excluded.label,
           href = excluded.href,
           description = excluded.description,
           is_active = excluded.is_active,
           sort_order = excluded.sort_order,
           updated_at = now()::text`,
        [item.id, item.label, item.href, item.description ?? null, item.active ? 1 : 0, item.sortOrder]
      );
    }

    await client.query(
      `update booking_menu_items
          set is_active = 0, updated_at = now()::text
        where id in ('agendar-dama', 'agendar-caballero', 'catalogo-trenzas')`
    );
  });
}

async function seedAgendaPages() {
  if ((await countRows("agenda_pages")) > 0) return;

  await withTransaction(async (client) => {
    for (const page of defaultAgendaPages) {
      await client.query(
        `insert into agenda_pages (page_key, eyebrow, title, subtitle, button_label, button_href, sections_json, items_json, service_slugs_json)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict (page_key) do nothing`,
        [
          page.pageKey,
          page.eyebrow,
          page.title,
          page.subtitle,
          page.buttonLabel ?? null,
          page.buttonHref ?? null,
          JSON.stringify(page.sections),
          JSON.stringify(page.items),
          JSON.stringify(page.serviceSlugs)
        ]
      );
    }
  });
}

async function seedProductDefaults() {
  if ((await countRows("products")) > 0) return;

  await withTransaction(async (client) => {
    let index = 0;
    for (const product of seedProducts) {
      await client.query(
        "insert into products (id, name, description, price, stock, image_url, active, sort_order) values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (id) do nothing",
        [product.id, product.name, product.description, product.price ?? null, product.stock ?? null, product.imageUrl, product.active ? 1 : 0, index]
      );
      index += 1;
    }
  });
}

async function ensureGalleryItemsTable() {
  await execute(
    `create table if not exists gallery_items (
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
    )`
  );

  await execute("alter table gallery_items add column if not exists title text");
  await execute("alter table gallery_items add column if not exists category text not null default ''");
  await execute("alter table gallery_items add column if not exists image_url text");
  await execute("alter table gallery_items add column if not exists instagram_url text");
  await execute("alter table gallery_items add column if not exists featured integer not null default 0");
  await execute("alter table gallery_items add column if not exists is_active integer not null default 1");
  await execute("alter table gallery_items add column if not exists sort_order integer not null default 0");
  await execute("alter table gallery_items add column if not exists created_at text not null default now()::text");
  await execute("alter table gallery_items add column if not exists updated_at text not null default now()::text");
}

async function seedGalleryDefaults() {
  await ensureGalleryItemsTable();
  if ((await countRows("gallery_items")) > 0) return;

  await withTransaction(async (client) => {
    let index = 0;
    for (const item of seedGalleryItems) {
      await client.query(
        `insert into gallery_items (id, title, category, image_url, instagram_url, featured, is_active, sort_order)
         values ($1, $2, $3, $4, $5, $6, 1, $7)
         on conflict (id) do nothing`,
        [item.id, item.title ?? null, item.category, item.imageUrl ?? null, item.instagramUrl ?? null, item.featured ? 1 : 0, item.sortOrder ?? index]
      );
      index += 1;
    }
  });
}

// --------------------------------------------------------------------------
// Usuarios únicos
// --------------------------------------------------------------------------

async function isUsernameTaken(username: string, staffId?: string, profileId?: string) {
  const profile = await queryOne<{ id: string }>("select id from profiles where username = $1 and id <> $2", [username, profileId || ""]);
  const staff = await queryOne<{ id: string }>("select id from staff_members where username = $1 and id <> $2", [username, staffId || ""]);
  return Boolean(profile || staff);
}

async function makeUniqueUsername(preferred: string, staffId?: string, profileId?: string) {
  const base = normalizeUsername(usernameFromName(preferred));
  let candidate = base.length >= 3 ? base.slice(0, 30) : `${base}user`.slice(0, 30);
  let suffix = 2;

  while (await isUsernameTaken(candidate, staffId, profileId)) {
    const suffixText = String(suffix);
    candidate = `${base.slice(0, 30 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}

// --------------------------------------------------------------------------
// Mapeos
// --------------------------------------------------------------------------

function mapBusinessHour(row: BusinessHourRow): BusinessHour {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    isActive: Boolean(row.is_active),
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    slotIntervalMinutes: row.slot_interval_minutes,
    bufferMinutes: row.buffer_minutes
  };
}

function mapAvailabilityException(row: AvailabilityExceptionRow): AvailabilityException {
  return {
    id: row.id,
    exceptionDate: row.exception_date,
    isAvailable: Boolean(row.is_available),
    startTime: row.start_time ? normalizeTime(row.start_time) : null,
    endTime: row.end_time ? normalizeTime(row.end_time) : null,
    reason: row.reason
  };
}

function mapAppointmentBooking(row: AppointmentBookingRow): AppointmentBooking {
  return {
    id: row.id,
    serviceId: row.service_id,
    staffMemberId: row.staff_member_id,
    staffName: row.staff_name,
    serviceName: row.service_name,
    clientName: row.client_name,
    phone: row.phone,
    instagram: row.instagram,
    email: row.email,
    appointmentDate: row.appointment_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    durationMinutes: row.duration_minutes,
    status: row.status,
    notes: row.notes,
    referenceImageUrl: row.reference_image_url,
    createdAt: row.created_at
  };
}

async function mapStaffMember(row: StaffMemberRow): Promise<StaffMember> {
  const servicesRows = await query<{ service_id: string }>(
    "select service_id from staff_services where staff_id = $1 and coalesce(is_active, 1) = 1 order by service_id",
    [row.id]
  );
  const upcoming = await queryOne<{ count: number }>(
    `select count(*)::int as count from appointment_bookings
     where staff_member_id = $1 and status in ('pendiente', 'confirmada') and appointment_date >= to_char(now(), 'YYYY-MM-DD')`,
    [row.id]
  );
  const appointmentCount = await getStaffAppointmentCount(row.id);

  return {
    id: row.id,
    profileId: row.profile_id,
    authUserId: row.auth_user_id,
    username: row.username || usernameFromName(row.full_name),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    instagram: row.instagram,
    photoUrl: row.photo_url || row.avatar_url,
    bio: row.bio,
    role: row.role,
    isActive: Boolean(row.is_active),
    specialty: row.specialty,
    calendarColor: row.calendar_color,
    services: servicesRows.map((item) => item.service_id),
    upcomingAppointments: upcoming?.count ?? 0,
    appointmentCount
  };
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username || usernameFromName(row.full_name),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    instagram: row.instagram,
    role: row.role,
    avatarUrl: row.avatar_url,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// --------------------------------------------------------------------------
// Citas y horario general
// --------------------------------------------------------------------------

export async function getAppointmentData() {
  await ready();
  const businessHours = await query<BusinessHourRow>("select * from business_hours order by day_of_week");
  const exceptions = await query<AvailabilityExceptionRow>("select * from availability_exceptions order by exception_date");
  const appointments = await query<AppointmentBookingRow>(
    "select * from appointment_bookings where status in ('pendiente', 'confirmada') order by appointment_date, start_time"
  );

  return {
    businessHours: businessHours.map(mapBusinessHour),
    exceptions: exceptions.map(mapAvailabilityException),
    appointments: appointments.map(mapAppointmentBooking)
  };
}

async function getStaffBusinessHours(staffId: string) {
  const rows = await query<BusinessHourRow>("select * from staff_business_hours where staff_id = $1 order by day_of_week", [staffId]);
  return rows.map(mapBusinessHour);
}

async function getStaffExceptions(staffId: string) {
  const rows = await query<AvailabilityExceptionRow>("select * from staff_availability_exceptions where staff_id = $1 order by exception_date", [staffId]);
  return rows.map(mapAvailabilityException);
}

async function getStaffAppointments(staffId: string, includeAllStatuses = false) {
  const rows = await query<AppointmentBookingRow>(
    includeAllStatuses
      ? "select * from appointment_bookings where staff_member_id = $1 order by appointment_date, start_time"
      : "select * from appointment_bookings where staff_member_id = $1 and status in ('pendiente', 'confirmada') order by appointment_date, start_time",
    [staffId]
  );
  return rows.map(mapAppointmentBooking);
}

export async function getStaffMembers({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  await ready();
  const rows = await query<StaffMemberRow>(
    activeOnly ? "select * from staff_members where is_active = 1 order by full_name" : "select * from staff_members order by full_name"
  );
  return Promise.all(rows.map(mapStaffMember));
}

export async function getProfiles({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  await ready();
  const rows = await query<ProfileRow>(
    activeOnly ? "select * from profiles where is_active = 1 order by full_name" : "select * from profiles order by full_name"
  );
  return rows.map(mapProfile);
}

export async function updateProfileAccess(input: {
  profileId: string;
  username: string;
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  avatarUrl?: string | null;
  role?: StaffRole;
  isActive?: boolean;
}) {
  await ensureStaffAvatarColumns();
  const profile = await queryOne<ProfileRow>("select * from profiles where id = $1", [input.profileId]);
  if (!profile) return null;

  const username = normalizeUsername(input.username);
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  const staff = await getStaffMemberByProfileId(profile.id);
  if (await isUsernameTaken(username, staff?.id, profile.id)) {
    throw new Error("Este usuario ya está en uso.");
  }

  if (staff) {
    await saveStaffMember({
      id: staff.id,
      profileId: profile.id,
      username,
      fullName: input.fullName?.trim() || staff.fullName,
      email: resolveProfileEmail(input.email, profile.email, username),
      phone: input.phone?.trim() || staff.phone,
      instagram: input.instagram === undefined ? staff.instagram || null : input.instagram?.trim() || null,
      photoUrl: input.avatarUrl === undefined ? staff.photoUrl || null : input.avatarUrl,
      bio: staff.bio || null,
      role: input.role || profile.role,
      isActive: input.isActive ?? Boolean(profile.is_active),
      specialty: staff.specialty || null,
      calendarColor: staff.calendarColor || null
    });

    return getProfileById(profile.id);
  }

  const email = resolveProfileEmail(input.email, profile.email, username);
  const fullName = input.fullName?.trim() || profile.full_name;
  const phone = input.phone?.trim() || profile.phone;
  const instagram = input.instagram === undefined ? profile.instagram : input.instagram?.trim() || null;
  const role = input.role || profile.role;
  const nextIsActive = input.isActive ?? Boolean(profile.is_active);
  const avatarUrl = input.avatarUrl === undefined ? profile.avatar_url : input.avatarUrl;
  const row = await queryOne<ProfileRow>(
    `update profiles
       set username = $1, full_name = $2, email = $3, phone = $4, instagram = $5, role = $6, is_active = $7, avatar_url = $8, updated_at = now()::text
     where id = $9
     returning *`,
    [username, fullName, email, phone, instagram, role, nextIsActive ? 1 : 0, avatarUrl, profile.id]
  );

  return row ? mapProfile(row) : null;
}

export async function createUserProfile(input: {
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  isActive?: boolean;
}) {
  await ready();
  const username = normalizeUsername(input.username);
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);
  if (await isUsernameTaken(username)) {
    throw new Error("Este usuario ya está en uso.");
  }

  const email = input.email?.trim() || internalEmailForUsername(username);
  const row = await queryOne<ProfileRow>(
    `insert into profiles (id, username, full_name, email, phone, role, is_active, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, now()::text)
     returning *`,
    [randomUUID(), username, input.fullName.trim(), email, input.phone?.trim() || null, input.role, (input.isActive ?? true) ? 1 : 0]
  );

  return row ? mapProfile(row) : null;
}

function resolveProfileEmail(nextEmail: string | null | undefined, currentEmail: string, username: string) {
  const trimmed = nextEmail?.trim();
  if (trimmed) return trimmed;
  return isInternalUsernameEmail(currentEmail) ? internalEmailForUsername(username) : currentEmail;
}

export async function updateProfilePassword(profileId: string, password: string) {
  if (!password.trim()) throw new Error("Escribe una contraseña temporal.");

  const passwordHash = hashPassword(password);
  const row = await queryOne<ProfileRow>("update profiles set password_hash = $1, updated_at = now()::text where id = $2 returning *", [
    passwordHash,
    profileId
  ]);

  return row ? mapProfile(row) : null;
}

export async function verifyLocalProfilePassword(profileId: string, password: string) {
  const row = await queryOne<{ password_hash: string | null }>("select password_hash from profiles where id = $1", [profileId]);
  if (!row?.password_hash) return false;
  return verifyPassword(password, row.password_hash);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, expectedHash] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  const expected = Buffer.from(expectedHash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function getProfileByUsername(username: string) {
  const row = await queryOne<ProfileRow>("select * from profiles where username = $1", [normalizeUsername(username)]);
  return row ? mapProfile(row) : null;
}

export async function getProfileById(id: string) {
  const row = await queryOne<ProfileRow>("select * from profiles where id = $1", [id]);
  return row ? mapProfile(row) : null;
}

export async function getProfileAuthByUsername(username: string) {
  await ready();
  const row = await queryOne<ProfileRow>("select * from profiles where username = $1", [normalizeUsername(username)]);
  return row || null;
}

export async function getStaffMember(id: string) {
  const row = await queryOne<StaffMemberRow>("select * from staff_members where id = $1", [id]);
  return row ? mapStaffMember(row) : null;
}

export async function getStaffMemberByProfileId(profileId: string) {
  const row = await queryOne<StaffMemberRow>("select * from staff_members where profile_id = $1", [profileId]);
  return row ? mapStaffMember(row) : null;
}

export async function getStaffAppointmentCount(staffId: string) {
  const row = await queryOne<{ count: number }>("select count(*)::int as count from appointment_bookings where staff_member_id = $1", [staffId]);
  return row?.count ?? 0;
}

export async function updateStaffAuthUserId(staffId: string, authUserId: string | null) {
  const row = await queryOne<StaffMemberRow>("update staff_members set auth_user_id = $1, updated_at = now()::text where id = $2 returning *", [
    authUserId,
    staffId
  ]);
  return row ? mapStaffMember(row) : null;
}

export async function setStaffAvatarUrl(staffId: string, avatarUrl: string | null) {
  await ready();
  await ensureStaffAvatarColumns();
  const current = await queryOne<StaffMemberRow>("select * from staff_members where id = $1", [staffId]);
  if (!current) return null;

  const row = await queryOne<StaffMemberRow>(
    "update staff_members set photo_url = $1, avatar_url = $2, updated_at = now()::text where id = $3 returning *",
    [avatarUrl, avatarUrl, staffId]
  );

  if (current.profile_id) {
    await execute("update profiles set avatar_url = $1, updated_at = now()::text where id = $2", [avatarUrl, current.profile_id]);
  }

  return row ? mapStaffMember(row) : null;
}

export async function setStaffActive(staffId: string, isActive: boolean) {
  const current = await queryOne<StaffMemberRow>("select * from staff_members where id = $1", [staffId]);
  if (!current) return null;

  await execute("update staff_members set is_active = $1, updated_at = now()::text where id = $2", [isActive ? 1 : 0, staffId]);
  if (current.profile_id) {
    await execute("update profiles set is_active = $1, updated_at = now()::text where id = $2", [isActive ? 1 : 0, current.profile_id]);
  }

  return getStaffMember(staffId);
}

export async function deleteStaffMember(staffId: string) {
  const current = await queryOne<StaffMemberRow>("select * from staff_members where id = $1", [staffId]);
  if (!current) return false;

  await withTransaction(async (client) => {
    await client.query("delete from staff_services where staff_id = $1", [staffId]);
    await client.query("delete from staff_business_hours where staff_id = $1", [staffId]);
    await client.query("delete from staff_availability_exceptions where staff_id = $1", [staffId]);
    await client.query("delete from staff_members where id = $1", [staffId]);
    if (current.profile_id) {
      await client.query("delete from profiles where id = $1", [current.profile_id]);
    }
  });

  return true;
}

export async function setProfileActive(profileId: string, isActive: boolean) {
  const current = await queryOne<ProfileRow>("select * from profiles where id = $1", [profileId]);
  if (!current) return null;

  await execute("update profiles set is_active = $1, updated_at = now()::text where id = $2", [isActive ? 1 : 0, profileId]);
  const staff = await queryOne<StaffMemberRow>("select * from staff_members where profile_id = $1", [profileId]);
  if (staff) {
    await execute("update staff_members set is_active = $1, updated_at = now()::text where id = $2", [isActive ? 1 : 0, staff.id]);
  }

  return getProfileById(profileId);
}

export async function deleteUserProfile(profileId: string) {
  const profile = await queryOne<ProfileRow>("select * from profiles where id = $1", [profileId]);
  if (!profile) {
    return { ok: false, action: "not_found" as const, appointmentCount: 0 };
  }

  const staff = await queryOne<StaffMemberRow>("select * from staff_members where profile_id = $1", [profileId]);
  const appointmentCount = staff ? await getStaffAppointmentCount(staff.id) : 0;

  if (staff && appointmentCount > 0) {
    await setStaffActive(staff.id, false);
    return { ok: true, action: "deactivated" as const, appointmentCount };
  }

  await withTransaction(async (client) => {
    if (staff) {
      await client.query("delete from staff_services where staff_id = $1", [staff.id]);
      await client.query("delete from staff_business_hours where staff_id = $1", [staff.id]);
      await client.query("delete from staff_availability_exceptions where staff_id = $1", [staff.id]);
      await client.query("delete from staff_members where id = $1", [staff.id]);
    }
    await client.query("delete from profiles where id = $1", [profileId]);
  });

  return { ok: true, action: "deleted" as const, appointmentCount };
}

export async function getStaffForService(serviceId: string) {
  await ready();
  const rows = await query<StaffMemberRow>(
    `select sm.*
       from staff_members sm
       join staff_services ss on ss.staff_id = sm.id
      where ss.service_id = $1 and sm.is_active = 1 and coalesce(ss.is_active, 1) = 1
      order by sm.full_name`,
    [serviceId]
  );

  return Promise.all(rows.map(mapStaffMember));
}

export async function getServiceBookingData(serviceId: string): Promise<ServiceBookingData> {
  const staffMembers = await getStaffForService(serviceId);
  const schedulesByStaff: Record<string, StaffScheduleData> = {};

  for (const staff of staffMembers) {
    schedulesByStaff[staff.id] = {
      businessHours: await getStaffBusinessHours(staff.id),
      exceptions: await getStaffExceptions(staff.id),
      appointments: await getStaffAppointments(staff.id)
    };
  }

  return { staffMembers, schedulesByStaff };
}

export async function getAdminAppointmentData() {
  const data = await getAppointmentData();
  const appointments = await query<AppointmentBookingRow>("select * from appointment_bookings order by appointment_date desc, start_time");

  return {
    businessHours: data.businessHours,
    exceptions: data.exceptions,
    appointments: appointments.map(mapAppointmentBooking),
    staffMembers: await getStaffMembers(),
    usingFallback: false
  };
}

export async function getAdminAppointmentById(id: string) {
  const row = await queryOne<AppointmentBookingRow>("select * from appointment_bookings where id = $1", [id]);
  return row ? mapAppointmentBooking(row) : null;
}

export async function saveBusinessHours(items: BusinessHour[]) {
  await ready();
  await withTransaction(async (client) => {
    for (const item of items) {
      await client.query(
        `insert into business_hours (id, day_of_week, is_active, start_time, end_time, slot_interval_minutes, buffer_minutes, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, now()::text)
         on conflict (day_of_week) do update set
           is_active = excluded.is_active,
           start_time = excluded.start_time,
           end_time = excluded.end_time,
           slot_interval_minutes = excluded.slot_interval_minutes,
           buffer_minutes = excluded.buffer_minutes,
           updated_at = now()::text`,
        [item.id || randomUUID(), item.dayOfWeek, item.isActive ? 1 : 0, item.startTime, item.endTime, item.slotIntervalMinutes, item.bufferMinutes]
      );
    }
  });
  return (await getAppointmentData()).businessHours;
}

export async function saveAvailabilityException(input: Omit<AvailabilityException, "id">) {
  await ready();
  const row = await queryOne<AvailabilityExceptionRow>(
    `insert into availability_exceptions (id, exception_date, is_available, start_time, end_time, reason)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (exception_date) do update set
       is_available = excluded.is_available,
       start_time = excluded.start_time,
       end_time = excluded.end_time,
       reason = excluded.reason
     returning *`,
    [
      randomUUID(),
      input.exceptionDate,
      input.isAvailable ? 1 : 0,
      input.isAvailable ? input.startTime ?? null : null,
      input.isAvailable ? input.endTime ?? null : null,
      input.reason || null
    ]
  );

  return mapAvailabilityException(row as AvailabilityExceptionRow);
}

export async function getStaffScheduleData(staffId: string): Promise<StaffScheduleData> {
  return {
    businessHours: await getStaffBusinessHours(staffId),
    exceptions: await getStaffExceptions(staffId),
    appointments: await getStaffAppointments(staffId)
  };
}

export async function saveStaffBusinessHours(staffId: string, items: BusinessHour[]) {
  await withTransaction(async (client) => {
    for (const item of items) {
      await client.query(
        `insert into staff_business_hours (id, staff_id, day_of_week, is_active, start_time, end_time, slot_interval_minutes, buffer_minutes, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, now()::text)
         on conflict (staff_id, day_of_week) do update set
           is_active = excluded.is_active,
           start_time = excluded.start_time,
           end_time = excluded.end_time,
           slot_interval_minutes = excluded.slot_interval_minutes,
           buffer_minutes = excluded.buffer_minutes,
           updated_at = now()::text`,
        [item.id || randomUUID(), staffId, item.dayOfWeek, item.isActive ? 1 : 0, item.startTime, item.endTime, item.slotIntervalMinutes, item.bufferMinutes]
      );
    }
  });

  return getStaffBusinessHours(staffId);
}

export async function saveStaffMember(input: {
  id?: string;
  profileId?: string | null;
  username: string;
  fullName: string;
  email?: string | null;
  phone: string;
  instagram?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  role: StaffRole;
  isActive: boolean;
  specialty?: string | null;
  calendarColor?: string | null;
}) {
  await ready();
  await ensureStaffAvatarColumns();
  const id = input.id || randomUUID();
  const existingStaff = input.id
    ? await queryOne<Pick<StaffMemberRow, "profile_id">>("select profile_id from staff_members where id = $1", [input.id])
    : null;
  const profileIdForUsernameCheck = input.profileId ?? existingStaff?.profile_id ?? null;
  const username = normalizeUsername(input.username);
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);
  if (await isUsernameTaken(username, id, profileIdForUsernameCheck || undefined)) {
    throw new Error("Este usuario ya está en uso.");
  }

  const email = input.email?.trim() || internalEmailForUsername(username);
  const profileId = await upsertProfileForStaff({
    id: profileIdForUsernameCheck,
    username,
    fullName: input.fullName,
    email,
    phone: input.phone,
    instagram: input.instagram || null,
    role: input.role,
    avatarUrl: input.photoUrl || null,
    isActive: input.isActive
  });

  const row = await queryOne<StaffMemberRow>(
    `insert into staff_members (id, profile_id, username, full_name, email, phone, instagram, photo_url, avatar_url, bio, role, is_active, specialty, calendar_color, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $13, now()::text)
     on conflict (id) do update set
       profile_id = excluded.profile_id,
       username = excluded.username,
       full_name = excluded.full_name,
       email = excluded.email,
       phone = excluded.phone,
       instagram = excluded.instagram,
       photo_url = excluded.photo_url,
       avatar_url = excluded.avatar_url,
       bio = excluded.bio,
       role = excluded.role,
       is_active = excluded.is_active,
       specialty = excluded.specialty,
       calendar_color = excluded.calendar_color,
       updated_at = now()::text
     returning *`,
    [
      id,
      profileId,
      username,
      input.fullName,
      email,
      input.phone,
      input.instagram || null,
      input.photoUrl || null,
      input.bio || null,
      input.role,
      input.isActive ? 1 : 0,
      input.specialty || null,
      input.calendarColor || null
    ]
  );

  const staff = await mapStaffMember(row as StaffMemberRow);
  await ensureStaffHours(staff.id);
  return staff;
}

async function upsertProfileForStaff(input: {
  id?: string | null;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  instagram?: string | null;
  role: StaffRole;
  avatarUrl?: string | null;
  isActive: boolean;
}) {
  await ensureStaffAvatarColumns();
  const existing = input.id
    ? await queryOne<ProfileRow>("select * from profiles where id = $1", [input.id])
    : await queryOne<ProfileRow>("select * from profiles where email = $1", [input.email]);
  const id = existing?.id || input.id || randomUUID();

  await execute(
    `insert into profiles (id, username, full_name, email, phone, instagram, role, avatar_url, is_active, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now()::text)
     on conflict (id) do update set
       username = excluded.username,
       full_name = excluded.full_name,
       email = excluded.email,
       phone = excluded.phone,
       instagram = excluded.instagram,
       role = excluded.role,
       avatar_url = excluded.avatar_url,
       is_active = excluded.is_active,
       updated_at = now()::text`,
    [id, input.username, input.fullName, input.email, input.phone, input.instagram || null, input.role, input.avatarUrl || null, input.isActive ? 1 : 0]
  );

  return id;
}

export async function setProfileAvatarUrl(profileId: string, avatarUrl: string | null) {
  await ready();
  await ensureStaffAvatarColumns();

  const row = await queryOne<ProfileRow>(
    "update profiles set avatar_url = $1, updated_at = now()::text where id = $2 returning *",
    [avatarUrl, profileId]
  );
  if (!row) return null;

  const staff = await queryOne<StaffMemberRow>("select * from staff_members where profile_id = $1", [profileId]);
  if (staff) {
    await execute("update staff_members set photo_url = $1, avatar_url = $1, updated_at = now()::text where id = $2", [avatarUrl, staff.id]);
  }

  return mapProfile(row);
}

async function ensureStaffHours(staffId: string) {
  const count = await queryOne<{ count: number }>("select count(*)::int as count from staff_business_hours where staff_id = $1", [staffId]);
  if ((count?.count ?? 0) > 0) return;

  await saveStaffBusinessHours(
    staffId,
    fallbackAppointmentData.businessHours.map((item) => ({
      ...item,
      id: randomUUID()
    }))
  );
}

export async function saveStaffServices(staffId: string, serviceIds: string[]) {
  await withTransaction(async (client) => {
    await client.query("delete from staff_services where staff_id = $1", [staffId]);
    for (const serviceId of serviceIds) {
      await client.query(
        "insert into staff_services (staff_id, service_id, is_active, created_at) values ($1, $2, 1, now()::text)",
        [staffId, serviceId]
      );
    }
  });

  return getStaffMember(staffId);
}

export async function deleteAvailabilityException(id: string) {
  await execute("delete from availability_exceptions where id = $1", [id]);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const row = await queryOne<AppointmentBookingRow>(
    "update appointment_bookings set status = $1, updated_at = now()::text where id = $2 returning *",
    [status, id]
  );
  return row ? mapAppointmentBooking(row) : null;
}

export async function deleteAppointmentBooking(id: string) {
  const changes = await execute("delete from appointment_bookings where id = $1", [id]);
  return changes > 0;
}

export async function createAppointmentBooking({
  serviceKey,
  staffMemberId,
  appointmentDate,
  selectedTime,
  values
}: {
  serviceKey: string;
  staffMemberId: string;
  appointmentDate: string;
  selectedTime: string;
  values: AppointmentBookingFormValues;
}) {
  const service = await getServiceById(serviceKey);
  if (!service) throw new Error("Servicio no encontrado.");
  if (service.active === false) throw new Error("Este servicio no está disponible.");
  const staff = await getStaffMember(staffMemberId);
  if (!staff || !staff.isActive) throw new Error("Colaborador no disponible.");
  if (!staff.services.includes(service.id)) throw new Error("Este colaborador no ofrece el servicio seleccionado.");

  const startTime = normalizeTime(selectedTime);
  const endTime = getAppointmentEndTime(startTime, service.durationMinutes);
  const availableSlots = generateAvailableSlots({
    date: parseDateKey(appointmentDate),
    durationMinutes: service.durationMinutes,
    businessHours: await getStaffBusinessHours(staff.id),
    exceptions: await getStaffExceptions(staff.id),
    appointments: await getStaffAppointments(staff.id)
  });

  if (!availableSlots.includes(startTime)) {
    throw new Error("Ese horario no está disponible para este colaborador. Elige otra fecha u hora.");
  }

  const existing = await query<AppointmentBookingRow>(
    `select * from appointment_bookings
      where appointment_date = $1
        and staff_member_id = $2
        and status in ('pendiente', 'confirmada')
        and start_time < $3
        and end_time > $4`,
    [appointmentDate, staff.id, endTime, startTime]
  );

  if (existing.length > 0) {
    throw new Error("Ese horario ya fue reservado. Elige otra hora disponible.");
  }

  const row = await queryOne<AppointmentBookingRow>(
    `insert into appointment_bookings (
        id, service_id, staff_member_id, staff_name, service_name, client_name, phone, instagram, email,
        appointment_date, start_time, end_time, duration_minutes, status, notes, reference_image_url
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pendiente', $14, $15)
      returning *`,
    [
      randomUUID(),
      service.id,
      staff.id,
      staff.fullName,
      service.name,
      values.fullName,
      values.whatsapp,
      values.instagram || null,
      values.email || null,
      appointmentDate,
      startTime,
      endTime,
      service.durationMinutes,
      values.note || null,
      values.referenceImageUrl || null
    ]
  );

  return mapAppointmentBooking(row as AppointmentBookingRow);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getLocalDbPath() {
  return process.env.SUPABASE_DB_URL ? "supabase" : "no-database";
}

// --------------------------------------------------------------------------
// Ajustes del sitio
// --------------------------------------------------------------------------

type SiteSettingsRow = {
  whatsapp: string;
  instagram: string;
  zone: string;
  hours: string;
  hero_title: string;
  hero_subtitle: string;
  booking_policy: string;
  whatsapp_message: string;
};

function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    zone: row.zone,
    hours: row.hours,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    bookingPolicy: row.booking_policy,
    whatsappMessage: row.whatsapp_message
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await ready();
  const row = await queryOne<SiteSettingsRow>("select * from site_settings where id = 1");
  if (row) return mapSiteSettings(row);

  return {
    whatsapp: siteSettings.whatsapp,
    instagram: siteSettings.instagram,
    zone: siteSettings.zone,
    hours: siteSettings.hours,
    heroTitle: siteSettings.heroTitle,
    heroSubtitle: siteSettings.heroSubtitle,
    bookingPolicy: "",
    whatsappMessage: siteSettings.whatsappMessage
  };
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  await ready();
  const row = await queryOne<SiteSettingsRow>(
    `insert into site_settings (
        id, whatsapp, instagram, zone, hours, hero_title, hero_subtitle, booking_policy, whatsapp_message, updated_at
      )
      values (1, $1, $2, $3, $4, $5, $6, $7, $8, now()::text)
      on conflict (id) do update set
        whatsapp = excluded.whatsapp,
        instagram = excluded.instagram,
        zone = excluded.zone,
        hours = excluded.hours,
        hero_title = excluded.hero_title,
        hero_subtitle = excluded.hero_subtitle,
        booking_policy = excluded.booking_policy,
        whatsapp_message = excluded.whatsapp_message,
        updated_at = now()::text
      returning *`,
    [
      input.whatsapp.trim(),
      input.instagram.trim(),
      input.zone.trim(),
      input.hours.trim(),
      input.heroTitle.trim(),
      input.heroSubtitle.trim(),
      input.bookingPolicy.trim(),
      input.whatsappMessage.trim()
    ]
  );

  if (!row) {
    throw new Error("Supabase no devolvio la configuracion guardada.");
  }

  return mapSiteSettings(row);
}

// --------------------------------------------------------------------------
// Menú de agendar
// --------------------------------------------------------------------------

type BookingMenuItemRow = {
  id: string;
  label: string;
  href: string;
  description: string | null;
  is_active: number;
  sort_order: number;
};

function mapBookingMenuItem(row: BookingMenuItemRow): BookingMenuItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    description: row.description,
    active: Boolean(row.is_active),
    sortOrder: row.sort_order
  };
}

export async function getBookingMenuItems({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<BookingMenuItem[]> {
  await ready();
  const rows = await query<BookingMenuItemRow>(
    activeOnly
      ? "select * from booking_menu_items where is_active = 1 order by sort_order, label"
      : "select * from booking_menu_items order by sort_order, label"
  );

  return rows.map(mapBookingMenuItem);
}

export async function saveBookingMenuItems(items: BookingMenuItem[]): Promise<BookingMenuItem[]> {
  await withTransaction(async (client) => {
    let index = 0;
    for (const item of items) {
      await client.query(
        `update booking_menu_items
           set label = $1, href = $2, description = $3, is_active = $4, sort_order = $5, updated_at = now()::text
         where id = $6`,
        [item.label.trim(), item.href.trim(), item.description?.trim() || null, item.active ? 1 : 0, item.sortOrder ?? index, item.id]
      );
      index += 1;
    }
  });

  return getBookingMenuItems();
}

// --------------------------------------------------------------------------
// Galeria
// --------------------------------------------------------------------------

function mapGalleryItem(row: GalleryItemRow): GalleryItem {
  const imageUrl = row.image_url && !isInstagramUrl(row.image_url) ? row.image_url : undefined;
  const instagramUrl = row.instagram_url || (row.image_url && isInstagramUrl(row.image_url) ? row.image_url : null);

  return {
    id: row.id,
    title: row.title ?? undefined,
    category: row.category,
    imageUrl,
    instagramUrl,
    featured: Boolean(row.featured),
    active: Boolean(row.is_active),
    sortOrder: row.sort_order
  };
}

export async function getGalleryItems({
  activeOnly = false,
  featuredOnly = false
}: {
  activeOnly?: boolean;
  featuredOnly?: boolean;
} = {}): Promise<GalleryItem[]> {
  await ready();

  const filters: string[] = [];
  if (activeOnly) filters.push("is_active = 1");
  if (featuredOnly) filters.push("featured = 1");

  const rows = await query<GalleryItemRow>(
    `select * from gallery_items${filters.length ? ` where ${filters.join(" and ")}` : ""} order by sort_order, created_at`
  );
  return rows.map(mapGalleryItem);
}

export async function saveGalleryItem(input: GalleryItem): Promise<GalleryItem> {
  await ready();
  await ensureGalleryItemsTable();

  const id = input.id || randomUUID();
  const title = input.title?.trim() || null;
  const category = input.category.trim() || "Instagram";
  let imageUrl = input.imageUrl?.trim() || null;
  let instagramUrl = input.instagramUrl?.trim() || null;

  if (imageUrl && isInstagramUrl(imageUrl)) {
    instagramUrl = instagramUrl || imageUrl;
    imageUrl = null;
  }

  if (!imageUrl && !instagramUrl) {
    throw new Error("Agrega una imagen manual o una URL de Instagram.");
  }

  if (instagramUrl && !isInstagramUrl(instagramUrl)) {
    throw new Error("La URL de Instagram debe ser un enlace valido de instagram.com.");
  }

  if (imageUrl && !isAllowedGalleryImageUrl(imageUrl)) {
    throw new Error("La imagen debe ser una ruta local, Supabase Storage o images.unsplash.com.");
  }

  const row = await queryOne<GalleryItemRow>(
    `insert into gallery_items (id, title, category, image_url, instagram_url, featured, is_active, sort_order, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, now()::text)
     on conflict (id) do update set
       title = excluded.title,
       category = excluded.category,
       image_url = excluded.image_url,
       instagram_url = excluded.instagram_url,
       featured = excluded.featured,
       is_active = excluded.is_active,
       sort_order = excluded.sort_order,
       updated_at = now()::text
     returning *`,
    [
      id,
      title,
      category,
      imageUrl,
      instagramUrl,
      input.featured ? 1 : 0,
      input.active === false ? 0 : 1,
      input.sortOrder ?? 0
    ]
  );

  if (!row) throw new Error("No se pudo guardar la publicacion de galeria.");
  return mapGalleryItem(row);
}

export async function hideGalleryItem(id: string) {
  await ready();
  const row = await queryOne<GalleryItemRow>(
    "update gallery_items set is_active = 0, updated_at = now()::text where id = $1 returning *",
    [id]
  );
  return row ? mapGalleryItem(row) : null;
}

export async function deleteGalleryItem(id: string) {
  await ready();
  const row = await queryOne<GalleryItemRow>("delete from gallery_items where id = $1 returning *", [id]);
  return row ? mapGalleryItem(row) : null;
}

function isInstagramUrl(value: string) {
  try {
    const url = new URL(value);
    return ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase()) && url.protocol === "https:";
  } catch {
    return false;
  }
}

function isAllowedGalleryImageUrl(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname.endsWith(".supabase.co") || url.hostname === "images.unsplash.com");
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// Páginas de agendar
// --------------------------------------------------------------------------

type AgendaPageRow = {
  page_key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  button_label: string | null;
  button_href: string | null;
  sections_json: string;
  items_json: string;
  service_slugs_json: string | null;
};

function mapAgendaPage(row: AgendaPageRow): AgendaPageContent {
  const fallback = defaultAgendaPages.find((page) => page.pageKey === row.page_key);
  const serviceSlugs = parseJsonList(row.service_slugs_json, []);

  return {
    pageKey: row.page_key,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    buttonLabel: row.button_label,
    buttonHref: row.button_href,
    sections: parseAgendaSections(row.sections_json),
    items: parseJsonList(row.items_json, []),
    serviceSlugs: serviceSlugs.length ? serviceSlugs : fallback?.serviceSlugs ?? []
  };
}

function parseAgendaSections(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title.trim() : "",
        text: typeof item?.text === "string" ? item.text.trim() : undefined
      }))
      .filter((item) => item.title);
  } catch {
    return [];
  }
}

export async function getAgendaPages() {
  await ready();
  const rows = await query<AgendaPageRow>("select * from agenda_pages order by page_key");
  return rows.map(mapAgendaPage);
}

export async function getAgendaPage(pageKey: string): Promise<AgendaPageContent> {
  await ready();
  const row = await queryOne<AgendaPageRow>("select * from agenda_pages where page_key = $1", [pageKey]);
  if (row) return mapAgendaPage(row);

  const fallback = defaultAgendaPages.find((page) => page.pageKey === pageKey);
  if (fallback) return fallback;

  return {
    pageKey,
    eyebrow: "Agendar Cita",
    title: "",
    subtitle: "",
    buttonLabel: null,
    buttonHref: null,
    sections: [],
    items: [],
    serviceSlugs: []
  };
}

export async function saveAgendaPages(pages: AgendaPageContent[]) {
  await withTransaction(async (client) => {
    for (const page of pages) {
      await client.query(
        `update agenda_pages
           set eyebrow = $1, title = $2, subtitle = $3, button_label = $4, button_href = $5,
               sections_json = $6, items_json = $7, service_slugs_json = $8, updated_at = now()::text
         where page_key = $9`,
        [
          page.eyebrow.trim(),
          page.title.trim(),
          page.subtitle.trim(),
          page.buttonLabel?.trim() || null,
          page.buttonHref?.trim() || null,
          JSON.stringify(page.sections),
          JSON.stringify(page.items),
          JSON.stringify(page.serviceSlugs),
          page.pageKey
        ]
      );
    }
  });

  return getAgendaPages();
}

// --------------------------------------------------------------------------
// Servicios (base + overrides + custom)
// --------------------------------------------------------------------------

type ServiceOverrideRow = {
  service_id: string;
  name: string;
  description: string;
  full_description: string | null;
  category: string;
  image_url: string | null;
  gallery_images_json: string | null;
  price_from: number | null;
  price_to: number | null;
  price_label: string | null;
  duration_minutes: number;
  duration_label: string | null;
  requires_quote: number;
  featured: number;
  active: number;
  booking_enabled: number;
  whatsapp_enabled: number;
  show_staff_selector: number;
  allow_any_staff: number;
  requires_deposit: number;
  deposit_amount: number | null;
  show_on_home: number;
  sort_order: number;
  internal_notes: string | null;
  before_care: string | null;
  after_care: string | null;
  whatsapp_message: string | null;
  prep_minutes: number | null;
  buffer_after_minutes: number | null;
  recommendations_json: string | null;
  includes_json: string | null;
  excludes_json: string | null;
  is_deleted?: number;
};

type CustomServiceRow = Omit<ServiceOverrideRow, "service_id"> & {
  id: string;
  slug: string;
};

async function ensureServiceDeletionColumns() {
  await execute("alter table if exists service_overrides add column if not exists is_deleted integer not null default 0");
}

export type ServiceOverridePatch = {
  slug?: string;
  name?: string;
  description?: string;
  fullDescription?: string | null;
  category?: string;
  priceFrom?: number | null;
  priceTo?: number | null;
  priceLabel?: string | null;
  durationMinutes?: number;
  durationLabel?: string | null;
  requiresQuote?: boolean;
  featured?: boolean;
  active?: boolean;
  imageUrl?: string;
  galleryImages?: string[];
  bookingEnabled?: boolean;
  whatsappEnabled?: boolean;
  showStaffSelector?: boolean;
  allowAnyStaff?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number | null;
  showOnHome?: boolean;
  sortOrder?: number;
  internalNotes?: string | null;
  beforeCare?: string | null;
  afterCare?: string | null;
  whatsappMessage?: string | null;
  prepMinutes?: number | null;
  bufferAfterMinutes?: number | null;
  recommendations?: string[];
  includes?: string[];
  excludes?: string[];
};

function mergeServiceWithOverride(base: Service, override?: ServiceOverrideRow): Service {
  if (!override) {
    return {
      ...base,
      fullDescription: base.description,
      galleryImages: [],
      priceLabel: null,
      durationLabel: null,
      bookingEnabled: true,
      whatsappEnabled: true,
      showStaffSelector: true,
      allowAnyStaff: true,
      requiresDeposit: false,
      depositAmount: null,
      showOnHome: base.featured ?? true,
      sortOrder: Number(base.id) || 0,
      internalNotes: null,
      beforeCare: null,
      afterCare: null,
      whatsappMessage: null,
      prepMinutes: null,
      bufferAfterMinutes: null,
      source: "base"
    };
  }

  return {
    ...base,
    name: override.name,
    description: override.description,
    fullDescription: override.full_description || override.description,
    category: override.category,
    imageUrl: override.image_url || base.imageUrl,
    galleryImages: parseJsonList(override.gallery_images_json, []),
    priceFrom: override.price_from,
    priceTo: override.price_to,
    priceLabel: override.price_label,
    durationMinutes: override.duration_minutes,
    durationLabel: override.duration_label,
    requiresQuote: Boolean(override.requires_quote),
    featured: Boolean(override.featured),
    active: Boolean(override.active),
    bookingEnabled: Boolean(override.booking_enabled),
    whatsappEnabled: Boolean(override.whatsapp_enabled),
    showStaffSelector: Boolean(override.show_staff_selector),
    allowAnyStaff: Boolean(override.allow_any_staff),
    requiresDeposit: Boolean(override.requires_deposit),
    depositAmount: override.deposit_amount,
    showOnHome: Boolean(override.show_on_home),
    sortOrder: override.sort_order,
    internalNotes: override.internal_notes,
    beforeCare: override.before_care,
    afterCare: override.after_care,
    whatsappMessage: override.whatsapp_message,
    prepMinutes: override.prep_minutes,
    bufferAfterMinutes: override.buffer_after_minutes,
    source: "base",
    recommendations: parseJsonList(override.recommendations_json, base.recommendations),
    includes: parseJsonList(override.includes_json, base.includes),
    excludes: parseJsonList(override.excludes_json, base.excludes)
  };
}

function mapCustomService(row: CustomServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    fullDescription: row.full_description || row.description,
    category: row.category,
    imageUrl: row.image_url || "/services/trenzas-africanas.jpg",
    galleryImages: parseJsonList(row.gallery_images_json, []),
    priceFrom: row.price_from,
    priceTo: row.price_to,
    priceLabel: row.price_label,
    durationMinutes: row.duration_minutes,
    durationLabel: row.duration_label,
    requiresQuote: Boolean(row.requires_quote),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    bookingEnabled: Boolean(row.booking_enabled),
    whatsappEnabled: Boolean(row.whatsapp_enabled),
    showStaffSelector: Boolean(row.show_staff_selector),
    allowAnyStaff: Boolean(row.allow_any_staff),
    requiresDeposit: Boolean(row.requires_deposit),
    depositAmount: row.deposit_amount,
    showOnHome: Boolean(row.show_on_home),
    sortOrder: row.sort_order,
    internalNotes: row.internal_notes,
    beforeCare: row.before_care,
    afterCare: row.after_care,
    whatsappMessage: row.whatsapp_message,
    prepMinutes: row.prep_minutes,
    bufferAfterMinutes: row.buffer_after_minutes,
    source: "custom",
    recommendations: parseJsonList(row.recommendations_json, []),
    includes: parseJsonList(row.includes_json, []),
    excludes: parseJsonList(row.excludes_json, [])
  };
}

function parseJsonList(value: string | null, fallback: string[]) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : fallback;
  } catch {
    return fallback;
  }
}

export async function getServices(): Promise<Service[]> {
  await ready();
  await ensureServiceDeletionColumns();
  const rows = await query<ServiceOverrideRow>("select * from service_overrides");
  const overrides = new Map(rows.map((row) => [row.service_id, row]));
  const baseServices = services
    .filter((base) => overrides.get(base.id)?.is_deleted !== 1)
    .map((base) => mergeServiceWithOverride(base, overrides.get(base.id)));
  const customRows = await query<CustomServiceRow>("select * from custom_services");
  return [...baseServices, ...customRows.map(mapCustomService)].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getServiceById(serviceId: string): Promise<Service | null> {
  await ready();
  await ensureServiceDeletionColumns();
  const base = services.find((item) => item.id === serviceId || item.slug === serviceId);
  if (base) {
    const override = await queryOne<ServiceOverrideRow>("select * from service_overrides where service_id = $1", [base.id]);
    if (override?.is_deleted === 1) return null;
    return mergeServiceWithOverride(base, override);
  }

  const custom = await queryOne<CustomServiceRow>("select * from custom_services where id = $1 or slug = $2", [serviceId, serviceId]);
  return custom ? mapCustomService(custom) : null;
}

export async function updateServiceOverride(serviceId: string, patch: ServiceOverridePatch): Promise<Service | null> {
  await ensureServiceDeletionColumns();
  const current = await getServiceById(serviceId);
  if (!current) return null;

  const next: Service = {
    ...current,
    slug: patch.slug?.trim() || current.slug,
    name: patch.name?.trim() || current.name,
    description: patch.description?.trim() ?? current.description,
    fullDescription: patch.fullDescription?.trim() ?? current.fullDescription ?? current.description,
    category: patch.category?.trim() || current.category,
    priceFrom: patch.priceFrom === undefined ? current.priceFrom : patch.priceFrom,
    priceTo: patch.priceTo === undefined ? current.priceTo : patch.priceTo,
    priceLabel: patch.priceLabel === undefined ? current.priceLabel ?? null : patch.priceLabel,
    durationMinutes: patch.durationMinutes ?? current.durationMinutes,
    durationLabel: patch.durationLabel === undefined ? current.durationLabel ?? null : patch.durationLabel,
    requiresQuote: patch.requiresQuote ?? current.requiresQuote,
    featured: patch.featured ?? current.featured ?? false,
    active: patch.active ?? current.active ?? true,
    imageUrl: patch.imageUrl?.trim() || current.imageUrl,
    galleryImages: patch.galleryImages ?? current.galleryImages ?? [],
    bookingEnabled: patch.bookingEnabled ?? current.bookingEnabled ?? true,
    whatsappEnabled: patch.whatsappEnabled ?? current.whatsappEnabled ?? true,
    showStaffSelector: patch.showStaffSelector ?? current.showStaffSelector ?? true,
    allowAnyStaff: patch.allowAnyStaff ?? current.allowAnyStaff ?? true,
    requiresDeposit: patch.requiresDeposit ?? current.requiresDeposit ?? false,
    depositAmount: patch.depositAmount === undefined ? current.depositAmount ?? null : patch.depositAmount,
    showOnHome: patch.showOnHome ?? current.showOnHome ?? true,
    sortOrder: patch.sortOrder ?? current.sortOrder ?? 0,
    internalNotes: patch.internalNotes === undefined ? current.internalNotes ?? null : patch.internalNotes,
    beforeCare: patch.beforeCare === undefined ? current.beforeCare ?? null : patch.beforeCare,
    afterCare: patch.afterCare === undefined ? current.afterCare ?? null : patch.afterCare,
    whatsappMessage: patch.whatsappMessage === undefined ? current.whatsappMessage ?? null : patch.whatsappMessage,
    prepMinutes: patch.prepMinutes === undefined ? current.prepMinutes ?? null : patch.prepMinutes,
    bufferAfterMinutes: patch.bufferAfterMinutes === undefined ? current.bufferAfterMinutes ?? null : patch.bufferAfterMinutes,
    recommendations: patch.recommendations ?? current.recommendations,
    includes: patch.includes ?? current.includes,
    excludes: patch.excludes ?? current.excludes
  };

  if (current.source === "custom") {
    const row = await queryOne<CustomServiceRow>(
      `update custom_services
         set slug = $1, name = $2, description = $3, full_description = $4, category = $5, image_url = $6, gallery_images_json = $7,
             price_from = $8, price_to = $9, price_label = $10, duration_minutes = $11, duration_label = $12,
             requires_quote = $13, featured = $14, active = $15, booking_enabled = $16, whatsapp_enabled = $17,
             show_staff_selector = $18, allow_any_staff = $19, requires_deposit = $20, deposit_amount = $21,
             show_on_home = $22, sort_order = $23, internal_notes = $24, before_care = $25, after_care = $26,
             whatsapp_message = $27, prep_minutes = $28, buffer_after_minutes = $29,
             recommendations_json = $30, includes_json = $31, excludes_json = $32, updated_at = now()::text
       where id = $33
       returning *`,
      [
        next.slug,
        next.name,
        next.description,
        next.fullDescription ?? null,
        next.category,
        next.imageUrl,
        JSON.stringify(next.galleryImages ?? []),
        next.priceFrom ?? null,
        next.priceTo ?? null,
        next.priceLabel?.trim() || null,
        next.durationMinutes,
        next.durationLabel?.trim() || null,
        next.requiresQuote ? 1 : 0,
        next.featured ? 1 : 0,
        next.active ? 1 : 0,
        next.bookingEnabled ? 1 : 0,
        next.whatsappEnabled ? 1 : 0,
        next.showStaffSelector ? 1 : 0,
        next.allowAnyStaff ? 1 : 0,
        next.requiresDeposit ? 1 : 0,
        next.depositAmount ?? null,
        next.showOnHome ? 1 : 0,
        next.sortOrder ?? 0,
        next.internalNotes?.trim() || null,
        next.beforeCare?.trim() || null,
        next.afterCare?.trim() || null,
        next.whatsappMessage?.trim() || null,
        next.prepMinutes ?? null,
        next.bufferAfterMinutes ?? null,
        JSON.stringify(next.recommendations),
        JSON.stringify(next.includes),
        JSON.stringify(next.excludes),
        current.id
      ]
    );

    return row ? mapCustomService(row) : null;
  }

  const row = await queryOne<ServiceOverrideRow>(
    `insert into service_overrides (
        service_id, name, description, full_description, category, image_url, gallery_images_json,
        price_from, price_to, price_label, duration_minutes, duration_label,
        requires_quote, featured, active, booking_enabled, whatsapp_enabled,
        show_staff_selector, allow_any_staff, requires_deposit, deposit_amount,
        show_on_home, sort_order, internal_notes, before_care, after_care,
        whatsapp_message, prep_minutes, buffer_after_minutes,
        recommendations_json, includes_json, excludes_json, updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, now()::text)
      on conflict (service_id) do update set
        name = excluded.name,
        description = excluded.description,
        full_description = excluded.full_description,
        category = excluded.category,
        image_url = excluded.image_url,
        gallery_images_json = excluded.gallery_images_json,
        price_from = excluded.price_from,
        price_to = excluded.price_to,
        price_label = excluded.price_label,
        duration_minutes = excluded.duration_minutes,
        duration_label = excluded.duration_label,
        requires_quote = excluded.requires_quote,
        featured = excluded.featured,
        active = excluded.active,
        booking_enabled = excluded.booking_enabled,
        whatsapp_enabled = excluded.whatsapp_enabled,
        show_staff_selector = excluded.show_staff_selector,
        allow_any_staff = excluded.allow_any_staff,
        requires_deposit = excluded.requires_deposit,
        deposit_amount = excluded.deposit_amount,
        show_on_home = excluded.show_on_home,
        sort_order = excluded.sort_order,
        internal_notes = excluded.internal_notes,
        before_care = excluded.before_care,
        after_care = excluded.after_care,
        whatsapp_message = excluded.whatsapp_message,
        prep_minutes = excluded.prep_minutes,
        buffer_after_minutes = excluded.buffer_after_minutes,
        recommendations_json = excluded.recommendations_json,
        includes_json = excluded.includes_json,
        excludes_json = excluded.excludes_json,
        is_deleted = 0,
        updated_at = now()::text
      returning *`,
    [
      current.id,
      next.name,
      next.description,
      next.fullDescription ?? null,
      next.category,
      next.imageUrl,
      JSON.stringify(next.galleryImages ?? []),
      next.priceFrom ?? null,
      next.priceTo ?? null,
      next.priceLabel?.trim() || null,
      next.durationMinutes,
      next.durationLabel?.trim() || null,
      next.requiresQuote ? 1 : 0,
      next.featured ? 1 : 0,
      next.active ? 1 : 0,
      next.bookingEnabled ? 1 : 0,
      next.whatsappEnabled ? 1 : 0,
      next.showStaffSelector ? 1 : 0,
      next.allowAnyStaff ? 1 : 0,
      next.requiresDeposit ? 1 : 0,
      next.depositAmount ?? null,
      next.showOnHome ? 1 : 0,
      next.sortOrder ?? 0,
      next.internalNotes?.trim() || null,
      next.beforeCare?.trim() || null,
      next.afterCare?.trim() || null,
      next.whatsappMessage?.trim() || null,
      next.prepMinutes ?? null,
      next.bufferAfterMinutes ?? null,
      JSON.stringify(next.recommendations),
      JSON.stringify(next.includes),
      JSON.stringify(next.excludes)
    ]
  );

  const base = services.find((item) => item.id === current.id);
  return base ? mergeServiceWithOverride(base, row as ServiceOverrideRow) : next;
}

export async function deleteService(serviceId: string) {
  await ready();
  await ensureServiceDeletionColumns();
  const current = await getServiceById(serviceId);
  if (!current) return null;

  await execute("delete from staff_services where service_id = $1", [current.id]);

  if (current.source === "custom") {
    const row = await queryOne<CustomServiceRow>("delete from custom_services where id = $1 returning *", [current.id]);
    return row ? mapCustomService(row) : current;
  }

  await updateServiceOverride(current.id, {
    active: false,
    bookingEnabled: false,
    showOnHome: false,
    featured: false
  });
  await execute("update service_overrides set is_deleted = 1, updated_at = now()::text where service_id = $1", [current.id]);
  return current;
}

export async function createCustomService(input: ServiceOverridePatch): Promise<Service> {
  await ready();
  const id = randomUUID();
  const baseSlug =
    (input.slug || input.name || "servicio")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `servicio-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;
  while (await getServiceById(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  const order = await queryOne<{ next: number }>("select coalesce(max(sort_order), 0)::int + 1 as next from custom_services");

  const row = await queryOne<CustomServiceRow>(
    `insert into custom_services (
        id, slug, name, description, full_description, category, image_url, gallery_images_json,
        price_from, price_to, price_label, duration_minutes, duration_label,
        requires_quote, featured, active, booking_enabled, whatsapp_enabled,
        show_staff_selector, allow_any_staff, requires_deposit, deposit_amount,
        show_on_home, sort_order, internal_notes, before_care, after_care,
        whatsapp_message, prep_minutes, buffer_after_minutes,
        recommendations_json, includes_json, excludes_json
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
      returning *`,
    [
      id,
      slug,
      input.name?.trim() || "Nuevo servicio",
      input.description?.trim() || "Describe este servicio.",
      input.fullDescription?.trim() || null,
      input.category?.trim() || "Servicios",
      input.imageUrl?.trim() || "/services/trenzas-africanas.jpg",
      JSON.stringify(input.galleryImages ?? []),
      input.priceFrom ?? null,
      input.priceTo ?? null,
      input.priceLabel?.trim() || null,
      input.durationMinutes ?? 120,
      input.durationLabel?.trim() || null,
      input.requiresQuote === false ? 0 : 1,
      input.featured ? 1 : 0,
      input.active === false ? 0 : 1,
      input.bookingEnabled === false ? 0 : 1,
      input.whatsappEnabled === false ? 0 : 1,
      input.showStaffSelector === false ? 0 : 1,
      input.allowAnyStaff === false ? 0 : 1,
      input.requiresDeposit ? 1 : 0,
      input.depositAmount ?? null,
      input.showOnHome === false ? 0 : 1,
      input.sortOrder ?? order?.next ?? 0,
      input.internalNotes?.trim() || null,
      input.beforeCare?.trim() || null,
      input.afterCare?.trim() || null,
      input.whatsappMessage?.trim() || null,
      input.prepMinutes ?? null,
      input.bufferAfterMinutes ?? null,
      JSON.stringify(input.recommendations ?? []),
      JSON.stringify(input.includes ?? []),
      JSON.stringify(input.excludes ?? [])
    ]
  );

  return mapCustomService(row as CustomServiceRow);
}

export async function getServiceAssignedStaffCount(serviceId: string) {
  const row = await queryOne<{ count: number }>(
    `select count(*)::int as count
       from staff_services ss
       join staff_members sm on sm.id = ss.staff_id
      where ss.service_id = $1 and sm.is_active = 1 and coalesce(ss.is_active, 1) = 1`,
    [serviceId]
  );

  return row?.count ?? 0;
}

export async function getServiceStaffIds(serviceId: string) {
  const rows = await query<{ staff_id: string }>(
    "select staff_id from staff_services where service_id = $1 and coalesce(is_active, 1) = 1 order by staff_id",
    [serviceId]
  );

  return rows.map((row) => row.staff_id);
}

export async function saveServiceStaff(serviceId: string, staffIds: string[]) {
  await withTransaction(async (client) => {
    await client.query("delete from staff_services where service_id = $1", [serviceId]);
    for (const staffId of staffIds) {
      const staff = await client.query<StaffMemberRow>("select * from staff_members where id = $1", [staffId]);
      if (staff.rows[0] && staff.rows[0].is_active) {
        await client.query(
          "insert into staff_services (staff_id, service_id, is_active, created_at) values ($1, $2, 1, now()::text)",
          [staffId, serviceId]
        );
      }
    }
  });

  return getServiceStaffIds(serviceId);
}

// --------------------------------------------------------------------------
// Productos
// --------------------------------------------------------------------------

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  stock: number | null;
  image_url: string;
  active: number;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    imageUrl: row.image_url,
    active: Boolean(row.active)
  };
}

export async function getProducts({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<Product[]> {
  await ready();
  const rows = await query<ProductRow>(
    activeOnly
      ? "select * from products where active = 1 order by sort_order, created_at"
      : "select * from products order by sort_order, created_at"
  );

  return rows.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await queryOne<ProductRow>("select * from products where id = $1", [id]);
  return row ? mapProduct(row) : null;
}

export async function createProduct(input: {
  name: string;
  description: string;
  price?: number | null;
  stock?: number | null;
  imageUrl?: string | null;
  active?: boolean;
}): Promise<Product> {
  await ready();
  const order = await queryOne<{ next: number }>("select coalesce(max(sort_order), -1)::int + 1 as next from products");

  const row = await queryOne<ProductRow>(
    `insert into products (id, name, description, price, stock, image_url, active, sort_order)
     values ($1, $2, $3, $4, $5, coalesce($6, '/services/extensiones-human-hair.jpg'), $7, $8)
     returning *`,
    [
      randomUUID(),
      input.name.trim(),
      input.description.trim(),
      input.price ?? null,
      input.stock ?? null,
      input.imageUrl?.trim() || null,
      input.active === false ? 0 : 1,
      order?.next ?? 0
    ]
  );

  return mapProduct(row as ProductRow);
}

export async function updateProduct(
  id: string,
  patch: { name?: string; description?: string; price?: number | null; stock?: number | null; imageUrl?: string | null; active?: boolean }
): Promise<Product | null> {
  const current = await getProductById(id);
  if (!current) return null;

  const row = await queryOne<ProductRow>(
    `update products
       set name = $1, description = $2, price = $3, stock = $4, image_url = $5, active = $6, updated_at = now()::text
     where id = $7
     returning *`,
    [
      patch.name?.trim() || current.name,
      patch.description?.trim() ?? current.description,
      patch.price === undefined ? current.price ?? null : patch.price,
      patch.stock === undefined ? current.stock ?? null : patch.stock,
      patch.imageUrl?.trim() || current.imageUrl,
      (patch.active ?? current.active) ? 1 : 0,
      id
    ]
  );

  return row ? mapProduct(row) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const changes = await execute("delete from products where id = $1", [id]);
  return changes > 0;
}
