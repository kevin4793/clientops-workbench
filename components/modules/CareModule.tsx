"use client";

import { useMemo } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { REFERENCE_DATE } from "@/lib/dates";

export function CareModule() {
  const { clients, updateCareReminder } = useClientOps();

  const items = useMemo(() => {
    return clients.flatMap((c) =>
      c.careReminders.map((r) => ({
        ...r,
        clientId: c.id,
        clientName: c.displayName,
        maskedName: c.maskedName,
      }))
    ).sort((a, b) => a.date.localeCompare(b.date));
  }, [clients]);

  const upcoming = items.filter((i) => !i.done);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-xs text-teal-300/70">
        基准日 {REFERENCE_DATE.toISOString().slice(0, 10)} · 生日与节日关怀均为虚构演练
      </p>
      <ul className="space-y-3">
        {upcoming.length === 0 ? (
          <li className="text-sm text-teal-300/60">暂无待关怀事项</li>
        ) : (
          upcoming.map((item) => (
            <li
              key={`${item.clientId}-${item.id}`}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-teal-800/40 bg-[#152a25] p-4"
            >
              <div className="flex-1">
                <p className="text-xs text-teal-400">
                  {item.type} · {item.date}
                </p>
                <p className="font-medium text-teal-50">{item.label}</p>
                <p className="text-sm text-teal-300/80">{item.clientName}</p>
              </div>
              <button
                type="button"
                onClick={() => updateCareReminder(item.clientId, item.id, true)}
                className="rounded-lg border border-teal-600 px-3 py-1.5 text-xs text-teal-100 hover:bg-teal-800/50"
              >
                标记已关怀
              </button>
            </li>
          ))
        )}
      </ul>
      {items.some((i) => i.done) && (
        <section className="opacity-60">
          <h3 className="text-xs font-medium text-teal-400">已完成</h3>
          <ul className="mt-2 space-y-1 text-sm text-teal-300/70">
            {items
              .filter((i) => i.done)
              .map((i) => (
                <li key={`${i.clientId}-${i.id}`}>
                  {i.label} — {i.maskedName}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
