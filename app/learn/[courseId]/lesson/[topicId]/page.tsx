"use client";

// The topic screen + slice player. Tapping a circle lands here: the circle
// opens into its lesson slices (brief §4's "small lessons, the bits inside").
// Each slice plays §5A mechanics — shake-not-judge, warm specific praise —
// and fills one segment of the circle. Review nodes play a short compulsory
// quiz drawn from earlier topics, keeping old rungs warm (Duolingo-style).
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import type { CheckStep, TeachStep, Step, Lesson } from "@/lib/course/types";
import {
  topicLessons,
  lessonKey,
  buildReviewQuiz,
  type ReviewCheck,
} from "@/lib/course/lessons";
import {
  loadProgress,
  markLessonComplete,
  recordReviewMiss,
  type LearnProgress,
} from "@/lib/learn/progress";
import {
  loadSlideVotes,
  saveSlideVote,
  slideKey,
  type SlideVote,
  type SlideVotes,
} from "@/lib/learn/feedback";
import Rich from "@/app/learn/components/Rich";
import KubeChat, {
  type KubeChatContext,
  type ChatTurn,
} from "@/app/learn/components/KubeChat";
import { authedFetch } from "@/lib/authed-fetch";

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

/** Minimal thumb: outline only; tapping fills it solid. Drawn, not emoji. */
function ThumbIcon({ down, filled }: { down?: boolean; filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={down ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0l4.2-7.1A2 2 0 0 1 13 2c1.1 0 2 .9 2 2v5h4.6a2 2 0 0 1 2 2.4l-1.3 7A2 2 0 0 1 18.3 20H7" />
    </svg>
  );
}

function ThumbButtons({
  vote,
  onVote,
}: {
  vote: SlideVote | undefined;
  onVote: (v: SlideVote | null) => void;
}) {
  const thumb = (v: SlideVote, label: string) => {
    const active = vote === v;
    return (
      <button
        aria-label={label}
        aria-pressed={active}
        onClick={() => onVote(active ? null : v)}
        className="grid h-8 w-8 place-items-center rounded-full transition-colors"
        style={{ color: "var(--ink)" }}
      >
        <ThumbIcon down={v === -1} filled={active} />
      </button>
    );
  };
  return (
    <div className="flex gap-0.5">
      {thumb(1, "This slide helped")}
      {thumb(-1, "This slide didn't help")}
    </div>
  );
}

/** One quiet lap of the button's border — the clock-hand hint. */
function SweepOverlay() {
  return (
    <svg
      className="k-sweep pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      <rect x="1" y="1" rx="15" pathLength={100} style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }} />
    </svg>
  );
}

function TeachCard({
  step,
  onNext,
  onBack,
  canBack,
  vote,
  onVote,
}: {
  step: TeachStep;
  onNext: () => void;
  onBack: () => void;
  canBack: boolean;
  vote: SlideVote | undefined;
  onVote: (v: SlideVote | null) => void;
}) {
  return (
    <div className="k-card k-rise px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        {step.title ? <h2 className="mb-3 text-xl">{step.title}</h2> : <span />}
        <ThumbButtons vote={vote} onVote={onVote} />
      </div>
      <Rich body={step.body} />
      {step.code && <pre className="k-code mt-4">{step.code}</pre>}
      <div className="mt-6 flex gap-3">
        {canBack && (
          <button
            onClick={onBack}
            className="rounded-2xl border py-3 text-sm font-semibold"
            style={{ flexBasis: "30%", borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            ← Back
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white"
          style={{ background: "var(--kube)" }}
        >
          Got it — keep going
        </button>
      </div>
    </div>
  );
}

// The hint waits long enough for genuine thought — not reading time.
const IDLE_HINT_MS = 18_000;
const SWEEP_ANIM_MS = 1500;

function CheckCard({
  step,
  mode,
  onPass,
  onMiss,
  onAskKube,
  onBack,
  canBack,
}: {
  step: CheckStep;
  /** learn = teaching check (quiet sweep hint, nothing recorded);
   *  assess = review question (no hints; misses are flagged). */
  mode: "learn" | "assess";
  onPass: () => void;
  onMiss?: () => void;
  onAskKube?: (question: string) => void;
  onBack?: () => void;
  canBack?: boolean;
}) {
  const [shaking, setShaking] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [missed, setMissed] = useState(false);
  const wrongTaps = useRef(0);
  const missReported = useRef(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sweepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sweepCorrect = useCallback(() => {
    setSweeping(false);
    // remount the overlay so the CSS animation restarts cleanly
    requestAnimationFrame(() => setSweeping(true));
    if (sweepTimer.current) clearTimeout(sweepTimer.current);
    sweepTimer.current = setTimeout(() => setSweeping(false), SWEEP_ANIM_MS);
  }, []);

  const armIdle = useCallback(() => {
    if (mode !== "learn") return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      sweepCorrect();
      armIdle(); // still thinking after another stretch → one more quiet lap
    }, IDLE_HINT_MS);
  }, [mode, sweepCorrect]);

  useEffect(() => {
    armIdle();
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (sweepTimer.current) clearTimeout(sweepTimer.current);
    };
  }, [armIdle]);

  function tap(i: number) {
    if (passed || shaking !== null) return;
    if (i === step.answer) {
      setPassed(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }
    // Wrong: shake + red, then reset — shake-not-judge, always.
    setShaking(i);
    shakeTimer.current = setTimeout(() => setShaking(null), 500);
    if (mode === "learn") {
      wrongTaps.current += 1;
      // Second wrong tap → the quiet border lap points the way.
      if (wrongTaps.current >= 2) {
        setTimeout(sweepCorrect, 520);
        wrongTaps.current = 0;
      }
      armIdle();
    } else {
      // Assessment: flag the miss (once per question) — Kube takes note and
      // can offer help. Retrying is still allowed.
      setMissed(true);
      if (!missReported.current) {
        missReported.current = true;
        onMiss?.();
      }
    }
  }

  return (
    <div className="k-card k-rise px-6 py-6">
      <span className="k-eyebrow">{mode === "assess" ? "review — this one counts" : "check yourself"}</span>
      <h2 className="mt-2 text-xl leading-snug">{step.prompt}</h2>
      {step.code && <pre className="k-code mt-4">{step.code}</pre>}
      <div className="mt-5 flex flex-col gap-3">
        {step.options.map((opt, i) => {
          const isShaking = shaking === i;
          const isRight = passed && i === step.answer;
          const isSweeping = sweeping && i === step.answer && !passed;
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={passed}
              className={`relative rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${isShaking ? "k-shake" : ""}`}
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
              {isSweeping && <SweepOverlay />}
            </button>
          );
        })}
      </div>
      {!passed && canBack && onBack && (
        <button
          onClick={onBack}
          className="mt-4 rounded-2xl border py-3 text-sm font-semibold"
          style={{ width: "30%", borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          ← Back
        </button>
      )}
      {passed && (
        <div className="k-rise mt-5 rounded-2xl px-4 py-4" style={{ background: "var(--kube-soft)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--kube)" }}>
            {step.praise}
          </p>
          {mode === "assess" && missed && onAskKube && (
            <button
              onClick={() =>
                onAskKube(
                  `I missed this review question: "${step.prompt}" — help me understand the idea behind it.`
                )
              }
              className="mt-3 w-full rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: "var(--kube-line)", color: "var(--kube)" }}
            >
              That slip is flagged — ask Kube about it
            </button>
          )}
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
  const [reviewSteps, setReviewSteps] = useState<ReviewCheck[] | null>(null);
  const [votes, setVotes] = useState<SlideVotes>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState<string | undefined>(undefined);
  // One chat per SLIDE: moving forward starts fresh; stepping back restores
  // that slide's conversation; finishing the slice clears everything.
  const [chats, setChats] = useState<Record<string, ChatTurn[]>>({});
  const notedChats = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle && topic) {
      Promise.all([
        loadProgress(user.uid, bundle.course.id),
        loadSlideVotes(user.uid, bundle.course.id),
      ]).then(([p, v]) => {
        setProgress(p);
        setVotes(v);
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
      reviewMisses: progress!.reviewMisses,
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
    const lesson = lessons[lessonIdx];
    const steps: Step[] = isReview ? (reviewSteps ?? []) : lesson.steps;
    const step = steps[stepIdx];
    if (!step) {
      // Empty slice (shouldn't happen) — treat as done.
      void finishLesson();
      return null;
    }
    const lessonSliceId = isReview ? "review" : lesson.id;
    const chatKey = slideKey(topic.id, lessonSliceId, stepIdx);
    const chatTurns = chats[chatKey] ?? [];

    // Leaving a slide where the student talked to Kube → quietly file the
    // struggle note (assessed server-side in the background, never shown).
    const noteChatIfAny = (key: string, turns: ChatTurn[]) => {
      if (turns.length < 2 || notedChats.current.has(key)) return;
      notedChats.current.add(key);
      void authedFetch("/api/learn/chat-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          topicId: topic!.id,
          topicTitle: topic!.title,
          lessonId: lessonSliceId,
          lessonTitle: isReview ? "Review assessment" : lesson.title,
          stepIdx,
          transcript: turns,
        }),
      }).catch(() => {});
    };

    const advance = () => {
      noteChatIfAny(chatKey, chatTurns);
      setChatOpen(false);
      setChatSeed(undefined);
      if (stepIdx + 1 >= steps.length) {
        setChats({}); // the slice is done — every slide's chat starts over next time
        void finishLesson();
      } else {
        setStepIdx(stepIdx + 1);
      }
    };
    const goBack = () => {
      setChatOpen(false);
      setChatSeed(undefined);
      if (stepIdx === 0) setPhase("overview");
      else setStepIdx(stepIdx - 1); // the previous slide's chat is still there
    };

    // Kube chat context: strictly THIS lesson's content, plus earlier topic
    // titles so Kube can point backward (never forward).
    const lessonContent = isReview
      ? [
          "This is a compulsory review assessment over earlier circles.",
          `Current question: ${(step as CheckStep).prompt}`,
          "Recaps of the circles under review:",
          ...(topic.review?.topicIds ?? []).map((id) => {
            const t = bundle.getTopic(id);
            return t ? `• ${t.title}: ${t.recap.join(" ")}` : "";
          }),
        ].join("\n")
      : steps
          .slice(0, stepIdx + 1) // only what the learner has actually seen
          .map((s) =>
            s.kind === "teach"
              ? `${s.title ? s.title + "\n" : ""}${s.body}${s.code ? "\n" + s.code : ""}`
              : `Check question: ${s.prompt}`
          )
          .join("\n\n");
    const chatContext: KubeChatContext = {
      courseTitle: bundle.course.title,
      topicTitle: topic.title,
      lessonTitle: isReview ? "Review assessment" : lesson.title,
      lessonContent,
      coveredSoFar: bundle.ladder
        .slice(0, pos)
        .map((t) => t.title)
        .join(" · "),
    };
    const openChat = (seed?: string) => {
      setChatSeed(seed);
      setChatOpen(true);
    };
    const stepVoteKey = slideKey(topic.id, isReview ? "review" : lesson.id, stepIdx);

    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="k-eyebrow">
              {isReview
                ? `review · ${stepIdx + 1} / ${steps.length}`
                : `${lesson.title}`}
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
          <TeachCard
            key={stepIdx}
            step={step}
            onNext={advance}
            onBack={goBack}
            canBack
            vote={votes[stepVoteKey]}
            onVote={(v) => {
              setVotes((prev) => {
                const next = { ...prev };
                if (v === null) delete next[stepVoteKey];
                else next[stepVoteKey] = v;
                return next;
              });
              if (user) void saveSlideVote(user.uid, courseId, stepVoteKey, v).catch(() => {});
            }}
          />
        ) : (
          <CheckCard
            key={stepIdx}
            step={step}
            mode={isReview ? "assess" : "learn"}
            onPass={advance}
            onBack={goBack}
            canBack={!isReview}
            onMiss={
              isReview
                ? () => {
                    const src = (step as ReviewCheck).sourceTopicId ?? topic.id;
                    setProgress((p) =>
                      p
                        ? {
                            ...p,
                            reviewMisses: {
                              ...p.reviewMisses,
                              [src]: (p.reviewMisses[src] ?? 0) + 1,
                            },
                          }
                        : p
                    );
                    if (user) void recordReviewMiss(user.uid, courseId, src).catch(() => {});
                  }
                : undefined
            }
            onAskKube={isReview ? openChat : undefined}
          />
        )}
        <button
          onClick={() => openChat()}
          aria-label="Ask Kube about this lesson"
          className="fixed bottom-5 right-5 z-40 rounded-full border px-4 py-3 text-sm font-semibold shadow-lg"
          style={{ background: "var(--card)", borderColor: "var(--kube-line)", color: "var(--kube)" }}
        >
          Ask Kube
        </button>
        <KubeChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          context={chatContext}
          seed={chatSeed}
          turns={chatTurns}
          onTurns={(updater) =>
            setChats((prev) => ({ ...prev, [chatKey]: updater(prev[chatKey] ?? []) }))
          }
        />
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
            fresh ones you haven&apos;t met in the lessons. This one assesses:
            a miss gets flagged and Kube offers to help, right there.
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
