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

  return (
    <div ref={wrapperRef} className="relative">
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
          "absolute left-1/2 top-full w-[min(250px,calc(100vw-2rem))] -translate-x-1/2 pt-2 transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="booking-dropdown-panel grid gap-1 overflow-hidden rounded-lg p-2 backdrop-blur-2xl">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              className="booking-dropdown-item rounded-md px-3 py-2.5 text-left text-sm font-bold leading-5 transition focus:outline-none"
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
