"use client";

// Definitions drill — recall (KUBE_CASUAL_AND_PRACTICE.md §3a). Three levels
// the USER picks: Easy (fill a couple of blanks), Normal (more blanked), Hard
// ("What is X?" from scratch). Kube SUGGESTS a level change on streaks but
// never forces it. Every answer is judged by MEANING (a real model call),
// teaching on the miss: "almost" shows Kube's wording then two corrections to
// choose between; "wrong" states the idea plainly.
import { useMemo, useState } from "react";
import type { Concept } from "@/lib/course/concepts";
import { keyWords } from "@/lib/course/concepts";
import { authedFetch } from "@/lib/authed-fetch";

type Level = "easy" | "normal" | "hard";
const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: "easy", label: "Easy", blurb: "fill a couple of blanks" },
  { id: "normal", label: "Normal", blurb: "more blanked out" },
  { id: "hard", label: "Hard", blurb: "from scratch" },
];

interface Verdict {
  verdict: "right" | "almost" | "wrong";
  better: string;
  corrections?: string[];
  note?: string;
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Tokenize a definition, marking which tokens are blanked for this level. */
function buildTemplate(def: string, level: Level) {
  if (level === "hard") return { tokens: [] as { text: string; blank: number }[], count: 0 };
  const keys = keyWords(def);
  const nBlanks = level === "easy" ? Math.min(2, keys.length) : Math.min(5, Math.ceil(keys.length * 0.5));
  const toBlank = new Set(keys.slice(0, nBlanks).map((w) => w.toLowerCase()));
  const used = new Set<string>();
  let bi = 0;
  const tokens = def.split(/(\s+)/).map((tok) => {
    const core = tok.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    if (core && toBlank.has(core) && !used.has(core)) {
      used.add(core);
      return { text: tok, blank: bi++ };
    }
    return { text: tok, blank: -1 };
  });
  return { tokens, count: bi };
}

export default function Definitions({ pool }: { pool: Concept[] }) {
  const deck = useMemo(() => shuffle(pool), [pool]);
  const [level, setLevel] = useState<Level>("easy");
  const [i, setI] = useState(0);
  const [fills, setFills] = useState<Record<number, string>>({});
  const [hard, setHard] = useState("");
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [pickedCorr, setPickedCorr] = useState<number | null>(null);
  const [streakRight, setStreakRight] = useState(0);
  const [streakMiss, setStreakMiss] = useState(0);
  const [suggest, setSuggest] = useState<null | "up" | "down">(null);

  const concept = deck[i % Math.max(1, deck.length)];
  const template = useMemo(
    () => (concept ? buildTemplate(concept.definition, level) : { tokens: [], count: 0 }),
    [concept, level]
  );

  function reset() {
    setFills({});
    setHard("");
    setVerdict(null);
    setPickedCorr(null);
  }

  async function submit() {
    if (busy || !concept) return;
    const answer =
      level === "hard"
        ? hard.trim()
        : template.tokens
            .map((t) => (t.blank >= 0 ? ` ${(fills[t.blank] ?? "").trim() || "___"} ` : t.text))
            .join("");
    if ((level === "hard" ? hard.trim() : Object.values(fills).some((v) => v.trim())) === false && !answer.trim()) return;
    setBusy(true);
    try {
      const res = await authedFetch("/api/learn/define-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: concept.term, definition: concept.definition, level, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kube couldn't check that.");
      setVerdict(data as Verdict);
      // Streaks → Kube suggests (never forces) a level change.
      if (data.verdict === "right") {
        const s = streakRight + 1;
        setStreakRight(s);
        setStreakMiss(0);
        if (s >= 3 && level !== "hard") setSuggest("up");
      } else {
        const m = streakMiss + 1;
        setStreakMiss(m);
        setStreakRight(0);
        if (m >= 2 && level !== "easy") setSuggest("down");
      }
    } catch (err) {
      setVerdict({
        verdict: "wrong",
        better: err instanceof Error ? err.message : "Kube couldn't check that just now.",
      });
    } finally {
      setBusy(false);
    }
  }

  function nextConcept() {
    reset();
    setI((n) => n + 1);
  }

  function changeLevel(l: Level) {
    setLevel(l);
    setSuggest(null);
    reset();
  }

  if (pool.length === 0) {
    return (
      <p className="mt-8 text-sm" style={{ color: "var(--faint)" }}>
        Nothing to define yet — feed this course some material first.
      </p>
    );
  }

  return (
    <div className="mt-6">
      {/* Level picker — the user always chooses. */}
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => changeLevel(l.id)}
            className="flex-1 rounded-xl border px-2 py-2 text-center"
            style={{
              borderColor: level === l.id ? "var(--kube)" : "var(--line)",
              background: level === l.id ? "var(--kube-soft)" : "var(--card)",
            }}
          >
            <span className="block text-sm font-semibold" style={{ color: level === l.id ? "var(--kube)" : "var(--ink)" }}>{l.label}</span>
            <span className="block text-[10px]" style={{ color: "var(--faint)" }}>{l.blurb}</span>
          </button>
        ))}
      </div>

      {/* Kube's gentle suggestion — one tap to take it, one to dismiss. */}
      {suggest && !verdict && (
        <div className="k-rise mt-3 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5" style={{ background: "var(--amber-soft)" }}>
          <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
            {suggest === "up" ? "You're flying — try Normal?" : "No shame — a gentler level? It's how it sticks."}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => changeLevel(suggest === "up" ? (level === "easy" ? "normal" : "hard") : (level === "hard" ? "normal" : "easy"))}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
              style={{ background: "var(--kube)" }}
            >
              {suggest === "up" ? "Bump up" : "Ease off"}
            </button>
            <button onClick={() => setSuggest(null)} className="text-xs" style={{ color: "var(--faint)" }}>stay</button>
          </div>
        </div>
      )}

      <div className="k-card mt-4 px-5 py-5">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>define</span>
        <h2 className="mt-1 text-xl">{concept.term}</h2>

        {!verdict ? (
          <>
            {level === "hard" ? (
              <textarea
                value={hard}
                onChange={(e) => setHard(e.target.value)}
                placeholder={`In your own words — what is ${concept.term}?`}
                rows={4}
                className="mt-4 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
              />
            ) : (
              <p className="mt-4 text-sm leading-loose" style={{ color: "var(--ink-soft)" }}>
                {template.tokens.map((t, k) =>
                  t.blank >= 0 ? (
                    <input
                      key={k}
                      value={fills[t.blank] ?? ""}
                      onChange={(e) => setFills((f) => ({ ...f, [t.blank]: e.target.value }))}
                      className="mx-1 inline-block w-24 rounded-md border-b-2 bg-transparent px-1 py-0.5 text-center text-sm outline-none"
                      style={{ borderColor: "var(--kube-line)", color: "var(--kube)" }}
                      aria-label={`blank ${t.blank + 1}`}
                    />
                  ) : (
                    <span key={k}>{t.text}</span>
                  )
                )}
              </p>
            )}
            <button
              onClick={submit}
              disabled={busy}
              className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--kube)" }}
            >
              {busy ? "Kube's reading it…" : "Check"}
            </button>
          </>
        ) : (
          <div className="k-rise mt-4">
            {verdict.verdict === "right" ? (
              <div className="rounded-xl px-4 py-3" style={{ background: "var(--kube-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--kube)" }}>Right — in your own words counts.</p>
                {verdict.note && <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{verdict.note}</p>}
              </div>
            ) : verdict.verdict === "almost" ? (
              <div>
                <p className="k-eyebrow" style={{ color: "var(--amber)" }}>almost there</p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  Closer wording: <span style={{ color: "var(--ink)" }}>{verdict.better}</span>
                </p>
                {verdict.corrections && (
                  <>
                    <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>Which fixes yours best?</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {verdict.corrections.map((corr, ci) => {
                        const picked = pickedCorr === ci;
                        // The clearly-better correction is index 0 from the judge.
                        const isBest = ci === 0;
                        return (
                          <button
                            key={ci}
                            onClick={() => setPickedCorr(ci)}
                            className="rounded-xl border px-4 py-2.5 text-left text-sm transition-colors"
                            style={{
                              borderColor: picked ? (isBest ? "var(--kube)" : "var(--amber)") : "var(--line)",
                              background: picked ? (isBest ? "var(--kube-soft)" : "var(--amber-soft)") : "var(--card)",
                              color: "var(--ink)",
                            }}
                          >
                            {corr}
                            {picked && (
                              <span className="mt-1 block text-xs" style={{ color: isBest ? "var(--kube)" : "var(--amber)" }}>
                                {isBest ? "— yes, that's the one." : "— close, but the other is sharper."}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl px-4 py-3" style={{ background: "var(--red-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--red)" }}>Not quite — here&apos;s the idea:</p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{verdict.better}</p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {verdict.verdict !== "right" && (
                <button
                  onClick={reset}
                  className="flex-1 rounded-2xl border py-3 text-sm font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
                >
                  Try again
                </button>
              )}
              <button
                onClick={nextConcept}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white"
                style={{ background: "var(--kube)" }}
              >
                Next concept
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
