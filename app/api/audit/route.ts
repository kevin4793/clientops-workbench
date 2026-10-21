import { NextResponse } from "next/server";

/** 演示环境审计由客户端 localStorage 持久化；此路由预留服务端写入 */
export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    ok: true,
    message: "演示模式：审计已记录在客户端；生产环境请写入行内审计库",
    received: body,
  });
}
