"use client";

import { useClientOps } from "@/context/ClientOpsContext";
import { sortByPriority } from "@/lib/priority";
import { inExpiryBucket } from "@/lib/dates";

export function FollowUpPanel() {
  const { clients, generateTodayTodos, addAudit } = useClientOps();
  const todos = sortByPriority(generateTodayTodos());
  const urgent = clients.filter(
    (c) =>
      inExpiryBucket(c.expiryDate, "today") ||
      inExpiryBucket(c.expiryDate, "overdue")
  );

  function handleGenerate() {
    addAudit("生成今日跟进清单", undefined, `${todos.length} 条待办`);
  }

  return (
    <section className="rounded-2xl border border-teal-800/40 bg-[#152a25]/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-teal-50">今日跟进清单</h2>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
        >
          刷新清单
        </button>
      </div>
      <p className="mt-1 text-xs text-teal-300/70">
        待联系/待回访 {todos.length} 人 · 今日或逾期 {urgent.length} 人
      </p>
      <ol className="mt-3 space-y-2">
        {todos.length === 0 ? (
          <li className="text-sm text-teal-300/60">暂无待办，辛苦了。</li>
        ) : (
          todos.slice(0, 8).map((c, i) => (
            <li
              key={c.id}
              className="flex gap-2 rounded-lg bg-[#0f1f1c]/80 px-3 py-2 text-sm text-teal-100"
            >
              <span className="font-bold text-teal-400">{i + 1}.</span>
              <span>
                {c.maskedName} — {c.productName}（{c.followUpStatus}）
              </span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
