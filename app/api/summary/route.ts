import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { generateSummary } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(req, body.material_id);
  if (!ctx.ok) return ctx.response;
  const { uid, material } = ctx;

  let content;
  try {
    content = await generateSummary(material.rawText);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  // One summary per material — the doc id is the material id (upsert).
  const doc = {
    materialId: material.id,
    userId: uid,
    content,
    createdAt: Date.now(),
  };
  try {
    await adminDb().collection("summaries").doc(material.id).set(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save.";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ summary: { id: material.id, ...doc } });
}
