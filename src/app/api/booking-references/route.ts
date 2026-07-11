import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requirePublicMutationOrigin } from "@/lib/security/origin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "booking-references";
const MAX_FILE_SIZE_MB = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 8;
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export async function POST(request: Request) {
  const originError = requirePublicMutationOrigin(request);
  if (originError) return originError;

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente en unos minutos." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecciona una imagen de referencia." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Solo se permiten imagenes jpg, png o webp." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `La imagen no puede superar ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase Storage no esta configurado para subir imagenes." }, { status: 503 });
  }

  const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
  if (bucketError) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
      allowedMimeTypes: Array.from(allowedTypes.keys())
    });
    if (createError) {
      return NextResponse.json({ error: "No se pudo preparar el almacenamiento de referencias." }, { status: 500 });
    }
  } else {
    await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
      allowedMimeTypes: Array.from(allowedTypes.keys())
    });
  }

  const bytes = await file.arrayBuffer();
  const filename = `booking-reference-${Date.now()}-${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo subir la imagen de referencia." }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "local";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const current = uploadAttempts.get(clientKey);

  if (!current || current.resetAt <= now) {
    uploadAttempts.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_UPLOADS_PER_WINDOW;
}
