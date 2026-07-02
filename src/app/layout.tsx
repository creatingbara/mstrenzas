import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PublicChrome } from "@/components/public/PublicChrome";
import { getSiteSettings } from "@/lib/local-db";
import { getAppFooterSettings, getAppNavigationItems, getAppThemeSettings, themeCssVariables } from "@/lib/super-panel";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "M&S Trenzas | Trenzas africanas y extensiones 100% Human Hair",
  description:
    "Agenda tus trenzas africanas, postura de extensiones y servicios de extensiones 100% Human Hair con M&S Trenzas. Estilos elegantes, protectores y personalizados.",
  keywords: [
    "trenzas africanas",
    "extensiones humanas",
    "trenzas RD",
    "postura de extensiones",
    "box braids",
    "knotless braids",
    "trenzas dominicana",
    "M&S Trenzas"
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export const viewport: Viewport = {
  themeColor: "#65004d",
  width: "device-width",
  initialScale: 1
};

export const dynamic = "force-dynamic";

const ADMIN_HOST = "admin.mystrenzas.com";

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const headerStore = await headers();
  const hostname = headerStore.get("host")?.split(":")[0]?.toLowerCase();
  const pathname = headerStore.get("x-ms-pathname");

  if (hostname === ADMIN_HOST && pathname && !pathname.startsWith("/admin")) {
    redirect("/admin/dashboard");
  }

  const [settings, theme, navigation, footer] = await Promise.all([
    getSiteSettings(),
    getAppThemeSettings(),
    getAppNavigationItems({ activeOnly: true }),
    getAppFooterSettings()
  ]);

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
      style={themeCssVariables(theme)}
    >
      <head>{theme.faviconUrl && <link rel="icon" href={theme.faviconUrl} />}</head>
      <body className="font-sans">
        <PublicChrome settings={settings} theme={theme} navigation={navigation} footer={footer}>{children}</PublicChrome>
      </body>
    </html>
  );
}
