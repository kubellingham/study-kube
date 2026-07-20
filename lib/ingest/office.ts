// Text extraction for the document formats students actually have.
// .pptx and .docx are ZIP archives of XML — jszip + light XML text-pulling
// handles them without any native tooling (works on the serverless runtime).
// Legacy binary .ppt/.doc can't be parsed here; we reject them with advice.
import JSZip from "jszip";
import { ingestPdf } from "./pdf";

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

/** PowerPoint .pptx → plain text, one block per slide in slide order. */
export async function extractPptxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const slideNum = (name: string) => parseInt(name.match(/slide(\d+)\.xml$/)?.[1] ?? "0", 10);
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNum(a) - slideNum(b));
  if (slides.length === 0) {
    throw new Error("No slides found in this PowerPoint file.");
  }
  const parts: string[] = [];
  for (const name of slides) {
    const xml = await zip.files[name].async("string");
    // One line per paragraph (<a:p>), text runs (<a:t>) joined within it.
    const paragraphs = xml
      .split(/<\/a:p>/)
      .map((p) =>
        [...p.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
          .map((m) => decodeXml(m[1]))
          .join("")
          .trim()
      )
      .filter(Boolean);
    if (paragraphs.length) {
      parts.push(`--- Slide ${slideNum(name)} ---\n${paragraphs.join("\n")}`);
    }
  }
  return parts.join("\n\n");
}

/** Word .docx → plain text, one line per paragraph. */
export async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const doc = zip.files["word/document.xml"];
  if (!doc) {
    throw new Error("This Word file has no readable document body.");
  }
  const xml = await doc.async("string");
  const paragraphs = xml
    .split(/<\/w:p>/)
    .map((p) =>
      [...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
        .map((m) => decodeXml(m[1]))
        .join("")
        .trim()
    )
    .filter(Boolean);
  return paragraphs.join("\n");
}

/** Dispatch any uploaded document to the right extractor by extension.
 *  Returns plain text; throws a friendly error for unsupported formats. */
export async function extractDocumentText(
  bytes: Uint8Array,
  filename: string
): Promise<string> {
  const ext = (filename.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
  switch (ext) {
    case "pdf":
      return (await ingestPdf(bytes, filename)).raw_text;
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
    case "ppt":
    case "doc":
      throw new Error(
        `"${filename}" is the old ${ext.toUpperCase()} format, which can't be read here. In PowerPoint/Word use File → Save As and pick .${ext}x or PDF, then add it again.`
      );
    default:
      throw new Error(
        `"${filename}" isn't a format Kube can read yet. PDF, PPTX, DOCX, TXT and MD all work.`
      );
  }
}
