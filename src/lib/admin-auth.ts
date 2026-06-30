import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { canAccessAdminPath } from "@/lib/auth/permissions";
import { getProfileById, getStaffMemberByProfileId } from "@/lib/local-db";

function deniedRedirectPath(role: string) {
  return role === "colaborador" ? "/admin/mi-calendario" : "/admin/dashboard";
}

export async function hasAdminAccess() {
  return Boolean(await getAdminSession());
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) return null;
  if (session.profileId === "local-admin") return session;

  const profile = await getProfileById(session.profileId);
  if (!profile?.isActive) return null;

  const staff = await getStaffMemberByProfileId(profile.id);
  if (profile.role === "colaborador" && (!staff || !staff.isActive)) return null;

  return {
    profileId: profile.id,
    username: profile.username,
    role: profile.role,
    staffMemberId: staff?.id ?? null,
    avatarUrl: profile.avatarUrl || staff?.photoUrl || null
  };
}

export async function hasAdminRoleAccess() {
  const session = await getAdminSession();
  return Boolean(session && session.role !== "colaborador");
}

export async function requireAdminPageAccess(pathname: string, { adminOnly = false }: { adminOnly?: boolean } = {}) {
  const session = await getAdminSession();

  if (!session) {
    redirect(`/admin?next=${encodeURIComponent(pathname)}`);
  }

  if (adminOnly && session.role === "colaborador") {
    redirect(deniedRedirectPath(session.role));
  }

  if (!canAccessAdminPath(session.role, pathname)) {
    redirect(deniedRedirectPath(session.role));
  }

  return session;
}
