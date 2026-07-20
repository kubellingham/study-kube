"use client";

// The persistent "Add material" surface (KUBE_INTAKE_FLOW.md Phase 2).
// Accepts any files in any number of batches — Kube silently classifies each
// (syllabus / unit / past paper / notes) and folds it into the ladder.
// Already-digested files are recognised by content hash and never re-processed.
import { useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";
import type { IngestedFile } from "@/lib/course/types";

interface BatchLine {
  name: string;
  state: "waiting" | "working" | "done" | "skipped" | "error";
  note: string;
}

export default function AddMaterial({
  courseId,
  files,
  onDone,
  invitation,
}: {
  courseId: string;
  files: IngestedFile[];
  onDone: () => void;
  /** Phase 1 syllabus-first copy vs the ongoing Phase 2 copy. */
  invitation: boolean;
}) {
  const [picked, setPicked] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"pdf" | "text">("pdf");
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<BatchLine[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);

  async function ingestOne(form: FormData): Promise<{ note: string; state: BatchLine["state"] }> {
    const res = await authedFetch("/api/course/ingest", { method: "POST", body: form });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      return { state: "error", note: data.error || "Digestion failed." };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let all = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      all += decoder.decode(value, { stream: true });
    }
    const match = all.match(/RESULT (\{.*\})/);
    if (!match) return { state: "error", note: "Interrupted — please try this file again." };
    const r = JSON.parse(match[1]) as {
      ok: boolean;
      error?: string;
      skipped?: boolean;
      deferred?: boolean;
      kind?: string;
      label?: string;
      unit?: number;
      topics?: number;
      questions?: number;
      units?: number;
      cos?: number;
      message?: string;
    };
    if (!r.ok) return { state: "error", note: r.error || "Digestion failed." };
    if (r.skipped) return { state: "skipped", note: r.message || "Already learned — not re-processed." };
    if (r.kind === "syllabus")
      return {
        state: "done",
        note: `Syllabus read — ${r.units} units${r.cos ? `, ${r.cos} Course Outcomes` : ""}. The course skeleton is up.`,
      };
    if (r.kind === "unit")
      return {
        state: "done",
        note: `Unit ${r.unit} digested — ${r.topics} topics, ${r.questions} exam questions.`,
      };
    if (r.kind === "pastpaper")
      return {
        state: r.deferred ? "skipped" : "done",
        note: r.message || `Past paper read — ${r.questions} exam-realistic questions added.`,
      };
    return { state: "done", note: r.message || `Filed as ${r.label}.` };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "text") {
        setLines([{ name: "pasted text", state: "working", note: "Kube is reading…" }]);
        const form = new FormData();
        form.append("courseId", courseId);
        form.append("text", text);
        const r = await ingestOne(form);
        setLines([{ name: "pasted text", state: r.state, note: r.note }]);
        if (r.state === "done") setText("");
      } else {
        if (picked.length === 0) {
          setLines([{ name: "—", state: "error", note: "Choose one or more PDFs first." }]);
          setBusy(false);
          return;
        }
        const batch: BatchLine[] = picked.map((f) => ({
          name: f.name,
          state: "waiting",
          note: "Waiting…",
        }));
        setLines(batch);
        for (let i = 0; i < picked.length; i++) {
          batch[i] = { ...batch[i], state: "working", note: "Kube is reading & digesting…" };
          setLines([...batch]);
          const form = new FormData();
          form.append("courseId", courseId);
          form.append("file", picked[i]);
          const r = await ingestOne(form);
          batch[i] = { ...batch[i], state: r.state, note: r.note };
          setLines([...batch]);
        }
        setPicked([]);
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  const KIND_LABEL: Record<IngestedFile["kind"], string> = {
    syllabus: "syllabus",
    unit: "unit",
    pastpaper: "past paper",
    notes: "notes",
  };

  return (
    <div className="k-card mt-8 px-6 py-6">
      <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
        {invitation ? "start here" : "add material"}
      </span>
      {invitation ? (
        <>
          <h2 className="mt-2 text-xl">
            Start with your syllabus — it&apos;s how Kube learns the shape of your
            whole course.
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Upload the course outline / curriculum first and Kube builds the
            skeleton: every unit, named, waiting to be filled. Don&apos;t have it
            handy? No problem — just add unit PDFs and Kube figures out the
            structure as you go; the syllabus can join anytime.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Add anything, anytime — units, past papers, the syllabus, notes, in as
          many batches as you like. Kube works out what each file is and slots
          it in. It keeps what it&apos;s already learned: nothing is re-processed.
        </p>
      )}

      <form onSubmit={submit} className="mt-4">
        <div className="flex gap-2">
          {(["pdf", "text"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={
                tab === t
                  ? { background: "var(--kube)", borderColor: "var(--kube)", color: "white" }
                  : { borderColor: "var(--line)", color: "var(--ink-soft)" }
              }
            >
              {t === "pdf" ? "Upload PDFs" : "Paste text"}
            </button>
          ))}
        </div>

        {tab === "pdf" ? (
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setPicked(Array.from(e.target.files ?? []))}
            className="mt-3 block w-full text-sm"
            style={{ color: "var(--ink-soft)" }}
          />
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste the material here — syllabus, a unit, or a past paper…"
            className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
          />
        )}

        {lines.length > 0 && (
          <ul className="mt-4 space-y-2">
            {lines.map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span aria-hidden>
                  {l.state === "done"
                    ? "✓"
                    : l.state === "error"
                      ? "✕"
                      : l.state === "skipped"
                        ? "▸"
                        : "…"}
                </span>
                <span
                  style={{
                    color:
                      l.state === "error"
                        ? "var(--red)"
                        : l.state === "done"
                          ? "var(--kube)"
                          : "var(--ink-soft)",
                  }}
                >
                  <span className="font-semibold">{l.name}:</span> {l.note}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--kube)" }}
        >
          {busy
            ? "Kube is learning…"
            : picked.length > 1
              ? `Feed Kube ${picked.length} files`
              : "Feed Kube"}
        </button>
        {busy && (
          <p className="mt-2 text-center text-xs" style={{ color: "var(--faint)" }}>
            A unit or past paper takes a couple of minutes — leave this page open.
          </p>
        )}
      </form>

      {files.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <button
            type="button"
            onClick={() => setReceiptOpen(!receiptOpen)}
            className="text-xs font-semibold"
            style={{ color: "var(--faint)" }}
          >
            {receiptOpen ? "Hide" : "Show"} what Kube has learned · {files.length} file
            {files.length === 1 ? "" : "s"} {receiptOpen ? "▴" : "▾"}
          </button>
          {receiptOpen && (
            <ul className="mt-3 space-y-2">
              {[...files]
                .sort((a, b) => a.digestedAt - b.digestedAt)
                .map((f) => (
                  <li key={f.id} className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    <span
                      className="mr-2 rounded-full px-2 py-0.5 font-semibold"
                      style={{ background: "var(--kube-soft)", color: "var(--kube)" }}
                    >
                      {KIND_LABEL[f.kind]}
                    </span>
                    <span className="font-semibold">{f.label}</span>
                    {" · "}
                    {f.name}
                    {f.topics > 0 && ` · ${f.topics} topics`}
                    {f.questions > 0 && ` · ${f.questions} questions`}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
