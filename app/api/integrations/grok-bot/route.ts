import { NextResponse } from "next/server";

/**
 * Grok Bot Webhook 占位
 *
 * Kevin 的 Grok Bot 可 POST JSON 触发维护动作，例如：
 * - { "type": "expiry_alert", "clientId": "demo-003", "message": "..." }
 * - { "type": "brief_request", "format": "markdown" }
 * - { "type": "intake_parse", "text": "..." } 或 { "imageText": "..." }
 *
 * 生产环境应校验 Authorization: Bearer <GROK_BOT_WEBHOOK_SECRET>
 */
type GrokBotPayload = {
  type?: string;
  clientId?: string;
  message?: string;
  format?: string;
  meta?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const secretConfigured = Boolean(process.env.GROK_BOT_WEBHOOK_SECRET);

  let payload: GrokBotPayload = {};
  try {
    payload = (await request.json()) as GrokBotPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (secretConfigured) {
    const expected = `Bearer ${process.env.GROK_BOT_WEBHOOK_SECRET}`;
    if (auth !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const type = payload.type ?? "unknown";

  switch (type) {
    case "expiry_alert":
      return NextResponse.json({
        status: "accepted",
        action: "expiry_alert_logged",
        clientId: payload.clientId,
        hint: "演示环境：请在前端打开 /expiry 或 /war-room/[id] 处理。",
        echo: payload.message,
      });
    case "brief_request":
      return NextResponse.json({
        status: "accepted",
        action: "brief_request",
        format: payload.format ?? "markdown",
        hint: "演示环境：请访问 /brief 导出；后续可返回生成的 Markdown 正文。",
      });
    case "intake_parse":
      return NextResponse.json({
        status: "accepted",
        action: "intake_parse",
        hint: "请转发至 POST /api/intake/parse 获取 fields；前端 /intake 完成登记。",
        forward: "/api/intake/parse",
        text: payload.message ?? (payload.meta as { text?: string })?.text,
      });
    default:
      return NextResponse.json({
        status: "accepted",
        action: "noop_stub",
        type,
        payload,
        message: "Grok Bot webhook 占位：已记录类型，待实现业务处理器。",
      });
  }
}

export async function GET() {
  return NextResponse.json({
    integration: "grok-bot",
    status: "stub",
    post: "/api/integrations/grok-bot",
    supportedTypes: ["expiry_alert", "brief_request"],
    auth: "可选 Bearer GROK_BOT_WEBHOOK_SECRET",
  });
}
