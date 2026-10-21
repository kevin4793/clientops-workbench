"use client";

import { useClientOps } from "@/context/ClientOpsContext";

export function DataModeToggle() {
  const { dataMode, setDataMode } = useClientOps();
  const isDemo = dataMode === "demo";

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-[#1a2f2a] p-1"
      role="group"
      aria-label="数据模式"
    >
      <button
        type="button"
        onClick={() => setDataMode("demo")}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
          isDemo
            ? "bg-teal-600 text-white shadow"
            : "text-teal-200/80 hover:text-teal-50"
        }`}
      >
        公开演练
      </button>
      <button
        type="button"
        onClick={() => setDataMode("snapshot")}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
          !isDemo
            ? "bg-amber-600 text-white shadow"
            : "text-teal-200/80 hover:text-teal-50"
        }`}
      >
        授权快照
      </button>
    </div>
  );
}
