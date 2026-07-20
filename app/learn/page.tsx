"use client";

// Kube home — pick a subject. Each course code (CSE22D today) owns its own
// ladder, exams and progress; new subjects slot in via lib/course/index.ts.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import { courses } from "@/lib/course";
import { loadProgress } from "@/lib/learn/progress";

export default function LearnHomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [done, setDone] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user) {
      Promise.all(
        courses.map(async (c) => {
          const p = await loadProgress(user.uid, c.course.id);
          return [
            c.course.id,
            c.ladder.filter((t) => p.completed[t.id]).length,
          ] as const;
        })
      ).then((entries) => setDone(Object.fromEntries(entries)));
    }
  }, [user, loading, router]);

  if (loading || !user || !done) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading your subjects…
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="k-eyebrow">Kube</span>
        <Link href="/dashboard" className="text-xs" style={{ color: "var(--faint)" }}>
          ← studying kube
        </Link>
      </div>
      <h1 className="text-3xl">Your subjects</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        One calm ladder per course. Pick up where you left off.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {courses.map((c) => {
          const climbed = done[c.course.id] ?? 0;
          const pct = (climbed / c.ladder.length) * 100;
          return (
            <Link
              key={c.course.id}
              href={`/learn/${c.course.id}`}
              className="k-card block px-6 py-5 transition-transform hover:scale-[1.01]"
            >
              <span className="k-eyebrow">{c.course.code}</span>
              <h2 className="mt-1 text-xl">{c.course.title}</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                {c.course.sections.length} sections · {c.ladder.length} topics ·{" "}
                {climbed === 0
                  ? "not started"
                  : climbed === c.ladder.length
                    ? "complete"
                    : `${climbed} climbed`}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div
                  className="k-bar h-full rounded-full"
                  style={{ width: `${pct}%`, background: "var(--kube)" }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-center text-xs" style={{ color: "var(--faint)" }}>
        More subjects (CSE46D and beyond) join this list as their units are added.
      </p>
    </main>
  );
}
