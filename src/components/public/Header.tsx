"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BookingDropdown } from "@/components/public/BookingDropdown";
import { MobileMenu } from "@/components/public/MobileMenu";
import { PublicThemeMenu } from "@/components/public/PublicThemeMenu";

const nav = [
  ["Productos", "/productos"],
  ["Galeria", "/galeria"],
  ["Contacto", "/contacto"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-white/88 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#170011]/90">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink transition-colors dark:text-white">
          <span className="relative size-11 overflow-hidden rounded-full border border-cocoa/15 bg-nude">
            <Image src="/brand/logo-ms-trenzas.jpg" alt="M&S Trenzas" fill sizes="44px" className="object-cover" priority />
          </span>
          M&S Trenzas
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted transition-colors dark:text-pink-100/80 lg:flex">
          <Link href="/" className="transition hover:text-cocoa dark:hover:text-pink-200">
            Inicio
          </Link>
          <BookingDropdown />
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-cocoa dark:hover:text-pink-200">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <PublicThemeMenu />
          <button
            className="grid size-11 place-items-center rounded-full border border-cocoa/20 text-ink transition hover:bg-cream dark:border-white/15 dark:text-white dark:hover:bg-white/10 lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && <MobileMenu onNavigate={() => setOpen(false)} />}
    </header>
  );
}
