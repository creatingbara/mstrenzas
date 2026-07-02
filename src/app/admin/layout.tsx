import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin-auth";
import { canAccessAdminPath } from "@/lib/auth/permissions";
import { getAppAdminUiSettings } from "@/lib/super-panel";

const ADMIN_HOST = "admin.mystrenzas.com";
const PUBLIC_HOSTS = new Set(["mystrenzas.com", "www.mystrenzas.com"]);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-ms-pathname");
  const hostname = headerStore.get("host")?.split(":")[0]?.toLowerCase();

  if (hostname && PUBLIC_HOSTS.has(hostname) && pathname?.startsWith("/admin")) {
    redirect(`https://${ADMIN_HOST}${pathname}`);
  }

  const isLoginRoute = pathname === "/admin" || pathname === "/admin/login";

  if (isLoginRoute) {
    return (
      <section className="section-pad bg-cream/45">
        <div className="container-shell">{children}</div>
      </section>
    );
  }

  const session = await getAdminSession();
  if (!session) {
    if (pathname) {
      redirect(`/admin?next=${encodeURIComponent(pathname)}`);
    }

    return (
      <section className="section-pad bg-cream/45">
        <div className="container-shell">{children}</div>
      </section>
    );
  }

  if (pathname && !canAccessAdminPath(session.role, pathname)) {
    redirect(session.role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard");
  }

  const profilePath = `/admin/equipo/${session.staffMemberId || session.profileId}`;
  if (session.passwordChangeRequired && pathname && pathname !== profilePath) {
    redirect(`${profilePath}?password=required`);
  }

  const adminUi = await getAppAdminUiSettings();

  return <AdminShell session={session} adminUi={adminUi}>{children}</AdminShell>;
}
