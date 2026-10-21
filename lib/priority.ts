import { daysUntilExpiry } from "./dates";
import type { ClientRecord, PriorityResult } from "./types";

export function computePriority(client: ClientRecord): PriorityResult {
  const days = daysUntilExpiry(client.expiryDate);
  let score = 0;
  const reasons: string[] = [];

  if (days < 0) {
    score += 1000 + Math.abs(days) * 15;
    reasons.push(`已逾期 ${Math.abs(days)} 天（权重最高）`);
  } else if (days === 0) {
    score += 520;
    reasons.push("今日到期");
  } else if (days <= 7) {
    score += 280 - days * 12;
    reasons.push(`7 日内到期（剩 ${days} 天）`);
  } else {
    score += Math.max(0, 80 - days);
    reasons.push(`距到期 ${days} 天`);
  }

  const amt = client.principalAmount;
  if (amt >= 5_000_000) {
    score += 220;
    reasons.push("金额档 ≥500 万");
  } else if (amt >= 1_000_000) {
    score += 140;
    reasons.push("金额档 ≥100 万");
  } else if (amt >= 500_000) {
    score += 70;
    reasons.push("金额档 ≥50 万");
  }

  if (client.tags.includes("高净值")) {
    score += 160;
    reasons.push("高净值服务标签");
  }

  if (client.reconciliation.status === "mismatch") {
    score += 90;
    reasons.push("到期与到账核对不一致");
  } else if (client.reconciliation.status === "pending") {
    score += 40;
    reasons.push("到账待确认");
  }

  if (client.followUpStatus === "待联系") {
    score += 35;
    reasons.push("尚未联系客户");
  }

  return {
    score,
    reasons,
    summary: reasons.slice(0, 3).join("；"),
  };
}

export function sortByPriority(clients: ClientRecord[]): ClientRecord[] {
  return [...clients].sort(
    (a, b) => computePriority(b).score - computePriority(a).score
  );
}
