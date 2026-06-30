import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getUserPasskeys } from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const items = await getUserPasskeys(session.profileId);
  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      deviceName: item.deviceName,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt,
      transports: item.transports
    }))
  });
}
