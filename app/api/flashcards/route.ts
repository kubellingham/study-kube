import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { generateFlashcards } from "@/lib/anthropic";
import type { Deck, Flashcard } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await requireMaterial(req, body.material_id);
  if (!ctx.ok) return ctx.response;
  const { uid, material } = ctx;

  const count = Math.min(Math.max(Number(body.count) || 15, 5), 40);

  let cards;
  try {
    ({ cards } = await generateFlashcards(material.rawText, count));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  const now = Date.now();
  const db = adminDb();
  const batch = db.batch();

  const deckRef = db.collection("decks").doc();
  const deckData = {
    materialId: material.id,
    userId: uid,
    title: `${material.title} — flashcards`,
    createdAt: now,
  };
  batch.set(deckRef, deckData);
  const deck: Deck = { id: deckRef.id, ...deckData };

  const cardDocs: Flashcard[] = cards.map((c) => {
    const ref = db.collection("cards").doc();
    const cardData = {
      deckId: deckRef.id,
      userId: uid,
      front: c.front,
      back: c.back,
      ease: 2.5,
      intervalDays: 0,
      dueAt: now,
      createdAt: now,
    };
    batch.set(ref, cardData);
    return { id: ref.id, ...cardData };
  });

  try {
    await batch.commit();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save deck.";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ deck, cards: cardDocs });
}
