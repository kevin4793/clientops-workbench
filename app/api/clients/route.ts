import { NextResponse } from "next/server";
import { listClients, upsertClient } from "@/lib/db/clients";
import { sanitizeClientInput } from "@/lib/secure/sanitize";
import { isSiteConfigured } from "@/lib/env-config";

export async function GET() {
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  try {
    const clients = await listClients();
    return NextResponse.json({ clients });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  const body = await req.json();
  const input = sanitizeClientInput(body);
  if (!input.displayName) {
    return NextResponse.json({ error: "displayName_required" }, { status: 400 });
  }
  try {
    const client = await upsertClient(input);
    return NextResponse.json({ client });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
