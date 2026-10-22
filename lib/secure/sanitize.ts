import type { SecureClientInput } from "./types";

const PHONE_RE =
  /1[3-9]\d{9}|(?:\+?86)?[\s-]*1[3-9]\d{9}/g;
const ID_CARD_RE = /\d{17}[\dXx]|\d{15}/g;
const BANK_ACCOUNT_RE = /(?:账号|卡号|银行账户)[：:\s]*\d{10,}/gi;

const FORBIDDEN_KEYS = [
  "phone",
  "mobile",
  "tel",
  "idCard",
  "身份证",
  "手机号",
  "账号",
  "account",
];

export function stripSensitiveFromText(text: string): string {
  return text
    .replace(PHONE_RE, "[已移除]")
    .replace(ID_CARD_RE, "[已移除]")
    .replace(BANK_ACCOUNT_RE, "[已移除]");
}

export function toBirthdayMmDd(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const md = t.match(/(?:\d{4}[-/年])?(\d{1,2})[-/月](\d{1,2})/);
  if (md) {
    return `${md[1].padStart(2, "0")}-${md[2].padStart(2, "0")}`;
  }
  if (/^\d{2}-\d{2}$/.test(t)) return t;
  return "";
}

export function sanitizeClientInput(
  input: Record<string, unknown>
): SecureClientInput {
  for (const k of FORBIDDEN_KEYS) {
    if (k in input) delete input[k];
  }

  const notes = stripSensitiveFromText(String(input.notes ?? ""));
  const displayName = String(input.displayName ?? input.name ?? "").trim();
  const clientCode = String(
    input.clientCode ?? input.productCode ?? input.contractNo ?? ""
  ).trim();
  const productName = String(input.productName ?? "").trim();
  const expiryDate = String(input.expiryDate ?? "").trim().slice(0, 10);
  const amountRaw = input.amount;
  const amount =
    typeof amountRaw === "string"
      ? parseAmountString(amountRaw)
      : Number(amountRaw ?? 0);
  const birthdayMmDd = toBirthdayMmDd(
    String(input.birthdayMmDd ?? input.dob ?? input.birthday ?? "")
  );

  return {
    displayName,
    clientCode,
    birthdayMmDd,
    productName,
    expiryDate,
    amount: Number.isFinite(amount) ? amount : 0,
    notes,
  };
}

export function parseAmountString(raw: string): number {
  const s = raw.replace(/[,，¥￥\s]/g, "");
  if (s.includes("万")) {
    const n = parseFloat(s.replace("万", ""));
    return Number.isFinite(n) ? Math.round(n * 10000) : 0;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
