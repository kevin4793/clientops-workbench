"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { inExpiryBucket } from "@/lib/dates";
import { sortByPriority } from "@/lib/priority";
import { NAV_ITEMS } from "@/lib/nav";
import { AuditTrail } from "./AuditTrail";

export function OverviewDashboard() {
  const { clients } = useClientOps();

  const stats = useMemo(() => {
    const openTasks = clients.flatMap((c) =>
      c.maintenanceTasks.filter((t) => t.status !== "已办结")
    );
    const careDue = clients.flatMap((c) =>
      c.careReminders.filter((r) => !r.done)
    );
    const expiring = clients.filter(
      (c) =>
        inExpiryBucket(c.expiryDate, "today") ||
        inExpiryBucket(c.expiryDate, "week") ||
        inExpiryBucket(c.expiryDate, "overdue")
    );
    const holdingsCount = clients.reduce((n, c) => n + c.holdings.length, 0);
    const top = sortByPriority(
      clients.filter((c) => c.followUpStatus !== "已办结")
    ).slice(0, 3);

    return {
      openTasks: openTasks.length,
      careDue: careDue.length,
      expiring: expiring.length,
      holdingsCount,
      top,
    };
  }, [clients]);

  const modules = NAV_ITEMS.filter((n) => n.id !== "overview");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="rounded-xl border border-teal-800/30 bg-teal-950/30 px-3 py-2 text-xs leading-relaxed text-teal-200/80">
        客户维护工作台覆盖档案、关怀、持仓、任务与服务记录；<strong className="font-medium text-teal-100">到期运营</strong>仅为其中一个模块。全部为虚构演示数据，不构成投资建议。
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="待办维护任务" value={stats.openTasks} href="/tasks" />
        <StatCard label="待关怀事项" value={stats.careDue} href="/care" />
        <StatCard label="到期关注客户" value={stats.expiring} href="/expiry" />
        <StatCard label="持仓笔数（演示）" value={stats.holdingsCount} href="/holdings" />
      </div>

      <section className="rounded-2xl border border-teal-800/40 bg-[#152a25]/60 p-4">
        <h2 className="text-sm font-semibold text-teal-50">今日优先（跨模块）</h2>
        <ul className="mt-3 space-y-2">
          {stats.top.length === 0 ? (
            <li className="text-sm text-teal-300/60">暂无紧急事项</li>
          ) : (
            stats.top.map((c, i) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0f1f1c]/80 px-3 py-2 text-sm"
              >
                <span>
                  {i + 1}. {c.maskedName} — {c.productName}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/profiles/${c.id}`}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    档案
                  </Link>
                  <Link
                    href={`/war-room/${c.id}`}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    作战室
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-teal-100">功能模块</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="rounded-xl border border-teal-800/40 bg-[#152a25]/50 p-4 transition hover:border-teal-600/50 hover:bg-[#152a25]"
            >
              <p className="font-medium text-teal-50">{m.label}</p>
              <p className="mt-1 text-xs text-teal-300/70">{m.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <AuditTrail />
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-teal-800/40 bg-[#152a25]/70 p-4 transition hover:border-teal-600/40"
    >
      <p className="text-2xl font-bold text-teal-50">{value}</p>
      <p className="mt-1 text-xs text-teal-300/80">{label}</p>
    </Link>
  );
}
