import { NextResponse } from "next/server";
import { getUserPasskeys } from "@/lib/auth/passkeys";
import { getProfileAuthByUsername, getStaffMemberByProfileId } from "@/lib/local-db";
import { normalizeUsername } from "@/lib/utils/username";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { username } = (await request.json().catch(() => ({}))) as { username?: string };
  const normalizedUsername = normalizeUsername(username || "");

  if (!normalizedUsername) {
    return NextResponse.json({ available: false });
  }

  const profile = await getProfileAuthByUsername(normalizedUsername);
  if (!profile || !profile.is_active) {
    return NextResponse.json({ available: false });
  }

  const staff = await getStaffMemberByProfileId(profile.id);
  if (profile.role === "colaborador" && (!staff || !staff.isActive)) {
    return NextResponse.json({ available: false });
  }

  const passkeys = await getUserPasskeys(profile.id);
  return NextResponse.json({ available: passkeys.length > 0 });
}
