"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => {
        if (!h.hasAppPassword) {
          router.replace("/setup");
          return;
        }
        if (!h.configured) {
          setIssues(
            (h.issues as { message: string; critical: boolean }[])
              .filter((i) => i.critical)
              .map((i) => i.message)
          );
        }
      });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "rate_limited") {
        setError(`尝试过多，请 ${data.retryAfterSec ?? 900} 秒后重试`);
      } else if (data.error === "env_incomplete") {
        setError(data.message);
      } else {
        setError("密码错误或无法登录");
      }
      return;
    }
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1614] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-teal-800 bg-[#152a25] p-6"
      >
        <h1 className="text-lg font-semibold text-teal-50">客户维护工作台</h1>
        <p className="mt-1 text-xs text-teal-400">单用户登录 · 真实客户数据</p>
        {issues.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-amber-200">
            {issues.map((m) => (
              <li key={m}>⚠ {m}</li>
            ))}
          </ul>
        )}
        <label className="mt-4 block text-sm text-teal-200">
          密码
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-teal-700 bg-[#0f1f1c] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white"
        >
          登录
        </button>
      </form>
    </div>
  );
}
