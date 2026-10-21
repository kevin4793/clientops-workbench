import type { ClientRecord, ProductType } from "./types";
import type { IntakeFieldKey } from "./intake-types";
import { emptyExtendedProfile } from "./profile-extended";
import { REFERENCE_DATE } from "./dates";

export type IntakeFormValues = Record<IntakeFieldKey, string>;

function maskName(name: string): string {
  const t = name.replace(/演练客户·/g, "").trim();
  if (t.length <= 1) return "*";
  return `${t[0]}**`;
}

function parseAmount(amount: string): number {
  const s = amount.replace(/[,，¥￥\s]/g, "");
  if (s.includes("万")) {
    const n = parseFloat(s.replace("万", ""));
    return Number.isFinite(n) ? Math.round(n * 10000) : 0;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function guessProductType(code: string): ProductType {
  const u = code.toUpperCase();
  if (u.includes("INS")) return "保险";
  if (u.includes("XT") || u.includes("TRUST")) return "信托";
  if (u.includes("FUND")) return "基金";
  if (u.includes("CD")) return "存款";
  return "理财";
}

export function buildClientFromIntake(
  values: IntakeFormValues,
  mode: "demo" | "snapshot"
): ClientRecord {
  const id = `intake-${Date.now()}`;
  const name = values.displayName.trim() || "录入客户·待补名";
  const productCode = values.productCode.trim() || `INTAKE-${id.slice(-6)}`;
  const amount = parseAmount(values.amount);
  const expiry =
    values.expiryDate.trim() ||
    new Date(REFERENCE_DATE.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const productType = guessProductType(productCode);

  const extended = emptyExtendedProfile();
  extended.dob = values.dob;
  extended.gender = values.gender;
  extended.lastBranchVisit = values.lastBranchVisit;
  extended.familySituation = values.familySituation;
  extended.household = values.household;
  extended.assetRange = values.assetRange;
  extended.hobbies = values.hobbies;
  extended.quotesSaid = values.quotesSaid;
  extended.personality = values.personality;
  extended.riskTolerance = values.riskTolerance;
  extended.otherBanksAssets = values.otherBanksAssets;
  extended.primaryBanks = values.primaryBanks;

  const riskTags = values.riskTolerance
    ? [values.riskTolerance]
    : ["待完善（录入）"];

  return {
    id,
    displayName: mode === "demo" ? `录入·${name}` : `快照录入·${name}`,
    maskedName: maskName(name),
    productType,
    productName: productCode ? `录入产品·${productCode}` : "录入待补产品",
    contractNo: productCode,
    expiryDate: expiry,
    principalAmount: amount || 0,
    currency: "CNY",
    tags: ["高效录入"],
    followUpStatus: "待联系",
    lastContactNote: values.contactNotes,
    lastContactAt: new Date().toISOString().slice(0, 10),
    reconciliation: {
      expectedAction: "录入后待核对",
      paymentStatus: "待确认",
      status: "pending",
      note: "由高效录入创建，演示数据",
    },
    timeline: [
      {
        id: "t-intake",
        date: new Date().toISOString().slice(0, 10),
        label: "高效录入登记",
        done: true,
      },
    ],
    gaps: [],
    suggestedActions: ["补充核实录入字段", "安排首次回访"],
    complianceChecks: [
      { id: "c1", label: "已向客户说明录入用途（演示）", checked: false },
    ],
    isDrill: mode === "demo",
    profile: {
      familyStructure:
        values.familySituation || values.household || "（录入待补充）",
      riskPreferenceTags: riskTags,
      recentContactSummary:
        values.contactNotes || values.quotesSaid || "高效录入创建",
      birthday: values.dob || "",
      memberSince: new Date().toISOString().slice(0, 7),
      extended,
      productCode,
      contactNotes: values.contactNotes,
    },
    holdings: [
      {
        id: `${id}-h0`,
        productType,
        productName: `录入产品·${productCode}`,
        contractNo: productCode,
        principalAmount: amount || 0,
        expiryDate: expiry,
        status: "即将到期",
      },
    ],
    careReminders: values.dob
      ? [
          {
            id: "cr-bday",
            type: "生日",
            date: values.dob,
            label: `生日关怀（录入）`,
            done: false,
          },
        ]
      : [],
    maintenanceTasks: [
      {
        id: "mt-intake",
        title: "核实高效录入字段",
        dueDate: new Date().toISOString().slice(0, 10),
        status: "待联系",
        category: "其他",
      },
    ],
    serviceRecords: values.contactNotes
      ? [
          {
            id: "sr-intake",
            at: new Date().toISOString(),
            channel: "微信",
            summary: values.contactNotes.slice(0, 200),
          },
        ]
      : [],
  };
}
