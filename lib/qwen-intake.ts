import { parseModelJsonContent } from "./intake-normalize";
import type { IntakeFieldKey, IntakeFieldValue } from "./intake-types";

const COMPAT_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const FIELD_LIST: IntakeFieldKey[] = [
  "displayName",
  "productCode",
  "amount",
  "expiryDate",
  "contactNotes",
  "dob",
  "gender",
  "lastBranchVisit",
  "familySituation",
  "household",
  "assetRange",
  "hobbies",
  "quotesSaid",
  "personality",
  "riskTolerance",
  "otherBanksAssets",
  "primaryBanks",
];

const EXTRACTION_RULES = `你是银行理财「高效录入」助手。从图片或文字提取客户维护字段。
要求：
1. 仅填写原文/图中能看清的内容；看不清或没有的字段 value 必须为 ""，禁止猜测或编造。
2. 支持中文普通话、粤语书写混用（如屋企、几时来过网点）。
3. 手写体尽量识别，不确定则留空并降低 confidence。
4. 每个字段输出 value、confidence（只能是 高、中、低 之一）、source（原文短片段，≤80字，无则 ""）。
5. 只输出一个 JSON 对象，不要 markdown，格式：
{"fields":{${FIELD_LIST.map((k) => `"${k}":{"value":"","confidence":"低","source":""}`).join(",")}}}`;

export type QwenParseOk = {
  ok: true;
  fields: Record<IntakeFieldKey, IntakeFieldValue>;
  model: string;
};

export type QwenParseFail = {
  ok: false;
  error: string;
};

function apiKey(): string | undefined {
  return process.env.DASHSCOPE_API_KEY?.trim();
}

function vlModel(): string {
  return process.env.QWEN_VL_MODEL?.trim() || "qwen-vl-max";
}

function textModel(): string {
  return process.env.QWEN_TEXT_MODEL?.trim() || "qwen-plus";
}

async function chatCompletion(
  model: string,
  messages: Array<Record<string, unknown>>
): Promise<QwenParseOk | QwenParseFail> {
  const key = apiKey();
  if (!key) {
    return { ok: false, error: "DASHSCOPE_API_KEY 未配置" };
  }

  const res = await fetch(COMPAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      error: `DashScope ${res.status}: ${errText.slice(0, 300)}`,
    };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) {
    return { ok: false, error: "模型返回空内容" };
  }

  const fields = parseModelJsonContent(content);
  const hasAny = Object.values(fields).some((f) => f.value);
  if (!hasAny) {
    return { ok: false, error: "模型未提取到任何字段" };
  }

  return { ok: true, fields, model };
}

export async function parseImageWithQwen(
  imageBase64: string,
  mimeType: string
): Promise<QwenParseOk | QwenParseFail> {
  const dataUrl = `data:${mimeType};base64,${imageBase64.replace(/^data:[^;]+;base64,/, "")}`;
  return chatCompletion(vlModel(), [
    { role: "system", content: EXTRACTION_RULES },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "请阅读这张客户备注/清单图片，按规则输出 JSON fields。",
        },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ]);
}

export async function parseTextWithQwen(
  text: string
): Promise<QwenParseOk | QwenParseFail> {
  return chatCompletion(textModel(), [
    { role: "system", content: EXTRACTION_RULES },
    {
      role: "user",
      content: `以下是需要结构化的客户备注文字：\n\n${text}`,
    },
  ]);
}
