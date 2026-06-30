"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { bookingLinks } from "@/components/public/BookingDropdown";
import { cn } from "@/lib/utils";
import type { BookingMenuItem } from "@/types/booking-menu";

const mainLinks = [
  { label: "Productos", href: "/productos" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/contacto" }
];

export function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [items, setItems] = useState<BookingMenuItem[]>(bookingLinks);

  useEffect(() => {
    let mounted = true;

    fetch("/api/booking-menu")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: BookingMenuItem[] } | null) => {
        if (mounted && data?.items?.length) setItems(data.items);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="border-t border-cocoa/10 bg-white transition-colors dark:border-white/10 dark:bg-[#170011] lg:hidden">
      <nav className="container-shell grid gap-2 py-4">
        <Link href="/" className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-cream dark:text-white dark:hover:bg-white/10" onClick={onNavigate}>
          Inicio
        </Link>
        <button
          type="button"
          className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-cream dark:text-white dark:hover:bg-white/10"
          aria-expanded={bookingOpen}
          onClick={() => setBookingOpen((value) => !value)}
        >
          Agendar Cita
          <ChevronDown className={cn("transition", bookingOpen && "rotate-180")} size={17} />
        </button>
        <div
          className={cn(
            "ml-3 grid overflow-hidden border-l border-cocoa/15 pl-3 transition-all duration-200 dark:border-white/15",
            bookingOpen ? "max-h-96 translate-y-0 gap-1 py-1 opacity-100" : "max-h-0 -translate-y-2 gap-0 py-0 opacity-0"
          )}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              tabIndex={bookingOpen ? 0 : -1}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-muted hover:bg-cream hover:text-cocoa dark:text-pink-100/75 dark:hover:bg-white/10 dark:hover:text-pink-100"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {mainLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-cream dark:text-white dark:hover:bg-white/10"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
