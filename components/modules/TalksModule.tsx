"use client";

import { useMemo, useState } from "react";
import {
  TALK_TRACKS,
  fillTalkTrack,
  type TalkScenario,
} from "@/lib/talk-tracks";
import { useClientOps } from "@/context/ClientOpsContext";

const scenarios: TalkScenario[] = [
  "关怀",
  "到期提醒",
  "到账核对",
  "犹豫期回访",
];

export function TalksModule() {
  const { clients } = useClientOps();
  const [scenario, setScenario] = useState<TalkScenario>("关怀");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [copied, setCopied] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId) ?? clients[0];
  const tracks = useMemo(
    () => TALK_TRACKS.filter((t) => t.scenario === scenario),
    [scenario]
  );

  const vars: Record<string, string> = client
    ? {
        姓名: client.maskedName,
        产品名: client.productName,
        合同号: client.contractNo,
        到期日: client.expiryDate,
        回执号: client.reconciliation.receiptRef ?? "（无）",
        节日: "重阳节",
      }
    : {
        姓名: "",
        产品名: "",
        合同号: "",
        到期日: "",
        回执号: "",
        节日: "重阳节",
      };

  async function copy(id: string, body: string, note: string) {
    await navigator.clipboard.writeText(`${body}\n\n${note}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-teal-200">
          演练客户
          <select
            className="ml-2 rounded-lg border border-teal-700 bg-[#0f1f1c] px-2 py-1"
            value={client?.id}
            onChange={(e) => setClientId(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-1">
        {scenarios.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScenario(s)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              scenario === s
                ? "bg-teal-600 text-white"
                : "bg-teal-900/50 text-teal-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {tracks.map((track) => {
          const body = fillTalkTrack(track.body, vars);
          return (
            <div
              key={track.id}
              className="rounded-xl border border-teal-800/60 bg-[#152a25] p-4"
            >
              <h3 className="font-medium text-teal-50">{track.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-teal-100/90">
                {body}
              </p>
              <p className="mt-2 text-xs text-amber-200/90">{track.complianceNote}</p>
              <button
                type="button"
                onClick={() => copy(track.id, body, track.complianceNote)}
                className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
              >
                {copied === track.id ? "已复制" : "复制话术"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
