import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "gallery";
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
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
    return NextResponse.json({ error: "No tienes permiso para importar imagenes." }, { status: 403 });
  }

  const { instagramUrl } = (await request.json().catch(() => ({}))) as { instagramUrl?: string };
  if (!instagramUrl || !isInstagramUrl(instagramUrl)) {
    return NextResponse.json({ error: "Pega un enlace valido de Instagram." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase Storage no esta configurado para guardar la imagen." }, { status: 503 });
  }

  try {
    const pageResponse = await fetch(instagramUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 M&S Trenzas gallery preview"
      },
      redirect: "follow"
    });

    if (!pageResponse.ok) {
      return NextResponse.json({ error: "Instagram no permitio leer la publicacion." }, { status: 502 });
    }

    const html = await pageResponse.text();
    const imageUrl = extractBestInstagramImage(html);
    if (!imageUrl) {
      return NextResponse.json({ error: "No pude encontrar una imagen publica en ese enlace de Instagram." }, { status: 404 });
    }

    const imageResponse = await fetch(imageUrl, {
      headers: { "user-agent": "Mozilla/5.0 M&S Trenzas gallery preview" },
      redirect: "follow"
    });
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "No se pudo descargar la imagen de Instagram." }, { status: 502 });
    }

    const contentType = normalizeContentType(imageResponse.headers.get("content-type"));
    const extension = allowedTypes.get(contentType);
    if (!extension) {
      return NextResponse.json({ error: "Instagram devolvio una imagen en un formato no permitido." }, { status: 400 });
    }

    const bytes = await imageResponse.arrayBuffer();
    if (bytes.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `La imagen de Instagram supera ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
    }

    await ensureGalleryBucket(supabase);

    const filename = `instagram-${Date.now()}-${randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
      contentType,
      upsert: false
    });
    if (error) {
      return NextResponse.json({ error: "No se pudo guardar la imagen en Supabase." }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ imageUrl: data.publicUrl, sourceImageUrl: imageUrl });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la imagen de Instagram." }, { status: 500 });
  }
}

async function ensureGalleryBucket(supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const options = {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Array.from(allowedTypes.keys())
  };

  const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
  if (bucketError) {
    const { error } = await supabase.storage.createBucket(BUCKET, options);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.storage.updateBucket(BUCKET, options);
  if (error) throw error;
}

function extractBestInstagramImage(html: string) {
  const decodedHtml = decodeHtml(html)
    .replaceAll("\\/", "/")
    .replaceAll("\\u0026", "&")
    .replaceAll("\\u003d", "=");
  const candidates = new Set<string>();

  const metaPatterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["'][^>]*>/i,
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["'][^>]*>/i,
    /<meta\s+itemprop=["']image["']\s+content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+content=["']([^"']+)["']\s+itemprop=["']image["'][^>]*>/i
  ];

  for (const pattern of metaPatterns) {
    const match = decodedHtml.match(pattern);
    if (match?.[1]) candidates.add(match[1]);
  }

  for (const match of decodedHtml.matchAll(/https?:\/\/[^"'<>\\\s]+(?:scontent|fbcdn)[^"'<>\\\s]+/gi)) {
    candidates.add(match[0]);
  }

  for (const match of decodedHtml.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) {
    candidates.add(match[1]);
  }

  return Array.from(candidates)
    .map((value) => sanitizeImageUrl(value))
    .filter((value): value is string => Boolean(value && isLikelyPostImage(value)))
    .sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a))[0] ?? null;
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function sanitizeImageUrl(value: string) {
  try {
    const normalized = decodeHtml(value.trim()).replaceAll("\\/", "/").replaceAll("\\u0026", "&");
    const url = new URL(normalized);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isLikelyPostImage(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === "static.cdninstagram.com") return false;
    if (!host.includes("cdninstagram.com") && !host.includes("fbcdn.net")) return false;
    if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url.pathname) && !url.searchParams.has("oh")) return false;

    const dimensions = imageDimensionsFromUrl(value);
    if (dimensions && Math.max(dimensions.width, dimensions.height) < 500) return false;
    return true;
  } catch {
    return false;
  }
}

function scoreImageUrl(value: string) {
  const dimensions = imageDimensionsFromUrl(value);
  const area = dimensions ? dimensions.width * dimensions.height : 0;
  let score = area;

  if (value.includes("scontent")) score += 2_000_000;
  if (/\.(jpg|jpeg)(\?|$)/i.test(value)) score += 100_000;
  if (/profile|avatar|150x150|s150x150/i.test(value)) score -= 5_000_000;
  return score;
}

function imageDimensionsFromUrl(value: string) {
  const matches = Array.from(value.matchAll(/(?:s|p|w|h|e35_s)(\d{2,5})x(\d{2,5})/gi));
  if (!matches.length) return null;

  return matches.reduce(
    (best, match) => {
      const width = Number(match[1]);
      const height = Number(match[2]);
      return width * height > best.width * best.height ? { width, height } : best;
    },
    { width: 0, height: 0 }
  );
}

function normalizeContentType(value: string | null) {
  return value?.split(";")[0]?.trim().toLowerCase() || "";
}

function isInstagramUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
