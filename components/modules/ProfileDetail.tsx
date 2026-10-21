"use client";

import Link from "next/link";
import { useClientOps } from "@/context/ClientOpsContext";

export function ProfileDetail({ clientId }: { clientId: string }) {
  const { getClient } = useClientOps();
  const c = getClient(clientId);

  if (!c) {
    return (
      <p className="text-teal-300">
        未找到客户。
        <Link href="/profiles" className="ml-2 text-teal-400 underline">
          返回列表
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/profiles" className="text-sm text-teal-400 hover:underline">
        ← 客户档案列表
      </Link>
      <section className="rounded-2xl border border-teal-800/40 bg-[#152a25] p-5">
        <h2 className="text-xl font-semibold">{c.displayName}</h2>
        <p className="text-sm text-teal-400">客户编号（演示）{c.id}</p>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-teal-500">家庭结构</dt>
            <dd className="mt-1 text-teal-100">{c.profile.familyStructure}</dd>
          </div>
          <div>
            <dt className="text-teal-500">生日</dt>
            <dd className="mt-1 text-teal-100">{c.profile.birthday}</dd>
          </div>
          <div>
            <dt className="text-teal-500">风险偏好标签</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {c.profile.riskPreferenceTags.map((t) => (
                <span key={t} className="rounded bg-teal-900 px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-teal-500">成为客户</dt>
            <dd className="mt-1 text-teal-100">{c.profile.memberSince ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-teal-500">最近接触摘要</dt>
            <dd className="mt-1 text-teal-100">{c.profile.recentContactSummary}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/holdings?client=${c.id}`}
            className="rounded-lg bg-teal-800/50 px-3 py-1.5 text-sm"
          >
            查看持仓
          </Link>
          <Link
            href={`/war-room/${c.id}`}
            className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white"
          >
            续期作战室
          </Link>
        </div>
      </section>
    </div>
  );
}
