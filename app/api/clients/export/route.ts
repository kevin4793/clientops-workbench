import { NextResponse } from "next/server";
import { listClients } from "@/lib/db/clients";
import { clientsToCsv } from "@/lib/import-export/parse-file";
import { isSiteConfigured } from "@/lib/env-config";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  if (!isSiteConfigured()) {
    return NextResponse.json({ error: "env_incomplete" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";

  const clients = await listClients();
  if (format === "xlsx") {
    const sheet = clients.map((c) => ({
      姓名: c.displayName,
      客户编号: c.clientCode,
      "生日(MM-DD)": c.birthdayMmDd,
      产品: c.productName,
      到期日: c.expiryDate,
      金额: c.amount,
      备注: c.notes,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheet);
    XLSX.utils.book_append_sheet(wb, ws, "clients");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="clients.xlsx"',
      },
    });
  }

  const csv = clientsToCsv(clients);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="clients.csv"',
    },
  });
}
