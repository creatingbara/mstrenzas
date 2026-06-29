import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffMember, setStaffAvatarUrl } from "@/lib/local-db";

const BUCKET = "staff-avatars";
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export async function uploadStaffAvatar(staffId: string, file: File) {
  validateAvatarFile(file);
  const bytes = await file.arrayBuffer();
  validateAvatarBytes(file.type, bytes);

  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase Storage no está configurado para subir fotos.");
  }

  await ensureStaffAvatarBucket();

  const extension = ALLOWED_TYPES.get(file.type);
  const path = `${staffId}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (error) throw new Error("No se pudo subir la foto del colaborador.");

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl
  };
}

export async function deleteStaffAvatar(avatarUrl?: string | null) {
  if (!avatarUrl) return;

  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase Storage no está configurado para eliminar fotos.");
  }

  const path = avatarPathFromUrl(avatarUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error("No se pudo eliminar la foto anterior.");
}

export async function updateStaffAvatar(staffId: string, file: File | null) {
  const staff = await getStaffMember(staffId);
  if (!staff) throw new Error("Colaborador no encontrado.");

  if (!file) {
    await deleteStaffAvatar(staff.photoUrl);
    const item = await setStaffAvatarUrl(staffId, null);
    return { item, avatarUrl: null };
  }

  const uploaded = await uploadStaffAvatar(staffId, file);
  if (staff.photoUrl) {
    await deleteStaffAvatar(staff.photoUrl).catch(() => null);
  }

  const item = await setStaffAvatarUrl(staffId, uploaded.publicUrl);
  return { item, avatarUrl: uploaded.publicUrl };
}

async function ensureStaffAvatarBucket() {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase Storage no está configurado para subir fotos.");
  }

  const { error } = await supabase.storage.getBucket(BUCKET);
  if (error) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_TYPES.keys())
    });
    if (createError) throw new Error("No se pudo crear el bucket staff-avatars.");
    return;
  }

  await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_TYPES.keys())
  });
}

function validateAvatarFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Solo se permiten imágenes jpg, png o webp.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`La imagen no puede superar ${MAX_FILE_SIZE_MB}MB.`);
  }
}

function validateAvatarBytes(type: string, bytes: ArrayBuffer) {
  const signature = new Uint8Array(bytes.slice(0, 16));
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const isPng =
    signature[0] === 0x89 &&
    signature[1] === 0x50 &&
    signature[2] === 0x4e &&
    signature[3] === 0x47 &&
    signature[4] === 0x0d &&
    signature[5] === 0x0a &&
    signature[6] === 0x1a &&
    signature[7] === 0x0a;
  const isWebp =
    signature[0] === 0x52 &&
    signature[1] === 0x49 &&
    signature[2] === 0x46 &&
    signature[3] === 0x46 &&
    signature[8] === 0x57 &&
    signature[9] === 0x45 &&
    signature[10] === 0x42 &&
    signature[11] === 0x50;

  if ((type === "image/jpeg" && isJpeg) || (type === "image/png" && isPng) || (type === "image/webp" && isWebp)) return;

  throw new Error("El archivo no parece una imagen válida.");
}

function avatarPathFromUrl(avatarUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = avatarUrl.indexOf(marker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(avatarUrl.slice(markerIndex + marker.length));
}
