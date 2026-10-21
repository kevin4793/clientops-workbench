/** 浏览器端 OCR（Tesseract.js），首次加载会下载语言包 */

export type OcrResult =
  | { ok: true; text: string }
  | { ok: false; error: string; hint: string };

export async function extractTextFromImage(file: File): Promise<OcrResult> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("chi_sim+eng", 1, {
      logger: () => {},
    });
    const {
      data: { text },
    } = await worker.recognize(file);
    await worker.terminate();
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        ok: false,
        error: "未识别到文字",
        hint:
          "可改用粘贴模式，或手动将 OCR 结果贴入文本框。生产环境可改接 /api/intake/parse 视觉模型。",
      };
    }
    return { ok: true, text: trimmed };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OCR 失败";
    return {
      ok: false,
      error: msg,
      hint:
        "演示环境 OCR 可能受网络或图片清晰度影响。请粘贴文字，或通过 API 传入已提取文本（imageText）。",
    };
  }
}
