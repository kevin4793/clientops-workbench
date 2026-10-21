"use client";

import type { ExpiryBucket } from "@/lib/types";

const tabs: { id: ExpiryBucket; label: string }[] = [
  { id: "today", label: "今日" },
  { id: "week", label: "7 日内" },
  { id: "overdue", label: "已逾期" },
  { id: "month", label: "本月" },
];

export function ExpiryTabs({
  active,
  counts,
  onChange,
}: {
  active: ExpiryBucket;
  counts: Record<ExpiryBucket, number>;
  onChange: (b: ExpiryBucket) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-teal-800/40 bg-[#0f1f1c] p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
            active === t.id
              ? "bg-teal-600 text-white"
              : "text-teal-200/80 hover:bg-teal-900/40 hover:text-teal-50"
          }`}
        >
          {t.label}
          <span className="ml-1.5 text-xs opacity-80">({counts[t.id]})</span>
        </button>
      ))}
    </div>
  );
}
