"use client";

import { useMemo, useState } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import type { MaintenanceTaskStatus } from "@/lib/types";

const columns: MaintenanceTaskStatus[] = ["待联系", "已约访", "已办结"];

export function TasksModule() {
  const { clients, updateMaintenanceTask } = useClientOps();
  const [category, setCategory] = useState<string>("全部");

  const tasks = useMemo(() => {
    let list = clients.flatMap((c) =>
      c.maintenanceTasks.map((t) => ({
        ...t,
        clientId: c.id,
        clientName: c.displayName,
        maskedName: c.maskedName,
      }))
    );
    if (category !== "全部") {
      list = list.filter((t) => t.category === category);
    }
    return list;
  }, [clients, category]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-teal-300">分类</span>
        <select
          className="rounded-lg border border-teal-700 bg-[#0f1f1c] px-2 py-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="全部">全部</option>
          <option value="关怀">关怀</option>
          <option value="到期">到期</option>
          <option value="回访">回访</option>
          <option value="其他">其他</option>
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div
            key={col}
            className="rounded-xl border border-teal-800/40 bg-[#152a25]/50 p-3"
          >
            <h3 className="mb-3 text-sm font-semibold text-teal-100">
              {col}
              <span className="ml-2 text-teal-500">
                ({tasks.filter((t) => t.status === col).length})
              </span>
            </h3>
            <ul className="space-y-2">
              {tasks
                .filter((t) => t.status === col)
                .map((t) => (
                  <li
                    key={t.id + t.clientId}
                    className="rounded-lg bg-[#0f1f1c]/90 p-3 text-sm"
                  >
                    <p className="font-medium text-teal-50">{t.title}</p>
                    <p className="text-xs text-teal-400">
                      {t.maskedName} · {t.category}
                      {t.dueDate ? ` · 截止 ${t.dueDate}` : ""}
                    </p>
                    {col !== "已办结" && (
                      <select
                        className="mt-2 w-full rounded border border-teal-800 bg-teal-950 text-xs"
                        value={t.status}
                        onChange={(e) =>
                          updateMaintenanceTask(
                            t.clientId,
                            t.id,
                            e.target.value as MaintenanceTaskStatus
                          )
                        }
                      >
                        {columns.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
