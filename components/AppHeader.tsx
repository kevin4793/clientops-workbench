"use client";

import Link from "next/link";
import { REFERENCE_DATE } from "@/lib/dates";
import { DataModeToggle } from "./DataModeToggle";

export function AppHeader() {
  const dateStr = `${REFERENCE_DATE.getFullYear()}年${
    REFERENCE_DATE.getMonth() + 1
  }月${REFERENCE_DATE.getDate()}日`;

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/60 bg-[#0f1f1c]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-teal-400/90">
            客户到期工作台 · 银行理财经理版
          </p>
          <h1 className="text-lg font-semibold text-teal-50 sm:text-xl">
            到期与续期运营看板
          </h1>
          <p className="text-xs text-teal-200/70">业务日：{dateStr}（演示基准）</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <DataModeToggle />
          <Link
            href="/brief"
            className="rounded-lg border border-teal-600/50 bg-teal-800/40 px-3 py-2 text-sm text-teal-50 transition hover:bg-teal-700/50"
          >
            晨会简报
          </Link>
        </div>
      </div>
    </header>
  );
}
