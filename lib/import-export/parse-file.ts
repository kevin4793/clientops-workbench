import * as XLSX from "xlsx";
import { sanitizeClientInput, parseAmountString } from "@/lib/secure/sanitize";
import type { SecureClientInput } from "@/lib/secure/types";

const HEADER_MAP: Record<string, string> = {
  姓名: "displayName",
  名字: "displayName",
  客户姓名: "displayName",
  客户编号: "clientCode",
  编号: "clientCode",
  生日: "birthdayMmDd",
  出生: "birthdayMmDd",
  产品: "productName",
  产品名称: "productName",
  到期日: "expiryDate",
  到期: "expiryDate",
  金额: "amount",
  本金: "amount",
  备注: "notes",
  说明: "notes",
};

function mapRow(row: Record<string, unknown>): SecureClientInput {
  const mapped: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = HEADER_MAP[k.trim()] ?? k;
    if (key === "amount" && typeof v === "string") {
      mapped.amount = parseAmountString(v);
    } else {
      mapped[key] = v;
    }
  }
  return sanitizeClientInput(mapped);
}

export function parseCsvText(text: string): SecureClientInput[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const out: SecureClientInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx]?.trim() ?? "";
    });
    const s = mapRow(row);
    if (s.displayName || s.clientCode) out.push(s);
  }
  return out;
}

export function parseExcelBuffer(buffer: ArrayBuffer): SecureClientInput[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows
    .map(mapRow)
    .filter((s) => s.displayName || s.clientCode);
}

export function clientsToCsv(
  clients: { displayName: string; clientCode: string; birthdayMmDd: string; productName: string; expiryDate: string; amount: number; notes: string }[]
): string {
  const header =
    "姓名,客户编号,生日(MM-DD),产品,到期日,金额,备注";
  const lines = clients.map((c) =>
    [
      c.displayName,
      c.clientCode,
      c.birthdayMmDd,
      c.productName,
      c.expiryDate,
      c.amount,
      c.notes.replace(/,/g, "，"),
    ]
      .map((x) => `"${String(x).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...lines].join("\n");
}
