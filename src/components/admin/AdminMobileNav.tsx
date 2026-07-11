"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMobileLinksForSession } from "@/components/admin/AdminSidebar";
import type { AdminSession } from "@/lib/auth/admin-session";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function mobileLabel(label: string, href: string) {
  if (href === "/admin/dashboard") return "Inicio";
  if (href === "/admin/calendario" || href === "/admin/mi-calendario") return "Agenda";
  if (href === "/admin/equipo") return "Equipo";
  if (href.includes("/admin/equipo/")) return "Perfil";
  if (label === "Servicios y Agenda") return "Servicios";
  return label.replace(" y Accesos", "");
}

export function AdminMobileNav({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const links = getMobileLinksForSession(session);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead8e6] bg-white/95 px-1.5 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 shadow-[0_-14px_45px_rgba(45,0,32,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#170011]/95 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative grid min-h-[3.85rem] min-w-0 place-items-center gap-0.5 rounded-2xl px-0.5 text-center text-[0.68rem] font-black text-[#303942] transition",
                "dark:text-pink-100/75",
                active && "text-[#9b1178] dark:text-pink-200"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && <span className="absolute inset-x-3 -top-2 h-1 rounded-full bg-[#9b1178] dark:bg-pink-300" />}
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-2xl transition",
                  active && "bg-[#f8e9f4] text-[#9b1178] dark:bg-white/10 dark:text-pink-200"
                )}
              >
                <Icon size={19} strokeWidth={2.35} />
              </span>
              <span className="w-full truncate leading-tight">{mobileLabel(link.label, link.href)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
