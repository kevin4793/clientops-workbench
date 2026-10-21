import demoClients from "@/data/demo-clients.json";
import snapshotClients from "@/data/snapshot-clients.json";
import type { ClientRecord, DataMode } from "./types";

/**
 * 未来可替换为 Notion API / SQLite：
 * - 在 app/api/clients/route.ts 中改为 fetch(NOTION_DATABASE)
 * - 保持 ClientRecord 结构不变
 */
export function loadClientsForMode(mode: DataMode): ClientRecord[] {
  const raw = mode === "demo" ? demoClients : snapshotClients;
  return raw as ClientRecord[];
}

export const DEMO_ACTOR = "理财经理·演示";
