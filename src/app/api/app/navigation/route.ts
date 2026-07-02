import { NextResponse } from "next/server";
import { getAppNavigationItems } from "@/lib/super-panel";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ items: await getAppNavigationItems({ activeOnly: true }) });
}
