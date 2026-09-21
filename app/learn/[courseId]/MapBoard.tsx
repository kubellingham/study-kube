"use client";

// The Map view — a subject whose material is a loose pile, laid out as a board
// of THEME CLUSTERS you study in any order (not an ordered ladder). Same topics
// underneath: each opens the same lesson, and the deck/exam are the same. Built
// for the student whose lecturer hands them scattered references, not units.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import type { CourseBundle } from "@/lib/course";
import { loadProgress, type LearnProgress } from "@/lib/learn/progress";
import { topicLessons, lessonKey } from "@/lib/course/lessons";
import { RichInline } from "@/app/learn/components/Rich";
import AddMaterial from "@/app/learn/components/AddMaterial";
import type { IngestedFile } from "@/lib/course/types";

export default function MapBoard({
  courseId,
  bundle,
  owned,
  files,
  onReload,
}: {
  courseId: string;
  bundle: CourseBundle;
  owned: boolean;
  files: IngestedFile[];
  onReload: () => void;
}) {
  const { user } = useUser();
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProgress(user.uid, courseId).then(setProgress);
  }, [user, courseId]);

  const course = bundle.course;
  const clusters = course.sections;
  const ladder = bundle.ladder;
  // How much of a topic is done, counted in lesson slices — a topic you are
  // two quarters into must not look identical to one you have never opened.
  function sliceProgress(topicId: string) {
    const topic = ladder.find((t) => t.id === topicId);
    if (!topic) return { done: 0, total: 0 };
    const slices = topicLessons(topic);
    const doneSlices = slices.filter((l) => progress?.lessons?.[lessonKey(topic.id, l.id)]).length;
    return { done: doneSlices, total: slices.length };
  }
  const done = progress ? ladder.filter((t) => progress.completed[t.id]).length : 0;
  const started = progress
    ? ladder.filter((t) => !progress.completed[t.id] && sliceProgress(t.id).done > 0).length
    : 0;
  const total = ladder.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const empty = total === 0;

  return (
    <main className="mx-auto w-full flex-1 px-4 pb-20 pt-5 sm:px-6" style={{ maxWidth: 1100 }}>
      {/* top bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/learn" className="k-chip" style={{ textDecoration: "none", cursor: "pointer" }}>
          ← subjects
        </Link>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <>
              <Link href={`/learn/${courseId}/practice`} className="k-btn gho" style={{ padding: "8px 14px", textDecoration: "none" }}>
                Practice
              </Link>
              <Link href={`/learn/${courseId}/exam`} className="k-btn gho" style={{ padding: "8px 14px", textDecoration: "none" }}>
                Mock exam
              </Link>
            </>
          )}
          {owned && (
            <Link href={`/learn/${courseId}/manage`} className="k-chip" style={{ textDecoration: "none", cursor: "pointer" }}>
              Manage
            </Link>
          )}
        </div>
      </div>

      {/* title */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="k-eyebrow">{course.code}</span>
        <span className="k-chip" style={{ padding: "3px 9px" }} title="Organized as topic clusters, not an ordered ladder">Map</span>
      </div>
      <h1 className="mt-1 text-3xl">{course.title}</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        A board of topics grouped by theme — study any of them, in any order. Each one stands on its own.
      </p>

      {total > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="track" style={{ width: 140 }}>
            <div className="fillbar" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs" style={{ color: "var(--faint)" }}>
            {done} / {total} topics studied{started > 0 ? ` · ${started} in progress` : ""} ·{" "}
            {clusters.length} {clusters.length === 1 ? "group" : "groups"}
          </span>
        </div>
      )}

      {/* empty state → let the owner feed it */}
      {empty ? (
        owned ? (
          <AddMaterial
            courseId={courseId}
            uid={user?.uid ?? ""}
            files={files}
            onDone={onReload}
            invitation
            courseTitle={course.title}
          />
        ) : (
          <p className="mt-8 text-sm" style={{ color: "var(--faint)" }}>
            Nothing here yet — the owner hasn&apos;t added material to this subject.
          </p>
        )
      ) : (
        <>
          <div className="mt-7 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
            {clusters.map((cluster) => {
              const wide = clusters.length === 1 || cluster.topics.length > 8;
              const cdone = progress ? cluster.topics.filter((t) => progress.completed[t.id]).length : 0;
              return (
                <div
                  key={cluster.id}
                  className="k-card"
                  style={{ padding: "16px 18px", minWidth: 0, gridColumn: wide ? "1 / -1" : undefined }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <h2 style={{ fontSize: 18, lineHeight: 1.2 }}>{cluster.title}</h2>
                    <span className="text-xs" style={{ color: "var(--faint)", whiteSpace: "nowrap" }}>
                      {cdone}/{cluster.topics.length}
                    </span>
                  </div>
                  {cluster.tagline && (
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
                      {cluster.tagline}
                    </p>
                  )}
                  <div
                    className="mt-3 grid gap-1.5"
                    style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}
                  >
                    {cluster.topics.map((t) => {
                      const isDone = !!progress?.completed[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => router.push(`/learn/${courseId}/lesson/${t.id}`)}
                          className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm"
                          style={{
                            borderColor: "var(--line)",
                            background: isDone ? "var(--kube-soft)" : "var(--card)",
                            color: "var(--ink)",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            aria-hidden
                            className="grid place-items-center rounded-full"
                            style={{
                              width: 18,
                              height: 18,
                              flex: "none",
                              fontSize: 11,
                              fontWeight: 700,
                              border: `2px solid ${isDone ? "var(--kube)" : "var(--line)"}`,
                              background: isDone ? "var(--kube)" : "transparent",
                              color: "#fff",
                            }}
                          >
                            {isDone ? "✓" : ""}
                          </span>
                          <span className="min-w-0 flex-1">
                            <RichInline text={t.title} />
                          </span>
                          {!isDone && sliceProgress(t.id).done > 0 && (
                            <span
                              className="flex-none text-[11px] font-semibold"
                              style={{ color: "var(--kube)" }}
                            >
                              {sliceProgress(t.id).done}/{sliceProgress(t.id).total}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {owned && (
              <button
                type="button"
                onClick={() => setAdding((v) => !v)}
                className="k-card"
                style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "16px 18px", minWidth: 0, borderStyle: "dashed", borderColor: "var(--kube-line)", background: "var(--bg-deep)", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 22, color: "var(--kube)", lineHeight: 1 }}>+</span>
                <span style={{ font: "600 14px var(--font-body)", color: "var(--kube)" }}>Add more material</span>
                <span style={{ font: "500 11px var(--font-body)", color: "var(--faint)" }}>
                  Another cluster — notes, slides, a reference, a link&apos;s text.
                </span>
              </button>
            )}
          </div>

          {owned && adding && (
            <AddMaterial
              courseId={courseId}
              uid={user?.uid ?? ""}
              files={files}
              onDone={onReload}
              invitation={false}
              courseTitle={course.title}
            />
          )}
        </>
      )}
    </main>
  );
}
