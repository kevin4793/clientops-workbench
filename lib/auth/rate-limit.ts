import { neon } from "@neondatabase/serverless";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

async function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_MISSING");
  return neon(url);
}

export async function ensureAuthTables() {
  const db = await sql();
  await db`
    CREATE TABLE IF NOT EXISTS login_attempts (
      ip TEXT PRIMARY KEY,
      attempts INT NOT NULL,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `;
}

export async function checkLoginAllowed(ip: string): Promise<{
  allowed: boolean;
  retryAfterSec?: number;
}> {
  await ensureAuthTables();
  const db = await sql();
  const rows = await db`
    SELECT attempts, reset_at FROM login_attempts WHERE ip = ${ip}
  `;
  const row = rows[0] as { attempts: number; reset_at: string } | undefined;
  if (!row) return { allowed: true };
  const resetAt = new Date(row.reset_at).getTime();
  if (Date.now() > resetAt) {
    await db`DELETE FROM login_attempts WHERE ip = ${ip}`;
    return { allowed: true };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((resetAt - Date.now()) / 1000),
    };
  }
  return { allowed: true };
}

export async function recordLoginFailure(ip: string) {
  await ensureAuthTables();
  const db = await sql();
  const rows = await db`
    SELECT attempts FROM login_attempts WHERE ip = ${ip}
  `;
  const row = rows[0] as { attempts: number } | undefined;
  const resetAt = new Date(Date.now() + WINDOW_MS).toISOString();
  if (!row) {
    await db`
      INSERT INTO login_attempts (ip, attempts, reset_at)
      VALUES (${ip}, 1, ${resetAt})
    `;
    return;
  }
  await db`
    UPDATE login_attempts
    SET attempts = ${row.attempts + 1}, reset_at = ${resetAt}
    WHERE ip = ${ip}
  `;
}

export async function clearLoginAttempts(ip: string) {
  const db = await sql();
  await db`DELETE FROM login_attempts WHERE ip = ${ip}`;
}
