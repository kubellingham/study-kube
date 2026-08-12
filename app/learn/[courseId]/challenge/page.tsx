"use client";

// Test out of the chain. A locked unit can be opened early by PASSING a
// challenge exam drawn from the units before it — closed book, no hints. Pass
// and the unit opens; miss and Kube says exactly which earlier ideas let you
// down. Deliberately separate from `completed`: you proved you know the run-up,
// you didn't climb it.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import { useCramLocked, CramLocked } from "@/app/learn/components/PlanGate";
import { RichInline } from "@/app/learn/components/Rich";
import type { ExamQuestion } from "@/lib/course/types";
import { shuffledOptions } from "@/lib/course/lessons";
import {
  saveExamAttempt,
  unlockUnitByChallenge,
  CHALLENGE_PASS_PCT,
} from "@/lib/learn/progress";

/** Enough to be a real gate, short enough to sit in one go. */
const CHALLENGE_CAP = 12;
/** Below this there isn't enough prior material to test fairly. */
const MIN_QUESTIONS = 5;

function shuffleArr<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Spread the draw across topics so the challenge covers the run-up, rather
 *  than hammering whichever topic happens to have the most questions. */
function sampleSpread(qs: ExamQuestion[], cap: number): ExamQuestion[] {
  if (qs.length <= cap) return shuffleArr(qs);
  const byTopic = new Map<string, ExamQuestion[]>();
  for (const q of qs)
    (byTopic.get(q.topicId) ?? byTopic.set(q.topicId, []).get(q.topicId)!).push(q);
  const pools = [...byTopic.values()].map(shuffleArr);
  const out: ExamQuestion[] = [];
  let i = 0;
  while (out.length < cap && pools.some((p) => p.length)) {
    const q = pools[i % pools.length].pop();
    if (q) out.push(q);
    i++;
  }
  return shuffleArr(out);
}

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
          Loading…
        </div>
      }
    >
      <ChallengeInner />
    </Suspense>
  );
}

function ChallengeInner() {
  const params = useParams<{ courseId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { user, status, bundle, reload } = useCourse(params.courseId);
  const cramLocked = useCramLocked();

  const unit = Number(search.get("unit") || 0);
  const [phase, setPhase] = useState<"intro" | "exam" | "result">("intro");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [passed, setPassed] = useState(false);

  // Every exam-bank question from the units BEFORE this one — the run-up.
  const pool = useMemo(
    () => (bundle ? bundle.examBank.filter((q) => q.unit < unit && q.options?.length >= 2) : []),
    [bundle, unit]
  );

  const priorUnits = useMemo(() => {
    if (!bundle) return [] as number[];
    return [...new Set(bundle.course.sections.map((s) => s.unit))]
      .filter((u) => u < unit)
      .sort((a, b) => a - b);
  }, [bundle, unit]);

  useEffect(() => {
    if (!Number.isFinite(unit) || unit <= 1) router.replace(`/learn/${params.courseId}`);
  }, [unit, params.courseId, router]);

  if (status === "loading" || !bundle) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading…
      </div>
    );
  }
  if (cramLocked) return <CramLocked feature="The challenge" />;

  const section = bundle.course.sections.find((s) => s.unit === unit);
  const passMark = Math.ceil((CHALLENGE_PASS_PCT / 100) * questions.length);

  function begin() {
    const qs = sampleSpread(pool, CHALLENGE_CAP).map((q) => {
      const s = shuffledOptions(q);
      return { ...q, options: s.options, answer: s.answer };
    });
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setQIdx(0);
    setPhase("exam");
  }

  async function submit(finalAnswers: (number | null)[]) {
    const score = questions.reduce((n, q, i) => n + (finalAnswers[i] === q.answer ? 1 : 0), 0);
    const pct = questions.length ? (score / questions.length) * 100 : 0;
    const ok = pct >= CHALLENGE_PASS_PCT;
    setPassed(ok);
    setPhase("result");
    if (!user) return;
    setSaving(true);
    try {
      const perTopic: Record<string, { correct: number; total: number }> = {};
      questions.forEach((q, i) => {
        const t = (perTopic[q.topicId] ??= { correct: 0, total: 0 });
        t.total += 1;
        if (finalAnswers[i] === q.answer) t.correct += 1;
      });
      await saveExamAttempt(user.uid, {
        courseId: params.courseId,
        mode: "closed",
        scope: `challenge to open Unit ${unit}`,
        score,
        total: questions.length,
        hintsUsed: 0,
        perTopic,
        takenAt: Date.now(),
      });
      if (ok) {
        await unlockUnitByChallenge(user.uid, params.courseId, unit);
        reload();
      }
    } catch {
      // Scoring already shown; a failed write shouldn't blank the result.
    } finally {
      setSaving(false);
    }
  }

  const back = (
    <Link
      href={`/learn/${params.courseId}`}
      className="text-xs font-semibold"
      style={{ color: "var(--faint)" }}
    >
      ← back to your path
    </Link>
  );

  /* ---------------------------- intro ---------------------------- */
  if (phase === "intro") {
    const enough = pool.length >= MIN_QUESTIONS;
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="k-eyebrow" style={{ color: "var(--amber)" }}>skip the wait</span>
          {back}
        </div>
        <h1 className="text-3xl">Test out of the run-up.</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {section ? `Unit ${unit} — ${section.title}` : `Unit ${unit}`} is locked because the
          units before it aren&apos;t finished. If you already know that material, prove it here and
          it opens right now.
        </p>

        {enough ? (
          <>
            <div className="k-card mt-6 px-6 py-5">
              <span className="k-eyebrow" style={{ color: "var(--kube)" }}>the deal</span>
              <ul className="mt-3 space-y-2.5">
                {[
                  `Questions drawn from ${priorUnits.length > 1 ? `Units ${priorUnits[0]}–${priorUnits[priorUnits.length - 1]}` : `Unit ${priorUnits[0] ?? 1}`} — the ideas Unit ${unit} builds on.`,
                  `${Math.min(CHALLENGE_CAP, pool.length)} questions, closed book. No hints — that's the point.`,
                  `Score ${CHALLENGE_PASS_PCT}% or better and Unit ${unit} unlocks.`,
                  "Miss it and nothing is lost — Kube shows you which ideas to shore up, and you can try again.",
                ].map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    <span aria-hidden style={{ color: "var(--kube-line)" }}>●</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
              Passing opens the unit — it doesn&apos;t tick off the earlier circles. They stay
              there for whenever you want them.
            </p>
            <button
              type="button"
              onClick={begin}
              className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{ background: "var(--amber)", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}
            >
              Start the challenge
            </button>
          </>
        ) : (
          <div className="k-card mt-6 px-6 py-5">
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              There isn&apos;t enough earlier material to test you on yet — a fair challenge needs
              at least {MIN_QUESTIONS} questions from the units before this one. Add more material
              to those units, or just climb the path.
            </p>
            <Link
              href={`/learn/${params.courseId}`}
              className="mt-4 inline-block text-sm font-semibold"
              style={{ color: "var(--kube)" }}
            >
              ← back to your path
            </Link>
          </div>
        )}
      </main>
    );
  }

  /* ---------------------------- exam ---------------------------- */
  if (phase === "exam") {
    const q = questions[qIdx];
    const chosen = answers[qIdx];
    const answeredCount = answers.filter((a) => a !== null).length;
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="k-eyebrow" style={{ color: "var(--amber)" }}>
            challenge · unit {unit}
          </span>
          <span className="text-xs" style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}>
            {qIdx + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${((qIdx + 1) / questions.length) * 100}%`, background: "var(--amber)" }}
          />
        </div>

        <div className="k-card mt-6 px-6 py-6">
          <p className="text-lg leading-snug"><RichInline text={q.prompt} /></p>
          {q.code && <pre className="k-code mt-4">{q.code}</pre>}
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const on = chosen === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const next = [...answers];
                    next[qIdx] = i;
                    setAnswers(next);
                  }}
                  className="rounded-2xl border px-4 py-3 text-left text-sm"
                  style={{
                    borderColor: on ? "var(--kube)" : "var(--line)",
                    background: on ? "var(--kube-soft)" : "var(--card)",
                    color: "var(--ink)",
                  }}
                >
                  <RichInline text={opt} />
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            {qIdx > 0 && (
              <button
                type="button"
                onClick={() => setQIdx(qIdx - 1)}
                className="rounded-2xl border px-5 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              >
                Back
              </button>
            )}
            {qIdx + 1 < questions.length ? (
              <button
                type="button"
                onClick={() => setQIdx(qIdx + 1)}
                disabled={chosen === null}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--kube)" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit(answers)}
                disabled={answeredCount < questions.length}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--amber)" }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------- result ---------------------------- */
  const score = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const missedByTopic = new Map<string, number>();
  questions.forEach((q, i) => {
    if (answers[i] !== q.answer)
      missedByTopic.set(q.topicId, (missedByTopic.get(q.topicId) ?? 0) + 1);
  });
  const weakTitles = [...missedByTopic.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => bundle.getTopic(id)?.title)
    .filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow" style={{ color: passed ? "var(--kube)" : "var(--amber)" }}>
          {passed ? "unlocked" : "not this time"}
        </span>
        {back}
      </div>

      <h1 className="text-3xl">
        {passed ? `Unit ${unit} is open.` : "Close — but not yet."}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        You scored <b>{score}/{questions.length}</b> ({pct}%). Pass mark is {CHALLENGE_PASS_PCT}%
        {questions.length ? ` — ${passMark} of ${questions.length}` : ""}.
      </p>

      {passed ? (
        <>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            You clearly know the run-up, so there&apos;s no sense making you climb it again. Unit{" "}
            {unit} is unlocked and waiting. The earlier circles stay on your path — untouched, for
            whenever you want them.
          </p>
          <Link
            href={`/learn/${params.courseId}`}
            className="mt-6 inline-block w-full rounded-2xl py-3.5 text-center text-sm font-semibold text-white"
            style={{ background: "var(--kube)", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}
          >
            {saving ? "Saving…" : `Go to Unit ${unit}`}
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {weakTitles.length
              ? `Your misses weren't scattered — they clustered in ${weakTitles.join(", ")}. That's a short list, not a whole revision. Shore those up and come straight back.`
              : "A few slipped through. Take another run at it whenever you're ready."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPhase("intro")}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{ background: "var(--amber)", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}
            >
              Try the challenge again
            </button>
            <Link
              href={`/learn/${params.courseId}`}
              className="w-full rounded-2xl border py-3.5 text-center text-sm font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
            >
              Climb the path instead
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
