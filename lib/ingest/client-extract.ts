"use client";

// Browser-side text extraction, so only small TEXT travels to the server —
// file size stops mattering (the serverless upload cap is ~4.5 MB, but a
// 40 MB deck's text is a few hundred KB at most).
import { extractPptxText, extractDocxText } from "./office-xml";

export async function extractFileTextInBrowser(file: File): Promise<string> {
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  switch (ext) {
    case "pptx":
    case "potx":
      return extractPptxText(bytes);
    case "docx":
    case "dotx":
      return extractDocxText(bytes);
    case "txt":
    case "md":
    case "csv":
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    case "pdf": {
      // unpdf is pdf.js underneath and runs in the browser; loaded lazily so
      // it never weighs down the normal bundle.
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(bytes);
      const { text } = await extractText(pdf, { mergePages: true });
      const raw = (Array.isArray(text) ? text.join("\n\n") : text).trim();
      if (!raw) {
        throw new Error(
          "Could not extract any text from this PDF. It may be a scanned image (OCR is not supported yet) — if you have the original slides or document, add that instead."
        );
      }
      return raw;
    }
    case "ppt":
    case "doc":
      throw new Error(
        `"${file.name}" is the old ${ext.toUpperCase()} format. In PowerPoint/Word use File → Save As and pick .${ext}x or PDF, then add it again.`
      );
    default:
      throw new Error(
        `"${file.name}" isn't a format Kube can read yet. PDF, PPTX, DOCX, TXT and MD all work.`
      );
  }
}
