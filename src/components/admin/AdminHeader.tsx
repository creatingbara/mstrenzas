"use client";

import { Bell, ChevronDown, Menu, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminSession } from "@/lib/auth/admin-session";
import { cn } from "@/lib/utils";

const roleLabels: Record<AdminSession["role"], string> = {
  super_admin: "Super admin",
  admin: "Admin",
  colaborador: "Colaborador"
};

type ThemeMode = "light" | "dark" | "system";

function applyAdminTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", mode === "dark" || (mode === "system" && prefersDark));
  document.documentElement.dataset.adminTheme = mode;
}

export function AdminHeader({
  session,
  menuControlId
}: {
  session: AdminSession;
  menuControlId: string;
}) {
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("ms-admin-theme");
    const initialTheme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setTheme(initialTheme);
    applyAdminTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => applyAdminTheme("system");
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, [theme]);

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem("ms-admin-theme", nextTheme);
    applyAdminTheme(nextTheme);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ead8e6] bg-white/88 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <label
            htmlFor={menuControlId}
            className="grid h-11 w-11 place-items-center rounded-lg border border-cocoa/25 bg-white text-ink shadow-sm transition hover:border-cocoa hover:bg-cream lg:hidden"
            aria-label="Abrir menu administrativo"
            role="button"
            tabIndex={0}
          >
            <Menu size={19} />
          </label>
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-cocoa sm:block">Panel administrativo</p>
            <h1 className="truncate text-lg font-black text-ink sm:text-xl">Gestion de M&S Trenzas</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center overflow-hidden rounded-lg border border-cocoa/15 bg-white shadow-sm dark:border-white/10 dark:bg-[#210018] md:flex">
            <button
              type="button"
              className={cn(
                "grid size-11 place-items-center text-ink transition hover:bg-cream dark:text-white dark:hover:bg-white/10",
                theme === "light" && "bg-cream text-cocoa dark:bg-white/10"
              )}
              aria-label="Tema claro"
              onClick={() => selectTheme("light")}
            >
              <Sun size={18} />
            </button>
            <button
              type="button"
              className={cn(
                "grid size-11 place-items-center border-l border-cocoa/10 text-ink transition hover:bg-cream dark:border-white/10 dark:text-white dark:hover:bg-white/10",
                theme === "dark" && "bg-cream text-cocoa dark:bg-white/10"
              )}
              aria-label="Tema oscuro"
              onClick={() => selectTheme("dark")}
            >
              <Moon size={18} />
            </button>
            <button
              type="button"
              className={cn(
                "flex h-11 items-center gap-2 border-l border-cocoa/10 px-4 text-sm font-bold text-cocoa transition hover:bg-cream dark:border-white/10 dark:text-white dark:hover:bg-white/10",
                theme === "system" && "bg-cream dark:bg-white/10"
              )}
              aria-label="Tema del sistema"
              onClick={() => selectTheme("system")}
            >
              <Monitor size={18} />
              Sistema
            </button>
          </div>

          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-lg border border-cocoa/15 bg-white text-ink shadow-sm transition hover:bg-cream"
            aria-label="Notificaciones"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-cocoa text-[0.65rem] font-bold text-white">
              3
            </span>
          </button>

          <div className="flex items-center gap-3 rounded-lg px-1 py-1">
            <span className="h-11 w-11 overflow-hidden rounded-full border border-cocoa/15 bg-nude">
              <img src="/brand/logo-ms-trenzas.jpg" alt="M&S Trenzas" className="h-full w-full object-cover" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold text-ink">{session.username}</p>
              <p className="text-xs text-muted">{roleLabels[session.role]}</p>
            </span>
            <ChevronDown className="hidden text-muted sm:block" size={17} />
          </div>
        </div>
      </div>
    </header>
  );
}
