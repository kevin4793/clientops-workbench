import { NextResponse } from "next/server";
import {
  checkLoginAllowed,
  clearLoginAttempts,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { isSiteConfigured } from "@/lib/env-config";

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  if (!process.env.APP_PASSWORD?.trim()) {
    return NextResponse.json(
      { error: "site_locked", message: "APP_PASSWORD 未配置" },
      { status: 503 }
    );
  }

  if (!isSiteConfigured()) {
    return NextResponse.json(
      { error: "env_incomplete", message: "环境变量未就绪，请查看 /setup" },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  try {
    const gate = await checkLoginAllowed(ip);
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          retryAfterSec: gate.retryAfterSec,
        },
        { status: 429 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (password !== process.env.APP_PASSWORD) {
    await recordLoginFailure(ip);
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  await clearLoginAttempts(ip);
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
