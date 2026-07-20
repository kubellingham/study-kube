"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Topic } from "@/lib/course/types";
import { useCourse } from "@/lib/learn/use-course";
import { loadProgress, type LearnProgress } from "@/lib/learn/progress";
import AddMaterial from "@/app/learn/components/AddMaterial";

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

function LadderNode({
  courseId,
  topic,
  state,
  side,
  number,
}: {
  courseId: string;
  topic: Topic;
  state: NodeState;
  side: "left" | "right";
  number: number;
}) {
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
      {topic.weight === "heavy" && state !== "locked" && (
        <span className="k-eyebrow mt-0.5" style={{ color: "var(--amber)" }}>
          core
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
      <div className="relative">
        {state === "current" && (
          <div
            className="k-bob absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "var(--amber)", color: "white" }}
          >
            start here
          </div>
        )}
        <div
          className="grid h-16 w-16 place-items-center rounded-full border-2 text-lg font-semibold text-white"
          style={circle[state]}
        >
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
      </div>
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

export default function CourseLadderPage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle, owned, syllabus, files, reload } =
    useCourse(params.courseId);
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle) {
      loadProgress(user.uid, bundle.course.id).then(setProgress);
    }
  }, [user, userLoading, router, bundle]);

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
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="k-eyebrow">{course.code} · Kube</span>
        <Link href="/learn" className="text-xs" style={{ color: "var(--faint)" }}>
          ← subjects
        </Link>
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
        <div className="mt-6 flex gap-3">
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
                  Kube&apos;s expecting this here — add its PDF below and the
                  node lights up.
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
              <div className="mt-8 flex flex-col gap-9">
                {row.section.topics.map((topic) => {
                  const side = nodeIdx % 2 === 0 ? "left" : "right";
                  nodeIdx += 1;
                  return (
                    <LadderNode
                      key={topic.id}
                      courseId={course.id}
                      topic={topic}
                      state={states[topic.id]}
                      side={side}
                      number={bundle.topicPosition(topic.id) + 1}
                    />
                  );
                })}
              </div>
            </section>
          )
        );
      })()}

      {owned && (
        <AddMaterial
          courseId={course.id}
          files={files}
          onDone={reload}
          invitation={ladder.length === 0 && !syllabus}
        />
      )}
    </main>
  );
}
