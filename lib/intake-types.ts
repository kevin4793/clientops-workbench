export type IntakeConfidence = "low" | "med" | "high";

export interface IntakeFieldValue {
  value: string;
  confidence: IntakeConfidence;
  sourceSnippet: string;
}

/** 高效录入表单字段（与档案 extended + 交易字段对应） */
export type IntakeFieldKey =
  | "displayName"
  | "productCode"
  | "amount"
  | "expiryDate"
  | "contactNotes"
  | "dob"
  | "gender"
  | "lastBranchVisit"
  | "familySituation"
  | "household"
  | "assetRange"
  | "hobbies"
  | "quotesSaid"
  | "personality"
  | "riskTolerance"
  | "otherBanksAssets"
  | "primaryBanks";

export interface IntakeParseResult {
  rawText: string;
  fields: Record<IntakeFieldKey, IntakeFieldValue>;
}

export const INTAKE_FIELD_META: Record<
  IntakeFieldKey,
  { label: string; hint?: string }
> = {
  displayName: { label: "姓名", hint: "姓名 / 客户称呼" },
  productCode: { label: "产品代码", hint: "合同号、保单号、产品代码" },
  amount: { label: "金额", hint: "本金或交易金额" },
  expiryDate: { label: "到期/关键日期", hint: "到期日或其他日期" },
  contactNotes: { label: "接触备注", hint: "微信/电话摘要" },
  dob: { label: "出生年月日", hint: "DOB" },
  gender: { label: "性别" },
  lastBranchVisit: { label: "几时来过网点", hint: "上次到行时间" },
  familySituation: { label: "屋企人情况", hint: "家庭概况" },
  household: { label: "家庭成员组合" },
  assetRange: { label: "资产大概", hint: "量级描述" },
  hobbies: { label: "爱好" },
  quotesSaid: { label: "讲过的话", hint: "客户原话" },
  personality: { label: "性格" },
  riskTolerance: { label: "风险承受能力" },
  otherBanksAssets: { label: "其他银行有没有钱" },
  primaryBanks: { label: "主要结余所在银行" },
};

export function emptyIntakeFields(): Record<IntakeFieldKey, IntakeFieldValue> {
  const keys = Object.keys(INTAKE_FIELD_META) as IntakeFieldKey[];
  return keys.reduce(
    (acc, k) => {
      acc[k] = { value: "", confidence: "low", sourceSnippet: "" };
      return acc;
    },
    {} as Record<IntakeFieldKey, IntakeFieldValue>
  );
}
