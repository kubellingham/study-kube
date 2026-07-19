import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { generateQuiz } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(body.material_id);
  if (!ctx.ok) return ctx.response;
  const { supabase, userId, material } = ctx;

  const count = Math.min(Math.max(Number(body.count) || 8, 3), 20);

  let questions;
  try {
    ({ questions } = await generateQuiz(material.raw_text, count));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  if (questions.length === 0) {
    return Response.json(
      { error: "The model returned no usable questions. Try again." },
      { status: 502 }
    );
  }

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      material_id: material.id,
      user_id: userId,
      title: `${material.title} — quiz`,
      questions,
    })
    .select()
    .single();

  if (error || !quiz) {
    return Response.json(
      { error: error?.message || "Could not save quiz." },
      { status: 500 }
    );
  }
  return Response.json({ quiz });
}
