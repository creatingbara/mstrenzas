import { NextResponse } from "next/server";
import { createAppointmentBooking } from "@/lib/local-db";
import { appointmentBookingSchema } from "@/lib/validations";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const appointmentAttempts = new Map<string, { count: number; resetAt: number }>();

type AppointmentRequest = {
  serviceKey?: string;
  staffMemberId?: string;
  appointmentDate?: string;
  selectedTime?: string;
  form?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AppointmentRequest;
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente en unos minutos." }, { status: 429 });
  }

  if (!body.serviceKey || !body.staffMemberId || !body.appointmentDate || !body.selectedTime) {
    return NextResponse.json({ error: "Faltan datos de la cita." }, { status: 400 });
  }

  const parsed = appointmentBookingSchema.safeParse(body.form);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos de la clienta." }, { status: 400 });
  }

  try {
    const item = await createAppointmentBooking({
      serviceKey: body.serviceKey,
      staffMemberId: body.staffMemberId,
      appointmentDate: body.appointmentDate,
      selectedTime: body.selectedTime,
      values: parsed.data
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la cita.";
    const status = message.includes("reservado") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "local";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const current = appointmentAttempts.get(clientKey);

  if (!current || current.resetAt <= now) {
    appointmentAttempts.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}
