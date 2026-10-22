import { NextResponse } from "next/server";
import { getEnvIssues, isSiteConfigured } from "@/lib/env-config";

export async function GET() {
  const issues = getEnvIssues();
  return NextResponse.json({
    configured: isSiteConfigured(),
    hasAppPassword: Boolean(process.env.APP_PASSWORD?.trim()),
    issues,
  });
}
