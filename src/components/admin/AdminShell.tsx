"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
      <input id={menuControlId} type="checkbox" className="peer sr-only" aria-hidden="true" />
      <div className="fixed inset-0 z-50 hidden peer-checked:block lg:hidden">
        <label htmlFor={menuControlId} className="absolute inset-0 bg-ink/45" aria-label="Cerrar menu administrativo" />
        <div className="relative h-full w-[min(22rem,88vw)] overflow-y-auto shadow-soft">
          <AdminSidebar session={session} />
        </div>
      </div>
      <div className="flex min-h-screen w-full">
        <div className="hidden w-[292px] shrink-0 lg:block">
          <AdminSidebar session={session} />
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden lg:w-[calc(100vw-307px)] lg:flex-none">
          <AdminHeader session={session} menuControlId={menuControlId} />
          <main className="admin-scope min-w-0 px-4 py-7 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto grid w-full max-w-[1460px] min-w-0 gap-6">{children}</div>
          </main>
        </div>
      </div>
    </section>
  );
}
