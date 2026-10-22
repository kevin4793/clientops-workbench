"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useSecureClients } from "@/context/SecureClientsContext";
import {
  SECURE_INTAKE_FIELD_KEYS,
  intakeFieldsToSecureInput,
} from "@/lib/secure/intake-map";
import { parseIntakeText } from "@/lib/intake-parser";
import { fileToCompressedBase64 } from "@/lib/compress-image-client";
import type { IntakeEngine } from "@/lib/intake-parse-response";
import {
  INTAKE_FIELD_META,
  type IntakeFieldKey,
  type IntakeFieldValue,
  type IntakeParseResult,
  emptyIntakeFields,
} from "@/lib/intake-types";
import { extractTextFromImage } from "@/lib/ocr";
const SAMPLE = `姓名：陈大明
产品代码：LC-2026-088
金额：120万
到期日：2026-12-01
出生：07-22
备注：微信讲过想了解下个月开放期，唔想太激`;

function confidenceLabel(c: IntakeFieldValue["confidence"]) {
  if (c === "high") return { text: "高", className: "bg-emerald-800/60 text-emerald-100" };
  if (c === "med") return { text: "中", className: "bg-amber-800/50 text-amber-100" };
  return { text: "低", className: "bg-slate-700 text-slate-200" };
}

type ParseApiPayload = {
  status?: string;
  engine?: IntakeEngine;
  engineLabel?: string;
  message?: string;
  rawText?: string;
  fields?: Record<IntakeFieldKey, IntakeFieldValue>;
};

export function IntakeModule() {
  const { saveClient } = useSecureClients();
  const [mode, setMode] = useState<"paste" | "image">("paste");
  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState<IntakeParseResult | null>(null);
  const [form, setForm] = useState<Record<IntakeFieldKey, IntakeFieldValue>>(
    emptyIntakeFields()
  );
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [engineLabel, setEngineLabel] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyParse = useCallback((result: IntakeParseResult) => {
    setParseResult(result);
    setForm(result.fields);
    setSavedId(null);
  }, []);

  function applyApiPayload(data: ParseApiPayload, fallbackText: string) {
    if (data.fields) {
      applyParse({
        rawText: data.rawText ?? fallbackText,
        fields: data.fields,
      });
      setEngineLabel(
        data.engineLabel ??
          (data.engine === "qwen-vl"
            ? "通义千问视觉"
            : data.engine === "qwen-text"
              ? "通义千问文本"
              : "本地规则 / Tesseract")
      );
      if (data.message) setStatusLine(data.message);
      return true;
    }
    return false;
  }

  async function runLocalFallback(text: string, prefix?: string) {
    const local = parseIntakeText(text);
    applyParse(local);
    setEngineLabel("本地规则解析 + Tesseract OCR");
    setStatusLine(
      prefix
        ? `${prefix}已使用本地识别。`
        : "已使用本地规则解析（未配置或通义调用失败）。"
    );
  }

  async function postParse(body: Record<string, string>) {
    const res = await fetch("/api/intake/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as ParseApiPayload;
  }

  async function runTextParse(text: string) {
    setParsing(true);
    setStatusLine(null);
    try {
      const data = await postParse({ text });
      if (!applyApiPayload(data, text)) {
        await runLocalFallback(text);
      }
    } catch {
      await runLocalFallback(text, "网络错误，");
    } finally {
      setParsing(false);
    }
  }

  async function runImageParse(file: File) {
    setParsing(true);
    setStatusLine("正在压缩并发送至服务端（阿里云通义千问）…");
    try {
      const { base64, mimeType } = await fileToCompressedBase64(file, 1600);
      const data = await postParse({
        imageBase64: base64,
        mimeType,
        text: rawText,
      });

      if (applyApiPayload(data, rawText)) {
        if (data.engine === "qwen-vl") {
          setStatusLine("图片已发送至阿里云识别完成，请核对字段。");
        }
        return;
      }

      setStatusLine(
        (data.message ? `${data.message} ` : "") +
          "正在本地 Tesseract OCR 回退…"
      );
      const ocr = await extractTextFromImage(file);
      if (ocr.ok) {
        setRawText(ocr.text);
        const textData = await postParse({ text: ocr.text });
        if (!applyApiPayload(textData, ocr.text)) {
          await runLocalFallback(ocr.text, "通义与接口均失败，");
        } else if (textData.engine !== "qwen-text" && textData.engine !== "qwen-vl") {
          setEngineLabel(`${textData.engineLabel ?? "本地"}（OCR 后）`);
        } else {
          setEngineLabel(`${textData.engineLabel}（OCR 回退后）`);
        }
      } else {
        setStatusLine(`${ocr.error}。${ocr.hint}`);
        await runLocalFallback("", "OCR 失败，");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "图片解析失败";
      setStatusLine(msg);
      if (pendingFile) {
        const ocr = await extractTextFromImage(pendingFile);
        if (ocr.ok) {
          setRawText(ocr.text);
          await runLocalFallback(ocr.text, "异常回退，");
        }
      }
    } finally {
      setParsing(false);
    }
  }

  function handleParseClick() {
    if (mode === "image" && pendingFile) {
      void runImageParse(pendingFile);
      return;
    }
    void runTextParse(rawText);
  }

  function updateField(key: IntakeFieldKey, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        confidence: "high",
        sourceSnippet: prev[key].sourceSnippet || "（人工修改）",
      },
    }));
  }

  async function onFile(file: File) {
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSavedId(null);
    void runImageParse(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) void onFile(f);
  }

  async function handleConfirm() {
    const input = intakeFieldsToSecureInput(form);
    const record = await saveClient(input);
    setSavedId(record.id);
  }

  const canParse =
    mode === "image" ? !!pendingFile || !!rawText.trim() : !!rawText.trim();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="rounded-xl border border-amber-700/30 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
        仅辅助录入，不构成投资建议；演示数据。系统<strong>不会</strong>自动编造原文没有的字段，请人工核对后再登记。
      </p>
      <p className="rounded-xl border border-sky-800/40 bg-sky-950/30 px-3 py-2 text-xs text-sky-100/90">
        上传图片进行识别时，压缩后的图像将发送至<strong>阿里云百炼（通义千问）</strong>处理；密钥仅存于服务端。无密钥或调用失败时自动回退本地 OCR + 规则解析。
      </p>

      {engineLabel && (
        <p className="text-xs text-teal-300">
          当前识别方式：<span className="font-medium text-teal-100">{engineLabel}</span>
        </p>
      )}
      {statusLine && (
        <p className="text-xs text-amber-200/90">{statusLine}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            mode === "paste" ? "bg-teal-600 text-white" : "bg-teal-900/50"
          }`}
        >
          粘贴文字
        </button>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            mode === "image" ? "bg-teal-600 text-white" : "bg-teal-900/50"
          }`}
        >
          拍照 / 上传图片
        </button>
        <button
          type="button"
          onClick={() => setRawText(SAMPLE)}
          className="ml-auto text-xs text-teal-400 underline"
        >
          填入示例（粤普混排）
        </button>
      </div>

      {mode === "paste" ? (
        <textarea
          className="min-h-[160px] w-full rounded-xl border border-teal-800 bg-[#0f1f1c] p-3 text-sm text-teal-50"
          placeholder="粘贴微信备注、手写清单、会议纪要片段…"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-xl border-2 border-dashed border-teal-700 bg-[#0f1f1c]/80 p-6 text-center"
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt="预览"
              className="mx-auto mb-3 max-h-48 rounded-lg object-contain"
            />
          )}
          <p className="text-sm text-teal-200">拖拽图片到此处，或选择文件</p>
          <p className="mt-1 text-xs text-teal-500">
            长边压缩至 ≤1600px 后上传；优先通义千问视觉，失败则 Tesseract
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="mt-3 text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </div>
      )}

      {mode === "image" && rawText && (
        <textarea
          className="min-h-[100px] w-full rounded-xl border border-teal-800 bg-[#0f1f1c] p-3 text-xs text-teal-300"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          aria-label="识别文本可编辑"
        />
      )}

      <button
        type="button"
        disabled={!canParse || parsing}
        onClick={handleParseClick}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {parsing ? "解析中…" : "解析字段"}
      </button>

      {parseResult && (
        <section className="space-y-4 rounded-2xl border border-teal-800/50 bg-[#152a25] p-4">
          <h2 className="text-sm font-semibold text-teal-50">
            核对登记表（可编辑）
          </h2>
          <p className="text-xs text-teal-400/80">
            来源摘要仅展示解析依据，未识别字段请留空。
          </p>
          <div className="space-y-3">
            {SECURE_INTAKE_FIELD_KEYS.map((key) => {
              const meta = INTAKE_FIELD_META[key];
              const field = form[key];
              const badge = confidenceLabel(field.confidence);
              return (
                <div
                  key={key}
                  className="rounded-lg border border-teal-900/50 bg-[#0f1f1c]/60 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm font-medium text-teal-100">
                      {meta.label}
                    </label>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${badge.className}`}
                    >
                      置信{badge.text}
                    </span>
                    {meta.hint && (
                      <span className="text-[10px] text-teal-500">{meta.hint}</span>
                    )}
                  </div>
                  <input
                    className="mt-2 w-full rounded-lg border border-teal-800 bg-teal-950/50 px-2 py-1.5 text-sm"
                    value={field.value}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                  {field.sourceSnippet && (
                    <p className="mt-1 text-[10px] text-teal-500/80">
                      来源：「{field.sourceSnippet}」
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
          >
            确认登记
          </button>
          {savedId && (
            <p className="text-center text-sm text-emerald-300">
              已保存至演示库。
              <Link href={`/profiles/${savedId}`} className="ml-1 underline">
                查看档案
              </Link>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
