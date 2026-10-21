"use client";

import { useMemo } from "react";
import { useClientOps } from "@/context/ClientOpsContext";

const channelIcon: Record<string, string> = {
  电话: "📞",
  面会: "🏦",
  微信: "💬",
  短信: "✉️",
};

export function TimelineModule() {
  const { clients } = useClientOps();

  const events = useMemo(() => {
    return clients
      .flatMap((c) =>
        c.serviceRecords.map((r) => ({
          ...r,
          clientId: c.id,
          clientName: c.displayName,
          maskedName: c.maskedName,
        }))
      )
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [clients]);

  return (
    <div className="mx-auto max-w-2xl">
      {events.length === 0 ? (
        <p className="text-sm text-teal-300/60">暂无服务记录（演示）</p>
      ) : (
        <ol className="space-y-4 border-l-2 border-teal-800 pl-4">
          {events.map((e) => (
            <li key={e.id + e.clientId} className="relative">
              <span className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-xs text-teal-400">
                {new Date(e.at).toLocaleString("zh-CN", { hour12: false })}
              </p>
              <p className="text-sm font-medium text-teal-50">
                {channelIcon[e.channel] ?? "•"} {e.channel} · {e.maskedName}
              </p>
              <p className="mt-1 text-sm text-teal-200/85">{e.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
