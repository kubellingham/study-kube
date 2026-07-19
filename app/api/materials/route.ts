import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestText, ingestPdf, ingestLink } from "@/lib/ingest";
import type { IngestResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
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

  const { data: material, error } = await supabase
    .from("materials")
    .insert({
      user_id: user.id,
      title: ingest.title,
      source_type: ingest.source_type,
      source_url: ingest.source_url,
      raw_text: ingest.raw_text,
    })
    .select()
    .single();

  if (error || !material) {
    return Response.json(
      { error: error?.message || "Could not save material." },
      { status: 500 }
    );
  }

  // Best-effort: keep the original PDF in storage. Failure here shouldn't
  // block the material (we already have the extracted text).
  if (pdfBytes) {
    await supabase.storage
      .from("materials")
      .upload(`${user.id}/${material.id}.pdf`, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
  }

  return Response.json({ material });
}
