"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PWARegister } from "@/components/public/PWARegister";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppFloatingButton";
import type { SiteSettings } from "@/types/settings";
import type { AppFooterSettings, AppNavigationItem, AppThemeSettings } from "@/types/super-panel";

export function PublicChrome({
  children,
  settings,
  theme,
  navigation,
  footer
}: {
  children: ReactNode;
  settings: SiteSettings;
  theme: AppThemeSettings;
  navigation: AppNavigationItem[];
  footer: AppFooterSettings;
}) {
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
      <Header theme={theme} navigation={navigation} />
      <main>{children}</main>
      <Footer settings={settings} footer={footer} navigation={navigation} />
      <WhatsAppFloatingButton settings={settings} footer={footer} />
      <PWARegister />
    </div>
  );
}
