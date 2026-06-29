"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { defaultBookingMenuItems } from "@/lib/booking-menu-defaults";
import { cn } from "@/lib/utils";
import type { BookingMenuItem } from "@/types/booking-menu";

export const bookingLinks = defaultBookingMenuItems;

export function BookingDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BookingMenuItem[]>(bookingLinks);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/booking-menu")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: BookingMenuItem[] } | null) => {
        if (mounted && data?.items?.length) setItems(data.items);
      })
      .catch(() => undefined);

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      mounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenuSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuSoon}
      onFocus={openMenu}
    >
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-1 transition hover:text-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/30"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        Agendar Cita
        <ChevronDown className={cn("transition", open && "rotate-180")} size={16} />
      </button>
      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full w-[min(720px,calc(100vw-2rem))] pt-3 transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenuSoon}
      >
        <div className="grid grid-cols-5 gap-1 overflow-hidden rounded-lg bg-[#050505] p-2 text-white shadow-soft ring-1 ring-white/10">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              className="rounded-md px-4 py-4 text-center text-sm font-semibold leading-5 text-white/80 transition hover:bg-white/10 hover:text-gold focus:bg-white/10 focus:text-gold focus:outline-none"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
