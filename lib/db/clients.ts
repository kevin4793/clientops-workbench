import { neon } from "@neondatabase/serverless";
import { decryptJson, encryptJson } from "@/lib/crypto";
import type { SecureClient, SecureClientInput } from "@/lib/secure/types";
import { randomUUID } from "crypto";

async function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_MISSING");
  return neon(url);
}

export async function ensureClientTable() {
  const sql = await db();
  await sql`
    CREATE TABLE IF NOT EXISTS secure_clients (
      id TEXT PRIMARY KEY,
      payload_enc TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function rowToClient(id: string, payloadEnc: string, updatedAt: string): SecureClient {
  const data = decryptJson<Omit<SecureClient, "id" | "updatedAt">>(payloadEnc);
  return { id, ...data, updatedAt };
}

export async function listClients(): Promise<SecureClient[]> {
  await ensureClientTable();
  const sql = await db();
  const rows = await sql`
    SELECT id, payload_enc, updated_at FROM secure_clients ORDER BY updated_at DESC
  `;
  return rows.map((r) =>
    rowToClient(
      r.id as string,
      r.payload_enc as string,
      (r.updated_at as Date).toISOString()
    )
  );
}

export async function getClient(id: string): Promise<SecureClient | null> {
  await ensureClientTable();
  const sql = await db();
  const rows = await sql`
    SELECT id, payload_enc, updated_at FROM secure_clients WHERE id = ${id}
  `;
  const r = rows[0];
  if (!r) return null;
  return rowToClient(
    r.id as string,
    r.payload_enc as string,
    (r.updated_at as Date).toISOString()
  );
}

export async function upsertClient(
  input: SecureClientInput & { id?: string }
): Promise<SecureClient> {
  await ensureClientTable();
  const id = input.id ?? randomUUID();
  const { id: _i, ...rest } = input as SecureClientInput & { id?: string };
  const payload = {
    displayName: rest.displayName,
    clientCode: rest.clientCode,
    birthdayMmDd: rest.birthdayMmDd,
    productName: rest.productName,
    expiryDate: rest.expiryDate,
    amount: rest.amount,
    notes: rest.notes,
  };
  const enc = encryptJson(payload);
  const sql = await db();
  await sql`
    INSERT INTO secure_clients (id, payload_enc, updated_at)
    VALUES (${id}, ${enc}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      payload_enc = EXCLUDED.payload_enc,
      updated_at = NOW()
  `;
  const c = await getClient(id);
  if (!c) throw new Error("UPSERT_FAILED");
  return c;
}

export async function deleteClient(id: string) {
  await ensureClientTable();
  const sql = await db();
  await sql`DELETE FROM secure_clients WHERE id = ${id}`;
}

export async function listExpiringWithinDays(days: number): Promise<SecureClient[]> {
  const all = await listClients();
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  const startStr = now.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return all.filter((c) => {
    if (!c.expiryDate) return false;
    return c.expiryDate >= startStr && c.expiryDate <= endStr;
  });
}
