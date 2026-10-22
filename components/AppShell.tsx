"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, navItemForPath } from "@/lib/nav";
import { useSecureClients } from "@/context/SecureClientsContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = navItemForPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { error, envReady } = useSecureClients();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0a1614] text-teal-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-teal-900/60 bg-[#0c1a17] transition-transform print:hidden lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <p className="text-base font-semibold text-teal-50">客户维护工作台</p>
          <p className="mb-4 text-[10px] text-teal-500">云端加密 · 单用户</p>
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm ${
                  active?.id === item.id
                    ? "bg-teal-700/50 text-white"
                    : "text-teal-200/85 hover:bg-teal-900/40"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-4 rounded-lg border border-teal-700 px-3 py-2 text-xs text-teal-200"
          >
            退出登录
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="关闭菜单"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-teal-900/60 bg-[#0f1f1c]/95 backdrop-blur print:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              className="rounded-lg border border-teal-800 px-2 py-1 text-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              菜单
            </button>
            <h1 className="text-lg font-semibold">{active?.label ?? "工作台"}</h1>
          </div>
          {!envReady && (
            <div className="border-t border-rose-600/40 bg-rose-950/50 px-4 py-2 text-center text-xs text-rose-100">
              环境未就绪 — <Link href="/setup" className="underline">查看配置说明</Link>
            </div>
          )}
          {error && envReady && (
            <div className="border-t border-amber-600/30 bg-amber-950/40 px-4 py-1.5 text-center text-xs text-amber-100">
              {error}
            </div>
          )}
        </header>
        <main className="flex-1 px-4 py-4 pb-10">{children}</main>
      </div>
    </div>
  );
}
