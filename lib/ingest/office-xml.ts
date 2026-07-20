// Pure text extraction for OOXML formats (.pptx / .docx). No Node APIs and
// no PDF dependencies, so it runs both server-side and IN THE BROWSER —
// client-side extraction is what lets big files skip the upload size cap.
import JSZip from "jszip";

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
