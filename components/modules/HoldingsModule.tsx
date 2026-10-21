"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useClientOps } from "@/context/ClientOpsContext";
import { daysUntilExpiry } from "@/lib/dates";

function fmt(n: number) {
  return new Intl.NumberFormat("zh-CN").format(n);
}

export function HoldingsModule() {
  const { clients } = useClientOps();
  const search = useSearchParams();
  const filterClient = search.get("client");

  const rows = useMemo(() => {
    return clients.flatMap((c) =>
      c.holdings.map((h) => ({
        ...h,
        clientId: c.id,
        clientName: c.displayName,
        maskedName: c.maskedName,
      }))
    ).filter((r) => !filterClient || r.clientId === filterClient);
  }, [clients, filterClient]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {filterClient && (
        <Link href="/holdings" className="text-sm text-teal-400 hover:underline">
          显示全部客户持仓
        </Link>
      )}
      <div className="overflow-x-auto rounded-xl border border-teal-800/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-teal-950/80 text-xs text-teal-400">
            <tr>
              <th className="px-3 py-2">客户</th>
              <th className="px-3 py-2">产品</th>
              <th className="px-3 py-2">类型</th>
              <th className="px-3 py-2">金额（演示）</th>
              <th className="px-3 py-2">到期</th>
              <th className="px-3 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const days = r.expiryDate ? daysUntilExpiry(r.expiryDate) : null;
              return (
                <tr
                  key={r.id + r.clientId}
                  className="border-t border-teal-900/50 hover:bg-teal-950/30"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/profiles/${r.clientId}`}
                      className="text-teal-300 hover:underline"
                    >
                      {r.maskedName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-teal-100">{r.productName}</td>
                  <td className="px-3 py-2">{r.productType}</td>
                  <td className="px-3 py-2">¥{fmt(r.principalAmount)}</td>
                  <td className="px-3 py-2">
                    {r.expiryDate ?? "—"}
                    {days !== null && (
                      <span className="ml-1 text-xs text-teal-500">
                        ({days < 0 ? `逾${Math.abs(days)}天` : `${days}天`})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        r.status === "已到期"
                          ? "bg-rose-900/50 text-rose-100"
                          : r.status === "即将到期"
                            ? "bg-amber-900/40 text-amber-100"
                            : "bg-teal-900/50 text-teal-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-teal-400/70">
        共 {rows.length} 笔持仓（演示）。到期运营看板仍可按「主到期产品」筛选，详见到期模块。
      </p>
    </div>
  );
}
