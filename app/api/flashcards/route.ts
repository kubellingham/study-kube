import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { generateFlashcards } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(body.material_id);
  if (!ctx.ok) return ctx.response;
  const { supabase, userId, material } = ctx;

  const count = Math.min(Math.max(Number(body.count) || 15, 5), 40);

  let cards;
  try {
    ({ cards } = await generateFlashcards(material.raw_text, count));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  const { data: deck, error: deckError } = await supabase
    .from("flashcard_decks")
    .insert({
      material_id: material.id,
      user_id: userId,
      title: `${material.title} — flashcards`,
    })
    .select()
    .single();

  if (deckError || !deck) {
    return Response.json(
      { error: deckError?.message || "Could not create deck." },
      { status: 500 }
    );
  }

  const rows = cards.map((c) => ({
    deck_id: deck.id,
    user_id: userId,
    front: c.front,
    back: c.back,
  }));

  const { data: inserted, error: cardsError } = await supabase
    .from("flashcards")
    .insert(rows)
    .select();

  if (cardsError) {
    return Response.json({ error: cardsError.message }, { status: 500 });
  }

  return Response.json({ deck, cards: inserted });
}
