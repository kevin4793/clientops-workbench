import { NextResponse } from "next/server";
import {
  localTextParse,
  mergeQwenFields,
  type IntakeParseApiBody,
} from "@/lib/intake-parse-response";
import { parseImageWithQwen, parseTextWithQwen } from "@/lib/qwen-intake";

/**
 * POST /api/intake/parse
 *
 * Body:
 * - { "text": "..." }  — 通义千问文本结构化（失败则本地规则）
 * - { "imageBase64": "...", "mimeType": "image/jpeg" } — 通义千问 VL（失败则 fallback，由前端 Tesseract）
 * - { "imageText": "..." } — 等同 text
 *
 * 密钥：DASHSCOPE_API_KEY（仅服务端）
 */
export async function POST(request: Request) {
  let body: IntakeParseApiBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = (body.text ?? body.imageText ?? "").trim();
  const imageBase64 = body.imageBase64?.trim();
  const mimeType = body.mimeType?.trim() || "image/jpeg";

  if (imageBase64) {
    const qwen = await parseImageWithQwen(imageBase64, mimeType);
    if (qwen.ok) {
      return NextResponse.json(
        mergeQwenFields(qwen.fields, text, "qwen-vl", qwen.model)
      );
    }

    if (text) {
      const textQwen = await parseTextWithQwen(text);
      if (textQwen.ok) {
        return NextResponse.json(
          mergeQwenFields(textQwen.fields, text, "qwen-text", textQwen.model)
        );
      }
      return NextResponse.json({
        ...localTextParse(text),
        status: "fallback",
        message: `视觉识别失败（${qwen.error}），已用本地规则解析 OCR 文本`,
      });
    }

    return NextResponse.json({
      status: "fallback",
      engine: "tesseract-local",
      engineLabel: "待本地 OCR（通义失败）",
      message: qwen.error,
      rawText: "",
      fields: localTextParse("").fields,
    });
  }

  if (!text) {
    return NextResponse.json({ error: "missing_text_or_image" }, { status: 400 });
  }

  const qwen = await parseTextWithQwen(text);
  if (qwen.ok) {
    return NextResponse.json(
      mergeQwenFields(qwen.fields, text, "qwen-text", qwen.model)
    );
  }

  return NextResponse.json({
    ...localTextParse(text),
    status: "fallback",
    message: `通义文本解析失败（${qwen.error}），已回退本地规则`,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/intake/parse",
    methods: ["POST"],
    vision: {
      provider: "aliyun-dashscope",
      model: process.env.QWEN_VL_MODEL || "qwen-vl-max",
      configured: Boolean(process.env.DASHSCOPE_API_KEY),
    },
    text: {
      model: process.env.QWEN_TEXT_MODEL || "qwen-plus",
    },
    body: {
      text: "paste note",
      imageBase64: "compressed base64, long edge ≤1600",
      mimeType: "image/jpeg",
    },
  });
}
