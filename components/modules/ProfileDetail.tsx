"use client";

import Link from "next/link";
import { useClientOps } from "@/context/ClientOpsContext";
import { EXTENDED_FIELD_LABELS } from "@/lib/profile-extended";

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

  const ext = c.profile.extended;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/profiles" className="text-sm text-teal-400 hover:underline">
        ← 客户档案列表
      </Link>
      <section className="rounded-2xl border border-teal-800/40 bg-[#152a25] p-5">
        <h2 className="text-xl font-semibold">{c.displayName}</h2>
        <p className="text-sm text-teal-400">客户编号（演示）{c.id}</p>
        {c.tags.includes("高效录入") && (
          <span className="mt-2 inline-block rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-100">
            高效录入登记
          </span>
        )}
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-teal-500">产品代码</dt>
            <dd className="mt-1 text-teal-100">{c.profile.productCode || "—"}</dd>
          </div>
          <div>
            <dt className="text-teal-500">家庭结构（摘要）</dt>
            <dd className="mt-1 text-teal-100">{c.profile.familyStructure}</dd>
          </div>
          <div>
            <dt className="text-teal-500">生日 / 出生</dt>
            <dd className="mt-1 text-teal-100">
              {ext.dob || c.profile.birthday || "—"}
            </dd>
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
          {c.profile.contactNotes && (
            <div>
              <dt className="text-teal-500">接触备注</dt>
              <dd className="mt-1 text-teal-100">{c.profile.contactNotes}</dd>
            </div>
          )}
        </dl>

        <h3 className="mt-6 text-sm font-semibold text-teal-200">档案扩展字段</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {(Object.keys(EXTENDED_FIELD_LABELS) as (keyof typeof ext)[]).map(
            (key) => {
              const val = ext[key];
              if (!val) return null;
              return (
                <div key={key} className="rounded-lg bg-[#0f1f1c]/60 p-2">
                  <dt className="text-[10px] text-teal-500">
                    {EXTENDED_FIELD_LABELS[key]}
                  </dt>
                  <dd className="text-sm text-teal-100">{val}</dd>
                </div>
              );
            }
          )}
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
