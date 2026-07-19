import { extractText, getDocumentProxy } from "unpdf";
import type { IngestResult } from "@/lib/types";

/** Extract text from a PDF file's bytes. Returns normalized Material payload.
 *  `filename` is used to derive a title. */
export async function ingestPdf(
  bytes: Uint8Array,
  filename: string
): Promise<IngestResult> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  const raw = (Array.isArray(text) ? text.join("\n\n") : text).trim();

  if (!raw) {
    throw new Error(
      "Could not extract any text from this PDF. It may be a scanned image (OCR is not supported yet)."
    );
  }

  const title = filename.replace(/\.pdf$/i, "").trim() || "PDF document";
  return {
    title,
    source_type: "pdf",
    source_url: null,
    raw_text: raw,
  };
}
