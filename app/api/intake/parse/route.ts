import { NextResponse } from "next/server";
import { parseIntakeText } from "@/lib/intake-parser";

/**
 * POST /api/intake/parse
 *
 * Body:
 * - { "text": "..." }  — 直接解析
 * - { "imageText": "..." } — Grok Bot / 视觉模型预提取文字
 * - 未来: { "imageBase64": "...", "mimeType": "image/jpeg" } → 服务端 Vision
 *
 * Grok Bot 示例：
 * POST 本路由，Header 可选 Authorization: Bearer <secret>
 */
export async function POST(request: Request) {
  let body: { text?: string; imageText?: string; imageBase64?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = (body.text ?? body.imageText ?? "").trim();

  if (!raw && body.imageBase64) {
    return NextResponse.json({
      status: "stub",
      message:
        "已收到 imageBase64；演示环境未启用服务端视觉。请客户端 OCR 或 Grok Bot 先提取 imageText 再 POST。",
      fields: parseIntakeText("").fields,
    });
  }

  if (!raw) {
    return NextResponse.json({ error: "missing_text" }, { status: 400 });
  }

  const result = parseIntakeText(raw);
  return NextResponse.json({
    status: "ok",
    ...result,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/intake/parse",
    methods: ["POST"],
    body: {
      text: "optional raw note",
      imageText: "optional OCR output from client or bot",
      imageBase64: "future vision model",
    },
  });
}
