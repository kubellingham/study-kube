"use client";

// Browser-side extraction, so only small TEXT + compressed images travel to
// the server — file size stops mattering (the serverless upload cap is
// ~4.5 MB, but a 40 MB deck's text is a few hundred KB and its pictures are
// re-encoded down to a bounded budget).
//
// Formats and how each is handled:
//   pptx/potx  – slide text; embedded pictures compressed for vision
//   docx/dotx  – paragraph text; embedded pictures for vision
//   ppt        – legacy binary: CFB walk for text atoms + carved pictures
//   doc        – legacy binary: best-effort printable-run text
//   xlsx       – sheet names + cell text
//   pdf        – text layer; if scanned (no text), pages render to images
//   png/jpg/…  – the image itself, compressed for vision
//   txt/md/csv – decoded as UTF-8
import { extractPptxText, extractDocxText, extractXlsxText, extractOoxmlImages } from "./office-xml";
import { extractPpt97, extractDoc97, isLegacyOffice } from "./legacy-office";
import {
  compressImage,
  budgetImages,
  renderPdfPages,
  type PreparedImage,
} from "./images-client";

export interface ExtractedMaterial {
  text: string;
  /** Compressed JPEGs Kube should LOOK at alongside the text (may be empty). */
  images: PreparedImage[];
}

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp"]);

/** Text under this length means a deck/pdf is image-carried: harvest visuals. */
const THIN_TEXT_CHARS = 2500;

async function compressAll(
  raws: { mediaType: string; bytes: Uint8Array }[]
): Promise<PreparedImage[]> {
  const out: PreparedImage[] = [];
  for (const raw of raws) {
    const prepared = await compressImage(raw.bytes, raw.mediaType);
    if (prepared) out.push(prepared);
  }
  return budgetImages(out);
}

export async function extractFileInBrowser(file: File): Promise<ExtractedMaterial> {
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (IMAGE_EXTS.has(ext)) {
    const prepared = await compressImage(new Blob([bytes], { type: file.type || "image/png" }));
    if (!prepared) throw new Error(`Could not read "${file.name}" as an image.`);
    return { text: `[Image file: ${file.name}]`, images: [prepared] };
  }

  switch (ext) {
    case "pptx":
    case "potx": {
      const text = await extractPptxText(bytes);
      // Image-heavy decks (like a certain Unit 3…) carry their teaching in
      // pictures — harvest them whenever the text runs thin, and grab a
      // handful even on text-rich decks so diagrams aren't lost.
      const thin = text.replace(/--- Slide \d+ ---/g, "").trim().length < THIN_TEXT_CHARS;
      const raws = await extractOoxmlImages(bytes, "pptx", thin ? 6 * 1024 : 24 * 1024, thin ? 60 : 16);
      return { text, images: await compressAll(raws) };
    }
    case "docx":
    case "dotx": {
      const text = await extractDocxText(bytes);
      const thin = text.trim().length < THIN_TEXT_CHARS;
      const raws = await extractOoxmlImages(bytes, "docx", thin ? 6 * 1024 : 24 * 1024, thin ? 40 : 10);
      return { text, images: await compressAll(raws) };
    }
    case "xlsx":
    case "xltx":
      return { text: await extractXlsxText(bytes), images: [] };
    case "txt":
    case "md":
    case "csv":
      return {
        text: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
        images: [],
      };
    case "pdf": {
      // unpdf is pdf.js underneath and runs in the browser; loaded lazily so
      // it never weighs down the normal bundle.
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(bytes));
      const { text } = await extractText(pdf, { mergePages: true });
      const raw = (Array.isArray(text) ? text.join("\n\n") : text).trim();
      if (raw.length >= 200) return { text: raw, images: [] };
      // Scanned (or near-empty text layer): let Kube SEE the pages instead.
      const pages = budgetImages(await renderPdfPages(bytes));
      if (pages.length === 0) {
        throw new Error(
          "Could not read this PDF — no text layer and the pages would not render."
        );
      }
      return {
        text: raw || `[Scanned PDF: ${file.name} — ${pages.length} page images attached]`,
        images: pages,
      };
    }
    case "ppt": {
      if (!isLegacyOffice(bytes)) {
        throw new Error(`"${file.name}" doesn't look like a valid PowerPoint file.`);
      }
      const { text, images } = extractPpt97(bytes);
      const thin = text.trim().length < THIN_TEXT_CHARS;
      // Carved pictures make old decks visible; small ones are noise.
      const keep = images.filter((im) => im.bytes.length >= (thin ? 6 * 1024 : 24 * 1024));
      const prepared = await compressAll(
        keep.slice(0, thin ? 60 : 16).map((im) => ({ mediaType: im.mediaType, bytes: im.bytes }))
      );
      if (!text.trim() && prepared.length === 0) {
        throw new Error(`No readable content found in "${file.name}".`);
      }
      return { text, images: prepared };
    }
    case "doc": {
      if (!isLegacyOffice(bytes)) {
        throw new Error(`"${file.name}" doesn't look like a valid Word file.`);
      }
      const text = extractDoc97(bytes);
      if (text.length < 100) {
        throw new Error(
          `"${file.name}" gave too little readable text — if possible, Save As .docx or PDF and add that instead.`
        );
      }
      return { text, images: [] };
    }
    default:
      throw new Error(
        `"${file.name}" isn't a format Kube can read yet. PDF, PPT(X), DOC(X), XLSX, images (PNG/JPG), TXT and MD all work.`
      );
  }
}

/** Back-compat name used elsewhere; returns text only. */
export async function extractFileTextInBrowser(file: File): Promise<string> {
  return (await extractFileInBrowser(file)).text;
}
