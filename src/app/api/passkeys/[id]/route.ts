import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteUserPasskey } from "@/lib/auth/passkeys";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteUserPasskey(id, session.profileId);
  if (!deleted) {
    return NextResponse.json({ error: "Passkey no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, message: "Passkey eliminada correctamente." });
}
