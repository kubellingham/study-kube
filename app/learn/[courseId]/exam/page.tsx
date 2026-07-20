"use client";

// Kube assessment mode — brief §5B + §6. The ONLY place answers are scored.
// Open mode offers hints; closed mode is real exam conditions. After
// submission: the diagnosis screen — solid / shaky / gap per topic, a warm
// honest verdict read from the shape of the misses, and a targeted plan.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import { getCourseBundle, type CourseBundle } from "@/lib/course";
import type { ExamQuestion } from "@/lib/course/types";
import { saveExamAttempt } from "@/lib/learn/progress";

type Mode = "open" | "closed";
type TopicStatus = "solid" | "shaky" | "gap";

interface TopicResult {
  topicId: string;
  correct: number;
  total: number;
  status: TopicStatus;
}

function diagnose(questions: ExamQuestion[], answers: (number | null)[]): TopicResult[] {
  const byTopic = new Map<string, { correct: number; total: number }>();
  questions.forEach((q, i) => {
    const t = byTopic.get(q.topicId) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (answers[i] === q.answer) t.correct += 1;
    byTopic.set(q.topicId, t);
  });
  return [...byTopic.entries()].map(([topicId, { correct, total }]) => {
    const ratio = correct / total;
    const status: TopicStatus = ratio >= 0.8 ? "solid" : ratio >= 0.5 ? "shaky" : "gap";
    return { topicId, correct, total, status };
  });
}

function verdict(
  bundle: CourseBundle,
  results: TopicResult[],
  score: number,
  total: number
): string {
  if (score === total) {
    return "A clean sweep. Every topic held. Rest well tonight — you've earned it, and tomorrow you get to prove it.";
  }
  const weak = results.filter((r) => r.status !== "solid");
  if (weak.length === 0) {
    return "You dropped a question or two, but no topic actually wobbled — everything reads solid. A light review of what you missed below and you're done.";
  }
  const weakNames = weak.map((r) => bundle.getTopic(r.topicId)?.title ?? r.topicId);
  if (weak.length <= 2) {
    return `Here's the good news hiding in this score: your misses aren't scattered — they cluster in ${weakNames.join(" and ")}. That's a clear target, not a vague "revise everything." Close that and this score jumps.`;
  }
  return `Your misses spread across a few topics: ${weakNames.join(", ")}. That's not a disaster — it's a map. Work them in ladder order below; the earlier ones make the later ones easier.`;
}

const STATUS_META: Record<TopicStatus, { label: string; color: string; soft: string }> = {
  solid: { label: "solid", color: "var(--kube)", soft: "var(--kube-soft)" },
  shaky: { label: "shaky", color: "var(--amber)", soft: "var(--amber-soft)" },
  gap: { label: "gap", color: "var(--red)", soft: "var(--red-soft)" },
};

export default function ExamPage() {
  const params = useParams<{ courseId: string }>();
  const bundle = getCourseBundle(params.courseId);
  const { user, loading } = useUser();
  const router = useRouter();

  const [phase, setPhase] = useState<"config" | "exam" | "analysis">("config");
  const [scope, setScope] = useState<number | "all">("all");
  const [mode, setMode] = useState<Mode>("closed");
  const [scopeLabel, setScopeLabel] = useState("whole course");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [hintShown, setHintShown] = useState<Record<number, true>>({});
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const results = useMemo(
    () => (phase === "analysis" ? diagnose(questions, answers) : []),
    [phase, questions, answers]
  );

  if (!bundle) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That course isn&apos;t in Kube yet.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← your subjects
        </Link>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading…
      </div>
    );
  }

  const courseId = bundle.course.id;

  function begin(qs: ExamQuestion[], label: string, m: Mode) {
    setQuestions(qs);
    setScopeLabel(label);
    setMode(m);
    setAnswers(new Array(qs.length).fill(null));
    setQIdx(0);
    setHintShown({});
    setReviewOpen(false);
    setPhase("exam");
  }

  function submit(finalAnswers: (number | null)[]) {
    setAnswers(finalAnswers);
    setPhase("analysis");
    const res = diagnose(questions, finalAnswers);
    const score = questions.reduce(
      (n, q, i) => n + (finalAnswers[i] === q.answer ? 1 : 0),
      0
    );
    if (user) {
      saveExamAttempt(user.uid, {
        courseId,
        mode,
        scope: scopeLabel,
        score,
        total: questions.length,
        hintsUsed: Object.keys(hintShown).length,
        perTopic: Object.fromEntries(
          res.map((r) => [r.topicId, { correct: r.correct, total: r.total }])
        ),
        takenAt: Date.now(),
      }).catch(() => {
        // A failed save shouldn't interrupt the diagnosis the student needs.
      });
    }
  }

  /* ---------------- config ---------------- */
  if (phase === "config") {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="k-eyebrow">{bundle.course.code} · mock exam</span>
          <Link href={`/learn/${courseId}`} className="text-xs" style={{ color: "var(--faint)" }}>
            ← path
          </Link>
        </div>
        <h1 className="text-3xl">Sit a mock exam</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          This is the one place Kube measures. Answer everything, then get a
          diagnosis: what&apos;s solid, what&apos;s shaky, and exactly what to study next.
        </p>

        <div className="k-card mt-6 px-5 py-5">
          <span className="k-eyebrow">coverage</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...bundle.availableUnits.map((u) => ({ v: u as number | "all", label: `Unit ${u}` })), { v: "all" as const, label: "Whole course" }].map(
              ({ v, label }) => (
                <button
                  key={label}
                  onClick={() => setScope(v)}
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  style={
                    scope === v
                      ? { background: "var(--kube)", borderColor: "var(--kube)", color: "white" }
                      : { borderColor: "var(--line)", color: "var(--ink-soft)" }
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          <span className="k-eyebrow mt-6 block">conditions</span>
          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => setMode("closed")}
              className="rounded-2xl border px-4 py-3 text-left"
              style={
                mode === "closed"
                  ? { borderColor: "var(--kube)", background: "var(--kube-soft)" }
                  : { borderColor: "var(--line)" }
              }
            >
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Closed book
              </span>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                No hints. Real exam conditions — the honest measure.
              </p>
            </button>
            <button
              onClick={() => setMode("open")}
              className="rounded-2xl border px-4 py-3 text-left"
              style={
                mode === "open"
                  ? { borderColor: "var(--kube)", background: "var(--kube-soft)" }
                  : { borderColor: "var(--line)" }
              }
            >
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Open book
              </span>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                A hint on tap for each question — a nudge toward the idea, never the answer.
              </p>
            </button>
          </div>

          <button
            onClick={() => {
              const qs = bundle.questionsForUnit(scope);
              begin(qs, scope === "all" ? "whole course" : `unit-${scope}`, mode);
            }}
            className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white"
            style={{ background: "var(--kube)" }}
          >
            Start · {bundle.questionsForUnit(scope).length} questions
          </button>
        </div>
      </main>
    );
  }

  /* ---------------- exam ---------------- */
  if (phase === "exam") {
    const q = questions[qIdx];
    const chosen = answers[qIdx];
    const answeredCount = answers.filter((a) => a !== null).length;
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="k-eyebrow">
            {mode} book · {qIdx + 1} / {questions.length}
          </span>
          <Link href={`/learn/${courseId}`} className="text-xs" style={{ color: "var(--faint)" }}>
            abandon
          </Link>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
          <div
            className="k-bar h-full rounded-full"
            style={{ width: `${(answeredCount / questions.length) * 100}%`, background: "var(--kube)" }}
          />
        </div>

        <div className="k-card k-rise mt-6 px-6 py-6" key={qIdx}>
          <h2 className="text-xl leading-snug">{q.prompt}</h2>
          {q.code && <pre className="k-code mt-4">{q.code}</pre>}
          <div className="mt-5 flex flex-col gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = [...answers];
                  next[qIdx] = i;
                  setAnswers(next);
                }}
                className="rounded-2xl border px-4 py-3 text-left text-sm font-medium"
                style={
                  chosen === i
                    ? { borderColor: "var(--kube)", background: "var(--kube-soft)", color: "var(--ink)" }
                    : { borderColor: "var(--line)", color: "var(--ink)" }
                }
              >
                {opt}
              </button>
            ))}
          </div>

          {mode === "open" && (
            <div className="mt-4">
              {hintShown[qIdx] ? (
                <p
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "var(--amber-soft)", color: "var(--amber)" }}
                >
                  {q.hint}
                </p>
              ) : (
                <button
                  onClick={() => setHintShown({ ...hintShown, [qIdx]: true })}
                  className="text-sm font-semibold"
                  style={{ color: "var(--amber)" }}
                >
                  Give me a hint
                </button>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {qIdx > 0 && (
              <button
                onClick={() => setQIdx(qIdx - 1)}
                className="rounded-2xl border px-5 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              >
                Back
              </button>
            )}
            {qIdx + 1 < questions.length ? (
              <button
                onClick={() => setQIdx(qIdx + 1)}
                disabled={chosen === null}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--kube)" }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => submit(answers)}
                disabled={answeredCount < questions.length}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--amber)" }}
              >
                Submit &amp; diagnose
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- analysis (§6 — the highest-value screen) ---------------- */
  const score = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const weak = results.filter((r) => r.status !== "solid");
  const solid = results.filter((r) => r.status === "solid");
  const missed = questions
    .map((q, i) => ({ q, chosen: answers[i] }))
    .filter(({ q, chosen }) => chosen !== q.answer);
  const hintsUsed = Object.keys(hintShown).length;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow">diagnosis · {scopeLabel}</span>
        <Link href={`/learn/${courseId}`} className="text-xs" style={{ color: "var(--faint)" }}>
          ← path
        </Link>
      </div>

      <div className="k-card k-rise px-6 py-6 text-center">
        <span className="k-eyebrow">{mode} book</span>
        <div className="mt-2 text-5xl k-display" style={{ color: "var(--ink)" }}>
          {score}
          <span className="text-2xl" style={{ color: "var(--faint)" }}>
            {" "}/ {questions.length}
          </span>
        </div>
        {mode === "open" && (
          <p className="mt-1 text-xs" style={{ color: "var(--faint)" }}>
            {hintsUsed} hint{hintsUsed === 1 ? "" : "s"} used
          </p>
        )}
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {verdict(bundle, results, score, questions.length)}
        </p>
      </div>

      <h2 className="mt-8 text-xl">Topic by topic</h2>
      <div className="mt-3 flex flex-col gap-3">
        {results.map((r) => {
          const meta = STATUS_META[r.status];
          const topic = bundle.getTopic(r.topicId);
          return (
            <div key={r.topicId} className="k-card px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {topic?.title}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: meta.soft, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div
                  className="k-bar h-full rounded-full"
                  style={{ width: `${(r.correct / r.total) * 100}%`, background: meta.color }}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
                {r.correct}/{r.total} · {topic?.whyItMatters}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-xl">Your plan for tonight</h2>
      {weak.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Nothing to patch. Skim the missed questions below if any, then stop
          studying — sleep is the best revision you have left.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Revisit only these {weak.length} topic{weak.length === 1 ? "" : "s"} — and leave the{" "}
            {solid.length} solid one{solid.length === 1 ? "" : "s"} alone, they&apos;re banked. A
            focused hour, not a panicked all-nighter.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {weak.map((r) => (
              <Link
                key={r.topicId}
                href={`/learn/${courseId}/lesson/${r.topicId}`}
                className="k-card flex items-center justify-between px-5 py-3 text-sm font-semibold"
                style={{ color: "var(--kube)" }}
              >
                <span>Revise: {bundle.getTopic(r.topicId)?.title}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
            <button
              onClick={() => {
                const qs = bundle.questionsForTopics(weak.map((r) => r.topicId));
                begin(qs, "retest of weak topics", "closed");
              }}
              className="mt-2 rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ background: "var(--amber)" }}
            >
              Re-test just these, closed book
            </button>
          </div>
        </>
      )}

      {missed.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setReviewOpen(!reviewOpen)}
            className="text-sm font-semibold"
            style={{ color: "var(--kube)" }}
          >
            {reviewOpen ? "Hide" : "Review"} the {missed.length} question
            {missed.length === 1 ? "" : "s"} you missed {reviewOpen ? "▴" : "▾"}
          </button>
          {reviewOpen && (
            <div className="mt-3 flex flex-col gap-3">
              {missed.map(({ q, chosen }) => (
                <div key={q.id} className="k-card px-5 py-4">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {q.prompt}
                  </p>
                  {q.code && <pre className="k-code mt-2">{q.code}</pre>}
                  <p className="mt-2 text-xs" style={{ color: "var(--red)" }}>
                    You chose: {chosen !== null ? q.options[chosen] : "—"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--kube)" }}>
                    Answer: {q.options[q.answer]}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
