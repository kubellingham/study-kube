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
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";
import { extractFileInBrowser, type ExtractedMaterial } from "@/lib/ingest/client-extract";
import type { IngestedFile } from "@/lib/course/types";
import type { Observation } from "@/lib/course/generate";
import { useEntitlement } from "@/lib/use-entitlement";
import DigestingAnimation from "./DigestingAnimation";

type IngestMode = "fromFile" | "fromKnowledge";

// Cap a single upload to a sane batch — a subject can hold many files, just
// not all dropped at once (protects spend and keeps the queue readable).
const MAX_FILES_PER_UPLOAD = 5;

interface JobLine {
  key: string;
  name: string;
  state: "extracting" | "reading" | "choose" | "confirm" | "working" | "done" | "skipped" | "error";
  note: string;
  read?: Observation;
  extracted?: ExtractedMaterial;
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
  courseTitle = "",
}: {
  courseId: string;
  uid: string;
  files: IngestedFile[];
  onDone: () => void;
  invitation: boolean;
  courseTitle?: string;
}) {
  const { entitlement } = useEntitlement();
  const isClimbOnly = entitlement?.tier === "climb";

  const [text, setText] = useState("");
  const [tab, setTab] = useState<"files" | "text">("files");
  const [lines, setLines] = useState<JobLine[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [digestHidden, setDigestHidden] = useState(false);
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
        // A digest that fits the 300s function limit finishes (or errors) within
        // ~5 min. Anything still "working" long after that was hard-killed
        // mid-flight and will never resolve — show it as stalled, not eternal.
        const STALE_MS = 15 * 60 * 1000;
        const now = Date.now();
        setLines((prev) => [
          ...prev,
          ...snap.docs.map((d) => {
            const updatedAt = (d.get("updatedAt") as number) ?? (d.get("createdAt") as number) ?? now;
            const stale = now - updatedAt > STALE_MS;
            return {
              key: d.id,
              name: (d.get("fileName") as string) ?? "file",
              state: (stale ? "error" : "working") as JobLine["state"],
              note: stale
                ? "This one got stuck and stopped — delete the subject (or make a fresh one) and try a smaller file."
                : (d.get("note") as string) ?? "Kube is working…",
            };
          }),
        ]);
        snap.docs.forEach((d) => {
          const updatedAt = (d.get("updatedAt") as number) ?? (d.get("createdAt") as number) ?? now;
          if (now - updatedAt <= STALE_MS) watchJob(d.id, d.id);
        });
      } catch {
        // No running jobs visible — fine.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, uid]);

  async function submitOne(key: string, name: string, extracted: ExtractedMaterial, mode: IngestMode) {
    try {
      const res = await authedFetch("/api/course/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          name,
          text: extracted.text,
          images: extracted.images,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Digestion failed.");
      if (data.skipped) {
        updateLine(key, { state: "skipped", note: data.note });
        return;
      }
      updateLine(key, { state: "working", note: mode === "fromKnowledge" ? "Building your ladder from the outline…" : "Kube is reading it…" });
      watchJob(data.jobId as string, key);
    } catch (err) {
      updateLine(key, {
        state: "error",
        note: err instanceof Error ? err.message : "Digestion failed.",
      });
    }
  }

  // Kube's "read": look at the file first and hand the student the wheel. If the
  // read call fails, fall back to digesting it straight (never block the user).
  async function observe(key: string, name: string, extracted: ExtractedMaterial) {
    updateLine(key, { state: "reading", note: "Kube is taking a look…" });
    try {
      const res = await authedFetch("/api/course/observe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseTitle, name, text: extracted.text, images: extracted.images }),
      });
      const data = await res.json();
      if (!res.ok || !data.read) throw new Error(data.error || "read failed");
      updateLine(key, { state: "choose", note: "", read: data.read as Observation, extracted });
    } catch {
      // Couldn't read it — just digest as content.
      await submitOne(key, name, extracted, "fromFile");
    }
  }

  // After a file is read on-device, hand off by tier. Climb gets a simple
  // confirm-first, cram-vs-deep card (no AI read call — cheaper, and Climb only
  // ever distills). Summit gets Kube's full read with its options.
  async function intake(key: string, name: string, extracted: ExtractedMaterial) {
    if (isClimbOnly) {
      updateLine(key, { state: "confirm", note: "", extracted });
    } else {
      await observe(key, name, extracted);
    }
  }

  function dropLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  // Act on a read's chosen option.
  async function proceed(line: JobLine, action: "build_from_knowledge" | "digest_as_content" | "add_material_first") {
    if (!line.extracted) return;
    if (action === "add_material_first") {
      updateLine(line.key, { state: "skipped", note: "Set aside — add more material, then come back to it.", read: undefined });
      return;
    }
    setDigestHidden(false);
    updateLine(line.key, { state: "working", note: "Starting…", read: undefined });
    await submitOne(line.key, line.name, line.extracted, action === "build_from_knowledge" ? "fromKnowledge" : "fromFile");
  }

  async function ingestFiles(picked: File[]) {
    if (picked.length === 0) return;
    // One upload = up to MAX_FILES_PER_UPLOAD; the rest wait for another batch.
    const overflow = picked.length > MAX_FILES_PER_UPLOAD;
    if (overflow) picked = picked.slice(0, MAX_FILES_PER_UPLOAD);
    const batch: JobLine[] = picked.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      state: "extracting",
      note: "Reading the file on your device…",
    }));
    if (overflow) {
      batch.unshift({
        key: `${Date.now()}-overflow`,
        name: "Heads up",
        state: "skipped",
        note: `Up to ${MAX_FILES_PER_UPLOAD} files per upload — took the first ${MAX_FILES_PER_UPLOAD}; add the rest in another batch.`,
      });
    }
    setLines((prev) => [...prev, ...batch]);
    for (let i = 0; i < picked.length; i++) {
      const key = batch[i].key;
      try {
        const extracted = await extractFileInBrowser(picked[i]);
        await intake(key, picked[i].name, extracted);
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
      { key, name: "pasted text", state: "extracting", note: "Kube is taking a look…" },
    ]);
    await intake(key, "pasted text", { text, images: [] });
    setText("");
  }

  // The full-screen digesting animation is only for the real (server) build —
  // not the on-device extract or the read/choose conversation.
  const anyWorking = lines.some((l) => l.state === "working");

  return (
    <>
    {anyWorking && !digestHidden && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 180,
          background: "rgba(238,241,244,0.96)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <DigestingAnimation accent="#1f6f6b" />
        </div>
        <button
          type="button"
          onClick={() => setDigestHidden(true)}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            zIndex: 2,
            border: "1px solid #b4d8d5",
            background: "#ffffff",
            color: "#1f6f6b",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Keep working in the background →
        </button>
      </div>
    )}
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
            PDF, PPT(X), DOC(X), XLSX, images, TXT, MD · any size — read on
            your device. Scanned PDFs and picture-heavy slides work too: Kube
            looks at the images.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.pptx,.potx,.docx,.dotx,.xlsx,.xltx,.txt,.md,.csv,.ppt,.doc,.png,.jpg,.jpeg,.webp,.gif,.bmp,application/pdf,image/*"
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
        <div className="mt-4 space-y-3">
          {lines.map((l) =>
            l.state === "confirm" ? (
              <ConfirmCard key={l.key} line={l} onBreakdown={(ln) => proceed(ln, "digest_as_content")} onCancel={dropLine} />
            ) : l.state === "choose" && l.read ? (
              <ReadCard key={l.key} line={l} read={l.read} onChoose={proceed} />
            ) : (
              <div key={l.key} className="flex items-start gap-2 text-sm">
                <span aria-hidden>
                  {l.state === "done" ? "✓" : l.state === "error" ? "✕" : l.state === "skipped" ? "▸" : "…"}
                </span>
                <span style={{ color: l.state === "error" ? "var(--red)" : l.state === "done" ? "var(--kube)" : "var(--ink-soft)" }}>
                  <span className="font-semibold">{l.name}:</span> {l.note}
                </span>
              </div>
            )
          )}
        </div>
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
    </>
  );
}

// Climb's confirm-first, cram-vs-deep card. The friction ("confirm this file")
// and the tier question ("break it down, or upgrade for deep teaching") in one.
function ConfirmCard({
  line,
  onBreakdown,
  onCancel,
}: {
  line: JobLine;
  onBreakdown: (line: JobLine) => void;
  onCancel: (key: string) => void;
}) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--kube-line)", background: "var(--kube-soft)" }}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md" style={{ background: "var(--kube)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>K</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>How should Kube handle this?</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}>{line.name}</div>
        </div>
      </div>

      <div className="mt-3.5 space-y-2.5">
        <button
          type="button"
          onClick={() => onBreakdown(line)}
          className="block w-full rounded-xl px-4 py-3 text-left"
          style={{ background: "var(--kube)", boxShadow: "0 3px 0 rgba(20,32,43,.16)" }}
        >
          <span className="block text-sm font-semibold text-white">Break it down for cramming</span>
          <span className="mt-0.5 block text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>Notes, flashcards, matching &amp; mock exams from this file.</span>
        </button>
        <Link
          href="/learn/upgrade"
          className="block w-full rounded-xl border px-4 py-3 text-left"
          style={{ borderColor: "var(--kube-line)", background: "var(--card)" }}
        >
          <span className="block text-sm font-semibold" style={{ color: "var(--kube)" }}>Deep digest — teach me it →</span>
          <span className="mt-0.5 block text-xs" style={{ color: "var(--faint)" }}>Full step-by-step lessons that teach every concept. Summit.</span>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => onCancel(line.key)}
        className="mt-2.5 text-xs font-semibold"
        style={{ color: "var(--faint)" }}
      >
        Not this one — remove
      </button>
    </div>
  );
}

// Kube's read of one uploaded file, with the student's options. This is the
// "someone to talk to when a file lands" surface.
function ReadCard({
  line,
  read,
  onChoose,
}: {
  line: JobLine;
  read: Observation;
  onChoose: (line: JobLine, action: "build_from_knowledge" | "digest_as_content" | "add_material_first") => void;
}) {
  const alts = (read.altActions || []).filter((a) => a.id !== read.primaryAction).slice(0, 2);
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--kube-line)", background: "var(--kube-soft)" }}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md" style={{ background: "var(--kube)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>K</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{read.whatItIs}</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}>{line.name}</div>
        </div>
      </div>

      {read.observations?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {read.observations.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.45 }}>
              <span aria-hidden style={{ color: "var(--kube)", marginTop: 2 }}>·</span>
              {o}
            </li>
          ))}
        </ul>
      )}

      {read.note && (
        <p className="mt-2.5 text-xs italic" style={{ color: "var(--faint)", lineHeight: 1.5 }}>{read.note}</p>
      )}

      <div className="mt-3.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose(line, read.primaryAction)}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--kube)", boxShadow: "0 3px 0 rgba(20,32,43,.16)" }}
        >
          {read.primaryLabel}
        </button>
        {alts.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChoose(line, a.id)}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--card)" }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
