"use client";

import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, ChevronDown, LogOut, Menu, Monitor, Moon, Settings, Sun, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminSession } from "@/lib/auth/admin-session";
import { cn } from "@/lib/utils";

const roleLabels: Record<AdminSession["role"], string> = {
  super_admin: "Super admin",
  admin: "Admin",
  colaborador: "Colaborador"
};

type ThemeMode = "light" | "dark" | "system";
type OpenMenu = "theme" | "notifications" | "profile" | null;

const themeOptions: Record<ThemeMode, { label: string; icon: typeof Sun; description: string }> = {
  light: { label: "Modo dia", icon: Sun, description: "Panel claro" },
  dark: { label: "Modo oscuro", icon: Moon, description: "Panel nocturno" },
  system: { label: "Sistema", icon: Monitor, description: "Seguir dispositivo" }
};

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
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const profilePath = `/admin/equipo/${session.staffMemberId || session.profileId}`;
  const currentTheme = themeOptions[theme];
  const CurrentThemeIcon = currentTheme.icon;

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
    setOpenMenu(null);
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  function toggle(menu: OpenMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ead8e6] bg-white/88 px-4 py-4 shadow-sm backdrop-blur-xl transition-colors dark:border-white/15 dark:bg-[#220018]/95 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <label
            htmlFor={menuControlId}
            className="grid h-11 w-11 place-items-center rounded-lg border border-cocoa/25 bg-white text-ink shadow-sm transition hover:border-cocoa hover:bg-cream dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 lg:hidden"
            aria-label="Abrir menu administrativo"
            role="button"
            tabIndex={0}
          >
            <Menu size={19} />
          </label>
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-cocoa dark:text-pink-300 sm:block">Panel administrativo</p>
            <h1 className="truncate text-lg font-black text-ink dark:text-white sm:text-xl">Gestion de M&S Trenzas</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              className="flex min-h-11 items-center gap-2 rounded-lg border border-cocoa/15 bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-cream dark:border-white/10 dark:bg-[#210018] dark:text-white dark:hover:bg-white/10 sm:px-4"
              aria-expanded={openMenu === "theme"}
              aria-haspopup="menu"
              onClick={() => toggle("theme")}
            >
              <CurrentThemeIcon size={18} />
              <span className="hidden sm:inline">{currentTheme.label}</span>
              <ChevronDown size={16} />
            </button>

            {openMenu === "theme" && (
              <Dropdown className="w-64">
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-cocoa dark:text-pink-200">Apariencia</p>
                {(Object.keys(themeOptions) as ThemeMode[]).map((mode) => {
                  const option = themeOptions[mode];
                  const Icon = option.icon;
                  const active = theme === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-cream dark:text-white dark:hover:bg-white/10",
                        active && "bg-cream text-cocoa dark:bg-white/10 dark:text-pink-100"
                      )}
                      onClick={() => selectTheme(mode)}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-cocoa dark:bg-white/10 dark:text-pink-100">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block">{option.label}</span>
                        <span className="block text-xs font-medium text-muted dark:text-pink-100/70">{option.description}</span>
                      </span>
                      {active && <CheckCircle2 className="ml-auto shrink-0 text-cocoa dark:text-pink-200" size={17} />}
                    </button>
                  );
                })}
              </Dropdown>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="relative grid size-11 place-items-center rounded-lg border border-cocoa/15 bg-white text-ink shadow-sm transition hover:bg-cream dark:border-white/15 dark:bg-white dark:text-cocoa dark:hover:bg-pink-50"
              aria-label="Notificaciones"
              aria-expanded={openMenu === "notifications"}
              aria-haspopup="menu"
              onClick={() => toggle("notifications")}
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-cocoa text-[0.65rem] font-bold text-white">
                3
              </span>
            </button>

            {openMenu === "notifications" && (
              <Dropdown className="w-[min(22rem,calc(100vw-2rem))]">
                <div className="flex items-center justify-between gap-3 px-2 pb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa dark:text-pink-200">Notificaciones</p>
                  <span className="rounded-full bg-cream px-2 py-1 text-xs font-bold text-cocoa dark:bg-white/10 dark:text-pink-100">3 nuevas</span>
                </div>
                <NotificationItem
                  icon={CalendarClock}
                  title="Revisar citas pendientes"
                  description="Hay solicitudes que necesitan confirmacion."
                  href="/admin/citas"
                  onClick={() => setOpenMenu(null)}
                />
                <NotificationItem
                  icon={Bell}
                  title="Agenda actualizada"
                  description="Verifica el calendario administrativo."
                  href="/admin/calendario"
                  onClick={() => setOpenMenu(null)}
                />
                <NotificationItem
                  icon={Settings}
                  title="Configuracion del sitio"
                  description={session.role === "super_admin" ? "Puedes revisar telefono, horario e Instagram." : "Disponible para super admin."}
                  href={session.role === "super_admin" ? "/admin/configuracion" : "/admin/dashboard"}
                  onClick={() => setOpenMenu(null)}
                />
              </Dropdown>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex min-h-11 items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-cream dark:hover:bg-white/10"
              aria-expanded={openMenu === "profile"}
              aria-haspopup="menu"
              onClick={() => toggle("profile")}
            >
              <ProfileAvatar avatarUrl={session.avatarUrl} username={session.username} className="h-11 w-11" />
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-left text-sm font-bold text-ink dark:text-white">{session.username}</span>
                <span className="block text-left text-xs text-muted dark:text-pink-200/80">{roleLabels[session.role]}</span>
              </span>
              <ChevronDown className="hidden text-muted dark:text-pink-200/80 sm:block" size={17} />
            </button>

            {openMenu === "profile" && (
              <Dropdown className="w-72">
                <div className="mb-2 flex items-center gap-3 rounded-lg bg-cream/70 p-3 dark:bg-white/10">
                  <ProfileAvatar avatarUrl={session.avatarUrl} username={session.username} className="size-11" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-ink dark:text-white">{session.username}</span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted dark:text-pink-100/70">{roleLabels[session.role]}</span>
                  </span>
                </div>

                <LinkItem icon={UserRound} href={profilePath} label="Configuracion del perfil" onClick={() => setOpenMenu(null)} />

                <div className="my-2 border-t border-cocoa/10 dark:border-white/10" />
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-100 dark:hover:bg-rose-300/10"
                  onClick={signOut}
                >
                  <LogOut size={17} />
                  Cerrar sesion
                </button>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Dropdown({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "absolute right-0 top-[calc(100%+0.6rem)] z-50 rounded-lg border border-cocoa/10 bg-white p-3 shadow-[0_24px_70px_rgba(45,0,32,0.2)] dark:border-white/10 dark:bg-[#210018]",
        className
      )}
    >
      {children}
    </div>
  );
}

function ProfileAvatar({
  avatarUrl,
  username,
  className
}: {
  avatarUrl?: string | null;
  username: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-cocoa/15 bg-white text-sm font-black text-cocoa dark:border-white/15",
        className
      )}
    >
      {avatarUrl && !failed ? (
        <img src={avatarUrl} alt={`Foto de ${username}`} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials
      )}
    </span>
  );
}

function NotificationItem({
  icon: Icon,
  title,
  description,
  href,
  onClick
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-cream dark:hover:bg-white/10"
      onClick={onClick}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cream text-cocoa dark:bg-white/10 dark:text-pink-100">
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-ink dark:text-white">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted dark:text-pink-100/70">{description}</span>
      </span>
    </Link>
  );
}

function LinkItem({
  icon: Icon,
  href,
  label,
  onClick
}: {
  icon: typeof UserRound;
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream dark:text-white dark:hover:bg-white/10"
      onClick={onClick}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}
