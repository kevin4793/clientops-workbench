"use client";

import { useMemo, useState } from "react";
import {
  TALK_TRACKS,
  fillTalkTrack,
  type TalkScenario,
} from "@/lib/talk-tracks";
import type { ClientRecord } from "@/lib/types";

const scenarios: TalkScenario[] = [
  "关怀",
  "到期提醒",
  "到账核对",
  "犹豫期回访",
];

export function TalkTrackDrawer({
  client,
  open,
  onClose,
}: {
  client: ClientRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  const [scenario, setScenario] = useState<TalkScenario>("到期提醒");
  const [copied, setCopied] = useState<string | null>(null);

  const tracks = useMemo(
    () => TALK_TRACKS.filter((t) => t.scenario === scenario),
    [scenario]
  );

  if (!open || !client) return null;

  const vars = {
    姓名: client.maskedName,
    产品名: client.productName,
    合同号: client.contractNo,
    到期日: client.expiryDate,
    回执号: client.reconciliation.receiptRef ?? "（无）",
    节日: "重阳节",
  };

  async function copyText(id: string, body: string, note: string) {
    const full = `${body}\n\n${note}`;
    await navigator.clipboard.writeText(full);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="关闭"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-teal-800 bg-[#0f1f1c] shadow-2xl"
        role="dialog"
        aria-labelledby="talk-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-teal-800 px-4 py-3">
          <h2 id="talk-drawer-title" className="text-lg font-semibold text-teal-50">
            合规话术
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-teal-300 hover:bg-teal-900"
          >
            关闭
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-teal-300/70">
          客户：{client.displayName} · 场景话术可复制，不含投资建议
        </p>
        <div className="flex gap-1 px-4 pb-2">
          {scenarios.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className={`rounded-lg px-2 py-1 text-xs ${
                scenario === s
                  ? "bg-teal-600 text-white"
                  : "bg-teal-900/50 text-teal-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
          {tracks.map((track) => {
            const body = fillTalkTrack(track.body, vars);
            return (
              <div
                key={track.id}
                className="rounded-xl border border-teal-800/60 bg-[#152a25] p-3"
              >
                <h3 className="text-sm font-medium text-teal-50">{track.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-teal-100/90">
                  {body}
                </p>
                <p className="mt-2 text-xs text-amber-200/90">{track.complianceNote}</p>
                <button
                  type="button"
                  onClick={() => copyText(track.id, body, track.complianceNote)}
                  className="mt-3 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-500"
                >
                  {copied === track.id ? "已复制" : "一键复制（含合规提示）"}
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
