import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect(session.role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard");
  }

  return <AdminLoginForm />;
}
