import {
  emptyIntakeFields,
  type IntakeConfidence,
  type IntakeFieldKey,
  type IntakeFieldValue,
  type IntakeParseResult,
} from "./intake-types";

function setField(
  fields: Record<IntakeFieldKey, IntakeFieldValue>,
  key: IntakeFieldKey,
  value: string,
  confidence: IntakeConfidence,
  sourceSnippet: string
) {
  const v = value.trim();
  if (!v) return;
  const cur = fields[key];
  const rank = { low: 0, med: 1, high: 2 };
  if (!cur.value || rank[confidence] >= rank[cur.confidence]) {
    fields[key] = {
      value: v,
      confidence,
      sourceSnippet: sourceSnippet.trim().slice(0, 120),
    };
  }
}

function snippetAround(text: string, index: number, len = 40): string {
  const start = Math.max(0, index - 10);
  const end = Math.min(text.length, index + len);
  return text.slice(start, end).replace(/\s+/g, " ");
}

type Rule = {
  key: IntakeFieldKey;
  confidence: IntakeConfidence;
  re: RegExp;
  pick: (m: RegExpMatchArray) => string;
};

const RULES: Rule[] = [
  {
    key: "displayName",
    confidence: "high",
    re: /(?:姓名|客户名|叫|称呼)[：:\s]*([^\s，,。\n；;]{2,8})/i,
    pick: (m) => m[1],
  },
  {
    key: "displayName",
    confidence: "med",
    re: /^([^\n]{0,20}?)(?:先生|女士|小姐|哥|姐)/m,
    pick: (m) => m[1].replace(/[，,。]/g, "").slice(-4) || m[0].slice(0, 4),
  },
  {
    key: "productCode",
    confidence: "high",
    re: /(?:产品代码|代码|合同号|保单号|产品编号)[：:\s]*([A-Za-z0-9][A-Za-z0-9-]{3,})/i,
    pick: (m) => m[1],
  },
  {
    key: "productCode",
    confidence: "med",
    re: /\b(DEMO-[A-Z]+-\d+|AUTH-[A-Z0-9-]+|LC\d{6,})\b/i,
    pick: (m) => m[1],
  },
  {
    key: "amount",
    confidence: "high",
    re: /(?:金额|本金|资金|申购|大概)[：:\s]*([¥￥]?\s*[\d,.]+(?:\s*[万千百])?(?:\s*元)?)/i,
    pick: (m) => m[1].replace(/\s/g, ""),
  },
  {
    key: "amount",
    confidence: "med",
    re: /([\d,.]+)\s*万(?:元)?/,
    pick: (m) => `${m[1]}万`,
  },
  {
    key: "expiryDate",
    confidence: "high",
    re: /(?:到期日?|到期|满期|关键日期)[：:\s]*(\d{4}[年/-]\d{1,2}[月/-]\d{1,2}日?|\d{4}-\d{2}-\d{2})/,
    pick: (m) => normalizeDate(m[1]),
  },
  {
    key: "dob",
    confidence: "high",
    re: /(?:出生|生日|DOB|出生年月日)[：:\s]*(\d{4}[年/-]\d{1,2}[月/-]\d{1,2}日?|\d{4}-\d{2}-\d{2})/i,
    pick: (m) => normalizeDate(m[1]),
  },
  {
    key: "gender",
    confidence: "high",
    re: /性别[：:\s]*(男|女)/,
    pick: (m) => m[1],
  },
  {
    key: "gender",
    confidence: "med",
    re: /(男|女)(?:性|客户|士)/,
    pick: (m) => m[1],
  },
  {
    key: "lastBranchVisit",
    confidence: "high",
    re: /(?:几时来过网点|上次到行|来过网点|到行时间|上次来行)[：:\s]*([^\n。；;]{2,40})/i,
    pick: (m) => m[1],
  },
  {
    key: "familySituation",
    confidence: "high",
    re: /(?:屋企人情况|屋企情况|家人情况)[：:\s]*([^\n。；;]{2,80})/i,
    pick: (m) => m[1],
  },
  {
    key: "household",
    confidence: "high",
    re: /(?:家庭成员组合|家庭成员|家庭结构)[：:\s]*([^\n。；;]{2,80})/i,
    pick: (m) => m[1],
  },
  {
    key: "assetRange",
    confidence: "high",
    re: /(?:资产大概|资产约|AUM|总资产)[：:\s]*([^\n。；;]{2,40})/i,
    pick: (m) => m[1],
  },
  {
    key: "hobbies",
    confidence: "high",
    re: /爱好[：:\s]*([^\n。；;]{2,60})/,
    pick: (m) => m[1],
  },
  {
    key: "quotesSaid",
    confidence: "high",
    re: /(?:讲过的话|说过|客户原话|原话)[：:\s]*[「"“]?([^」"”\n。；;]{2,120})/,
    pick: (m) => m[1],
  },
  {
    key: "personality",
    confidence: "high",
    re: /性格[：:\s]*([^\n。；;]{2,40})/,
    pick: (m) => m[1],
  },
  {
    key: "riskTolerance",
    confidence: "high",
    re: /(?:风险承受能力|风险偏好|风险等级)[：:\s]*([^\n。；;]{2,40})/i,
    pick: (m) => m[1],
  },
  {
    key: "otherBanksAssets",
    confidence: "high",
    re: /(?:其他银行有没有钱|他行资产|别的银行)[：:\s]*([^\n。；;]{2,60})/i,
    pick: (m) => m[1],
  },
  {
    key: "primaryBanks",
    confidence: "high",
    re: /(?:主要结余|资金主要在|主账户在)[：:\s]*([^\n。；;]{2,60})/i,
    pick: (m) => m[1],
  },
  {
    key: "contactNotes",
    confidence: "med",
    re: /(?:备注|微信|电话|接触)[：:\s]*([^\n]{4,120})/,
    pick: (m) => m[1],
  },
];

function normalizeDate(raw: string): string {
  const s = raw
    .replace(/年/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/\//g, "-");
  const parts = s.split("-").filter(Boolean);
  if (parts.length >= 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return raw.trim();
}

/** 解析杂乱中文/粤普混排备注，不臆造字段 */
export function parseIntakeText(rawText: string): IntakeParseResult {
  const text = rawText.trim();
  const fields = emptyIntakeFields();

  if (!text) {
    return { rawText: text, fields };
  }

  for (const rule of RULES) {
    const m = text.match(rule.re);
    if (m && m.index !== undefined) {
      setField(
        fields,
        rule.key,
        rule.pick(m),
        rule.confidence,
        snippetAround(text, m.index)
      );
    }
  }

  // 兜底：文中独立日期（仅填尚未识别的 expiryDate）
  if (!fields.expiryDate.value) {
    const dm = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (dm && dm.index !== undefined) {
      setField(
        fields,
        "expiryDate",
        dm[1],
        "low",
        snippetAround(text, dm.index)
      );
    }
  }

  return { rawText: text, fields };
}
