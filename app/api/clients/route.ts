import { NextResponse } from "next/server";
import { loadClientsForMode } from "@/lib/data-source";
import type { DataMode } from "@/lib/types";

/**
 * GET /api/clients?mode=demo|snapshot
 *
 * 未来替换为 Notion API 示例：
 * const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
 *   headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" },
 * });
 * return mapNotionPagesToClientRecords(res);
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "demo") as DataMode;
  if (mode !== "demo" && mode !== "snapshot") {
    return NextResponse.json({ error: "invalid mode" }, { status: 400 });
  }
  const clients = loadClientsForMode(mode);
  return NextResponse.json({ mode, clients });
}
