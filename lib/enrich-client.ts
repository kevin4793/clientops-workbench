import { emptyExtendedProfile } from "./profile-extended";
import type { ClientRecord, HoldingPosition } from "./types";

/** 将单笔到期字段同步为持仓列表的首项（兼容旧 JSON） */
export function ensureClientShape(raw: Record<string, unknown>): ClientRecord {
  const c = raw as unknown as ClientRecord;
  const primaryHolding: HoldingPosition = {
    id: `${c.id}-h0`,
    productType: c.productType,
    productName: c.productName,
    contractNo: c.contractNo,
    principalAmount: c.principalAmount,
    expiryDate: c.expiryDate,
    status: "即将到期",
  };

  return {
    ...c,
    profile: {
      familyStructure:
        c.profile?.familyStructure ?? "（演示）家庭信息待补充",
      riskPreferenceTags:
        c.profile?.riskPreferenceTags ?? ["稳健型（演示）"],
      recentContactSummary:
        c.profile?.recentContactSummary ??
        c.lastContactNote ??
        "暂无最近接触摘要",
      birthday: c.profile?.birthday ?? "01-01",
      memberSince: c.profile?.memberSince,
      extended: c.profile?.extended ?? emptyExtendedProfile(),
      productCode: c.profile?.productCode ?? c.contractNo ?? "",
      contactNotes: c.profile?.contactNotes ?? c.lastContactNote ?? "",
    },
    holdings: c.holdings?.length ? c.holdings : [primaryHolding],
    careReminders: c.careReminders ?? [],
    maintenanceTasks: c.maintenanceTasks ?? [],
    serviceRecords: c.serviceRecords ?? [],
  };
}
