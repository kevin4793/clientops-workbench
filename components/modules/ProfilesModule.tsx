"use client";

import Link from "next/link";
import { useClientOps } from "@/context/ClientOpsContext";

export function ProfilesModule() {
  const { clients } = useClientOps();

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/profiles/${c.id}`}
            className="rounded-2xl border border-teal-800/40 bg-[#152a25]/70 p-4 transition hover:border-teal-600/40"
          >
            <h3 className="font-semibold text-teal-50">{c.displayName}</h3>
            <p className="text-xs text-teal-400/80">脱敏 {c.maskedName}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-[10px] uppercase text-teal-500">家庭结构</dt>
                <dd className="text-teal-100/90">{c.profile.familyStructure}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase text-teal-500">风险偏好</dt>
                <dd className="flex flex-wrap gap-1">
                  {c.profile.riskPreferenceTags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-teal-900/60 px-1.5 py-0.5 text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase text-teal-500">最近接触</dt>
                <dd className="text-teal-200/80">{c.profile.recentContactSummary}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
