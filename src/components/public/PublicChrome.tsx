"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PWARegister } from "@/components/public/PWARegister";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppFloatingButton";
import type { SiteSettings } from "@/types/settings";

export function PublicChrome({ children, settings }: { children: ReactNode; settings: SiteSettings }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        {children}
        <PWARegister />
      </>
    );
  }

  return (
    <div className="public-scope min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloatingButton settings={settings} />
      <PWARegister />
    </div>
  );
}
