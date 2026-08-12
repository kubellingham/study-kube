"use client";

// Mistakes & Flags — the place to face what tripped you up. Every exam-bank
// question you've missed, plus everything you've flagged as "don't really get
// it," gathered with deep explanations, linked to their topic, and re-doable
// as an open study exam (explanations next to each question).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import { useCramLocked, CramLocked } from "@/app/learn/components/PlanGate";
import type { ExamQuestion } from "@/lib/course/types";
import { loadFlags, saveFlag, type Flags } from "@/lib/learn/flags";
import { loadMistakes, clearMistake, type Mistakes } from "@/lib/learn/mistakes";
import FlagButton from "@/app/learn/components/FlagButton";
import { RichInline } from "@/app/learn/components/Rich";

interface Entry {
  key: string;
  prompt: string;
  topicId?: string;
  topicTitle?: string;
  answer?: string;
  explanation?: string;
  missed: boolean;
  flagged: boolean;
}

export default function MistakesPage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle } = useCourse(params.courseId);
  const router = useRouter();
  const cramLocked = useCramLocked();
  const [flags, setFlags] = useState<Flags>({});
  const [mistakes, setMistakes] = useState<Mistakes>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/");
    if (user && bundle) {
      Promise.all([
        loadFlags(user.uid, bundle.course.id),
        loadMistakes(user.uid, bundle.course.id),
      ]).then(([f, m]) => {
        setFlags(f);
        setMistakes(m);
        setReady(true);
      });
    }
  }, [user, userLoading, router, bundle]);

  const examById = useMemo(() => {
    const map = new Map<string, ExamQuestion>();
    bundle?.examBank.forEach((q) => map.set(q.id, q));
    return map;
  }, [bundle]);

  const entries: Entry[] = useMemo(() => {
    if (!bundle) return [];
    const keys = new Set([...Object.keys(mistakes), ...Object.keys(flags)]);
    const list: Entry[] = [];
    for (const key of keys) {
      const q = examById.get(key);
      const flagMeta = flags[key];
      const missed = !!mistakes[key];
      const flagged = !!flagMeta;
      if (q) {
        const topic = bundle.getTopic(q.topicId);
        list.push({
          key,
          prompt: q.prompt,
          topicId: q.topicId,
          topicTitle: topic?.title,
          answer: q.options[q.answer],
          explanation: q.explanation,
          missed,
          flagged,
        });
      } else if (flagMeta) {
        const topic = flagMeta.topicId ? bundle.getTopic(flagMeta.topicId) : undefined;
        list.push({
          key,
          prompt: flagMeta.prompt,
          topicId: flagMeta.topicId,
          topicTitle: topic?.title,
          missed,
          flagged,
        });
      }
    }
    // Missed-and-flagged first, then flagged, then missed.
    return list.sort(
      (a, b) => Number(b.missed && b.flagged) - Number(a.missed && a.flagged) || Number(b.flagged) - Number(a.flagged)
    );
  }, [bundle, flags, mistakes, examById]);

  const redoable = useMemo(
    () => entries.some((e) => examById.has(e.key)),
    [entries, examById]
  );

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
        Gathering what tripped you up…
      </div>
    );
  }
  if (cramLocked) return <CramLocked feature="Mistakes & flags" />;

  const { course } = bundle;

  function unflag(key: string) {
    setFlags((prev) => {
      const next = { ...prev };
      delete next[key];
      if (user) void saveFlag(user!.uid, course.id, key, null).catch(() => {});
      return next;
    });
  }
  function resolveMistake(key: string) {
    setMistakes((prev) => {
      const next = { ...prev };
      delete next[key];
      if (user) void clearMistake(user!.uid, course.id, key).catch(() => {});
      return next;
    });
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="k-eyebrow">{course.code} · mistakes &amp; flags</span>
        <Link href={`/learn/${course.id}`} className="text-xs" style={{ color: "var(--faint)" }}>
          ← path
        </Link>
      </div>
      <h1 className="text-3xl">Mistakes &amp; flags</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Everything you&apos;ve missed or flagged as &quot;don&apos;t really get it&quot; — in one
        place, explained, linked to its topic. The fastest way to turn weak
        spots into banked ones.
      </p>

      {entries.length === 0 ? (
        <div className="k-card mt-6 px-6 py-10 text-center">
          <div className="text-4xl" aria-hidden>◇</div>
          <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
            Nothing here yet. Miss a question or tap the flag on one you&apos;re
            unsure of, and it lands here for you to face later.
          </p>
        </div>
      ) : (
        <>
          {redoable && (
            <Link
              href={`/learn/${course.id}/exam?set=review`}
              className="mt-6 block rounded-2xl py-3 text-center text-sm font-semibold text-white"
              style={{ background: "var(--amber)" }}
            >
              Re-do these as an open exam — explanations shown
            </Link>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {entries.map((e) => (
              <div key={e.key} className="k-card px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {e.missed && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--red-soft)", color: "var(--red)", letterSpacing: "0.08em" }}>
                        missed
                      </span>
                    )}
                    {e.flagged && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--kube-soft)", color: "var(--kube)", letterSpacing: "0.08em" }}>
                        flagged
                      </span>
                    )}
                  </div>
                  {e.flagged && <FlagButton on onToggle={() => unflag(e.key)} size={16} />}
                </div>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>{e.prompt}</p>
                {e.answer && (
                  <p className="mt-1 text-xs" style={{ color: "var(--kube)" }}>Answer: {e.answer}</p>
                )}
                {e.explanation && (
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}><RichInline text={e.explanation} /></p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {e.topicId && (
                    <Link href={`/learn/${course.id}/lesson/${e.topicId}`} className="font-semibold" style={{ color: "var(--kube)" }}>
                      {e.topicTitle ? `Revisit: ${e.topicTitle}` : "Open the lesson"} →
                    </Link>
                  )}
                  {e.missed && (
                    <button onClick={() => resolveMistake(e.key)} style={{ color: "var(--faint)" }}>
                      got it now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
