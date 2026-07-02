import { randomUUID } from "node:crypto";
import webpush from "web-push";
import { execute, query, queryOne } from "@/lib/db/pg";
import type { AppointmentBooking } from "@/types/appointment";

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
};

type BrowserPushSubscription = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export type PushDeliveryResult = {
  subscriptionId: string;
  endpointType: "apple" | "fcm" | "other";
  deviceName: string | null;
  ok: boolean;
  statusCode?: number;
  error?: string;
};

let schemaPromise: Promise<void> | null = null;
let vapidConfigured = false;

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function getVapidSubject() {
  return process.env.VAPID_SUBJECT || `mailto:${process.env.ADMIN_EMAIL || "admin@mstrenzas.com"}`;
}

function configureVapid() {
  if (vapidConfigured || !isPushConfigured()) return false;

  webpush.setVapidDetails(getVapidSubject(), process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  vapidConfigured = true;
  return true;
}

export function ensurePushSubscriptionsTable() {
  schemaPromise ??= (async () => {
    await execute(`
      create table if not exists push_subscriptions (
        id text primary key,
        user_id text not null references profiles(id) on delete cascade,
        endpoint text not null unique,
        p256dh text not null,
        auth text not null,
        user_agent text,
        device_name text,
        created_at text not null default (now()::text),
        last_used_at text
      )
    `);
    await execute("create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id)");
  })();

  return schemaPromise;
}

export async function upsertPushSubscription({
  userId,
  subscription,
  userAgent,
  deviceName
}: {
  userId: string;
  subscription: BrowserPushSubscription;
  userAgent?: string | null;
  deviceName?: string | null;
}) {
  const endpoint = subscription.endpoint?.trim();
  const p256dh = subscription.keys?.p256dh?.trim();
  const auth = subscription.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    throw new Error("La suscripcion push no esta completa.");
  }

  await ensurePushSubscriptionsTable();
  const row = await queryOne<PushSubscriptionRow>(
    `insert into push_subscriptions (id, user_id, endpoint, p256dh, auth, user_agent, device_name, created_at, last_used_at)
      values ($1, $2, $3, $4, $5, $6, $7, now()::text, now()::text)
      on conflict (endpoint) do update set
        user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_agent = excluded.user_agent,
        device_name = excluded.device_name,
        last_used_at = now()::text
      returning *`,
    [randomUUID(), userId, endpoint, p256dh, auth, userAgent || null, deviceName || null]
  );

  return row;
}

export async function deletePushSubscription(userId: string, endpoint: string) {
  await ensurePushSubscriptionsTable();
  return execute("delete from push_subscriptions where user_id = $1 and endpoint = $2", [userId, endpoint]);
}

async function deletePushSubscriptionByEndpoint(endpoint: string) {
  await execute("delete from push_subscriptions where endpoint = $1", [endpoint]);
}

async function getAdminPushSubscriptions() {
  await ensurePushSubscriptionsTable();
  return query<PushSubscriptionRow>(
    `select ps.*
       from push_subscriptions ps
       join profiles p on p.id = ps.user_id
      where p.is_active = 1
        and p.role in ('admin', 'super_admin')`
  );
}

export async function getUserPushSubscriptions(userId: string) {
  await ensurePushSubscriptionsTable();
  return query<PushSubscriptionRow>(
    `select *
       from push_subscriptions
      where user_id = $1
      order by last_used_at desc nulls last, created_at desc`,
    [userId]
  );
}

async function getStaffPushSubscriptions(staffMemberId: string | null | undefined) {
  if (!staffMemberId) return [];
  await ensurePushSubscriptionsTable();
  return query<PushSubscriptionRow>(
    `select ps.*
       from push_subscriptions ps
       join staff_members sm on sm.profile_id = ps.user_id
       join profiles p on p.id = ps.user_id
      where sm.id = $1
        and sm.is_active = 1
        and p.is_active = 1`,
    [staffMemberId]
  );
}

export async function notifyNewAppointment(appointment: AppointmentBooking) {
  const adminSubscriptions = await getAdminPushSubscriptions();
  const staffSubscriptions = await getStaffPushSubscriptions(appointment.staffMemberId);
  const subscriptions = uniqueSubscriptions([...adminSubscriptions, ...staffSubscriptions]);

  return sendPushNotification(subscriptions, {
    title: "Nueva reservacion",
    body: `${appointment.clientName} reservo ${appointment.serviceName} para ${appointment.appointmentDate} a las ${appointment.startTime}.`,
    url: `/admin/citas/${appointment.id}`,
    tag: `appointment-new-${appointment.id}`
  });
}

function uniqueSubscriptions(subscriptions: PushSubscriptionRow[]) {
  const seen = new Set<string>();
  return subscriptions.filter((subscription) => {
    if (seen.has(subscription.endpoint)) return false;
    seen.add(subscription.endpoint);
    return true;
  });
}

export async function notifyAppointmentConfirmed(appointment: AppointmentBooking) {
  const subscriptions = await getStaffPushSubscriptions(appointment.staffMemberId);
  return sendPushNotification(subscriptions, {
    title: "Cita confirmada",
    body: `${appointment.clientName} fue confirmada para ${appointment.serviceName} el ${appointment.appointmentDate} a las ${appointment.startTime}.`,
    url: `/admin/citas/${appointment.id}`,
    tag: `appointment-confirmed-${appointment.id}`
  });
}

export async function sendPushNotification(subscriptions: PushSubscriptionRow[], payload: PushPayload) {
  if (!subscriptions.length || !configureVapid()) return [];

  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      const resultBase = {
        subscriptionId: subscription.id,
        endpointType: getEndpointType(subscription.endpoint),
        deviceName: subscription.device_name
      } satisfies Omit<PushDeliveryResult, "ok" | "statusCode" | "error">;

      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 }
        );
        await execute("update push_subscriptions set last_used_at = now()::text where id = $1", [subscription.id]);
        return { ...resultBase, ok: true };
      } catch (error) {
        const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
        const message = error instanceof Error ? error.message : "No se pudo enviar la notificacion.";
        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscriptionByEndpoint(subscription.endpoint);
        } else {
          console.error("No se pudo enviar una notificacion push", error);
        }
        return { ...resultBase, ok: false, statusCode, error: message };
      }
    })
  );

  return results;
}

function getEndpointType(endpoint: string): PushDeliveryResult["endpointType"] {
  if (endpoint.startsWith("https://web.push.apple.com")) return "apple";
  if (endpoint.includes("fcm.googleapis.com")) return "fcm";
  return "other";
}
