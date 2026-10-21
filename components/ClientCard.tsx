"use client";

import Link from "next/link";
import { daysUntilExpiry, formatCNDate } from "@/lib/dates";
import { computePriority } from "@/lib/priority";
import type { ClientRecord, FollowUpStatus } from "@/lib/types";
import { ReconciliationBadge } from "./ReconciliationBadge";
import { useClientOps } from "@/context/ClientOpsContext";

const statusColors: Record<FollowUpStatus, string> = {
  待联系: "bg-slate-700 text-slate-100",
  已联系: "bg-blue-800/60 text-blue-100",
  待回访: "bg-amber-800/60 text-amber-100",
  已办结: "bg-emerald-800/50 text-emerald-100",
};

function formatAmount(n: number) {
  return new Intl.NumberFormat("zh-CN").format(n);
}

export function ClientCard({
  client,
  rank,
  showPriorityReason,
}: {
  client: ClientRecord;
  rank?: number;
  showPriorityReason?: boolean;
}) {
  const { updateFollowUp } = useClientOps();
  const days = daysUntilExpiry(client.expiryDate);
  const priority = computePriority(client);

  let expiryLabel = `还有 ${days} 天`;
  if (days < 0) expiryLabel = `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) expiryLabel = "今日到期";

  return (
    <article
      className={`rounded-2xl border bg-[#152a25]/80 p-4 shadow-lg transition hover:border-teal-600/40 ${
        client.reconciliation.status === "mismatch"
          ? "border-rose-500/50 ring-1 ring-rose-500/20"
          : "border-teal-800/40"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {rank !== undefined && (
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {rank}
            </span>
          )}
          <h3 className="inline text-base font-semibold text-teal-50">
            {client.displayName}
          </h3>
          <p className="mt-0.5 text-xs text-teal-300/70">
            脱敏：{client.maskedName} · {client.productType} · {client.contractNo}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[client.followUpStatus]}`}
        >
          {client.followUpStatus}
        </span>
      </div>

      <p className="mt-2 text-sm text-teal-100/90">{client.productName}</p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-teal-200/80">
        <span>
          到期：{formatCNDate(client.expiryDate)}（{expiryLabel}）
        </span>
        <span>本金（演示）：¥{formatAmount(client.principalAmount)}</span>
      </div>

      {client.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {client.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-teal-900/60 px-1.5 py-0.5 text-[10px] text-teal-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <ReconciliationBadge recon={client.reconciliation} />
      </div>

      {client.lastContactNote && (
        <p className="mt-2 text-xs text-teal-200/60">
          最近跟进：{client.lastContactAt ?? "—"} — {client.lastContactNote}
        </p>
      )}

      {showPriorityReason && (
        <p className="mt-2 rounded-lg bg-teal-950/50 px-2 py-1.5 text-xs text-amber-100/90">
          优先级：{priority.summary}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/war-room/${client.id}`}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-500"
        >
          续期作战室
        </Link>
        <select
          className="rounded-lg border border-teal-700 bg-[#0f1f1c] px-2 py-1.5 text-xs text-teal-100"
          value={client.followUpStatus}
          onChange={(e) =>
            updateFollowUp(client.id, e.target.value as FollowUpStatus)
          }
          aria-label="跟进状态"
        >
          <option value="待联系">待联系</option>
          <option value="已联系">已联系</option>
          <option value="待回访">待回访</option>
          <option value="已办结">已办结</option>
        </select>
      </div>
    </article>
  );
}
