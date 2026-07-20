"use client";

// The topic screen + slice player. Tapping a circle lands here: the circle
// opens into its lesson slices (brief §4's "small lessons, the bits inside").
// Each slice plays §5A mechanics — shake-not-judge, warm specific praise —
// and fills one segment of the circle. Review nodes play a short compulsory
// quiz drawn from earlier topics, keeping old rungs warm (Duolingo-style).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import type { CheckStep, TeachStep, Step, Lesson } from "@/lib/course/types";
import { topicLessons, lessonKey, buildReviewQuiz } from "@/lib/course/lessons";
import {
  loadProgress,
  markLessonComplete,
  type LearnProgress,
} from "@/lib/learn/progress";
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
    // Wrong: shake + red, then reset. Nothing is recorded — Kube is teaching
    // here, not testing.
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

type Phase = "loading" | "overview" | "play" | "topicDone";

export default function TopicPage() {
  const params = useParams<{ courseId: string; topicId: string }>();
  const { user, userLoading, status, bundle } = useCourse(params.courseId);
  const topic = bundle?.getTopic(params.topicId);
  const router = useRouter();

  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [reviewSteps, setReviewSteps] = useState<Step[] | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle && topic) {
      loadProgress(user.uid, bundle.course.id).then((p) => {
        setProgress(p);
        setPhase("overview");
      });
    }
  }, [user, userLoading, router, bundle, topic]);

  if (status === "notfound" || (status === "ready" && bundle && !topic)) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That topic isn&apos;t on the ladder.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← back to Kube
        </Link>
      </main>
    );
  }

  if (userLoading || !user || !bundle || !topic || !progress || phase === "loading") {
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
  const isReview = topic.kind === "review";
  const lessons = topicLessons(topic);
  const isDone = (l: Lesson) => !!progress.lessons[lessonKey(topic.id, l.id)];
  const doneCount = lessons.filter(isDone).length;
  const topicComplete = !!progress.completed[topic.id] || doneCount === lessons.length;

  function beginLesson(i: number) {
    if (isReview) {
      setReviewSteps(buildReviewQuiz(bundle!, topic!));
    }
    setLessonIdx(i);
    setStepIdx(0);
    setPhase("play");
  }

  async function finishLesson() {
    const lesson = lessons[lessonIdx];
    const key = lessonKey(topic!.id, lesson.id);
    const alreadyDone = !!progress!.lessons[key];
    const newLessons: Record<string, true> = { ...progress!.lessons, [key]: true };
    const allDone = lessons.every((l) => newLessons[lessonKey(topic!.id, l.id)]);
    setProgress({
      completed: allDone
        ? { ...progress!.completed, [topic!.id]: true }
        : progress!.completed,
      lessons: newLessons,
    });
    setPhase(allDone ? "topicDone" : "overview");
    if (user && !alreadyDone) {
      try {
        await markLessonComplete(user.uid, courseId, topic!.id, lesson.id, allDone);
      } catch {
        // A failed save shouldn't block the learner mid-flow.
      }
    }
  }

  const header = (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <span className="k-eyebrow">
          Section {section?.letter} · {topic.title}
        </span>
        <Link
          href={`/learn/${courseId}`}
          className="text-xs"
          style={{ color: "var(--faint)" }}
        >
          ← path
        </Link>
      </div>
    </div>
  );

  /* ---------------- play a slice ---------------- */
  if (phase === "play") {
    const steps: Step[] = isReview ? (reviewSteps ?? []) : lessons[lessonIdx].steps;
    const step = steps[stepIdx];
    if (!step) {
      // Empty slice (shouldn't happen) — treat as done.
      void finishLesson();
      return null;
    }
    const advance = () => {
      if (stepIdx + 1 >= steps.length) {
        void finishLesson();
      } else {
        setStepIdx(stepIdx + 1);
      }
    };
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="k-eyebrow">
              {isReview
                ? `review · ${stepIdx + 1} / ${steps.length}`
                : `${lessons[lessonIdx].title}`}
            </span>
            <button
              onClick={() => setPhase("overview")}
              className="text-xs"
              style={{ color: "var(--faint)" }}
            >
              ← {topic.title}
            </button>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div
              className="k-bar h-full rounded-full"
              style={{
                width: `${(stepIdx / steps.length) * 100}%`,
                background: "var(--kube)",
              }}
            />
          </div>
        </div>
        {step.kind === "teach" ? (
          <TeachCard key={stepIdx} step={step} onNext={advance} />
        ) : (
          <CheckCard key={stepIdx} step={step} onPass={advance} />
        )}
      </main>
    );
  }

  /* ---------------- whole-circle celebration ---------------- */
  if (phase === "topicDone") {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        {header}
        <div className="k-card k-rise flex flex-col items-center px-6 py-10 text-center">
          <DrawnCheck />
          <h1 className="mt-5 text-2xl">
            {isReview ? "Still yours." : "The whole circle is yours."}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {topic.whyItMatters}
          </p>
          <div className="mt-7 flex w-full flex-col gap-3">
            {next ? (
              <Link
                href={`/learn/${courseId}/lesson/${next.id}`}
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

  /* ---------------- overview: the opened circle ---------------- */
  if (isReview) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
        {header}
        <div className="k-card k-rise px-6 py-6">
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
            compulsory quick review
          </span>
          <h1 className="mt-2 text-2xl">{topic.title}</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {topic.whyItMatters}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {topic.review?.count ?? 5} questions on what you climbed earlier —
            fresh ones each sitting. Wrong answers just shake; this keeps old
            rungs warm, it doesn&apos;t grade you.
          </p>
          <button
            onClick={() => beginLesson(0)}
            className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white"
            style={{ background: "var(--kube)" }}
          >
            {topicComplete ? "Run the review again" : "Start the review"}
          </button>
        </div>
      </main>
    );
  }

  const firstOpen = lessons.findIndex((l) => !isDone(l));
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
      {header}
      <h1 className="text-2xl">{topic.title}</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {topic.whyItMatters}
      </p>

      {topicComplete && topic.recap.length > 0 && (
        <div className="k-card mt-5 px-5 py-4" style={{ background: "var(--kube-soft)", borderColor: "var(--kube-line)" }}>
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
            quick recap
          </span>
          <ul className="mt-2 space-y-2">
            {topic.recap.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                <span aria-hidden style={{ color: "var(--kube)" }}>
                  ●
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <span className="k-eyebrow">
          {lessons.length === 1
            ? "one sitting"
            : `${lessons.length} parts · ${doneCount} done`}
        </span>
        <div className="mt-3 flex flex-col gap-3">
          {lessons.map((lesson, i) => {
            const done = isDone(lesson);
            const unlocked = done || i === 0 || isDone(lessons[i - 1]);
            const current = i === firstOpen;
            return (
              <button
                key={lesson.id}
                disabled={!unlocked}
                onClick={() => beginLesson(i)}
                className="k-card flex items-center gap-4 px-5 py-4 text-left disabled:opacity-60"
                style={current ? { borderColor: "var(--amber)", boxShadow: "0 0 0 4px var(--amber-soft)" } : undefined}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold"
                  style={
                    done
                      ? { background: "var(--kube)", borderColor: "var(--kube)", color: "white" }
                      : unlocked
                        ? { borderColor: "var(--kube-line)", color: "var(--kube)" }
                        : { borderColor: "var(--line)", color: "var(--faint)" }
                  }
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-sm font-semibold"
                    style={{ color: unlocked ? "var(--ink)" : "var(--faint)" }}
                  >
                    {lesson.title}
                  </span>
                  <span className="block text-xs" style={{ color: "var(--faint)" }}>
                    {done
                      ? "done — tap to replay"
                      : current
                        ? "up next"
                        : unlocked
                          ? "ready"
                          : "finish the part above first"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
