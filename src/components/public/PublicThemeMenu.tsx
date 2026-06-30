"use client";

import { CheckCircle2, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

const themeOptions: Record<ThemeMode, { label: string; icon: typeof Sun; description: string }> = {
  light: { label: "Modo dia", icon: Sun, description: "Pagina clara" },
  dark: { label: "Modo oscuro", icon: Moon, description: "Pagina nocturna" },
  system: { label: "Sistema", icon: Monitor, description: "Seguir dispositivo" }
};

function applyPublicTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", mode === "dark" || (mode === "system" && prefersDark));
  document.documentElement.dataset.publicTheme = mode;
}

export function PublicThemeMenu() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentTheme = themeOptions[theme];
  const CurrentThemeIcon = currentTheme.icon;

  useEffect(() => {
    const stored = window.localStorage.getItem("ms-public-theme");
    const initialTheme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setTheme(initialTheme);
    applyPublicTheme(initialTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => applyPublicTheme("system");
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, [theme]);

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem("ms-public-theme", nextTheme);
    applyPublicTheme(nextTheme);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cocoa/15 bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-cocoa/30 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 sm:px-4"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cambiar apariencia"
        onClick={() => setOpen((value) => !value)}
      >
        <CurrentThemeIcon size={18} />
        <span className="hidden sm:inline">{currentTheme.label}</span>
        <ChevronDown className={cn("hidden transition sm:block", open && "rotate-180")} size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-64 rounded-lg border border-cocoa/10 bg-white p-3 shadow-[0_24px_70px_rgba(45,0,32,0.2)] dark:border-white/10 dark:bg-[#210018]"
        >
          <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-cocoa dark:text-pink-200">Apariencia</p>
          {(Object.keys(themeOptions) as ThemeMode[]).map((mode) => {
            const option = themeOptions[mode];
            const Icon = option.icon;
            const active = theme === mode;

            return (
              <button
                key={mode}
                type="button"
                role="menuitem"
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
        </div>
      )}
    </div>
  );
}
