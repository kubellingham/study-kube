"use client";

// Manage a course you own: add more material for digestion, rename it, or
// delete it. Built-in courses live in code and can't be managed here.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import { authedFetch } from "@/lib/authed-fetch";
import AddMaterial from "@/app/learn/components/AddMaterial";
import { loadPlan, setCourseSemester, SEMESTERS } from "@/lib/learn/plan";

const KIND_LABEL: Record<string, string> = { syllabus: "syllabus", unit: "unit", pastpaper: "past paper", notes: "notes" };

export default function ManageCoursePage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle, owned, files, reload } = useCourse(params.courseId);
  const router = useRouter();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [savedBase, setSavedBase] = useState({ code: "", title: "" });
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [recheckMsg, setRecheckMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (bundle) {
      setCode(bundle.course.code);
      setTitle(bundle.course.title);
      setSavedBase({ code: bundle.course.code, title: bundle.course.title });
    }
  }, [bundle]);

  useEffect(() => {
    if (!user) return;
    loadPlan(user.uid).then((p) => setSemester(p.semesters[params.courseId] ?? null));
  }, [user, params.courseId]);

  /** File this subject under a semester — tapping the current one unfiles it. */
  async function fileSemester(next: number | null) {
    if (!user) return;
    setSemester(next);
    await setCourseSemester(user.uid, params.courseId, next).catch(() => {});
  }

  if (userLoading || !user || status === "loading") {
    return <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>Loading…</div>;
  }
  if (status === "notfound" || !bundle) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That course isn&apos;t in Kube.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>← your subjects</Link>
      </main>
    );
  }
  if (!owned) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl">{bundle.course.code}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          This is a built-in Kube course — it&apos;s curated, so it can&apos;t be edited or deleted. Your own courses can.
        </p>
        <Link href={`/learn/${params.courseId}`} className="mt-5 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>← back to the course</Link>
      </main>
    );
  }

  const dirty = code !== savedBase.code || title !== savedBase.title;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveMsg(null);
    try {
      const res = await authedFetch(`/api/course/${params.courseId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, title }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save.");
      setSavedBase({ code, title });
      setSaveMsg({ ok: true, text: "Saved." });
      reload();
    } catch (err) {
      setSaveMsg({ ok: false, text: err instanceof Error ? err.message : "Could not save." });
    } finally { setSaving(false); }
  }

  async function recheck() {
    setRechecking(true); setRecheckMsg(null);
    try {
      const res = await authedFetch(`/api/course/${params.courseId}/recheck`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "The answer check failed.");
      setRecheckMsg({ ok: true, text: d.note });
      reload();
    } catch (err) {
      setRecheckMsg({ ok: false, text: err instanceof Error ? err.message : "The answer check failed." });
    } finally { setRechecking(false); }
  }

  async function del() {
    setDeleting(true); setDelErr(null);
    try {
      const res = await authedFetch(`/api/course/${params.courseId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not delete.");
      router.replace("/learn");
    } catch (err) {
      setDelErr(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
    }
  }

  const field: React.CSSProperties = { width: "100%", borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", padding: "12px 13px", fontSize: 14, color: "var(--ink)", outline: "none" };

  // Confirm match, tolerant of lookalike characters (O↔0, I↔1) so a course
  // code like "MECO3D" can't be blocked by an impossible-to-see zero.
  const norm = (s: string) => s.trim().toUpperCase().replace(/0/g, "O").replace(/1/g, "I");
  const confirmOk = norm(confirm) === norm(bundle.course.code);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>{bundle.course.code} · manage</span>
        <Link href={`/learn/${params.courseId}`} className="text-xs font-semibold" style={{ color: "var(--faint)" }}>← back to the course</Link>
      </div>
      <h1 className="text-3xl">Manage this subject</h1>

      {/* Add material — the main event */}
      <div className="mt-2">
        <AddMaterial courseId={bundle.course.id} uid={user.uid} files={files} onDone={reload} invitation={files.length === 0} courseTitle={bundle.course.title} />
      </div>

      {/* What Kube has learned */}
      {files.length > 0 && (
        <div className="k-card mt-6 px-6 py-5">
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>digested files · {files.length}</span>
          <ul className="mt-3 space-y-2">
            {[...files].sort((a, b) => a.digestedAt - b.digestedAt).map((f) => (
              <li key={f.id} className="text-xs" style={{ color: "var(--ink-soft)" }}>
                <span className="mr-2 rounded-full px-2 py-0.5 font-semibold" style={{ background: "var(--kube-soft)", color: "var(--kube)" }}>{KIND_LABEL[f.kind] ?? f.kind}</span>
                <span className="font-semibold">{f.label}</span>{" · "}{f.name}
                {f.topics > 0 && ` · ${f.topics} topics`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rename */}
      <form onSubmit={save} className="k-card mt-6 px-6 py-6">
        <h2 className="text-lg font-semibold">Rename</h2>
        <label className="k-eyebrow mt-4 block">course code</label>
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setSaveMsg(null); }} maxLength={12} className="mt-2" style={field} />
        <label className="k-eyebrow mt-4 block">course title</label>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setSaveMsg(null); }} maxLength={120} className="mt-2" style={field} />
        {saveMsg && <p className="mt-3 text-sm" style={{ color: saveMsg.ok ? "var(--kube)" : "var(--red)" }}>{saveMsg.text}</p>}
        <button type="submit" disabled={!dirty || saving} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--kube)" }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Which semester this subject belongs to. Groups the shelf on /learn so
          the semester you're in is what you land on. */}
      <div className="k-card mt-6 px-6 py-6">
        <h2 className="text-lg font-semibold">Semester</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {semester === null
            ? "Not filed yet. Pick a semester and this subject joins that shelf on your subjects page."
            : `Filed under Semester ${semester}. Tap it again to unfile.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SEMESTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => fileSemester(s === semester ? null : s)}
              className="rounded-lg border text-sm font-semibold"
              style={{
                borderColor: s === semester ? "var(--kube)" : "var(--line)",
                background: s === semester ? "var(--kube-soft)" : "var(--card)",
                color: s === semester ? "var(--kube)" : "var(--ink-soft)",
                minWidth: 40,
                minHeight: 40,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Re-mark. Kube writes the question, the options and the answer key in
          one pass, and it can point at the wrong row — so a second checker
          re-solves everything without seeing the key. New material goes through
          this automatically; this button re-marks what's already built. */}
      <div className="k-card mt-6 px-6 py-6">
        <h2 className="text-lg font-semibold">Re-check the answers</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Kube solves every question in this subject again — from scratch, without looking at its
          own answer key — and fixes any that were marked wrong. Costs a fraction of a cent and
          leaves your progress alone.
        </p>
        {recheckMsg && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: recheckMsg.ok ? "var(--kube)" : "var(--red)" }}>
            {recheckMsg.text}
          </p>
        )}
        <button
          type="button"
          onClick={recheck}
          disabled={rechecking}
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--kube)" }}
        >
          {rechecking ? "Re-marking every question…" : "Re-check the answers"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border px-6 py-6" style={{ borderColor: "var(--red)", background: "var(--red-soft)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--red)" }}>Delete this subject</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Removes the course and everything Kube digested into it. This can&apos;t be undone. Type <b>{bundle.course.code}</b> to confirm.
        </p>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value.toUpperCase())} placeholder={bundle.course.code} className="mt-3" style={{ ...field, borderColor: "var(--red)" }} />
        {delErr && <p className="mt-2 text-sm" style={{ color: "var(--red)" }}>{delErr}</p>}
        <button
          type="button"
          onClick={del}
          disabled={!confirmOk || deleting}
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--red)" }}
        >
          {deleting ? "Deleting…" : "Delete subject"}
        </button>
      </div>
    </main>
  );
}
