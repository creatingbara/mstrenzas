const CACHE_NAME = "ms-trenzas-static-v2";
const STATIC_ASSETS = ["/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  const title = payload.title || "M&S Trenzas";
  const url = payload.url || "/admin";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "Tienes una nueva notificacion.",
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag: payload.tag || "ms-trenzas",
      data: { url },
      actions: [
        {
          action: "open",
          title: "Abrir"
        }
      ]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/admin", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((client) => client.url === targetUrl);
        if (existingClient) return existingClient.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});

function readPushPayload(event) {
  try {
    return event.data ? event.data.json() : {};
  } catch {
    return {};
  }
}
