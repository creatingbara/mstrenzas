"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { MobileMenu } from "@/components/public/MobileMenu";
import { PublicThemeMenu } from "@/components/public/PublicThemeMenu";
import { cn } from "@/lib/utils";
import type { AppNavigationItem, AppThemeSettings } from "@/types/super-panel";

export function Header({ theme, navigation }: { theme: AppThemeSettings; navigation: AppNavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const tree = buildNavigationTree(navigation);
  const logo = theme.logoUrl || "/brand/logo-ms-trenzas.jpg";
  const darkLogo = theme.logoDarkUrl || logo;

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-white/88 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#170011]/90">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink transition-colors dark:text-white">
          <span className="relative size-11 overflow-hidden rounded-full border border-cocoa/15 bg-nude">
            <img src={logo} alt="M&S Trenzas" className="h-full w-full object-cover dark:hidden" />
            <img src={darkLogo} alt="M&S Trenzas" className="hidden h-full w-full object-cover dark:block" />
          </span>
          M&S Trenzas
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted transition-colors dark:text-pink-100/80 lg:flex">
          {tree.map((item) => (
            item.children.length ? (
              <NavigationDropdown key={item.id} item={item} />
            ) : (
              <NavLink key={item.id} item={item} />
            )
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
      {open && <MobileMenu navigation={navigation} onNavigate={() => setOpen(false)} />}
    </header>
  );
}

function NavigationDropdown({ item }: { item: NavigationNode }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-1 transition hover:text-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/30"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        {item.label}
        <ChevronDown className={cn("transition", open && "rotate-180")} size={16} />
      </button>
      <div
        role="menu"
        className={cn(
          "absolute left-1/2 top-full w-[min(260px,calc(100vw-2rem))] -translate-x-1/2 pt-2 transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="booking-dropdown-panel grid gap-1 overflow-hidden rounded-lg p-2 backdrop-blur-2xl">
          {item.children.map((child) => (
            <NavLink key={child.id} item={child} className="booking-dropdown-item rounded-md px-3 py-2.5 text-left text-sm font-bold leading-5 transition focus:outline-none" onClick={() => setOpen(false)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, className, onClick }: { item: NavigationNode; className?: string; onClick?: () => void }) {
  return (
    <Link
      href={item.href || "#"}
      target={item.opensNewTab ? "_blank" : undefined}
      rel={item.opensNewTab ? "noreferrer" : undefined}
      className={className || "transition hover:text-cocoa dark:hover:text-pink-200"}
      onClick={onClick}
    >
      {item.label}
    </Link>
  );
}

type NavigationNode = AppNavigationItem & { children: NavigationNode[] };

function buildNavigationTree(items: AppNavigationItem[]): NavigationNode[] {
  const nodes = new Map<string, NavigationNode>();
  items
    .filter((item) => item.isActive)
    .forEach((item) => nodes.set(item.id, { ...item, children: [] }));

  const roots: NavigationNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sort = (a: NavigationNode, b: NavigationNode) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label);
  roots.sort(sort);
  roots.forEach((node) => node.children.sort(sort));
  return roots;
}
