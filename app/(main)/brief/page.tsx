"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { REFERENCE_DATE, inExpiryBucket } from "@/lib/dates";
import { sortByPriority, computePriority } from "@/lib/priority";
import { fillTalkTrack, TALK_TRACKS } from "@/lib/talk-tracks";

export default function BriefPage() {
  const { clients, addAudit } = useClientOps();

  const targets = useMemo(() => {
    const list = clients.filter(
      (c) =>
        c.followUpStatus !== "已办结" &&
        (inExpiryBucket(c.expiryDate, "today") ||
          inExpiryBucket(c.expiryDate, "overdue") ||
          inExpiryBucket(c.expiryDate, "week"))
    );
    return sortByPriority(list).slice(0, 10);
  }, [clients]);

  const openMaintenance = useMemo(
    () =>
      clients.flatMap((c) =>
        c.maintenanceTasks
          .filter((t) => t.status !== "已办结")
          .map((t) => ({ ...t, maskedName: c.maskedName }))
      ).slice(0, 5),
    [clients]
  );

  const dateLabel = `${REFERENCE_DATE.getFullYear()}-${String(
    REFERENCE_DATE.getMonth() + 1
  ).padStart(2, "0")}-${String(REFERENCE_DATE.getDate()).padStart(2, "0")}`;

  const markdown = useMemo(() => {
    const lines = [
      `# 晨会简报 · 客户维护`,
      ``,
      `**业务日**：${dateLabel}`,
      ``,
      `> 演示数据；不构成投资建议。`,
      ``,
      `## 到期外呼优先`,
      ``,
    ];
    targets.forEach((c, i) => {
      const p = computePriority(c);
      lines.push(
        `${i + 1}. **${c.maskedName}** — ${p.summary}`,
        ``
      );
    });
    lines.push(`## 其他维护任务`, ``);
    openMaintenance.forEach((t) => {
      lines.push(`- ${t.maskedName}：${t.title}（${t.status}）`);
    });
    return lines.join("\n");
  }, [targets, openMaintenance, dateLabel]);

  function handlePrint() {
    addAudit("导出/打印晨会简报");
    window.print();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    addAudit("复制晨会简报 Markdown");
  }

  return (
    <div className="brief-print mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap gap-2 print:hidden">
        <Link href="/" className="text-sm text-teal-400">← 总览</Link>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white"
        >
          复制 Markdown
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg border border-teal-600 px-3 py-1.5 text-sm text-teal-100"
        >
          打印
        </button>
      </div>

      <article className="rounded-xl bg-white p-6 text-slate-900 shadow print:shadow-none">
        <h1 className="text-2xl font-bold">晨会简报 · 客户维护</h1>
        <p className="mt-2 text-sm"><strong>业务日</strong>：{dateLabel}</p>
        <p className="mt-2 text-sm text-slate-600">
          演示数据，虚构客户；不构成投资建议。
        </p>
        <h2 className="mt-6 text-lg font-semibold">今日到期外呼顺序</h2>
        {targets.length === 0 ? (
          <p className="text-sm">今日无强制到期外呼对象。</p>
        ) : (
          <ol className="mt-2 list-decimal space-y-4 pl-5 text-sm">
            {targets.map((c) => {
              const p = computePriority(c);
              const track = TALK_TRACKS.find((t) => t.scenario === "到期提醒");
              const snippet = track
                ? fillTalkTrack(track.body, {
                    姓名: c.maskedName,
                    产品名: c.productName,
                    合同号: c.contractNo,
                    到期日: c.expiryDate,
                    回执号: c.reconciliation.receiptRef ?? "—",
                    节日: "重阳节",
                  })
                : "";
              return (
                <li key={c.id}>
                  <strong>{c.maskedName}</strong> · {c.productName}
                  <ul className="mt-1 list-disc pl-4 text-slate-700">
                    <li>为什么：{p.summary}</li>
                    <li>说什么：{snippet.slice(0, 100)}…</li>
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
        <h2 className="mt-6 text-lg font-semibold">其他维护任务摘要</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
          {openMaintenance.length === 0 ? (
            <li>无</li>
          ) : (
            openMaintenance.map((t) => (
              <li key={t.id + t.title}>
                {t.maskedName}：{t.title}（{t.status}）
              </li>
            ))
          )}
        </ul>
        <hr className="my-6" />
        <p className="text-xs text-slate-500">
          【合规】不得承诺收益；话术以产品说明书与客户风险等级为准。
        </p>
      </article>
    </div>
  );
}
