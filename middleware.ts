import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/auth/session";

function hasAppPassword(): boolean {
  return Boolean(process.env.APP_PASSWORD?.trim());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(svg|ico|png|jpg)$/)
  ) {
    return NextResponse.next();
  }

  if (!hasAppPassword()) {
    if (pathname === "/setup" || pathname === "/api/health") {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  if (pathname === "/api/expiring") {
    const auth = request.headers.get("authorization");
    const token = process.env.BOT_API_TOKEN?.trim();
    if (token && auth === `Bearer ${token}`) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const publicPaths = ["/login", "/api/auth/login", "/setup", "/api/health"];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ok = await isRequestAuthenticated(request);
  if (!ok) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
