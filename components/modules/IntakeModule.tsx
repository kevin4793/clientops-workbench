"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { parseIntakeText } from "@/lib/intake-parser";
import {
  INTAKE_FIELD_META,
  type IntakeFieldKey,
  type IntakeFieldValue,
  type IntakeParseResult,
  emptyIntakeFields,
} from "@/lib/intake-types";
import { extractTextFromImage } from "@/lib/ocr";
import type { IntakeFormValues } from "@/lib/build-client-from-intake";

const SAMPLE = `姓名：陈大明
性别：男
出生：1985-07-22
几时来过网点：上个月周三下午
屋企人情况：老婆+两个仔，父母同住
家庭成员组合：4口之家
资产大概：800万左右
爱好：打羽毛球、饮茶
讲过的话：「唔想太激，稳阵先得」
性格：爽快，讲嘢直接
风险承受能力：稳健 R2
其他银行有没有钱：招行有一点理财
主要结余：我行活期+定期
产品代码：DEMO-LC-2026-088
金额：120万
到期日：2026-12-01
备注：微信讲过想了解下个月开放期`;

function confidenceLabel(c: IntakeFieldValue["confidence"]) {
  if (c === "high") return { text: "高", className: "bg-emerald-800/60 text-emerald-100" };
  if (c === "med") return { text: "中", className: "bg-amber-800/50 text-amber-100" };
  return { text: "低", className: "bg-slate-700 text-slate-200" };
}

export function IntakeModule() {
  const { registerClientFromIntake } = useClientOps();
  const [mode, setMode] = useState<"paste" | "image">("paste");
  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState<IntakeParseResult | null>(null);
  const [form, setForm] = useState<Record<IntakeFieldKey, IntakeFieldValue>>(
    emptyIntakeFields()
  );
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyParse = useCallback((result: IntakeParseResult) => {
    setParseResult(result);
    setForm(result.fields);
    setSavedId(null);
  }, []);

  async function runParse(text: string) {
    setParsing(true);
    try {
      const res = await fetch("/api/intake/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.fields) {
        applyParse({ rawText: text, fields: data.fields });
      } else {
        applyParse(parseIntakeText(text));
      }
    } catch {
      applyParse(parseIntakeText(text));
    } finally {
      setParsing(false);
    }
  }

  function handleParseClick() {
    void runParse(rawText);
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
    setPreviewUrl(URL.createObjectURL(file));
    setOcrStatus("识别中…（首次会下载语言包，稍等）");
    const ocr = await extractTextFromImage(file);
    if (ocr.ok) {
      setRawText(ocr.text);
      setOcrStatus("OCR 完成，已填入文本区，请核对后点「解析字段」");
      void runParse(ocr.text);
    } else {
      setOcrStatus(`${ocr.error}。${ocr.hint}`);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) void onFile(f);
  }

  function handleConfirm() {
    const values = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.value])
    ) as IntakeFormValues;
    const record = registerClientFromIntake(values);
    setSavedId(record.id);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="rounded-xl border border-amber-700/30 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
        仅辅助录入，不构成投资建议；演示数据。系统<strong>不会</strong>自动编造原文没有的字段，请人工核对后再登记。
      </p>

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
          placeholder="粘贴微信备注、手写清单 OCR 结果、会议纪要片段…"
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
            本地 Tesseract OCR（chi_sim+eng）；识别后请核对
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
          {ocrStatus && (
            <p className="mt-3 text-xs text-amber-100/90">{ocrStatus}</p>
          )}
        </div>
      )}

      {mode === "image" && rawText && (
        <textarea
          className="min-h-[100px] w-full rounded-xl border border-teal-800 bg-[#0f1f1c] p-3 text-xs text-teal-300"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          aria-label="OCR 文本可编辑"
        />
      )}

      <button
        type="button"
        disabled={!rawText.trim() || parsing}
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
            {(Object.keys(INTAKE_FIELD_META) as IntakeFieldKey[]).map((key) => {
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
