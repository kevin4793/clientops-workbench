/** 工作台统一「今日」基准，便于演示数据与筛选一致 */
export const REFERENCE_DATE = new Date("2026-10-21T12:00:00+08:00");

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function parseISODate(iso: string): Date {
  return startOfDay(new Date(iso + "T12:00:00+08:00"));
}

export function daysUntilExpiry(expiryDate: string, ref = REFERENCE_DATE): number {
  const exp = parseISODate(expiryDate);
  const refDay = startOfDay(ref);
  return Math.round((exp.getTime() - refDay.getTime()) / 86400000);
}

export function formatCNDate(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function endOfMonth(ref = REFERENCE_DATE): Date {
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59);
}

export function inExpiryBucket(
  expiryDate: string,
  bucket: "today" | "week" | "overdue" | "month",
  ref = REFERENCE_DATE
): boolean {
  const days = daysUntilExpiry(expiryDate, ref);
  const exp = parseISODate(expiryDate);
  const refDay = startOfDay(ref);
  const monthEnd = endOfMonth(ref);

  switch (bucket) {
    case "today":
      return days === 0;
    case "week":
      return days >= 0 && days <= 7;
    case "overdue":
      return days < 0;
    case "month":
      return exp >= refDay && exp <= monthEnd;
    default:
      return true;
  }
}
