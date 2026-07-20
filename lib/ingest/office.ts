// Server-side document dispatch. The OOXML extraction lives in office-xml.ts
// (shared with the browser); PDFs use unpdf here. Legacy binary .ppt/.doc
// can't be parsed without desktop software — rejected with advice.
import { ingestPdf } from "./pdf";
import { extractPptxText, extractDocxText } from "./office-xml";

export { extractPptxText, extractDocxText };

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
