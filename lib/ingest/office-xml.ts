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

/** Excel .xlsx → plain text: sheet names + cell text, row per line.
 *  Reads sharedStrings (where Excel keeps most text) and inline strings, plus
 *  numeric cell values, walking sheets in workbook order. */
export async function extractXlsxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);

  // Shared strings: <si> items, each possibly split across <t> runs.
  const shared: string[] = [];
  const ss = zip.files["xl/sharedStrings.xml"];
  if (ss) {
    const xml = await ss.async("string");
    for (const si of xml.split(/<\/si>/)) {
      const t = [...si.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
        .map((m) => decodeXml(m[1]))
        .join("");
      if (si.includes("<si")) shared.push(t);
    }
  }

  // Sheet names in workbook order → their XML paths (sheetN.xml by rel order
  // is close enough for study material; exact rel resolution is overkill).
  const workbook = zip.files["xl/workbook.xml"];
  const names: string[] = [];
  if (workbook) {
    const xml = await workbook.async("string");
    for (const m of xml.matchAll(/<sheet\s[^>]*name="([^"]*)"/g)) names.push(decodeXml(m[1]));
  }

  const sheetPaths = Object.keys(zip.files)
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort((a, b) => {
      const num = (s: string) => parseInt(s.match(/sheet(\d+)\.xml$/)?.[1] ?? "0", 10);
      return num(a) - num(b);
    });

  const parts: string[] = [];
  for (let i = 0; i < sheetPaths.length; i++) {
    const xml = await zip.files[sheetPaths[i]].async("string");
    const rows: string[] = [];
    for (const row of xml.split(/<\/row>/)) {
      if (!row.includes("<c")) continue;
      const cells: string[] = [];
      for (const c of row.matchAll(/<c\s([^>]*)>([\s\S]*?)<\/c>/g)) {
        const attrs = c[1];
        const inner = c[2];
        const type = attrs.match(/t="([^"]*)"/)?.[1] ?? "n";
        if (type === "s") {
          const idx = parseInt(inner.match(/<v>(\d+)<\/v>/)?.[1] ?? "-1", 10);
          if (idx >= 0 && idx < shared.length && shared[idx].trim()) cells.push(shared[idx].trim());
        } else if (type === "inlineStr") {
          const t = [...inner.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
            .map((m) => decodeXml(m[1]))
            .join("");
          if (t.trim()) cells.push(t.trim());
        } else {
          const v = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
          if (v !== undefined && v.trim()) cells.push(decodeXml(v.trim()));
        }
      }
      if (cells.length) rows.push(cells.join(" | "));
    }
    if (rows.length) {
      parts.push(`--- Sheet: ${names[i] ?? `Sheet ${i + 1}`} ---\n${rows.join("\n")}`);
    }
  }
  if (parts.length === 0) {
    throw new Error("No readable cells found in this Excel file.");
  }
  return parts.join("\n\n");
}

/** Extract embedded media (pictures) from a .pptx or .docx zip, largest-first
 *  bias preserved by slide order; tiny images (logos, bullets) are skipped. */
export async function extractOoxmlImages(
  bytes: Uint8Array,
  kind: "pptx" | "docx",
  minBytes = 12 * 1024,
  maxCount = 60
): Promise<{ mediaType: string; bytes: Uint8Array }[]> {
  const zip = await JSZip.loadAsync(bytes);
  const dir = kind === "pptx" ? /^ppt\/media\// : /^word\/media\//;
  const mediaNames = Object.keys(zip.files)
    .filter((n) => dir.test(n) && /\.(png|jpe?g|gif|bmp|webp)$/i.test(n))
    .sort((a, b) => {
      const num = (s: string) => parseInt(s.match(/(\d+)\.\w+$/)?.[1] ?? "0", 10);
      return num(a) - num(b);
    });
  const out: { mediaType: string; bytes: Uint8Array }[] = [];
  for (const name of mediaNames) {
    if (out.length >= maxCount) break;
    const data = await zip.files[name].async("uint8array");
    if (data.length < minBytes) continue;
    const ext = name.match(/\.(\w+)$/)?.[1].toLowerCase() ?? "png";
    const mediaType =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
      ext === "gif" ? "image/gif" :
      ext === "bmp" ? "image/bmp" :
      ext === "webp" ? "image/webp" : "image/png";
    out.push({ mediaType, bytes: data });
  }
  return out;
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
