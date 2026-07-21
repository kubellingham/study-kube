"use client";

// Timed Sprint — speed / fluency (KUBE_CASUAL_AND_PRACTICE.md §3d). 60s
// count-UP: clear as many fast-recognition items as you can, beating your
// own record. Uses the exam bank (already snap-answerable MCQs) — NEVER
// deep/free-text under a clock. The only tracked number is personal-best
// speed, framed as automatic-recall drill, not a measure of understanding.
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExamQuestion } from "@/lib/course/types";
import { saveSprintBest } from "@/lib/learn/practice";

const SECONDS = 60;

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Shuffle a question's options while tracking where the right one lands. */
function prep(q: ExamQuestion) {
  const idx = q.options.map((_, i) => i);
  const order = shuffle(idx);
  return {
    prompt: q.prompt,
    code: q.code,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
  };
}

export default function Sprint({
  items,
  uid,
  courseId,
  best,
  onBest,
}: {
  items: ExamQuestion[];
  uid: string;
  courseId: string;
  best: number;
  onBest: (n: number) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "run" | "over">("idle");
  const [left, setLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [qi, setQi] = useState(0);
  const [flash, setFlash] = useState<null | "good" | "bad">(null);
  const [order, setOrder] = useState<ExamQuestion[]>([]);
  const endAt = useRef(0);

  const current = useMemo(() => (order[qi] ? prep(order[qi]) : null), [order, qi]);

  function begin() {
    setOrder(shuffle(items));
    setScore(0);
    setQi(0);
    setLeft(SECONDS);
    setPhase("run");
    endAt.current = Date.now() + SECONDS * 1000;
  }

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      const remain = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) {
        clearInterval(t);
        setPhase("over");
      }
    }, 200);
    return () => clearInterval(t);
  }, [phase]);

  // Record a new personal best when the run ends.
  useEffect(() => {
    if (phase === "over" && score > best) {
      onBest(score);
      void saveSprintBest(uid, courseId, score).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function answer(choice: number) {
    if (phase !== "run" || flash) return;
    const right = choice === current?.answer;
    setFlash(right ? "good" : "bad");
    if (right) setScore((s) => s + 1);
    setTimeout(() => {
      setFlash(null);
      setQi((n) => (n + 1 < order.length ? n + 1 : 0)); // loop the deck if exhausted
    }, right ? 160 : 340);
  }

  if (items.length < 3) {
    return (
      <p className="mt-8 text-sm" style={{ color: "var(--faint)" }}>
        The sprint needs a handful of quiz questions — climb or feed a bit more
        of this course first.
      </p>
    );
  }

  if (phase === "idle") {
    return (
      <div className="k-card k-rise mt-6 px-6 py-8 text-center">
        <h2 className="text-2xl">Timed Sprint</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          60 seconds, count up. How many can you snap through? It&apos;s a
          fluency drill for exam-day speed — not a test of understanding.
        </p>
        {best > 0 && (
          <p className="k-eyebrow mt-3" style={{ color: "var(--amber)" }}>
            your best · {best}
          </p>
        )}
        <button
          onClick={begin}
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Start 60s
        </button>
      </div>
    );
  }

  if (phase === "over") {
    const beat = score > best;
    return (
      <div className="k-card k-rise mt-6 px-6 py-10 text-center">
        <span className="k-eyebrow">time</span>
        <p className="mt-1 text-5xl font-semibold" style={{ color: "var(--kube)" }}>{score}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
          {beat ? "New personal best — you got faster." : `Cleared in 60s. Your best is ${Math.max(best, score)}.`}
        </p>
        <button
          onClick={begin}
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Chase it again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="k-eyebrow">cleared · {score}</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div className="h-full rounded-full" style={{ width: `${(left / SECONDS) * 100}%`, background: left <= 10 ? "var(--red)" : "var(--kube)" }} />
          </div>
          <span className="mono text-sm font-semibold" style={{ fontFamily: "var(--font-mono)", color: left <= 10 ? "var(--red)" : "var(--faint)" }}>{left}s</span>
        </div>
      </div>

      {current && (
        <div
          className="k-card px-5 py-5 transition-colors"
          style={{
            borderColor: flash === "good" ? "var(--kube)" : flash === "bad" ? "var(--red)" : "var(--line)",
            background: flash === "good" ? "var(--kube-soft)" : flash === "bad" ? "var(--red-soft)" : "var(--card)",
          }}
        >
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--ink)" }}>{current.prompt}</p>
          {current.code && <pre className="k-code mt-3">{current.code}</pre>}
          <div className="mt-4 grid gap-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                className="rounded-xl border px-4 py-2.5 text-left text-sm font-medium"
                style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
