import openNextWorker from "./.open-next/worker.js";

const ADMIN_HOST = "admin.mystrenzas.com";
const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);
const SECURITY_HEADERS = {
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()"
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function secureRedirect(url) {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set("location", url);
  return new Response(null, {
    status: 307,
    headers
  });
}

function isAdminApiPath(pathname) {
  return pathname.startsWith("/api/admin") || pathname.startsWith("/api/passkeys") || pathname.startsWith("/api/push");
}

function isSharedAssetOrApiPath(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  );
}

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (PUBLIC_HOSTS.has(url.hostname) && url.pathname.startsWith("/admin")) {
      url.hostname = ADMIN_HOST;
      return secureRedirect(url.toString());
    }

    if (PUBLIC_HOSTS.has(url.hostname) && isAdminApiPath(url.pathname)) {
      return withSecurityHeaders(new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      }));
    }

    if (url.hostname === ADMIN_HOST && !url.pathname.startsWith("/admin") && !isSharedAssetOrApiPath(url.pathname)) {
      return secureRedirect(new URL("/admin/dashboard", url).toString());
    }

    return openNextWorker.fetch(request, env, ctx);
  }
};
