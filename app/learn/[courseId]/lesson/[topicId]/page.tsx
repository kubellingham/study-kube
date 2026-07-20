"use client";

// The Kube lesson player — brief §5A. Wrong tap = shake + red + reset, no
// judgment, no score. Right tap = warm specific praise, then advance.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import { getCourseBundle } from "@/lib/course";
import type { CheckStep, TeachStep } from "@/lib/course/types";
import { loadProgress, markTopicComplete } from "@/lib/learn/progress";
import Rich from "@/app/learn/components/Rich";

function DrawnCheck() {
  return (
    <svg width="72" height="72" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="17" fill="var(--kube-soft)" stroke="var(--kube-line)" />
      <path
        className="k-check-path"
        d="M10 18.5l5.5 5.5L26 12.5"
        stroke="var(--kube)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TeachCard({ step, onNext }: { step: TeachStep; onNext: () => void }) {
  return (
    <div className="k-card k-rise px-6 py-6">
      {step.title && <h2 className="mb-3 text-xl">{step.title}</h2>}
      <Rich body={step.body} />
      {step.code && <pre className="k-code mt-4">{step.code}</pre>}
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white"
        style={{ background: "var(--kube)" }}
      >
        Got it — keep going
      </button>
    </div>
  );
}

function CheckCard({ step, onPass }: { step: CheckStep; onPass: () => void }) {
  const [shaking, setShaking] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function tap(i: number) {
    if (passed || shaking !== null) return;
    if (i === step.answer) {
      setPassed(true);
      return;
    }
    // Wrong: shake + red, then reset. Nothing is recorded. Same calm response
    // however many times — Kube is teaching here, not testing.
    setShaking(i);
    timer.current = setTimeout(() => setShaking(null), 500);
  }

  return (
    <div className="k-card k-rise px-6 py-6">
      <span className="k-eyebrow">check yourself</span>
      <h2 className="mt-2 text-xl leading-snug">{step.prompt}</h2>
      {step.code && <pre className="k-code mt-4">{step.code}</pre>}
      <div className="mt-5 flex flex-col gap-3">
        {step.options.map((opt, i) => {
          const isShaking = shaking === i;
          const isRight = passed && i === step.answer;
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={passed}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${isShaking ? "k-shake" : ""}`}
              style={{
                background: isRight
                  ? "var(--kube-soft)"
                  : isShaking
                    ? "var(--red-soft)"
                    : "var(--card)",
                borderColor: isRight
                  ? "var(--kube)"
                  : isShaking
                    ? "var(--red)"
                    : "var(--line)",
                color: isShaking ? "var(--red)" : "var(--ink)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {passed && (
        <div className="k-rise mt-5 rounded-2xl px-4 py-4" style={{ background: "var(--kube-soft)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--kube)" }}>
            {step.praise}
          </p>
          <button
            onClick={onPass}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-white"
            style={{ background: "var(--kube)" }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ courseId: string; topicId: string }>();
  const bundle = getCourseBundle(params.courseId);
  const topic = bundle?.getTopic(params.topicId);
  const { user, loading } = useUser();
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<"loading" | "review" | "lesson" | "done">("loading");
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user && bundle && topic) {
      loadProgress(user.uid, bundle.course.id).then((p) => {
        const done = !!p.completed[topic.id];
        setAlreadyDone(done);
        setPhase(done ? "review" : "lesson");
      });
    }
  }, [user, loading, router, bundle, topic]);

  if (!bundle || !topic) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That topic isn&apos;t on the ladder.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← back to Kube
        </Link>
      </main>
    );
  }

  if (loading || !user || phase === "loading") {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading…
      </div>
    );
  }

  const courseId = bundle.course.id;
  const section = bundle.sectionOfTopic(topic.id);
  const pos = bundle.topicPosition(topic.id);
  const next = bundle.ladder[pos + 1];
  const steps = topic.steps;
  const firstCheckIdx = steps.findIndex((s) => s.kind === "check");

  async function finish() {
    setPhase("done");
    if (user && !alreadyDone) {
      try {
        await markTopicComplete(user.uid, courseId, topic!.id);
      } catch {
        // Progress write failing shouldn't block the learner mid-celebration.
      }
    }
  }

  const header = (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <span className="k-eyebrow">
          Section {section?.letter} · {topic.title}
        </span>
        <Link href={`/learn/${courseId}`} className="text-xs" style={{ color: "var(--faint)" }}>
          ← path
        </Link>
      </div>
      {phase === "lesson" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
          <div
            className="k-bar h-full rounded-full"
            style={{ width: `${(stepIdx / steps.length) * 100}%`, background: "var(--kube)" }}
          />
        </div>
      )}
    </div>
  );

  // Quick review — a completed node reopens condensed, not as the full teach.
  if (phase === "review") {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        {header}
        <div className="k-card k-rise px-6 py-6">
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
            quick review
          </span>
          <h1 className="mt-2 text-2xl">{topic.title}</h1>
          <ul className="mt-4 space-y-3">
            {topic.recap.map((line, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                <span aria-hidden style={{ color: "var(--kube)" }}>
                  ●
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                setStepIdx(firstCheckIdx >= 0 ? firstCheckIdx : 0);
                setPhase("lesson");
              }}
              className="rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ background: "var(--kube)" }}
            >
              Run the checks again
            </button>
            <button
              onClick={() => {
                setStepIdx(0);
                setPhase("lesson");
              }}
              className="rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: "var(--kube-line)", color: "var(--kube)" }}
            >
              Reteach me from the top
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        {header}
        <div className="k-card k-rise flex flex-col items-center px-6 py-10 text-center">
          <DrawnCheck />
          <h1 className="mt-5 text-2xl">
            {alreadyDone ? "Still solid." : "That rung is yours."}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {topic.whyItMatters}
          </p>
          <div className="mt-7 flex w-full flex-col gap-3">
            {next ? (
              <Link
                href={`/learn/${courseId}/lesson/${next.id}`}
                onClick={() => {
                  setStepIdx(0);
                  setPhase("loading");
                }}
                className="rounded-2xl py-3 text-sm font-semibold text-white"
                style={{ background: "var(--kube)" }}
              >
                Next up: {next.title}
              </Link>
            ) : (
              <Link
                href={`/learn/${courseId}/exam`}
                className="rounded-2xl py-3 text-sm font-semibold text-white"
                style={{ background: "var(--amber)" }}
              >
                Top of the ladder — sit the mock exam
              </Link>
            )}
            <Link
              href={`/learn/${courseId}`}
              className="rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
            >
              Back to the path
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const step = steps[stepIdx];
  const advance = () => {
    if (stepIdx + 1 >= steps.length) {
      void finish();
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
      {header}
      {step.kind === "teach" ? (
        <TeachCard key={stepIdx} step={step} onNext={advance} />
      ) : (
        <CheckCard key={stepIdx} step={step} onPass={advance} />
      )}
    </main>
  );
}
