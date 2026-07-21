"use client";

// The Practice Hub (KUBE_CASUAL_AND_PRACTICE.md §3) — one calm gym per
// course. Four pressures on the SAME concept pool Kube already extracts for
// the deep lessons: Matching (discrimination), Definitions (recall),
// Flashcards (self-graded + spacing), Timed Sprint (fluency). Pick the mood
// you're in; it all reinforces the same material.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import { buildConceptPool, sprintItems } from "@/lib/course/concepts";
import { loadPracticeState, type CardState } from "@/lib/learn/practice";
import Matching from "./Matching";
import Definitions from "./Definitions";
import Flashcards from "./Flashcards";
import Sprint from "./Sprint";

type Tool = "matching" | "definitions" | "flashcards" | "sprint";

const DOORS: { id: Tool; title: string; blurb: string; icon: string }[] = [
  { id: "matching", title: "Matching", blurb: "Tell confusables apart — snap the pairs.", icon: "⇄" },
  { id: "definitions", title: "Definitions", blurb: "Recall it in your own words, your level.", icon: "✎" },
  { id: "flashcards", title: "Flashcards", blurb: "Flip & swipe — the deck learns your weak spots.", icon: "▭" },
  { id: "sprint", title: "Timed Sprint", blurb: "60 seconds, beat your own speed.", icon: "⚡" },
];

export default function PracticePage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle } = useCourse(params.courseId);
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [best, setBest] = useState(0);
  const [ready, setReady] = useState(false);
  // Which unit to practise from — "auto" draws from the whole course.
  const [unit, setUnit] = useState<number | "auto">("auto");

  const fullPool = useMemo(() => (bundle ? buildConceptPool(bundle) : []), [bundle]);
  const fullItems = useMemo(() => (bundle ? sprintItems(bundle) : []), [bundle]);
  const units = useMemo(
    () => [...new Set(fullPool.map((c) => c.unit))].sort((a, b) => a - b),
    [fullPool]
  );
  const pool = useMemo(
    () => (unit === "auto" ? fullPool : fullPool.filter((c) => c.unit === unit)),
    [fullPool, unit]
  );
  const items = useMemo(
    () => (unit === "auto" ? fullItems : fullItems.filter((q) => q.unit === unit)),
    [fullItems, unit]
  );

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle) {
      loadPracticeState(user.uid, bundle.course.id).then((s) => {
        setCards(s.cards);
        setBest(s.sprintBest);
        setReady(true);
      });
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

  if (userLoading || !user || !bundle || !ready) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading the gym…
      </div>
    );
  }

  const { course } = bundle;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="k-eyebrow">{course.code} · practice</span>
        {tool ? (
          <button onClick={() => setTool(null)} className="text-xs" style={{ color: "var(--faint)" }}>
            ← all tools
          </button>
        ) : (
          <Link href={`/learn/${course.id}`} className="text-xs" style={{ color: "var(--faint)" }}>
            ← path
          </Link>
        )}
      </div>

      {!tool ? (
        <>
          <h1 className="text-3xl">Practice</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {pool.length} concept{pool.length === 1 ? "" : "s"} from everything you&apos;ve fed
            this course, gathered for fast drilling. Same brain as the lessons,
            different door.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DOORS.map((d) => (
              <button
                key={d.id}
                onClick={() => setTool(d.id)}
                className="k-card flex flex-col items-start px-5 py-5 text-left transition-transform hover:scale-[1.02]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: "var(--kube-soft)", color: "var(--kube)" }} aria-hidden>
                  {d.icon}
                </span>
                <h2 className="mt-3 text-lg font-semibold" style={{ color: "var(--ink)" }}>{d.title}</h2>
                <p className="mt-1 text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>{d.blurb}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl">{DOORS.find((d) => d.id === tool)!.title}</h1>

          {/* Draw from one unit, or Auto (the whole course). */}
          {units.length > 1 && (
            <div className="k-rail mt-4 flex gap-2 pb-1">
              {(["auto", ...units] as const).map((u) => {
                const active = unit === u;
                return (
                  <button
                    key={u}
                    onClick={() => setUnit(u as number | "auto")}
                    className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: active ? "var(--kube)" : "var(--line)",
                      background: active ? "var(--kube-soft)" : "var(--card)",
                      color: active ? "var(--kube)" : "var(--ink-soft)",
                    }}
                  >
                    {u === "auto" ? "Auto — all units" : `Unit ${u}`}
                  </button>
                );
              })}
            </div>
          )}

          {/* key forces a fresh round when the unit changes */}
          {tool === "matching" && <Matching key={`m-${unit}`} pool={pool} />}
          {tool === "definitions" && <Definitions key={`d-${unit}`} pool={pool} />}
          {tool === "flashcards" && (
            <Flashcards key={`f-${unit}`} pool={pool} uid={user.uid} courseId={course.id} cards={cards} onCards={setCards} />
          )}
          {tool === "sprint" && (
            <Sprint key={`s-${unit}`} items={items} uid={user.uid} courseId={course.id} best={best} onBest={setBest} />
          )}
        </>
      )}
    </main>
  );
}
