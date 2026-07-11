import { NextResponse } from "next/server";

const ADMIN_HOST = "admin.mystrenzas.com";
const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function getHostnameFromOrigin(origin: string | null) {
  if (!origin) return null;

  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalHost(hostname: string | null) {
  return Boolean(hostname && LOCAL_HOSTS.has(hostname));
}

function getHeader(headers: Headers, name: string) {
  return headers.get(name)?.split(",")[0]?.split(":")[0]?.trim().toLowerCase() || null;
}

export function getRequestHostname(headers: Headers) {
  return (
    getHeader(headers, "host") ||
    getHeader(headers, "x-forwarded-host") ||
    getHeader(headers, "x-original-host") ||
    headers.get("forwarded")?.match(/host=([^;]+)/i)?.[1]?.split(":")[0]?.trim().toLowerCase() ||
    null
  );
}

export function isAdminRequestAllowed(headers: Headers) {
  const host = getRequestHostname(headers);
  if (host && PUBLIC_HOSTS.has(host)) return false;

  const originHost = getHostnameFromOrigin(headers.get("origin"));
  if (!originHost) return true;

  return originHost === ADMIN_HOST || isLocalHost(originHost);
}

export function requireAdminOrigin(request: Request) {
  const originHost = getHostnameFromOrigin(request.headers.get("origin"));
  const host = getRequestHostname(request.headers);

  if (host && PUBLIC_HOSTS.has(host)) {
    return NextResponse.json({ error: "Ruta administrativa no disponible en este dominio." }, { status: 404 });
  }

  if (!originHost && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  if (originHost && originHost !== ADMIN_HOST && !isLocalHost(originHost)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  return null;
}

export function requirePublicMutationOrigin(request: Request) {
  const originHost = getHostnameFromOrigin(request.headers.get("origin"));

  if (!originHost && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  if (originHost && !PUBLIC_HOSTS.has(originHost) && !isLocalHost(originHost)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  return null;
}
