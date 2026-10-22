import { NextResponse } from "next/server";
import { deleteClient, getClient, upsertClient } from "@/lib/db/clients";
import { sanitizeClientInput } from "@/lib/secure/sanitize";
import { isSiteConfigured } from "@/lib/env-config";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  const client = await getClient(id);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  const body = await req.json();
  const input = sanitizeClientInput({ ...body, id });
  try {
    const client = await upsertClient({ ...input, id });
    return NextResponse.json({ client });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  await deleteClient(id);
  return NextResponse.json({ ok: true });
}
