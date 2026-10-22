import { NextResponse } from "next/server";
import { listExpiringWithinDays } from "@/lib/db/clients";
import { isSiteConfigured } from "@/lib/env-config";

export async function GET(req: Request) {
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const days = Math.min(365, Math.max(1, Number(searchParams.get("days") ?? 7)));
  try {
    const clients = await listExpiringWithinDays(days);
    return NextResponse.json({
      days,
      count: clients.length,
      clients: clients.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        clientCode: c.clientCode,
        productName: c.productName,
        expiryDate: c.expiryDate,
        amount: c.amount,
        birthdayMmDd: c.birthdayMmDd,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
