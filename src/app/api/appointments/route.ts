import { NextResponse } from "next/server";
import { createAppointmentBooking } from "@/lib/local-db";
import { notifyNewAppointment } from "@/lib/push-notifications";
import { requirePublicMutationOrigin } from "@/lib/security/origin-guard";
import { appointmentBookingRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const appointmentAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const originError = requirePublicMutationOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene datos válidos." }, { status: 400 });
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente en unos minutos." }, { status: 429 });
  }

  const parsed = appointmentBookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos de la cita y de la clienta." }, { status: 400 });
  }

  try {
    const item = await createAppointmentBooking({
      serviceKey: parsed.data.serviceKey,
      staffMemberId: parsed.data.staffMemberId,
      appointmentDate: parsed.data.appointmentDate,
      selectedTime: parsed.data.selectedTime,
      values: parsed.data.form
    });

    await notifyNewAppointment(item).catch((error) => {
      console.error("No se pudo notificar la nueva reservacion", error);
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la cita.";
    const status = message.includes("reservado")
      ? 409
      : /no encontrado|no está disponible|no disponible|agenda.*desactivada|no ofrece el servicio|debes aceptar|horario no está disponible/i.test(message)
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function getClientKey(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return cloudflareIp || forwardedFor || request.headers.get("x-real-ip") || "local";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  for (const [key, attempt] of appointmentAttempts) {
    if (attempt.resetAt <= now) appointmentAttempts.delete(key);
  }

  const current = appointmentAttempts.get(clientKey);

  if (!current || current.resetAt <= now) {
    appointmentAttempts.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}
