"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CriticalPasskeyGate } from "@/components/admin/CriticalPasskeyGate";
import type { AdminSession } from "@/lib/auth/admin-session";

export function AdminShell({
  children,
  session
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  const menuControlId = "admin-mobile-menu";

  return (
    <section className="min-h-screen bg-[#fff7fc] transition-colors dark:bg-[#13000f]">
      <CriticalPasskeyGate session={session} />
      <input id={menuControlId} type="checkbox" className="peer sr-only" aria-hidden="true" />
      <div className="fixed inset-0 z-50 hidden peer-checked:block lg:hidden">
        <label htmlFor={menuControlId} className="absolute inset-0 bg-ink/45" aria-label="Cerrar menu administrativo" />
        <div className="relative h-full w-[min(22rem,88vw)] overflow-y-auto shadow-soft">
          <AdminSidebar session={session} />
        </div>
      </div>
      <div className="min-h-screen w-full lg:pl-[292px]">
        <div className="fixed inset-y-0 left-0 z-40 hidden w-[292px] overflow-y-auto lg:block">
          <AdminSidebar session={session} />
        </div>

        <div className="min-w-0 overflow-x-hidden">
          <AdminHeader session={session} menuControlId={menuControlId} />
          <main className="admin-scope min-w-0 px-4 py-7 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto grid w-full max-w-[1460px] min-w-0 gap-6 has-[.admin-full-width]:max-w-none">{children}</div>
          </main>
        </div>
      </div>
    </section>
  );
}
