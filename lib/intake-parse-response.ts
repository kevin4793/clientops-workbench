import { parseIntakeText } from "./intake-parser";
import type { IntakeFieldKey, IntakeFieldValue, IntakeParseResult } from "./intake-types";

export type IntakeEngine =
  | "qwen-vl"
  | "qwen-text"
  | "local-heuristic"
  | "tesseract-local";

export interface IntakeParseApiBody {
  text?: string;
  imageText?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface IntakeParseApiResponse {
  status: "ok" | "fallback";
  engine: IntakeEngine;
  engineLabel: string;
  message?: string;
  rawText: string;
  fields: Record<IntakeFieldKey, IntakeFieldValue>;
  model?: string;
}

export function localTextParse(text: string): IntakeParseApiResponse {
  const result: IntakeParseResult = parseIntakeText(text);
  return {
    status: "ok",
    engine: "local-heuristic",
    engineLabel: "本地规则解析",
    rawText: result.rawText,
    fields: result.fields,
  };
}

export function mergeQwenFields(
  fields: Record<IntakeFieldKey, IntakeFieldValue>,
  rawText: string,
  engine: IntakeEngine,
  model: string
): IntakeParseApiResponse {
  return {
    status: "ok",
    engine,
    engineLabel:
      engine === "qwen-vl"
        ? `通义千问视觉（${model}）`
        : `通义千问文本（${model}）`,
    model,
    rawText,
    fields,
  };
}
