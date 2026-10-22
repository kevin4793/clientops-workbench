"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSecureClients } from "@/context/SecureClientsContext";

export function OverviewDashboard() {
  const { clients, loading } = useSecureClients();

  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const stats = useMemo(() => {
    if (!today) return { total: clients.length, expiring: 0, overdue: 0 };
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    const end = in7.toISOString().slice(0, 10);
    const expiring = clients.filter(
      (c) => c.expiryDate && c.expiryDate >= today && c.expiryDate <= end
    );
    const overdue = clients.filter((c) => c.expiryDate && c.expiryDate < today);
    return { total: clients.length, expiring: expiring.length, overdue: overdue.length };
  }, [clients, today]);

  if (loading) {
    return <p className="text-teal-400">加载云端客户…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="rounded-xl border border-teal-800/30 bg-teal-950/30 px-3 py-2 text-xs text-teal-200/80">
        客户记录经 AES-256-GCM 加密后存入 Neon Postgres；不存储手机、身份证、账号。演示 JSON 不会自动上传。
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="客户总数" value={stats.total} href="/profiles" />
        <Stat label="7 日内到期" value={stats.expiring} href="/expiry" />
        <Stat label="已逾期" value={stats.overdue} href="/expiry" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/intake" className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white">
          高效录入
        </Link>
        <Link
          href="/import-export"
          className="rounded-lg border border-teal-600 px-4 py-2 text-sm"
        >
          导入 / 导出
        </Link>
      </div>
    </div>
  );
}

function Stat({
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
      className="rounded-xl border border-teal-800/40 bg-[#152a25]/70 p-4"
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-teal-400">{label}</p>
    </Link>
  );
}
