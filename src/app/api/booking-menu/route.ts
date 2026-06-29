import { NextResponse } from "next/server";
import { getBookingMenuItems } from "@/lib/local-db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ items: await getBookingMenuItems({ activeOnly: true }) });
}
