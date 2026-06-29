import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { PublicChrome } from "@/components/public/PublicChrome";
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="font-sans">
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
