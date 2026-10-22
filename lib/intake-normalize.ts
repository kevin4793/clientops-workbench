import { emptyIntakeFields } from "./intake-types";
import type { IntakeConfidence, IntakeFieldKey, IntakeFieldValue } from "./intake-types";

const FIELD_KEYS = Object.keys(emptyIntakeFields()) as IntakeFieldKey[];

function mapConfidence(raw: unknown): IntakeConfidence {
  const s = String(raw ?? "").toLowerCase();
  if (s === "高" || s === "high") return "high";
  if (s === "中" || s === "med" || s === "medium") return "med";
  return "low";
}

function stripJsonFence(text: string): string {
  const t = text.trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

export function normalizeQwenFieldsPayload(
  rawJson: unknown
): Record<IntakeFieldKey, IntakeFieldValue> {
  const base = emptyIntakeFields();
  if (!rawJson || typeof rawJson !== "object") return base;

  const root = rawJson as Record<string, unknown>;
  const fields =
    (root.fields as Record<string, unknown>) ??
    (root.data as Record<string, unknown>) ??
    root;

  for (const key of FIELD_KEYS) {
    const item = fields[key];
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const value = String(obj.value ?? obj.val ?? "").trim();
    const sourceSnippet = String(
      obj.source ?? obj.sourceSnippet ?? obj.snippet ?? ""
    ).trim();
    const confidence = mapConfidence(obj.confidence ?? obj.conf);
    if (!value && !sourceSnippet) continue;
    base[key] = {
      value,
      confidence: value ? confidence : "low",
      sourceSnippet: sourceSnippet.slice(0, 120),
    };
  }
  return base;
}

export function parseModelJsonContent(content: string): Record<IntakeFieldKey, IntakeFieldValue> {
  try {
    const parsed = JSON.parse(stripJsonFence(content)) as unknown;
    return normalizeQwenFieldsPayload(parsed);
  } catch {
    return emptyIntakeFields();
  }
}
