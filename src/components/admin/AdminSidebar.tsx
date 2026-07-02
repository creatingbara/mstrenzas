"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  Gauge,
  ImageIcon,
  Package,
  SlidersHorizontal,
  Settings,
  Users
} from "lucide-react";
import type { AdminSession } from "@/lib/auth/admin-session";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types/staff";
import type { AppAdminUiSettings } from "@/types/super-panel";

type AdminNavLink = {
  href: string;
  label: string;
  icon: typeof Gauge;
};

type AdminNavGroup = {
  title?: string;
  links: AdminNavLink[];
};

const superAdminGroups: AdminNavGroup[] = [
  {
    links: [
      { href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
      { href: "/admin/servicios-agenda", label: "Servicios y Agenda", icon: CalendarDays },
      { href: "/admin/citas", label: "Citas", icon: CalendarCheck },
      { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/admin/equipo", label: "Equipo y Accesos", icon: Users },
      { href: "/admin/galeria", label: "Galeria", icon: ImageIcon },
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/super-panel", label: "Super Panel", icon: SlidersHorizontal },
      { href: "/admin/configuracion", label: "Configuracion", icon: Settings }
    ]
  }
];

const adminHiddenHrefs = new Set(["/admin/configuracion"]);

const adminGroups: AdminNavGroup[] = superAdminGroups
  .map((group) => ({
    ...group,
    links: group.links.filter((link) => !adminHiddenHrefs.has(link.href))
  }))
  .filter((group) => group.links.length > 0);

const collaboratorGroups: AdminNavGroup[] = [
  {
    links: [{ href: "/admin/mi-calendario", label: "Mi calendario", icon: CalendarDays }]
  }
];

function getGroupsForRole(role: StaffRole) {
  if (role === "super_admin") return superAdminGroups;
  if (role === "admin") return adminGroups;
  return collaboratorGroups;
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  session,
  onNavigate,
  adminUi
}: {
  session: AdminSession;
  onNavigate?: () => void;
  adminUi: AppAdminUiSettings;
}) {
  const pathname = usePathname();
  const visibleGroups = getGroupsForRole(session.role);

  return (
    <aside
      className="flex min-h-screen flex-col p-4 text-white"
      style={{
        background: `radial-gradient(circle at top left, color-mix(in srgb, ${adminUi.sidebarAccentColor} 38%, transparent), transparent 28%), linear-gradient(180deg, ${adminUi.sidebarColor} 0%, #1b0019 100%)`
      }}
    >
      <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-4" onClick={onNavigate}>
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gold/50 bg-nude shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
          <img src={adminUi.sidebarLogoUrl || "/brand/logo-ms-trenzas.jpg"} alt="M&S Trenzas" className="h-full w-full object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block text-xl font-extrabold text-white">M&S Trenzas</span>
          <span className="block text-sm text-white/85">{adminUi.adminSubtitle}</span>
        </span>
      </Link>

      <nav className="mt-8 grid gap-2">
        {visibleGroups.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`} className="grid gap-2">
            {group.title && (
              <p className="px-3 pb-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/45">{group.title}</p>
            )}
            {group.links.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-14 items-center gap-4 rounded-lg px-4 py-3 text-base font-semibold text-white/90 transition hover:bg-white/12 hover:text-white",
                    active && "text-white shadow-[0_14px_34px_rgba(155,17,120,0.28)]"
                  )}
                  style={active ? { backgroundColor: adminUi.sidebarAccentColor } : undefined}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
