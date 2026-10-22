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
];

const EXTRACTION_RULES = `你是银行理财「高效录入」助手。仅提取 6 个字段。
要求：
1. 看不清则 value 为 ""，禁止编造。
2. 禁止输出手机号、身份证号、银行账号。
3. dob 仅 MM-DD，不含年份。
4. 支持粤语、普通话、手写。
5. 每字段含 value、confidence（高/中/低）、source。
6. 只输出 JSON：
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
