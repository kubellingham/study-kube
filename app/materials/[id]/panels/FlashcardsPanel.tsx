"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";
import type { Material, Flashcard, Deck } from "@/lib/types";
import { Skeleton, Empty } from "./SummaryPanel";

type Grade = "again" | "good" | "easy";

// SM-2 lite: adjust ease + next interval based on how well the card was recalled.
function schedule(card: Flashcard, grade: Grade) {
  let ease = card.ease;
  let interval = card.intervalDays;
  if (grade === "again") {
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
  } else {
    if (interval === 0) interval = grade === "easy" ? 4 : 1;
    else interval = Math.round(interval * ease * (grade === "easy" ? 1.3 : 1));
    if (grade === "easy") ease += 0.15;
  }
  const dueAt = Date.now() + interval * 86_400_000;
  return { ease, intervalDays: interval, dueAt };
}

export default function FlashcardsPanel({
  material,
  uid,
}: {
  material: Material;
  uid: string;
}) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    (async () => {
      const deckSnap = await getDocs(
        query(
          collection(db(), "decks"),
          where("userId", "==", uid),
          where("materialId", "==", material.id)
        )
      );
      const decks = deckSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deck);
      decks.sort((a, b) => b.createdAt - a.createdAt);
      const latest = decks[0] ?? null;
      setDeck(latest);
      if (latest) {
        const cardSnap = await getDocs(
          query(
            collection(db(), "cards"),
            where("userId", "==", uid),
            where("deckId", "==", latest.id)
          )
        );
        const cs = cardSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Flashcard
        );
        cs.sort((a, b) => a.createdAt - b.createdAt);
        setCards(cs);
      }
      setLoading(false);
    })();
  }, [material.id, uid]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: material.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate.");
      setDeck(data.deck as Deck);
      setCards(data.cards as Flashcard[]);
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function grade(g: Grade) {
    const card = cards[index];
    if (!card) return;
    const next = schedule(card, g);
    await updateDoc(doc(db(), "cards", card.id), next);
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, ...next } : c)));
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (loading) return <Skeleton />;

  if (!deck || cards.length === 0) {
    return (
      <Empty
        title="No flashcards yet"
        description="Generate a deck of active-recall flashcards from this material."
        actionLabel={busy ? "Generating…" : "Generate flashcards"}
        onAction={generate}
        busy={busy}
        error={error}
      />
    );
  }

  const done = index >= cards.length;
  const card = cards[index];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {done ? cards.length : index + 1} / {cards.length}
        </span>
        <button
          onClick={generate}
          disabled={busy}
          className="hover:text-indigo-600 disabled:opacity-60"
        >
          {busy ? "Generating…" : "↻ New deck"}
        </button>
      </div>

      {done ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-semibold">Deck complete 🎉</p>
          <p className="mt-1 text-sm text-slate-500">
            You reviewed all {cards.length} cards.
          </p>
          <button
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Review again
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="flex min-h-48 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                {flipped ? "Answer" : "Question"}
              </p>
              <p className="whitespace-pre-wrap">
                {flipped ? card.back : card.front}
              </p>
              {!flipped && (
                <p className="mt-4 text-xs text-slate-400">Tap to flip</p>
              )}
            </div>
          </button>

          {flipped && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => grade("again")}
                className="rounded-lg bg-rose-100 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
              >
                Again
              </button>
              <button
                onClick={() => grade("good")}
                className="rounded-lg bg-amber-100 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300"
              >
                Good
              </button>
              <button
                onClick={() => grade("easy")}
                className="rounded-lg bg-emerald-100 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
              >
                Easy
              </button>
            </div>
          )}
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
