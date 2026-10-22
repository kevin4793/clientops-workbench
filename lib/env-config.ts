export type EnvIssue = { key: string; message: string; critical: boolean };

export function getEnvIssues(): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (!process.env.APP_PASSWORD?.trim()) {
    issues.push({
      key: "APP_PASSWORD",
      message: "未设置登录密码，站点已锁定",
      critical: true,
    });
  }
  if (!process.env.SESSION_SECRET?.trim()) {
    issues.push({
      key: "SESSION_SECRET",
      message: "未设置会话签名密钥",
      critical: true,
    });
  }
  if (!process.env.DATABASE_URL?.trim()) {
    issues.push({
      key: "DATABASE_URL",
      message: "未连接 Neon Postgres（Vercel Marketplace 创建）",
      critical: true,
    });
  }
  if (!process.env.DATA_KEY?.trim()) {
    issues.push({
      key: "DATA_KEY",
      message: "未设置 DATA_KEY（AES-256 加密密钥，64 位十六进制）",
      critical: true,
    });
  } else if (
    process.env.DATA_KEY.trim().length !== 64 ||
    !/^[0-9a-fA-F]+$/.test(process.env.DATA_KEY.trim())
  ) {
    issues.push({
      key: "DATA_KEY",
      message: "DATA_KEY 必须为 64 位十六进制（32 字节）",
      critical: true,
    });
  }

  if (!process.env.BOT_API_TOKEN?.trim()) {
    issues.push({
      key: "BOT_API_TOKEN",
      message: "未设置 Grok Bot 只读接口令牌（可选，但 Bot 无法拉取到期列表）",
      critical: false,
    });
  }

  return issues;
}

export function isSiteConfigured(): boolean {
  return getEnvIssues().filter((i) => i.critical).length === 0;
}
