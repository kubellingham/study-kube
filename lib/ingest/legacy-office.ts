// Legacy binary Office extraction (.ppt / .doc) — the same technique Kube's
// author used by hand for the CSE46D decks, ported to run in the browser.
// PPT97: walk the "PowerPoint Document" stream's record tree and collect the
// three text atom types; carve embedded JPEG/PNG images out of the "Pictures"
// stream so image-heavy decks can be SEEN, not just read.
// DOC: best-effort — decode the "WordDocument" stream and keep printable runs.
import { openCfb, isCfb } from "./cfb";

const REC_TEXT_CHARS = 0x0fa0; // UTF-16LE text
const REC_TEXT_BYTES = 0x0fa8; // 8-bit text
const REC_CSTRING = 0x0fba; // UTF-16LE string

export function isLegacyOffice(bytes: Uint8Array): boolean {
  return isCfb(bytes);
}

function decodeLatin1(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function decodeUtf16le(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    s += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
  }
  return s;
}

function cleanPptText(s: string): string {
  return s
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "\n")
    .trim();
}

/** Walk PowerPoint record structure: 8-byte headers, containers descend. */
function walkRecords(bytes: Uint8Array, out: string[], depth = 0): void {
  if (depth > 24) return;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let off = 0;
  while (off + 8 <= bytes.length) {
    const verInstance = dv.getUint16(off, true);
    const recType = dv.getUint16(off + 2, true);
    const recLen = dv.getUint32(off + 4, true);
    const bodyStart = off + 8;
    const bodyEnd = Math.min(bodyStart + recLen, bytes.length);
    if (recLen > bytes.length) break; // corrupt header — stop this level
    const body = bytes.subarray(bodyStart, bodyEnd);
    if ((verInstance & 0x0f) === 0x0f) {
      walkRecords(body, out, depth + 1); // container
    } else if (recType === REC_TEXT_CHARS || recType === REC_CSTRING) {
      const t = cleanPptText(decodeUtf16le(body));
      if (t) out.push(t);
    } else if (recType === REC_TEXT_BYTES) {
      const t = cleanPptText(decodeLatin1(body));
      if (t) out.push(t);
    }
    off = bodyEnd; // header already consumed; zero-length atoms advance by the 8-byte header alone
  }
}

export interface CarvedImage {
  mediaType: "image/jpeg" | "image/png";
  bytes: Uint8Array;
}

/** Carve JPEG (SOI..EOI) and PNG (signature..IEND) blobs out of a stream. */
export function carveImages(stream: Uint8Array, maxCount = 80): CarvedImage[] {
  const out: CarvedImage[] = [];
  const n = stream.length;
  let i = 0;
  while (i + 8 < n && out.length < maxCount) {
    // PNG signature
    if (
      stream[i] === 0x89 && stream[i + 1] === 0x50 && stream[i + 2] === 0x4e &&
      stream[i + 3] === 0x47 && stream[i + 4] === 0x0d && stream[i + 5] === 0x0a
    ) {
      // find IEND + 8 bytes (length+type already at match; chunk has 4-byte CRC)
      let j = i + 8;
      let end = -1;
      while (j + 8 <= n) {
        if (stream[j] === 0x49 && stream[j + 1] === 0x45 && stream[j + 2] === 0x4e && stream[j + 3] === 0x44) {
          end = j + 8; // IEND type + CRC
          break;
        }
        j++;
      }
      if (end > 0) {
        out.push({ mediaType: "image/png", bytes: stream.subarray(i, end) });
        i = end;
        continue;
      }
    }
    // JPEG SOI
    if (stream[i] === 0xff && stream[i + 1] === 0xd8 && stream[i + 2] === 0xff) {
      let j = i + 2;
      let end = -1;
      while (j + 1 < n) {
        if (stream[j] === 0xff && stream[j + 1] === 0xd9) {
          end = j + 2;
          break;
        }
        j++;
      }
      if (end > 0 && end - i > 2048) {
        out.push({ mediaType: "image/jpeg", bytes: stream.subarray(i, end) });
        i = end;
        continue;
      }
      if (end > 0) { i = end; continue; } // tiny thumbnail — skip past it
    }
    i++;
  }
  return out;
}

export interface LegacyPptResult {
  text: string;
  images: CarvedImage[];
}

/** Extract text + embedded images from a legacy binary .ppt. */
export function extractPpt97(bytes: Uint8Array): LegacyPptResult {
  const cfb = openCfb(bytes);
  const doc = cfb.readStream("PowerPoint Document");
  const texts: string[] = [];
  if (doc) walkRecords(doc, texts);
  const pictures = cfb.readStream("Pictures");
  const images = pictures ? carveImages(pictures) : [];
  // De-noise: drop layout-machinery strings and template boilerplate that
  // text atoms carry alongside the real slide content.
  const lines = texts
    .flatMap((t) => t.split("\n"))
    .map((l) => l.trim())
    .filter(
      (l) =>
        (l.length > 1 || /[A-Za-z0-9]/.test(l)) &&
        !/^___PPT\d*/.test(l) &&
        !/^Click to edit Master/.test(l) &&
        !/^(Second|Third|Fourth|Fifth) level$/.test(l) &&
        !/^\d+_Office Theme$/.test(l) &&
        l !== "*"
    );
  return { text: lines.join("\n"), images };
}

/** Best-effort text from a legacy binary .doc: printable runs from the
 *  WordDocument stream (full piece-table parsing is out of scope; lecture
 *  notes are overwhelmingly non-complex files where this reads well). */
export function extractDoc97(bytes: Uint8Array): string {
  const cfb = openCfb(bytes);
  const doc = cfb.readStream("WordDocument");
  if (!doc) return "";
  const runs: string[] = [];
  // Try UTF-16 runs first (modern Word stores text as UTF-16LE), then latin1.
  let current = "";
  for (let i = 0; i + 1 < doc.length; i += 2) {
    const code = doc[i] | (doc[i + 1] << 8);
    const ch = String.fromCharCode(code);
    if ((code >= 32 && code < 0xd800) || code === 10 || code === 13 || code === 9) {
      current += ch === "\r" ? "\n" : ch;
    } else {
      if (current.replace(/\s/g, "").length >= 12) runs.push(current.trim());
      current = "";
    }
  }
  if (current.replace(/\s/g, "").length >= 12) runs.push(current.trim());
  if (runs.join("").length < 200) {
    // Fall back to single-byte interpretation.
    runs.length = 0;
    current = "";
    for (let i = 0; i < doc.length; i++) {
      const b = doc[i];
      if ((b >= 32 && b < 127) || b === 10 || b === 13 || b === 9) {
        current += b === 13 ? "\n" : String.fromCharCode(b);
      } else {
        if (current.replace(/\s/g, "").length >= 12) runs.push(current.trim());
        current = "";
      }
    }
    if (current.replace(/\s/g, "").length >= 12) runs.push(current.trim());
  }
  return runs.join("\n").trim();
}
