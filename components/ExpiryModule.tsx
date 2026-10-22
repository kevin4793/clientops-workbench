"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSecureClients } from "@/context/SecureClientsContext";

type Bucket = "week" | "overdue" | "month";

export function ExpiryModule() {
  const { clients, loading } = useSecureClients();
  const [bucket, setBucket] = useState<Bucket>("week");
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const filtered = useMemo(() => {
    if (!today) return [];
    const todayStr = today;
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const weekEnd = in7.toISOString().slice(0, 10);
    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const monthEndStr = monthEnd.toISOString().slice(0, 10);

    return clients.filter((c) => {
      if (!c.expiryDate) return false;
      if (bucket === "overdue") return c.expiryDate < todayStr;
      if (bucket === "week")
        return c.expiryDate >= todayStr && c.expiryDate <= weekEnd;
      return c.expiryDate >= todayStr && c.expiryDate <= monthEndStr;
    });
  }, [clients, bucket, today]);

  if (loading) return <p className="text-teal-400">加载中…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        {(
          [
            ["week", "7 日内"],
            ["overdue", "已逾期"],
            ["month", "30 日内"],
          ] as [Bucket, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBucket(id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              bucket === id ? "bg-teal-600 text-white" : "bg-teal-900/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {filtered.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-teal-800/40 bg-[#152a25]/60 px-4 py-3"
          >
            <Link href={`/profiles/${c.id}`} className="font-medium text-teal-50">
              {c.displayName}
            </Link>
            <p className="text-xs text-teal-400">
              {c.productName} · 到期 {c.expiryDate} · ¥{c.amount.toLocaleString("zh-CN")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
