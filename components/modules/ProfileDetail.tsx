"use client";

import Link from "next/link";
import { useState } from "react";
import { useSecureClients } from "@/context/SecureClientsContext";

export function ProfileDetail({ clientId }: { clientId: string }) {
  const { clients, saveClient, removeClient } = useSecureClients();
  const c = clients.find((x) => x.id === clientId);
  const [form, setForm] = useState<typeof c>(c);
  const [msg, setMsg] = useState<string | null>(null);

  if (!c || !form) {
    return (
      <p className="text-teal-300">
        未找到客户。
        <Link href="/profiles" className="ml-2 underline">返回</Link>
      </p>
    );
  }

  async function save() {
    if (!c || !form) return;
    await saveClient({
      displayName: form.displayName,
      clientCode: form.clientCode,
      birthdayMmDd: form.birthdayMmDd,
      productName: form.productName,
      expiryDate: form.expiryDate,
      amount: form.amount,
      notes: form.notes,
      id: c.id,
    });
    setMsg("已保存");
  }

  async function del() {
    if (!c) return;
    if (!confirm("确认删除该客户记录？")) return;
    await removeClient(c.id);
    window.location.href = "/profiles";
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "displayName", label: "姓名" },
    { key: "clientCode", label: "客户编号" },
    { key: "birthdayMmDd", label: "生日 (MM-DD)" },
    { key: "productName", label: "产品" },
    { key: "expiryDate", label: "到期日" },
    { key: "amount", label: "金额" },
    { key: "notes", label: "备注" },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/profiles" className="text-sm text-teal-400 underline">← 列表</Link>
      {fields.map((f) => (
        <label key={f.key} className="block text-sm">
          <span className="text-teal-400">{f.label}</span>
          <input
            className="mt-1 w-full rounded-lg border border-teal-800 bg-[#0f1f1c] px-3 py-2"
            value={String(form[f.key] ?? "")}
            onChange={(e) =>
              setForm({
                ...form,
                [f.key]:
                  f.key === "amount" ? Number(e.target.value) : e.target.value,
              })
            }
          />
        </label>
      ))}
      {msg && <p className="text-xs text-emerald-300">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => void del()}
          className="rounded-lg border border-rose-700 px-4 py-2 text-sm text-rose-200"
        >
          删除
        </button>
      </div>
    </div>
  );
}
