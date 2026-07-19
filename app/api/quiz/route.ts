import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { generateQuiz } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(req, body.material_id);
  if (!ctx.ok) return ctx.response;
  const { uid, material } = ctx;

  const count = Math.min(Math.max(Number(body.count) || 8, 3), 20);

  let questions;
  try {
    ({ questions } = await generateQuiz(material.rawText, count));
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

  const data = {
    materialId: material.id,
    userId: uid,
    title: `${material.title} — quiz`,
    questions,
    createdAt: Date.now(),
  };

  try {
    const ref = await adminDb().collection("quizzes").add(data);
    return Response.json({ quiz: { id: ref.id, ...data } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save quiz.";
    return Response.json({ error: message }, { status: 500 });
  }
}
