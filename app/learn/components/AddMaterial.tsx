"use client";

// The persistent "Add material" surface (KUBE_INTAKE_FLOW.md Phase 2).
// Drag in any files, any number of batches. Text is extracted ON THIS DEVICE
// (so big files are fine), then Kube classifies and digests each one as a
// BACKGROUND job — closing the tab is safe; progress reattaches on return.
import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";
import { extractFileTextInBrowser } from "@/lib/ingest/client-extract";
import type { IngestedFile } from "@/lib/course/types";

interface JobLine {
  key: string;
  name: string;
  state: "extracting" | "working" | "done" | "skipped" | "error";
  note: string;
}

const KIND_LABEL: Record<IngestedFile["kind"], string> = {
  syllabus: "syllabus",
  unit: "unit",
  pastpaper: "past paper",
  notes: "notes",
};

export default function AddMaterial({
  courseId,
  uid,
  files,
  onDone,
  invitation,
}: {
  courseId: string;
  uid: string;
  files: IngestedFile[];
  onDone: () => void;
  invitation: boolean;
}) {
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"files" | "text">("files");
  const [lines, setLines] = useState<JobLine[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const unsubs = useRef<(() => void)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const subs = unsubs.current;
    return () => subs.forEach((u) => u());
  }, []);

  function updateLine(key: string, patch: Partial<JobLine>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function watchJob(jobId: string, key: string) {
    const unsub = onSnapshot(
      doc(db(), "ingestJobs", jobId),
      (snap) => {
        if (!snap.exists()) return;
        const status = snap.get("status") as JobLine["state"];
        const note = (snap.get("note") as string) ?? "";
        updateLine(key, { state: status === "working" ? "working" : status, note });
        if (status === "done") {
          onDone();
          unsub();
        } else if (status === "error" || status === "skipped") {
          unsub();
        }
      },
      () => {
        // Snapshot listener failing shouldn't kill the page; the job still
        // finishes server-side and a reload will show the result.
      }
    );
    unsubs.current.push(unsub);
  }

  // Reattach to any job still running for this course (e.g. after the user
  // closed the tab mid-digestion — the job kept going without them).
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db(), "ingestJobs"),
            where("userId", "==", uid),
            where("courseId", "==", courseId),
            where("status", "==", "working")
          )
        );
        if (snap.empty) return;
        setLines((prev) => [
          ...prev,
          ...snap.docs.map((d) => ({
            key: d.id,
            name: (d.get("fileName") as string) ?? "file",
            state: "working" as const,
            note: (d.get("note") as string) ?? "Kube is working…",
          })),
        ]);
        snap.docs.forEach((d) => watchJob(d.id, d.id));
      } catch {
        // No running jobs visible — fine.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, uid]);

  async function submitOne(key: string, name: string, extracted: string) {
    try {
      const res = await authedFetch("/api/course/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name, text: extracted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Digestion failed.");
      if (data.skipped) {
        updateLine(key, { state: "skipped", note: data.note });
        return;
      }
      updateLine(key, { state: "working", note: "Kube is reading it…" });
      watchJob(data.jobId as string, key);
    } catch (err) {
      updateLine(key, {
        state: "error",
        note: err instanceof Error ? err.message : "Digestion failed.",
      });
    }
  }

  async function ingestFiles(picked: File[]) {
    if (picked.length === 0) return;
    const batch: JobLine[] = picked.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      state: "extracting",
      note: "Reading the file on your device…",
    }));
    setLines((prev) => [...prev, ...batch]);
    for (let i = 0; i < picked.length; i++) {
      const key = batch[i].key;
      try {
        const extracted = await extractFileTextInBrowser(picked[i]);
        updateLine(key, { note: "Sending the text to Kube…" });
        await submitOne(key, picked[i].name, extracted);
      } catch (err) {
        updateLine(key, {
          state: "error",
          note: err instanceof Error ? err.message : "Could not read this file.",
        });
      }
    }
  }

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 100) return;
    const key = `${Date.now()}-pasted`;
    setLines((prev) => [
      ...prev,
      { key, name: "pasted text", state: "working", note: "Sending to Kube…" },
    ]);
    await submitOne(key, "pasted text", text);
    setText("");
  }

  const anyWorking = lines.some((l) => l.state === "working" || l.state === "extracting");

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
            handy? No problem — just add unit files and Kube figures out the
            structure as you go; the syllabus can join anytime.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Add anything, anytime — units, past papers, the syllabus, notes, in as
          many batches as you like. Kube works out what each file is and slots
          it in. Nothing already learned is ever re-processed.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {(["files", "text"] as const).map((t) => (
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
            {t === "files" ? "Upload files" : "Paste text"}
          </button>
        ))}
      </div>

      {tab === "files" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void ingestFiles(Array.from(e.dataTransfer.files ?? []));
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className="mt-3 cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors"
          style={{
            borderColor: dragOver ? "var(--kube)" : "var(--kube-line)",
            background: dragOver ? "var(--kube-soft)" : "transparent",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--kube)" }}>
            Drop files here — or tap to choose
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--faint)" }}>
            PDF, PPTX, DOCX, TXT, MD · any size — text is read on your device.
            Old .ppt/.doc need a quick Save-As first.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.pptx,.docx,.txt,.md,.ppt,.doc,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              void ingestFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <form onSubmit={submitText}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste the material here — syllabus, a unit, or a past paper…"
            className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--kube)" }}
            disabled={text.trim().length < 100}
          >
            Feed Kube
          </button>
        </form>
      )}

      {lines.length > 0 && (
        <ul className="mt-4 space-y-2">
          {lines.map((l) => (
            <li key={l.key} className="flex items-start gap-2 text-sm">
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
      {anyWorking && (
        <p className="mt-3 text-xs" style={{ color: "var(--faint)" }}>
          Digestion runs on Kube&apos;s side — a unit takes a couple of minutes.
          You can close this page or put your phone away; it finishes on its
          own, and this list picks back up when you return.
        </p>
      )}

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
