"use client";

// Matching — recognition / discrimination (KUBE_CASUAL_AND_PRACTICE.md §3b).
// Left = concepts, right = short tells. Tap one on each side: a correct pair
// snaps and clears (warm win), a wrong pair soft-shakes and stays (gentle,
// no grading). The board holds ~5 pairs drawn from a larger deck of
// confusables; a cleared slot refills from the deck (fade-in) so it feels
// endless, then drains to empty at the end. NO score, NO mismatch count —
// the shake is the only feedback.
import { useMemo, useRef, useState } from "react";
import type { Concept } from "@/lib/course/concepts";
import { confusableClusters } from "@/lib/course/concepts";

const BOARD = 5;
const DECK = 14;

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Build a deck biased toward confusable clusters (sections with siblings),
 *  so telling-apart stays the challenge as pairs refresh. */
function buildDeck(pool: Concept[]): Concept[] {
  const clusters = confusableClusters(pool)
    .filter((c) => c.length >= 2)
    .sort((a, b) => b.length - a.length);
  const picked: Concept[] = [];
  for (const cluster of clusters) {
    for (const c of shuffle(cluster)) {
      if (picked.length >= DECK) break;
      picked.push(c);
    }
    if (picked.length >= DECK) break;
  }
  // Top up from anywhere if clusters were thin.
  if (picked.length < DECK) {
    const have = new Set(picked.map((c) => c.id));
    for (const c of shuffle(pool)) {
      if (picked.length >= DECK) break;
      if (!have.has(c.id)) picked.push(c);
    }
  }
  return shuffle(picked);
}

export default function Matching({ pool }: { pool: Concept[] }) {
  const initialDeck = useMemo(() => buildDeck(pool), [pool]);
  const byId = useMemo(() => new Map(pool.map((c) => [c.id, c])), [pool]);

  const deckRef = useRef<Concept[]>([]);
  const [leftCol, setLeftCol] = useState<string[]>([]);
  const [rightCol, setRightCol] = useState<string[]>([]);
  const [entering, setEntering] = useState<Set<string>>(new Set());
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [snap, setSnap] = useState<string | null>(null);
  const [shake, setShake] = useState<{ l: string; r: string } | null>(null);
  const [cleared, setCleared] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const busy = useRef(false);

  function start() {
    const deck = initialDeck.slice();
    const first = deck.splice(0, Math.min(BOARD, deck.length));
    deckRef.current = deck;
    setLeftCol(shuffle(first.map((c) => c.id)));
    setRightCol(shuffle(first.map((c) => c.id)));
    setEntering(new Set());
    setCleared(0);
    setStarted(true);
    setDone(false);
  }

  function clearAndRefill(id: string) {
    setSnap(id);
    setTimeout(() => {
      const next = deckRef.current.shift();
      setLeftCol((col) => {
        const without = col.filter((x) => x !== id);
        if (next) without.splice(Math.floor(Math.random() * (without.length + 1)), 0, next.id);
        return without;
      });
      setRightCol((col) => {
        const without = col.filter((x) => x !== id);
        if (next) without.splice(Math.floor(Math.random() * (without.length + 1)), 0, next.id);
        return without;
      });
      setSnap(null);
      setCleared((n) => n + 1);
      if (next) {
        setEntering((e) => new Set(e).add(next.id));
        setTimeout(() => setEntering((e) => {
          const n = new Set(e);
          n.delete(next.id);
          return n;
        }), 500);
      } else {
        // Deck drained — when the board empties, the round is done.
        setLeftCol((col) => {
          if (col.length === 0) setDone(true);
          return col;
        });
      }
      busy.current = false;
    }, 340);
  }

  function evaluate(l: string, r: string) {
    if (l === r) {
      busy.current = true;
      setSelL(null);
      setSelR(null);
      clearAndRefill(l);
    } else {
      setShake({ l, r });
      setTimeout(() => {
        setShake(null);
        setSelL(null);
        setSelR(null);
        busy.current = false;
      }, 460);
      busy.current = true;
    }
  }

  function tapLeft(id: string) {
    if (busy.current || snap === id) return;
    if (selR) evaluate(id, selR);
    else setSelL((cur) => (cur === id ? null : id));
  }
  function tapRight(id: string) {
    if (busy.current || snap === id) return;
    if (selL) evaluate(selL, id);
    else setSelR((cur) => (cur === id ? null : id));
  }

  if (pool.length < 4) {
    return (
      <p className="mt-8 text-sm" style={{ color: "var(--faint)" }}>
        Add a little more material to this course first — matching needs a few
        concepts to tell apart.
      </p>
    );
  }

  if (!started) {
    return (
      <div className="k-card k-rise mt-6 px-6 py-8 text-center">
        <h2 className="text-2xl">Matching</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Pair each concept with its tell. Right ones snap away; a wrong pair
          just gives a nudge. No score — pure warm-up.
        </p>
        <button
          onClick={start}
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Start matching
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="k-card k-rise mt-6 px-6 py-10 text-center">
        <div className="text-4xl" aria-hidden>✧</div>
        <h2 className="mt-3 text-2xl">Board cleared.</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
          Nicely told apart. Come back whenever you want another shuffle.
        </p>
        <button
          onClick={start}
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Go again
        </button>
      </div>
    );
  }

  const totalPips = Math.min(DECK, initialDeck.length);

  return (
    <div className="mt-6">
      {/* Non-numeric progress: pips fill as pairs clear (progress, not score) */}
      <div className="mb-4 flex flex-wrap gap-1.5" aria-hidden>
        {Array.from({ length: totalPips }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-4 rounded-full transition-colors"
            style={{ background: i < cleared ? "var(--kube)" : "var(--line)" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {leftCol.map((id) => {
            const c = byId.get(id);
            if (!c) return null;
            const sel = selL === id;
            const isShake = shake?.l === id;
            const isSnap = snap === id;
            return (
              <button
                key={id}
                onClick={() => tapLeft(id)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all ${isShake ? "k-shake" : ""} ${entering.has(id) ? "k-rise" : ""}`}
                style={{
                  background: sel ? "var(--kube-soft)" : "var(--card)",
                  borderColor: isShake ? "var(--red)" : sel ? "var(--kube)" : "var(--line)",
                  color: isShake ? "var(--red)" : "var(--ink)",
                  opacity: isSnap ? 0 : 1,
                  transform: isSnap ? "scale(0.9)" : "none",
                }}
              >
                {c.term}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {rightCol.map((id) => {
            const c = byId.get(id);
            if (!c) return null;
            const sel = selR === id;
            const isShake = shake?.r === id;
            const isSnap = snap === id;
            return (
              <button
                key={id}
                onClick={() => tapRight(id)}
                className={`rounded-2xl border px-3 py-3 text-left text-[13px] leading-snug transition-all ${isShake ? "k-shake" : ""} ${entering.has(id) ? "k-rise" : ""}`}
                style={{
                  background: sel ? "var(--kube-soft)" : "var(--card)",
                  borderColor: isShake ? "var(--red)" : sel ? "var(--kube)" : "var(--line)",
                  color: isShake ? "var(--red)" : "var(--ink-soft)",
                  opacity: isSnap ? 0 : 1,
                  transform: isSnap ? "scale(0.9)" : "none",
                }}
              >
                {c.tell}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
