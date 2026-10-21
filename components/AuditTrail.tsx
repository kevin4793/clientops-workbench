"use client";

import { useClientOps } from "@/context/ClientOpsContext";

export function AuditTrail() {
  const { auditLog } = useClientOps();

  return (
    <section className="rounded-2xl border border-teal-800/40 bg-[#152a25]/60 p-4">
      <h2 className="text-sm font-semibold text-teal-50">审计轨迹（本地演示）</h2>
      <p className="mt-1 text-xs text-teal-300/60">
        记录状态变更操作，正式环境应对接行内审计系统
      </p>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {auditLog.slice(0, 12).map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-teal-900/50 bg-[#0f1f1c]/80 px-3 py-2 text-xs"
          >
            <div className="flex flex-wrap justify-between gap-1 text-teal-200/70">
              <span>{e.actor}</span>
              <time dateTime={e.at}>
                {new Date(e.at).toLocaleString("zh-CN", { hour12: false })}
              </time>
            </div>
            <p className="mt-0.5 font-medium text-teal-100">{e.action}</p>
            {e.detail && (
              <p className="text-teal-300/60">{e.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
