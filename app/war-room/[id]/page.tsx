"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { daysUntilExpiry, formatCNDate } from "@/lib/dates";
import { computePriority } from "@/lib/priority";
import { ReconciliationBadge } from "@/components/ReconciliationBadge";
import { TalkTrackDrawer } from "@/components/TalkTrackDrawer";

export default function WarRoomPage() {
  const params = useParams();
  const id = params.id as string;
  const { getClient, updateGap, updateComplianceCheck, addAudit } = useClientOps();
  const client = getClient(id);
  const [talkOpen, setTalkOpen] = useState(false);

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1614] text-teal-100">
        <p>未找到该客户（可能切换了数据模式）。</p>
        <Link href="/" className="mt-4 text-teal-400 underline">
          返回看板
        </Link>
      </div>
    );
  }

  const days = daysUntilExpiry(client.expiryDate);
  const priority = computePriority(client);

  return (
    <div className="min-h-screen bg-[#0a1614] text-teal-50">
      <header className="border-b border-teal-900/60 bg-[#0f1f1c] px-4 py-4">
        <Link href="/" className="text-sm text-teal-400 hover:underline">
          ← 返回看板
        </Link>
        <h1 className="mt-2 text-xl font-semibold">续期作战室</h1>
        <p className="text-sm text-teal-300/80">{client.displayName}</p>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">关键信息</h2>
          <ul className="mt-2 space-y-1 text-sm text-teal-200/90">
            <li>产品：{client.productName}</li>
            <li>到期日：{formatCNDate(client.expiryDate)}（{days < 0 ? `逾期 ${Math.abs(days)} 天` : `剩 ${days} 天`}）</li>
            <li>合同/保单号：{client.contractNo}</li>
          </ul>
          <p className="mt-3 rounded-lg bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
            优先级解读：{priority.reasons.join("；")}
          </p>
        </section>

        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">关键日期时间线</h2>
          <ol className="mt-4 space-y-3 border-l-2 border-teal-700 pl-4">
            {client.timeline.map((ev) => (
              <li key={ev.id} className="relative">
                <span
                  className={`absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full ${
                    ev.done ? "bg-teal-500" : "bg-slate-500"
                  }`}
                />
                <p className="text-xs text-teal-400">{ev.date}</p>
                <p className="text-sm text-teal-50">{ev.label}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">到期 × 到账核对</h2>
          <div className="mt-2">
            <ReconciliationBadge recon={client.reconciliation} />
          </div>
        </section>

        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">缺口清单</h2>
          <ul className="mt-3 space-y-2">
            {client.gaps.length === 0 ? (
              <li className="text-sm text-teal-300/60">无待办缺口</li>
            ) : (
              client.gaps.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={g.resolved}
                    onChange={(e) => {
                      updateGap(client.id, g.id, e.target.checked);
                    }}
                    className="rounded border-teal-600"
                  />
                  <span className={g.resolved ? "text-teal-400/60 line-through" : ""}>
                    {g.label}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">建议下一步（动作级）</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-teal-200/90">
            {client.suggestedActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-teal-400/70">
            以上为运营动作建议，不包含具体产品推介或收益承诺。
          </p>
        </section>

        <section className="rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-100">合规检查勾选</h2>
          <ul className="mt-3 space-y-2">
            {client.complianceChecks.map((ch) => (
              <li key={ch.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ch.checked}
                  onChange={(e) =>
                    updateComplianceCheck(client.id, ch.id, e.target.checked)
                  }
                />
                {ch.label}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTalkOpen(true);
              addAudit("打开合规话术", client.id);
            }}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          >
            合规话术抽屉
          </button>
        </div>
      </main>

      <TalkTrackDrawer
        client={client}
        open={talkOpen}
        onClose={() => setTalkOpen(false)}
      />
    </div>
  );
}
