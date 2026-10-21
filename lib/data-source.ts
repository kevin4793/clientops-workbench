import demoClients from "@/data/demo-clients.json";
import snapshotClients from "@/data/snapshot-clients.json";
import demoMaintenance from "@/data/demo-maintenance.json";
import snapshotMaintenance from "@/data/snapshot-maintenance.json";
import { ensureClientShape } from "./enrich-client";
import type { ClientRecord, DataMode } from "./types";

type MaintenanceMap = Record<
  string,
  Partial<
    Pick<
      ClientRecord,
      | "profile"
      | "holdings"
      | "careReminders"
      | "maintenanceTasks"
      | "serviceRecords"
    >
  >
>;

/**
 * 未来可替换为 Notion API（见 /api/integrations/notion）：
 * - 将 Notion 行映射为 ClientRecord + maintenance 字段
 * - 保持 ClientRecord 结构不变
 */
export function loadClientsForMode(mode: DataMode): ClientRecord[] {
  const raw = mode === "demo" ? demoClients : snapshotClients;
  const ext = (mode === "demo"
    ? demoMaintenance
    : snapshotMaintenance) as unknown as MaintenanceMap;

  return (raw as Record<string, unknown>[]).map((row) => {
    const id = row.id as string;
    const merged = { ...row, ...(ext[id] ?? {}) };
    return ensureClientShape(merged);
  });
}

export const DEMO_ACTOR = "理财经理·演示";
