import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "gallery";
const MAX_FILE_SIZE_MB = 20;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasPermission(session.role, "manage_gallery")) {
    return NextResponse.json({ error: "No tienes permiso para subir imagenes." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
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
    if (createError) return NextResponse.json({ error: "No se pudo crear el bucket gallery." }, { status: 500 });
  } else {
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
      allowedMimeTypes: Array.from(allowedTypes.keys())
    });
    if (updateError) {
      return NextResponse.json({ error: "No se pudo actualizar el limite del bucket gallery." }, { status: 500 });
    }
  }

  const bytes = await file.arrayBuffer();
  const filename = `gallery-${Date.now()}-${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
    contentType: file.type,
    upsert: false
  });
  if (error) {
    return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
