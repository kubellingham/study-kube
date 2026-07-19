import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb, adminBucket } from "@/lib/firebase/admin";
import { ingestText, ingestPdf, ingestLink } from "@/lib/ingest";
import type { IngestResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB
// Firestore documents are capped at ~1 MiB; keep raw text comfortably under.
const MAX_STORED_CHARS = 800_000;

export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let ingest: IngestResult;
  let pdfBytes: Uint8Array | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return Response.json({ error: "No PDF file provided." }, { status: 400 });
      }
      if (file.size > MAX_PDF_BYTES) {
        return Response.json(
          { error: "PDF is too large (max 25 MB)." },
          { status: 400 }
        );
      }
      pdfBytes = new Uint8Array(await file.arrayBuffer());
      ingest = await ingestPdf(pdfBytes, file.name);
    } else {
      const body = await req.json();
      if (body.kind === "text") {
        if (!body.text?.trim()) {
          return Response.json({ error: "Text is empty." }, { status: 400 });
        }
        ingest = ingestText(body.text, body.title);
      } else if (body.kind === "link") {
        if (!body.url?.trim()) {
          return Response.json({ error: "URL is empty." }, { status: 400 });
        }
        ingest = await ingestLink(body.url);
      } else {
        return Response.json({ error: "Unknown material kind." }, { status: 400 });
      }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read material.";
    return Response.json({ error: message }, { status: 400 });
  }

  const doc = {
    userId: uid,
    title: ingest.title,
    sourceType: ingest.source_type,
    sourceUrl: ingest.source_url,
    rawText: ingest.raw_text.slice(0, MAX_STORED_CHARS),
    createdAt: Date.now(),
  };

  let ref;
  try {
    ref = await adminDb().collection("materials").add(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save material.";
    return Response.json({ error: message }, { status: 500 });
  }

  // Best-effort: keep the original PDF in Cloud Storage.
  if (pdfBytes) {
    try {
      await adminBucket()
        .file(`materials/${uid}/${ref.id}.pdf`)
        .save(Buffer.from(pdfBytes), { contentType: "application/pdf" });
    } catch {
      // Non-fatal — we already stored the extracted text.
    }
  }

  return Response.json({ material: { id: ref.id, ...doc } });
}
