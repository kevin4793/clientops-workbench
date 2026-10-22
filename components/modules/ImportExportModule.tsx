"use client";

import { useState } from "react";
import { useSecureClients } from "@/context/SecureClientsContext";

export function ImportExportModule() {
  const { refresh } = useSecureClients();
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(file: File) {
    setMsg(null);
    const buf = await file.arrayBuffer();
    const res = await fetch("/api/clients/import", {
      method: "POST",
      headers: {
        "Content-Type":
          file.name.endsWith(".csv")
            ? "application/json"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      body:
        file.name.endsWith(".csv")
          ? JSON.stringify({ csv: new TextDecoder().decode(buf) })
          : buf,
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "导入失败");
      return;
    }
    setMsg(`已导入 ${data.imported} 条（已剥离禁止字段与生日年份）`);
    await refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-xs text-teal-400">
        支持从飞书表格导出的 CSV / Excel。表头可用：姓名、客户编号、生日、产品、到期日、金额、备注。
      </p>
      <section className="rounded-xl border border-teal-800/40 p-4">
        <h2 className="text-sm font-medium">导入</h2>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="mt-2 text-xs"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </section>
      <section className="rounded-xl border border-teal-800/40 p-4">
        <h2 className="text-sm font-medium">导出</h2>
        <div className="mt-2 flex gap-2">
          <a
            href="/api/clients/export?format=csv"
            className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white"
          >
            下载 CSV
          </a>
          <a
            href="/api/clients/export?format=xlsx"
            className="rounded-lg border border-teal-600 px-3 py-1.5 text-sm"
          >
            下载 Excel
          </a>
        </div>
      </section>
      {msg && <p className="text-sm text-teal-200">{msg}</p>}
    </div>
  );
}
