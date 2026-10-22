import { NextResponse } from "next/server";
import {
  parseCsvText,
  parseExcelBuffer,
} from "@/lib/import-export/parse-file";
import { upsertClient } from "@/lib/db/clients";
import { isSiteConfigured } from "@/lib/env-config";

export async function POST(req: Request) {
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const { csv } = await req.json();
      const rows = parseCsvText(String(csv ?? ""));
      const saved = [];
      for (const row of rows) {
        saved.push(await upsertClient(row));
      }
      return NextResponse.json({ imported: saved.length, clients: saved });
    }

    const buf = await req.arrayBuffer();
    const rows = parseExcelBuffer(buf);
    const saved = [];
    for (const row of rows) {
      saved.push(await upsertClient(row));
    }
    return NextResponse.json({ imported: saved.length, clients: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "import_failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
