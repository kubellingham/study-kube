"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import { authedFetch } from "@/lib/authed-fetch";
import { loadPlan, setCourseSemester } from "@/lib/learn/plan";

export default function NewCoursePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Crew state, used to show the "share with your crew" toggle. Null when
  // the user isn't in a crew at all — we hide the affordance in that case
  // rather than tempt them into a state they can't reach.
  const [inCrew, setInCrew] = useState(false);
  const [share, setShare] = useState(true);
  // Do they have the syllabus? Guidance only — nudges the layout choice.
  const [hasSyllabus, setHasSyllabus] = useState<"yes" | "no" | null>(null);
  // How Kube lays this subject out. "auto" = let Kube decide from the first
  // file. Map is the recommended default (most students have mixed material).
  const [modeChoice, setModeChoice] = useState<"map" | "path" | "auto">("map");

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    authedFetch("/api/crew")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // Either leading a crew or a member of one — both count as "in a crew"
        // for the sharing affordance.
        if (d && (d.leader || d.member)) setInCrew(true);
      })
      .catch(() => {
        /* silent — sharing toggle just stays hidden */
      });
  }, [user]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          share: inCrew && share,
          ...(modeChoice === "auto" ? {} : { mode: modeChoice }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the course.");
      // A subject you add mid-semester almost always belongs to the semester
      // you're in — file it there so the shelf stays sorted without asking.
      if (user) {
        const plan = await loadPlan(user.uid).catch(() => null);
        if (plan?.currentSemester !== null && plan?.currentSemester !== undefined) {
          await setCourseSemester(user.uid, data.id, plan.currentSemester).catch(() => {});
        }
      }
      router.push(`/learn/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the course.");
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading…
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow">new subject</span>
        <Link href="/learn" className="text-xs" style={{ color: "var(--faint)" }}>
          ← subjects
        </Link>
      </div>
      <h1 className="text-3xl">Add a subject</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Name the course first. Then start with your syllabus so Kube learns the
        shape of the whole course — and add units, past papers, and notes in as
        many batches as you like. Kube files each one automatically.
      </p>

      <form onSubmit={create} className="k-card mt-6 px-6 py-6">
        <label className="k-eyebrow block">course code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CSE46D"
          required
          maxLength={12}
          className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
        />

        <label className="k-eyebrow mt-5 block">course title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Data Structures"
          required
          maxLength={120}
          className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
        />

        {/* Do you have the syllabus? Guidance that helps Kube (and you) pick
            the right layout. */}
        <div className="mt-6">
          <label className="k-eyebrow block">do you have the syllabus / course-outline sheet?</label>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
            The syllabus lists every unit and outcome — with it, Kube can lay the whole course
            out as a Ladder. Without it, a Map is usually the better fit.
          </p>
          <div className="mt-2 flex gap-2">
            {([["yes", "Yes, I have it"], ["no", "No / not sure"]] as const).map(([v, label]) => {
              const on = hasSyllabus === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setHasSyllabus(v); setModeChoice(v === "yes" ? "path" : "map"); }}
                  className="rounded-full border px-4 py-1.5 text-xs font-semibold"
                  style={{
                    borderColor: on ? "var(--kube)" : "var(--line)",
                    background: on ? "var(--kube-soft)" : "var(--card)",
                    color: on ? "var(--kube)" : "var(--ink-soft)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* How Kube organizes the subject. This is LOCKED once the first file
            is added, so it's chosen here, deliberately. */}
        <div className="mt-6">
          <label className="k-eyebrow block">how should Kube organize this subject?</label>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
            You choose this once — after your first file it&apos;s locked in, because
            re-organizing a built subject would scramble it.
          </p>
          <div className="mt-3 grid gap-2.5">
            {([
              ["map", "Map — study by topic", "Kube sorts your material into topic clusters you study in any order. Best for mixed notes, slides and links.", "Recommended"],
              ["path", "Ladder — climb in order", "One ordered path, unit by unit. Best when your course has a clear shape (a syllabus, numbered units).", hasSyllabus === "yes" ? "Fits a syllabus" : ""],
              ["auto", "Let Kube decide", "Kube picks Map or Ladder from your first file.", ""],
            ] as const).map(([v, title2, desc, tag]) => {
              const on = modeChoice === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setModeChoice(v)}
                  className="rounded-xl border px-4 py-3 text-left"
                  style={{
                    borderColor: on ? "var(--kube)" : "var(--line)",
                    background: on ? "var(--kube-soft)" : "var(--card)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: on ? "var(--kube)" : "var(--ink)" }}>
                      {title2}
                    </span>
                    {tag && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: "var(--kube-soft)", color: "var(--kube)", border: "1px solid var(--kube-line)" }}
                      >
                        {tag}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {inCrew && (
          <label
            className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: "var(--kube-line)", background: "var(--kube-soft)" }}
          >
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="mt-0.5"
              style={{ accentColor: "var(--kube)" }}
            />
            <span className="text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
              <b style={{ color: "var(--ink)" }}>Share with your crew.</b> Everyone in your crew
              will see this subject and can study from the units you add. Only you can add or
              remove material.
            </span>
          </label>
        )}

        {error && (
          <p className="mt-4 text-sm" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--kube)" }}
        >
          {busy ? "Creating…" : "Create subject"}
        </button>
      </form>
    </main>
  );
}
