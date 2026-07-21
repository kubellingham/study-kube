"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Topic } from "@/lib/course/types";
import { topicLessons, lessonKey } from "@/lib/course/lessons";
import { useCourse } from "@/lib/learn/use-course";
import { loadProgress, type LearnProgress } from "@/lib/learn/progress";
import AddMaterial from "@/app/learn/components/AddMaterial";
import { useKubeTheme, MOODS } from "@/app/learn/components/KubeShell";

type NodeState = "completed" | "current" | "available" | "locked";

function nodeStates(
  ladder: Topic[],
  progress: LearnProgress
): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};
  let currentAssigned = false;
  for (const t of ladder) {
    if (progress.completed[t.id]) {
      states[t.id] = "completed";
      continue;
    }
    const unlocked = t.deps.every((d) => progress.completed[d]);
    if (unlocked && !currentAssigned) {
      states[t.id] = "current";
      currentAssigned = true;
    } else if (unlocked) {
      states[t.id] = "available";
    } else {
      states[t.id] = "locked";
    }
  }
  if (!currentAssigned && ladder.length && !progress.completed[ladder[0].id]) {
    states[ladder[0].id] = "current";
  }
  return states;
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** The circle's slices: one arc segment per lesson, filling as they're done. */
function SegmentRing({ total, done }: { total: number; done: number }) {
  if (total < 2) return null;
  const size = 84;
  const c = size / 2;
  const r = 38;
  const gapDeg = Math.min(10, 120 / total);
  const per = 360 / total;
  const segs = [];
  for (let i = 0; i < total; i++) {
    const a0 = i * per + gapDeg / 2;
    const a1 = (i + 1) * per - gapDeg / 2;
    const p0 = polar(c, c, r, a0);
    const p1 = polar(c, c, r, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    segs.push(
      <path
        key={i}
        d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`}
        fill="none"
        stroke={i < done ? "var(--kube)" : "var(--line)"}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute -left-2.5 -top-2.5"
      aria-hidden
    >
      {segs}
    </svg>
  );
}

/** The circle itself — shared between the vertical zig-zag and the
 *  horizontal rail. Ring shadow on done, amber glow + pill on current. */
function TopicCircle({
  topic,
  state,
  number,
  lessonsTotal,
  lessonsDone,
}: {
  topic: Topic;
  state: NodeState;
  number: number;
  lessonsTotal: number;
  lessonsDone: number;
}) {
  const isReview = topic.kind === "review";
  const circle: Record<NodeState, React.CSSProperties> = {
    completed: { background: "var(--kube)", borderColor: "var(--kube)" },
    current: {
      background: "var(--amber)",
      borderColor: "var(--amber)",
      boxShadow: "0 0 0 8px var(--amber-soft)",
    },
    available: {
      background: "var(--card)",
      borderColor: "var(--kube-line)",
      color: "var(--kube)",
    },
    locked: {
      background: "var(--line)",
      borderColor: "var(--line)",
      color: "var(--faint)",
    },
  };
  const startHerePill = (
    <div
      className="k-bob absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
      style={{
        background: "var(--amber)",
        color: "white",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.1em",
      }}
    >
      start here
    </div>
  );

  return (
    <div
      className={`relative rounded-full ${state === "current" ? "k-locate" : ""}`}
      {...(state === "current" ? { "data-kube-current": "" } : {})}
    >
      {state === "current" && startHerePill}
      {isReview ? (
        <div
          className="grid h-12 w-12 place-items-center rounded-full border-2 text-base font-semibold"
          style={{
            ...(state === "completed"
              ? { background: "var(--kube)", borderColor: "var(--kube)", color: "white" }
              : state === "locked"
                ? { background: "var(--line)", borderColor: "var(--line)", color: "var(--faint)" }
                : {
                    background: "var(--kube-soft)",
                    borderColor: "var(--kube-line)",
                    color: "var(--kube)",
                    borderStyle: "dashed",
                    ...(state === "current"
                      ? { boxShadow: "0 0 0 6px var(--amber-soft)" }
                      : {}),
                  }),
          }}
        >
          {state === "completed" ? <CheckIcon /> : "↻"}
        </div>
      ) : (
        <div
          className={`grid h-16 w-16 place-items-center rounded-full border-2 text-lg font-semibold text-white ${state === "completed" ? "k-ring-done" : ""}`}
          style={circle[state]}
        >
          {state !== "locked" && (
            <SegmentRing total={lessonsTotal} done={lessonsDone} />
          )}
          {state === "completed" ? (
            <CheckIcon />
          ) : state === "locked" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--faint)" strokeWidth="2" />
              <path d="M8 10V7a4 4 0 018 0v3" stroke="var(--faint)" strokeWidth="2" />
            </svg>
          ) : (
            <span style={state === "available" ? { color: "var(--kube)" } : undefined}>
              {number}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function LadderNode({
  courseId,
  topic,
  state,
  side,
  number,
  lessonsTotal,
  lessonsDone,
}: {
  courseId: string;
  topic: Topic;
  state: NodeState;
  side: "left" | "right";
  number: number;
  lessonsTotal: number;
  lessonsDone: number;
}) {
  const isReview = topic.kind === "review";
  const label = (
    <div
      className={`flex flex-col ${side === "left" ? "items-start text-left" : "items-end text-right"} max-w-[11rem]`}
    >
      <span
        className="text-sm font-semibold leading-snug"
        style={{ color: state === "locked" ? "var(--faint)" : "var(--ink)" }}
      >
        {topic.title}
      </span>
      {isReview && state !== "locked" && (
        <span className="k-eyebrow mt-0.5" style={{ color: "var(--kube)" }}>
          5 questions
        </span>
      )}
      {!isReview && topic.weight === "heavy" && state !== "locked" && (
        <span className="k-eyebrow mt-0.5" style={{ color: "var(--amber)" }}>
          core
        </span>
      )}
      {!isReview && lessonsTotal > 1 && state !== "locked" && state !== "completed" && (
        <span className="text-xs mt-0.5" style={{ color: "var(--faint)" }}>
          {lessonsDone} of {lessonsTotal} parts
        </span>
      )}
      {state === "completed" && (
        <span className="text-xs mt-0.5" style={{ color: "var(--faint)" }}>
          tap for a quick review
        </span>
      )}
    </div>
  );

  const node = (
    <div
      className={`flex items-center gap-4 ${side === "left" ? "flex-row" : "flex-row-reverse"}`}
    >
      <TopicCircle
        topic={topic}
        state={state}
        number={number}
        lessonsTotal={lessonsTotal}
        lessonsDone={lessonsDone}
      />
      {label}
    </div>
  );

  if (state === "locked") {
    return <div className={side === "left" ? "self-start ml-2" : "self-end mr-2"}>{node}</div>;
  }
  return (
    <Link
      href={`/learn/${courseId}/lesson/${topic.id}`}
      className={`${side === "left" ? "self-start ml-2" : "self-end mr-2"} transition-transform hover:scale-[1.03]`}
    >
      {node}
    </Link>
  );
}

/** One slot of the horizontal rail: label above or below, circle centered —
 *  the redesign's top/bottom alternation, scaled to real ladders by letting
 *  each section's rail scroll sideways. */
function RailNode({
  courseId,
  topic,
  state,
  alt,
  number,
  lessonsTotal,
  lessonsDone,
}: {
  courseId: string;
  topic: Topic;
  state: NodeState;
  alt: boolean; // true = label above (the "top" position)
  number: number;
  lessonsTotal: number;
  lessonsDone: number;
}) {
  const isReview = topic.kind === "review";
  const label = (
    <div className="flex w-[130px] flex-col items-center text-center">
      <span
        className="text-[13px] font-semibold leading-tight"
        style={{ color: state === "locked" ? "var(--faint)" : "var(--ink)" }}
      >
        {topic.title}
      </span>
      {isReview && state !== "locked" && (
        <span className="k-eyebrow mt-0.5" style={{ color: "var(--kube)", fontSize: "9.5px" }}>
          5 questions
        </span>
      )}
      {!isReview && topic.weight === "heavy" && state !== "locked" && (
        <span className="k-eyebrow mt-0.5" style={{ color: "var(--amber)", fontSize: "9.5px" }}>
          core
        </span>
      )}
    </div>
  );
  const body = (
    <div className="flex w-[150px] flex-none flex-col items-center">
      <div className="flex h-20 items-end justify-center pb-2.5">{alt && label}</div>
      <TopicCircle
        topic={topic}
        state={state}
        number={number}
        lessonsTotal={lessonsTotal}
        lessonsDone={lessonsDone}
      />
      <div className="flex h-20 items-start justify-center pt-2.5">{!alt && label}</div>
    </div>
  );
  if (state === "locked") return body;
  return (
    <Link
      href={`/learn/${courseId}/lesson/${topic.id}`}
      className="transition-transform hover:scale-[1.03]"
    >
      {body}
    </Link>
  );
}

export default function CourseLadderPage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle, owned, syllabus, files, reload } =
    useCourse(params.courseId);
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const { mood, setMood, layout, setLayout } = useKubeTheme();
  const horizontal = layout === "horizontal";

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle) {
      loadProgress(user.uid, bundle.course.id).then(setProgress);
    }
  }, [user, userLoading, router, bundle]);

  // Find-me-on-load: once the ladder is rendered, bring the "start here"
  // circle into view — vertically down the page AND sideways along the rail
  // in horizontal mode — so a refresh never dumps you back at the top.
  useEffect(() => {
    if (!progress || !bundle) return;
    const t = setTimeout(() => {
      document
        .querySelector("[data-kube-current]")
        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 200);
    return () => clearTimeout(t);
  }, [progress, bundle, layout]);

  if (status === "notfound") {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That course isn&apos;t in Kube yet.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← your subjects
        </Link>
      </main>
    );
  }

  if (userLoading || !user || status === "loading" || !bundle || !progress) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading your path…
      </div>
    );
  }

  const { course, ladder } = bundle;
  const states = nodeStates(ladder, progress);
  const done = ladder.filter((t) => progress.completed[t.id]).length;
  let nodeIdx = 0;

  const controls = (
    <div className="flex items-center gap-3">
      {/* Mood dots — same tokens, different weather */}
      <div className="flex items-center gap-1.5" role="group" aria-label="Mood">
        {MOODS.map((m) => (
          <button
            key={m.id}
            aria-label={`${m.label} mood`}
            aria-pressed={mood === m.id}
            onClick={() => setMood(m.id)}
            className="h-4.5 w-4.5 rounded-full transition-transform hover:scale-110"
            style={{
              width: 18,
              height: 18,
              background: m.dot,
              border: `2px solid ${mood === m.id ? m.ring : "var(--line)"}`,
              boxShadow: mood === m.id ? `0 0 0 2px var(--card)` : undefined,
            }}
          />
        ))}
      </div>
      {/* Orientation toggle — one ladder, two ways to lay it down */}
      {ladder.length > 0 && (
        <div
          className="flex overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--line)" }}
          role="group"
          aria-label="Ladder orientation"
        >
          {(["vertical", "horizontal"] as const).map((l) => (
            <button
              key={l}
              aria-label={`${l} ladder`}
              aria-pressed={layout === l}
              onClick={() => setLayout(l)}
              className="grid h-7 w-8 place-items-center"
              style={{
                background: layout === l ? "var(--kube-soft)" : "transparent",
                color: layout === l ? "var(--kube)" : "var(--faint)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                {l === "vertical" ? (
                  <>
                    <circle cx="4" cy="2.5" r="2" fill="currentColor" />
                    <circle cx="10" cy="7" r="2" fill="currentColor" />
                    <circle cx="4" cy="11.5" r="2" fill="currentColor" />
                  </>
                ) : (
                  <>
                    <circle cx="2.5" cy="10" r="2" fill="currentColor" />
                    <circle cx="7" cy="4" r="2" fill="currentColor" />
                    <circle cx="11.5" cy="10" r="2" fill="currentColor" />
                  </>
                )}
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="w-full flex-1 px-3 pb-24 pt-8 sm:px-6" style={{ background: "var(--bg-deep)" }}>
      <div
        className={`k-frame mx-auto w-full px-4 py-7 sm:px-8 ${horizontal ? "max-w-5xl" : "max-w-xl"}`}
      >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="k-eyebrow">{course.code} · Kube</span>
        <div className="flex items-center gap-4">
          {controls}
          <Link href="/learn" className="text-xs" style={{ color: "var(--faint)" }}>
            ← subjects
          </Link>
        </div>
      </div>
      <h1 className="text-3xl">{course.title}</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        {ladder.length === 0
          ? syllabus
            ? `Kube knows the shape: ${syllabus.units.length} units. Feed them in below and watch the skeleton fill.`
            : "A blank ladder, waiting for its course."
          : `One ladder, ${ladder.length} small steps. You've climbed ${done}.`}
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
        <div
          className="k-bar h-full rounded-full"
          style={{
            width: `${ladder.length ? (done / ladder.length) * 100 : 0}%`,
            background: "var(--kube)",
          }}
        />
      </div>

      {ladder.length > 0 && (
        <>
          <Link
            href={`/learn/${course.id}/practice`}
            className="mt-6 flex items-center gap-3 rounded-2xl px-5 py-4 transition-transform hover:scale-[1.01]"
            style={{ background: "var(--kube-soft)", border: "1px solid var(--kube-line)" }}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg" style={{ background: "var(--kube)", color: "white" }} aria-hidden>
              ⇄
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold" style={{ color: "var(--kube)" }}>
                Practice Hub
              </span>
              <span className="block text-xs" style={{ color: "var(--ink-soft)" }}>
                Matching, definitions, flashcards & a 60-second sprint — cram what&apos;s in this course.
              </span>
            </span>
          </Link>
          <div className="mt-3 flex gap-3">
            <Link
              href={`/learn/${course.id}/exam`}
              className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white"
              style={{ background: "var(--kube)" }}
            >
              Sit a mock exam
            </Link>
            <Link
              href={`/learn/${course.id}/glossary`}
              className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold k-card"
              style={{ color: "var(--kube)" }}
            >
              Notes &amp; glossary
            </Link>
          </div>
        </>
      )}

      {(() => {
        // Course skeleton (KUBE_INTAKE_FLOW.md): fed units render their full
        // sections; syllabus units not yet fed render as named, expectant
        // placeholders — the whole mountain visible before it's climbed.
        const fedUnits = new Set(course.sections.map((s) => s.unit));
        const rows: (
          | { type: "section"; unit: number; section: (typeof course.sections)[number] }
          | { type: "skeleton"; unit: number; title: string }
        )[] = [
          ...course.sections.map((s) => ({
            type: "section" as const,
            unit: s.unit,
            section: s,
          })),
          ...(syllabus?.units ?? [])
            .filter((u) => !fedUnits.has(u.unit))
            .map((u) => ({ type: "skeleton" as const, unit: u.unit, title: u.title })),
        ].sort((a, b) => a.unit - b.unit);

        return rows.map((row) =>
          row.type === "skeleton" ? (
            <section key={`skeleton-${row.unit}`} className="mt-12">
              <div
                className="rounded-2xl border-2 border-dashed px-5 py-4"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="k-eyebrow">Unit {row.unit} · not fed yet</span>
                <h2 className="mt-1 text-xl" style={{ color: "var(--faint)" }}>
                  {row.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--faint)" }}>
                  {owned
                    ? "Kube's expecting this here — add its file below and the node lights up."
                    : "Kube's expecting this here — it lights up when its material is fed in."}
                </p>
              </div>
            </section>
          ) : (
            <section key={row.section.id} className="mt-12">
              <div className="k-card px-5 py-4" style={{ borderColor: "var(--amber-soft)" }}>
                <span className="k-eyebrow" style={{ color: "var(--amber)" }}>
                  Section {row.section.letter} · Unit {row.section.unit} · digested
                </span>
                <h2 className="mt-1 text-xl">{row.section.title}</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {row.section.tagline}
                </p>
              </div>
              {horizontal ? (
                <div className="k-rail mt-2 pb-1">
                  <div className="flex items-stretch" style={{ minWidth: "max-content" }}>
                    {row.section.topics.map((topic) => {
                      const alt = nodeIdx % 2 === 1; // odd slots carry the label on top
                      nodeIdx += 1;
                      const lessons = topicLessons(topic);
                      const lessonsDone = lessons.filter(
                        (l) => progress.lessons[lessonKey(topic.id, l.id)]
                      ).length;
                      return (
                        <RailNode
                          key={topic.id}
                          courseId={course.id}
                          topic={topic}
                          state={states[topic.id]}
                          alt={alt}
                          number={bundle.topicPosition(topic.id) + 1}
                          lessonsTotal={lessons.length}
                          lessonsDone={
                            progress.completed[topic.id] ? lessons.length : lessonsDone
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-9">
                  {row.section.topics.map((topic) => {
                    const side = nodeIdx % 2 === 0 ? "left" : "right";
                    nodeIdx += 1;
                    const lessons = topicLessons(topic);
                    const lessonsDone = lessons.filter(
                      (l) => progress.lessons[lessonKey(topic.id, l.id)]
                    ).length;
                    return (
                      <LadderNode
                        key={topic.id}
                        courseId={course.id}
                        topic={topic}
                        state={states[topic.id]}
                        side={side}
                        number={bundle.topicPosition(topic.id) + 1}
                        lessonsTotal={lessons.length}
                        lessonsDone={
                          progress.completed[topic.id] ? lessons.length : lessonsDone
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )
        );
      })()}

      {owned && (
        <AddMaterial
          courseId={course.id}
          uid={user.uid}
          files={files}
          onDone={reload}
          invitation={ladder.length === 0 && !syllabus}
        />
      )}
      </div>
    </main>
  );
}
