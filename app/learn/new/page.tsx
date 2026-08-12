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

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, title }),
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
