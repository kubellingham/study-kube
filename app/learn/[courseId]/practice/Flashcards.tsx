"use client";

// Flashcards — self-graded recall + spaced repetition (KUBE_CASUAL_AND_
// PRACTICE.md §3c). Tap to flip term↔definition, then SWIPE: right = "got
// it" (drifts far away), left = "needs work" (comes back soon). Swipe/drag
// is primary; ←/→ keys and two buttons are fallbacks. Grades drive the
// SM-2-lite schedule — no Kube override. Deck-end whispers what's due soon.
import { useEffect, useMemo, useRef, useState } from "react";
import type { Concept } from "@/lib/course/concepts";
import {
  bySpacing,
  nextCardState,
  saveCardStates,
  type CardState,
} from "@/lib/learn/practice";

const ROUND = 12;

export default function Flashcards({
  pool,
  uid,
  courseId,
  cards,
  onCards,
}: {
  pool: Concept[];
  uid: string;
  courseId: string;
  cards: Record<string, CardState>;
  onCards: (next: Record<string, CardState>) => void;
}) {
  const now = Date.now();
  const deck = useMemo(
    () => bySpacing(pool, cards, now).slice(0, ROUND),
    // rebuild only when the round is (re)started, not on every card grade
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  const [soon, setSoon] = useState<string[]>([]);
  const drag = useRef<{ x0: number; active: boolean }>({ x0: 0, active: false });
  const pending = useRef<Record<string, CardState>>({});

  const card = deck[i];
  const done = i >= deck.length;

  function grade(gotIt: boolean) {
    if (!card || leaving) return;
    setLeaving(gotIt ? "right" : "left");
    const next = nextCardState(cards[card.id], gotIt, Date.now());
    pending.current[card.id] = next;
    if (!gotIt) setSoon((s) => (s.includes(card.term) ? s : [...s, card.term]));
    setTimeout(() => {
      setLeaving(null);
      setDx(0);
      setFlipped(false);
      setI((n) => n + 1);
    }, 260);
  }

  // Persist grades when the round ends.
  useEffect(() => {
    if (done && Object.keys(pending.current).length) {
      const merged = { ...cards, ...pending.current };
      onCards(merged);
      void saveCardStates(uid, courseId, merged).catch(() => {});
      pending.current = {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Keyboard fallback.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === "ArrowRight") grade(true);
      else if (e.key === "ArrowLeft") grade(false);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, flipped, leaving, done]);

  function onDown(x: number) {
    drag.current = { x0: x, active: true };
  }
  function onMove(x: number) {
    if (!drag.current.active) return;
    setDx(x - drag.current.x0);
  }
  function onUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (dx > 90) grade(true);
    else if (dx < -90) grade(false);
    else setDx(0);
  }

  if (pool.length === 0) {
    return (
      <p className="mt-8 text-sm" style={{ color: "var(--faint)" }}>
        No concepts to flip yet — feed this course some material first.
      </p>
    );
  }

  if (done) {
    return (
      <div className="k-card k-rise mt-6 px-6 py-10 text-center">
        <div className="text-4xl" aria-hidden>✓</div>
        <h2 className="mt-3 text-2xl">Deck done.</h2>
        {soon.length > 0 ? (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Coming back soon: {soon.slice(0, 4).join(", ")}
            {soon.length > 4 ? " …" : ""}. Kube keeps them close till they stick.
          </p>
        ) : (
          <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            All marked &quot;got it&quot; — those drift far off. Lovely.
          </p>
        )}
        <button
          onClick={() => {
            setI(0);
            setSoon([]);
          }}
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Another round
        </button>
      </div>
    );
  }

  const rot = dx / 18;
  const hint = dx > 40 ? "got it" : dx < -40 ? "needs work" : null;

  return (
    <div className="mt-6 select-none">
      <div className="mb-3 flex items-center justify-between text-xs" style={{ color: "var(--faint)" }}>
        <span className="k-eyebrow">card {i + 1} / {deck.length}</span>
        <span>tap to flip · swipe to grade</span>
      </div>

      <div
        className="relative mx-auto grid min-h-[220px] max-w-md cursor-pointer place-items-center rounded-3xl border px-6 py-8 text-center"
        style={{
          background: "var(--card)",
          borderColor: hint === "got it" ? "var(--kube)" : hint === "needs work" ? "var(--amber)" : "var(--line)",
          transform: leaving
            ? `translateX(${leaving === "right" ? 500 : -500}px) rotate(${leaving === "right" ? 16 : -16}deg)`
            : `translateX(${dx}px) rotate(${rot}deg)`,
          transition: drag.current.active ? "none" : "transform 0.26s ease, border-color 0.2s",
          touchAction: "pan-y",
        }}
        onClick={() => !drag.current.active && dx === 0 && setFlipped((f) => !f)}
        onPointerDown={(e) => onDown(e.clientX)}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {hint && (
          <span
            className="k-eyebrow absolute top-3"
            style={{ color: hint === "got it" ? "var(--kube)" : "var(--amber)" }}
          >
            {hint}
          </span>
        )}
        {!flipped ? (
          <div>
            <span className="k-eyebrow">concept</span>
            <p className="mt-2 text-xl font-semibold" style={{ color: "var(--ink)" }}>{card.term}</p>
          </div>
        ) : (
          <div>
            <span className="k-eyebrow" style={{ color: "var(--kube)" }}>definition</span>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{card.definition}</p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-5 flex max-w-md gap-3">
        <button
          onClick={() => grade(false)}
          className="flex-1 rounded-2xl border py-3 text-sm font-semibold"
          style={{ borderColor: "var(--amber-line)", color: "var(--amber)" }}
        >
          ← Needs work
        </button>
        <button
          onClick={() => grade(true)}
          className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Got it →
        </button>
      </div>
    </div>
  );
}
