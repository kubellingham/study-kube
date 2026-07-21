"use client";

// Browser-side image preparation for vision ingestion. Everything Kube will
// LOOK at (standalone photos, embedded slide pictures, scanned PDF pages) is
// downscaled and re-encoded as JPEG here, so the JSON POST stays far under
// the serverless body cap and vision token cost stays sane.

export interface PreparedImage {
  mediaType: "image/jpeg";
  /** bare base64, no data: prefix */
  data: string;
}

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.78;
/** Total base64 budget across one file's images (~3 MB leaves headroom
 *  under Vercel's ~4.5 MB request cap alongside the extracted text). */
export const IMAGE_BUDGET_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGES_PER_FILE = 28;

async function blobToBitmap(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      // fall through to <img> decode (e.g. odd BMPs)
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not decode image.")); };
    img.src = url;
  });
}

/** Downscale + re-encode any decodable image to JPEG base64. Returns null for
 *  images too small to carry teaching content (icons, bullets). */
export async function compressImage(
  input: Blob | Uint8Array,
  mediaTypeHint = "image/png"
): Promise<PreparedImage | null> {
  const blob = input instanceof Blob
    ? input
    : new Blob([new Uint8Array(input)], { type: mediaTypeHint });
  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await blobToBitmap(blob);
  } catch {
    return null;
  }
  const w = bitmap.width;
  const h = bitmap.height;
  if (!w || !h || (w < 80 && h < 80)) return null; // decoration, not content

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff"; // transparent PNGs flatten onto white
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";
  if (!base64) return null;
  return { mediaType: "image/jpeg", data: base64 };
}

/** Apply the per-file count + byte budget, keeping document order. */
export function budgetImages(images: PreparedImage[]): PreparedImage[] {
  const out: PreparedImage[] = [];
  let bytes = 0;
  for (const img of images) {
    if (out.length >= MAX_IMAGES_PER_FILE) break;
    if (bytes + img.data.length > IMAGE_BUDGET_BYTES) break;
    out.push(img);
    bytes += img.data.length;
  }
  return out;
}

/** Render pages of a (typically scanned) PDF to JPEG images via pdf.js —
 *  the OCR-free way to let Kube SEE what a scanner refused to give as text. */
export async function renderPdfPages(
  bytes: Uint8Array,
  maxPages = 24
): Promise<PreparedImage[]> {
  const { getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const total = Math.min(pdf.numPages, maxPages);
  const out: PreparedImage[] = [];
  for (let p = 1; p <= total; p++) {
    const page = await pdf.getPage(p);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2, MAX_DIMENSION / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;
    const base64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1];
    if (base64) out.push({ mediaType: "image/jpeg", data: base64 });
  }
  return out;
}
