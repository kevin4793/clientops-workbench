import { NextResponse } from "next/server";

/**
 * Notion 客户库集成占位（Kevin 的 Notion Client DB）
 *
 * 建议实现步骤：
 * 1. 在环境变量中配置 NOTION_TOKEN、NOTION_DATABASE_ID（勿提交仓库）
 * 2. POST 本路由触发全量/增量同步，或 GET 返回连接状态
 * 3. 将 Notion 页面属性映射为 ClientRecord + demo-maintenance 同等字段
 *
 * 示例查询（未启用）：
 * ```
 * const res = await fetch(
 *   `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
 *   {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
 *       "Notion-Version": "2022-06-28",
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({ page_size: 100 }),
 *   }
 * );
 * ```
 */
export async function GET() {
  return NextResponse.json({
    integration: "notion",
    status: "stub",
    message:
      "Notion 客户库尚未连接。请配置 NOTION_TOKEN 与 NOTION_DATABASE_ID 后实现同步逻辑。",
    docs: "/api/clients 与 lib/data-source.ts 为当前演示数据源入口。",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    integration: "notion",
    status: "stub",
    accepted: body,
    message: "同步请求已接收（演示环境未写入）。",
  });
}
