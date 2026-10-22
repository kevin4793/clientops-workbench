/** 浏览器端压缩图片，长边不超过 maxEdge，返回 base64（无 data: 前缀） */

export async function fileToCompressedBase64(
  file: File,
  maxEdge = 1600
): Promise<{ base64: string; mimeType: string }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建 canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const mimeType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("压缩失败"))),
      mimeType,
      0.85
    );
  });

  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return { base64: btoa(binary), mimeType };
}
