"use client";

import Link from "next/link";
import { useSecureClients } from "@/context/SecureClientsContext";

export function ProfilesModule() {
  const { clients, loading } = useSecureClients();

  if (loading) return <p className="text-teal-400">加载中…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      {clients.length === 0 ? (
        <p className="text-sm text-teal-400">暂无客户，请录入或导入。</p>
      ) : (
        clients.map((c) => (
          <Link
            key={c.id}
            href={`/profiles/${c.id}`}
            className="block rounded-xl border border-teal-800/40 bg-[#152a25]/70 p-4 hover:border-teal-600/40"
          >
            <p className="font-medium text-teal-50">{c.displayName}</p>
            <p className="text-xs text-teal-400">
              {c.clientCode} · 到期 {c.expiryDate || "—"} · ¥{c.amount.toLocaleString("zh-CN")}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}
