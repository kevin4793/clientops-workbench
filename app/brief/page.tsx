"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { REFERENCE_DATE } from "@/lib/dates";
import { sortByPriority, computePriority } from "@/lib/priority";
import { inExpiryBucket } from "@/lib/dates";
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

  const dateLabel = `${REFERENCE_DATE.getFullYear()}-${String(
    REFERENCE_DATE.getMonth() + 1
  ).padStart(2, "0")}-${String(REFERENCE_DATE.getDate()).padStart(2, "0")}`;

  const markdown = useMemo(() => {
    const lines = [
      `# 晨会简报 · 客户到期跟进`,
      ``,
      `**业务日**：${dateLabel}`,
      ``,
      `> 演示数据，虚构客户；不构成投资建议。`,
      ``,
      `## 今日建议外呼顺序`,
      ``,
    ];
    targets.forEach((c, i) => {
      const p = computePriority(c);
      const track = TALK_TRACKS.find((t) => t.scenario === "到期提醒");
      const snippet = track
        ? fillTalkTrack(track.body, {
            姓名: c.maskedName,
            产品名: c.productName,
            合同号: c.contractNo,
            到期日: c.expiryDate,
            回执号: c.reconciliation.receiptRef ?? "—",
          }).split("\n")[0]
        : "（请从话术库选择）";
      lines.push(
        `### ${i + 1}. ${c.maskedName} · ${c.productName}`,
        `- **为什么**：${p.summary}`,
        `- **状态**：${c.followUpStatus}；到账核对：${c.reconciliation.status}`,
        `- **说什么（摘要）**：${snippet}`,
        ``
      );
    });
    lines.push(`---`, `导出时间：${new Date().toLocaleString("zh-CN")}`);
    return lines.join("\n");
  }, [targets, dateLabel]);

  function handlePrint() {
    addAudit("导出/打印晨会简报");
    window.print();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    addAudit("复制晨会简报 Markdown");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-white">
      <div className="border-b border-slate-200 bg-[#0f1f1c] px-4 py-3 text-teal-50 print:hidden">
        <Link href="/" className="text-sm text-teal-400">← 返回看板</Link>
        <h1 className="mt-1 text-lg font-semibold">晨会简报</h1>
        <div className="mt-2 flex gap-2">
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
            className="rounded-lg border border-teal-600 px-3 py-1.5 text-sm"
          >
            打印友好页
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-2xl px-6 py-8 prose prose-slate print:max-w-none">
        <h1>晨会简报 · 客户到期跟进</h1>
        <p><strong>业务日</strong>：{dateLabel}</p>
        <blockquote>
          <p>演示数据，虚构客户；不构成投资建议。</p>
        </blockquote>
        <h2>今日建议外呼顺序</h2>
        {targets.length === 0 ? (
          <p>今日无强制外呼对象。</p>
        ) : (
          <ol>
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
                  })
                : "";
              return (
                <li key={c.id} className="mb-6">
                  <strong>{c.maskedName}</strong> · {c.productName}
                  <ul>
                    <li>为什么：{p.summary}</li>
                    <li>状态：{c.followUpStatus}</li>
                    <li>说什么：{snippet.slice(0, 120)}…</li>
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
        <hr />
        <p className="text-sm text-slate-500">
          【合规】外呼话术不得承诺收益；请以产品说明书与客户风险等级为准。
        </p>
      </article>

      <pre className="mx-auto mt-4 hidden max-w-2xl overflow-x-auto rounded bg-slate-100 p-4 text-xs print:hidden md:block">
        {markdown}
      </pre>
    </div>
  );
}
