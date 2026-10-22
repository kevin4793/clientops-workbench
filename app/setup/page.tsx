"use client";

import { useEffect, useState } from "react";

export default function SetupPage() {
  const [issues, setIssues] = useState<
    { key: string; message: string; critical: boolean }[]
  >([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => setIssues(h.issues ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-teal-50">
      <h1 className="text-xl font-semibold">站点未就绪</h1>
      <p className="mt-2 text-sm text-teal-300">
        未配置 <code className="text-teal-100">APP_PASSWORD</code> 或关键环境变量缺失时，全站锁定。
      </p>
      <section className="mt-6 rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-sm">
        <h2 className="font-medium text-amber-100">Vercel：创建 Neon Postgres</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-50/90">
          <li>打开 Vercel 项目 → <strong>Storage</strong> 或 <strong>Marketplace</strong></li>
          <li>选择 <strong>Neon</strong> → Create / Connect（区域选 Singapore 或离香港最近）</li>
          <li>连接后自动注入 <code>DATABASE_URL</code></li>
        </ol>
      </section>
      <ul className="mt-6 space-y-2 text-sm">
        {issues.map((i) => (
          <li
            key={i.key}
            className={`rounded-lg px-3 py-2 ${
              i.critical ? "bg-rose-900/30 text-rose-100" : "bg-teal-900/30"
            }`}
          >
            <strong>{i.key}</strong> — {i.message}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-teal-500">
        配置完成后 Redeploy。详见仓库 README「生产环境变量」。
      </p>
    </div>
  );
}
