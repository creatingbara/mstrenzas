"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PWARegister } from "@/components/public/PWARegister";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppFloatingButton";

export function PublicChrome({ children }: { children: ReactNode }) {
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
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
      <PWARegister />
    </>
  );
}
