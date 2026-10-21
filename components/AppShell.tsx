"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, navItemForPath } from "@/lib/nav";
import { REFERENCE_DATE } from "@/lib/dates";
import { DataModeToggle } from "./DataModeToggle";
import { useClientOps } from "@/context/ClientOpsContext";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const active = navItemForPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataMode } = useClientOps();

  const dateStr = `${REFERENCE_DATE.getFullYear()}年${
    REFERENCE_DATE.getMonth() + 1
  }月${REFERENCE_DATE.getDate()}日`;

  return (
    <div className="flex min-h-screen bg-[#0a1614] text-teal-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-teal-900/60 bg-[#0c1a17] transition-transform print:hidden lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <Link href="/" className="mb-1 block" onClick={() => setMobileOpen(false)}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-teal-500">
              Client Maintenance Ops
            </p>
            <p className="text-base font-semibold leading-tight text-teal-50">
              客户维护工作台
            </p>
          </Link>
          <p className="mb-4 text-[11px] text-teal-400/70">业务日 {dateStr}</p>
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = active?.id === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 transition ${
                    isActive
                      ? "bg-teal-700/50 text-white"
                      : "text-teal-200/85 hover:bg-teal-900/40 hover:text-teal-50"
                  }`}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-teal-900/50 pt-4">
            <DataModeToggle />
          </div>
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
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold">
                {title ?? active?.label ?? "客户维护工作台"}
              </h1>
              {(subtitle ?? active?.description) && (
                <p className="truncate text-xs text-teal-300/70">
                  {subtitle ?? active?.description}
                </p>
              )}
            </div>
          </div>
          {dataMode === "snapshot" && (
            <div className="border-t border-amber-600/30 bg-amber-950/40 px-4 py-1.5 text-center text-[11px] text-amber-100">
              授权测试快照 — 与公开演练库隔离，仍为虚构数据
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-4 pb-10">{children}</main>
      </div>
    </div>
  );
}
