"use client";

import { useEffect } from "react";

const ADMIN_HOST = "admin.mystrenzas.com";
const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);

export function DomainRedirector() {
  useEffect(() => {
    const { hostname, pathname, search, hash } = window.location;

    if (PUBLIC_HOSTS.has(hostname) && pathname.startsWith("/admin")) {
      window.location.replace(`https://${ADMIN_HOST}${pathname}${search}${hash}`);
      return;
    }

    if (hostname === ADMIN_HOST && !pathname.startsWith("/admin")) {
      window.location.replace("/admin/dashboard");
    }
  }, []);

  return null;
}
