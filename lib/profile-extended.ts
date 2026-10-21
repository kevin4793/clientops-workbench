import type { ClientExtendedProfile } from "./types";

export function emptyExtendedProfile(): ClientExtendedProfile {
  return {
    dob: "",
    gender: "",
    lastBranchVisit: "",
    familySituation: "",
    household: "",
    assetRange: "",
    hobbies: "",
    quotesSaid: "",
    personality: "",
    riskTolerance: "",
    otherBanksAssets: "",
    primaryBanks: "",
  };
}

export const EXTENDED_FIELD_LABELS: Record<
  keyof ClientExtendedProfile,
  string
> = {
  dob: "出生年月日",
  gender: "性别",
  lastBranchVisit: "几时来过网点",
  familySituation: "屋企人情况",
  household: "家庭成员组合",
  assetRange: "资产大概",
  hobbies: "爱好",
  quotesSaid: "讲过的话",
  personality: "性格",
  riskTolerance: "风险承受能力",
  otherBanksAssets: "其他银行有没有钱",
  primaryBanks: "主要结余所在银行",
};
