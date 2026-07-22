"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Topic } from "@/lib/course/types";
import { topicLessons, lessonKey } from "@/lib/course/lessons";
import { buildConceptPool } from "@/lib/course/concepts";
import { useCourse } from "@/lib/learn/use-course";
import { loadProgress, loadExamSummary, type LearnProgress } from "@/lib/learn/progress";
import { loadPracticeState } from "@/lib/learn/practice";
import { loadFlags } from "@/lib/learn/flags";
import { loadMistakes } from "@/lib/learn/mistakes";
import AddMaterial from "@/app/learn/components/AddMaterial";
import { useKubeTheme, MOODS } from "@/app/learn/components/KubeShell";

interface HubCounts {
  due: number; // practice concepts due/unseen
  best: number; // best exam %
  tries: number;
  notes: number; // concept count
  redo: number; // mistakes + flags
}

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
  const size = 72;
  const c = size / 2;
  const r = 32;
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
      className="pointer-events-none absolute -left-2 -top-2"
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
          className={`grid h-14 w-14 place-items-center rounded-full border-2 text-base font-semibold text-white ${state === "completed" ? "k-ring-done" : ""}`}
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
  // One tidy meta line — no more "tap for a quick review" on every node.
  let meta: { text: string; color: string } | null = null;
  if (state !== "locked") {
    if (isReview) meta = { text: "5 questions", color: "var(--kube)" };
    else if (lessonsTotal > 1 && state !== "completed")
      meta = { text: `${lessonsDone} of ${lessonsTotal} parts`, color: "var(--faint)" };
    else if (topic.weight === "heavy")
      meta = { text: "core", color: "var(--amber)" };
  }
  const label = (
    <div
      className={`flex flex-col ${side === "left" ? "items-start text-left" : "items-end text-right"} max-w-[10rem]`}
    >
      <span
        className="text-sm font-semibold leading-snug"
        style={{ color: state === "locked" ? "var(--faint)" : "var(--ink)" }}
      >
        {topic.title}
      </span>
      {meta && (
        <span className="k-eyebrow mt-0.5" style={{ color: meta.color, fontSize: 9.5 }}>
          {meta.text}
        </span>
      )}
    </div>
  );

  const node = (
    <div
      className={`inline-flex items-center gap-3.5 ${side === "left" ? "flex-row" : "flex-row-reverse"}`}
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

  // Amplitude comes from padding (not edge margins) so labels never fall off
  // the frame and the empty side stays smaller.
  const amp = side === "left" ? "flex justify-start pl-12" : "flex justify-end pr-12";
  if (state === "locked") {
    return <div className={amp}>{node}</div>;
  }
  return (
    <Link
      href={`/learn/${courseId}/lesson/${topic.id}`}
      className={`${amp} transition-transform hover:scale-[1.03]`}
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

/** The four hubs — icon, live count, and colour — for the 2×2 grid. */
function HUBS(courseId: string, hub: HubCounts | null) {
  return [
    {
      href: `/learn/${courseId}/practice`,
      label: "Practice",
      sub: hub == null ? "flashcards & drills" : hub.due > 0 ? `${hub.due} due today` : "all caught up",
      color: "var(--kube)",
      soft: "var(--kube-soft)",
      alert: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 8h12l-3-3M20 16H8l3 3" stroke="var(--kube)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: `/learn/${courseId}/exam`,
      label: "Exam",
      sub: hub == null ? "mock exam" : hub.tries > 0 ? `best ${hub.best}% · try #${hub.tries + 1}` : "first attempt",
      color: "var(--amber)",
      soft: "var(--amber-soft)",
      alert: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="var(--amber)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 13.5l2 2 4-4" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: `/learn/${courseId}/glossary`,
      label: "Notes",
      sub: hub == null ? "glossary" : `${hub.notes} · glossary`,
      color: "var(--faint)",
      soft: "var(--kube-soft)",
      alert: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 4h7v16H5a1 1 0 01-1-1V4z" stroke="var(--kube)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 4h8a1 1 0 011 1v14a1 1 0 01-1 1h-8V4z" stroke="var(--kube)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 9h1M14 9h3M14 13h3" stroke="var(--kube)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: `/learn/${courseId}/mistakes`,
      label: "Mistakes",
      sub: hub == null ? "missed & flagged" : hub.redo > 0 ? `${hub.redo} to redo` : "nothing yet",
      color: "var(--red)",
      soft: "var(--red-soft)",
      alert: hub != null && hub.redo > 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l9 16H3l9-16z" stroke="var(--red)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 10v4M12 17v.5" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];
}

export default function CourseLadderPage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle, owned, syllabus, files, reload } =
    useCourse(params.courseId);
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [hub, setHub] = useState<HubCounts | null>(null);
  const { mood, setMood, layout, setLayout } = useKubeTheme();
  const horizontal = layout === "horizontal";

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle) {
      loadProgress(user.uid, bundle.course.id).then(setProgress);
    }
  }, [user, userLoading, router, bundle]);

  // Live hub counts (Practice due / Exam best / Notes / Mistakes) — loaded
  // after the ladder so they never block first paint.
  useEffect(() => {
    if (!user || !bundle) return;
    const cid = bundle.course.id;
    const pool = buildConceptPool(bundle);
    (async () => {
      const [practice, exam, flags, mistakes] = await Promise.all([
        loadPracticeState(user.uid, cid),
        loadExamSummary(user.uid, cid),
        loadFlags(user.uid, cid),
        loadMistakes(user.uid, cid),
      ]);
      const now = Date.now();
      const due = pool.filter((c) => (practice.cards[c.id]?.dueAt ?? 0) <= now).length;
      const redo = new Set([...Object.keys(mistakes), ...Object.keys(flags)]).size;
      setHub({ due, best: exam.best, tries: exam.tries, notes: pool.length, redo });
    })();
  }, [user, bundle]);

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

  return (
    <main className="w-full flex-1 px-3 pb-24 pt-8 sm:px-6" style={{ background: "var(--bg-deep)" }}>
      <div
        className={`k-frame mx-auto w-full overflow-hidden ${horizontal ? "max-w-5xl" : "max-w-xl"}`}
        style={{ padding: 0 }}
      >
        {/* ── Header: eyebrow, title, numeric progress, a labeled controls row ── */}
        <div className="px-6 pb-4 pt-6 sm:px-8" style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="k-eyebrow">{course.code} · Kube</span>
          <h1 className="mt-1 text-3xl">{course.title}</h1>
          {ladder.length === 0 ? (
            <p className="mt-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
              {syllabus
                ? `Kube knows the shape: ${syllabus.units.length} units. Feed them in below and watch the skeleton fill.`
                : "A blank ladder, waiting for its course."}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
                One ladder, {ladder.length} small steps.
              </p>
              <div className="mt-3.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                  <div
                    className="k-bar h-full rounded-full"
                    style={{ width: `${(done / ladder.length) * 100}%`, background: "var(--kube)" }}
                  />
                </div>
                <span
                  className="whitespace-nowrap font-semibold"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--kube)" }}
                >
                  {done}
                  <span style={{ color: "var(--faint)", fontWeight: 400 }}> / {ladder.length}</span>
                </span>
              </div>
            </>
          )}

          {/* Controls on their own labeled row, breathing. */}
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3.5"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-3">
              <span className="k-eyebrow" style={{ fontSize: 10 }}>mood</span>
              <div className="flex items-center gap-1.5" role="group" aria-label="Mood">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    aria-label={`${m.label} mood`}
                    aria-pressed={mood === m.id}
                    onClick={() => setMood(m.id)}
                    className="rounded-full transition-transform hover:scale-110"
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
            </div>
            <div className="flex items-center gap-3.5">
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
                      className="grid h-7 w-9 place-items-center"
                      style={{
                        background: layout === l ? "var(--kube-soft)" : "transparent",
                        color: layout === l ? "var(--kube)" : "var(--faint)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                        {l === "vertical" ? (
                          <>
                            <circle cx="4" cy="3" r="2" fill="currentColor" />
                            <circle cx="10" cy="7" r="2" fill="currentColor" />
                            <circle cx="4" cy="11" r="2" fill="currentColor" />
                          </>
                        ) : (
                          <>
                            <circle cx="3" cy="10" r="2" fill="currentColor" />
                            <circle cx="7" cy="4" r="2" fill="currentColor" />
                            <circle cx="11" cy="10" r="2" fill="currentColor" />
                          </>
                        )}
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              <Link href="/learn" className="text-xs font-semibold" style={{ color: "var(--kube)" }}>
                ← subjects
              </Link>
            </div>
          </div>
        </div>

        {/* ── Hubs: what you can do right now — 2×2, real icons, live counts ── */}
        {ladder.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 px-5 pt-5 sm:px-6">
            {HUBS(course.id, hub).map((h) => (
              <Link
                key={h.label}
                href={h.href}
                className="relative flex items-center gap-3 rounded-2xl border p-3.5 transition-transform hover:scale-[1.02]"
                style={{ background: "var(--card)", borderColor: h.alert ? "var(--red)" : "var(--line)" }}
              >
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl" style={{ background: h.soft }}>
                  {h.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight" style={{ color: "var(--ink)" }}>{h.label}</div>
                  <div className="mt-0.5 truncate" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: h.color, fontWeight: 600 }}>
                    {h.sub}
                  </div>
                </div>
                {h.alert && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "var(--red)" }} />
                )}
              </Link>
            ))}
          </div>
        )}

      <div className="px-4 pb-7 pt-4 sm:px-8">
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
            <section key={`skeleton-${row.unit}`} className="mt-8">
              <div
                className="sticky top-2 z-20 rounded-xl border-2 border-dashed px-5 py-4"
                style={{ borderColor: "var(--line)", background: "var(--bg)" }}
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
            (() => {
              const secTopics = row.section.topics;
              const secDone = secTopics.filter((t) => progress.completed[t.id]).length;
              return (
            <section key={row.section.id} className="mt-8">
              {/* Sticky unit banner with a left accent + per-section progress —
                  stays on top so you always know where you are; the next unit's
                  banner pushes it up as you scroll. */}
              <div
                className="k-card sticky top-2 z-20 px-5 py-4"
                style={{ borderColor: "var(--amber-line)", borderLeft: "4px solid var(--amber)", borderRadius: 12 }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="k-eyebrow" style={{ color: "var(--amber)" }}>
                    Section {row.section.letter} · Unit {row.section.unit}
                  </span>
                  <span className="whitespace-nowrap" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--faint)" }}>
                    {secDone} / {secTopics.length} climbed
                  </span>
                </div>
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
                <div className="mt-6 flex flex-col gap-5">
                  {row.section.topics.flatMap((topic, ti) => {
                    const side = nodeIdx % 2 === 0 ? "left" : "right";
                    nodeIdx += 1;
                    const lessons = topicLessons(topic);
                    const lessonsDone = lessons.filter(
                      (l) => progress.lessons[lessonKey(topic.id, l.id)]
                    ).length;
                    const node = (
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
                    if (ti === 0) return [node];
                    // Quiet 3-dot connector between nodes — amber just before
                    // the current "start here" node.
                    const amber = states[topic.id] === "current";
                    const connector = (
                      <div key={`c-${topic.id}`} className="-my-2 flex justify-center gap-1" aria-hidden>
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            style={{ width: 3, height: 3, borderRadius: 9999, background: amber ? "var(--amber)" : "var(--kube-line)" }}
                          />
                        ))}
                      </div>
                    );
                    return [connector, node];
                  })}
                </div>
              )}
            </section>
              );
            })()
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
      </div>
    </main>
  );
}
