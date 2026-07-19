import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { generateSummary } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(body.material_id);
  if (!ctx.ok) return ctx.response;
  const { supabase, userId, material } = ctx;

  let content;
  try {
    content = await generateSummary(material.raw_text);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  // One summary per material — replace any existing one.
  const { data, error } = await supabase
    .from("summaries")
    .upsert(
      { material_id: material.id, user_id: userId, content },
      { onConflict: "material_id" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ summary: data });
}
