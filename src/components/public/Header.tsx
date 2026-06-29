"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BookingDropdown } from "@/components/public/BookingDropdown";
import { MobileMenu } from "@/components/public/MobileMenu";

const nav = [
  ["Productos", "/productos"],
  ["Galería", "/galeria"],
  ["Contacto", "/contacto"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-white/88 backdrop-blur-xl">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="relative size-11 overflow-hidden rounded-full border border-cocoa/15 bg-nude">
            <Image src="/brand/logo-ms-trenzas.jpg" alt="M&S Trenzas" fill sizes="44px" className="object-cover" priority />
          </span>
          M&S Trenzas
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
          <Link href="/" className="transition hover:text-cocoa">
            Inicio
          </Link>
          <BookingDropdown />
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-cocoa">
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="grid size-11 place-items-center rounded-full border border-cocoa/20 lg:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && <MobileMenu onNavigate={() => setOpen(false)} />}
    </header>
  );
}
