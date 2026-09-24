"use client";

// The persistent "Add material" surface (KUBE_INTAKE_FLOW.md Phase 2).
// Drag in any files, any number of batches. Text is extracted ON THIS DEVICE
// (so big files are fine), then Kube classifies and digests each one as a
// BACKGROUND job — closing the tab is safe; progress reattaches on return.
import { useCallback, useEffect, useRef, useState } from "react";
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
import { extractFileInBrowser, type ExtractedMaterial } from "@/lib/ingest/client-extract";
import type { IngestedFile } from "@/lib/course/types";
import type { Observation } from "@/lib/course/generate";
import {
  shelveBatch,
  listShelf,
  loadShelfContent,
  removeShelfItem,
  shelfAvailable,
  shelfSizeLabel,
  type ShelfItem,
} from "@/lib/learn/shelf";
import DigestingAnimation from "./DigestingAnimation";

type IngestMode = "fromFile" | "fromKnowledge" | "augmented";

// Cap a single upload to a sane batch — a subject can hold many files, just
// not all dropped at once (protects spend and keeps the queue readable).
const MAX_FILES_PER_UPLOAD = 5;

interface JobLine {
  key: string;
  name: string;
  state: "extracting" | "working" | "done" | "skipped" | "error" | "needs-unit";
  note: string;
  /** Present only in the "needs-unit" state: what Kube offers for the picker. */
  ask?: { suggested: number | null; units: { unit: number; title: string }[] };
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
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"files" | "text">("files");
  const [lines, setLines] = useState<JobLine[]>([]);
  // The upload waiting on the student's confirmation: Kube's read of the whole
  // batch (null read = the read call failed, so we still ask, just without it).
  const [batch, setBatch] = useState<{
    items: { name: string; extracted: ExtractedMaterial }[];
    read: Observation | null;
    /** Set when this batch was pulled back off the shelf, so the held records
     *  are cleared once their build is safely under way. */
    fromShelf?: ShelfItem[];
  } | null>(null);
  const [reading, setReading] = useState(false);
  // What Kube is holding, unbuilt, for this subject.
  const [shelf, setShelf] = useState<ShelfItem[]>([]);
  const [shelfBusy, setShelfBusy] = useState<string | null>(null);
  const [shelfError, setShelfError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [digestHidden, setDigestHidden] = useState(false);
  const unsubs = useRef<(() => void)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // Remember each submission by line key, so a "which unit?" answer can
  // re-send the very same file with the chosen unit — no re-upload needed.
  const pending = useRef<
    Record<string, { name: string; extracted: ExtractedMaterial; mode: IngestMode }>
  >({});

  useEffect(() => {
    const subs = unsubs.current;
    return () => subs.forEach((u) => u());
  }, []);

  // The shelf is durable, so it's fetched like any other saved state — this is
  // what makes "hold this, unit 2 comes Friday" survive closing the app.
  const refreshShelf = useCallback(async () => {
    if (!uid || !courseId) return;
    try {
      setShelf(await listShelf(uid, courseId));
    } catch {
      // A shelf we can't read just shows as empty; nothing is lost.
    }
  }, [uid, courseId]);

  useEffect(() => {
    if (!shelfAvailable()) return;
    let alive = true;
    (async () => {
      try {
        const items = await listShelf(uid, courseId);
        if (alive) setShelf(items);
      } catch {
        // Same as above: an unreadable shelf shows as empty.
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, courseId]);

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
        if (status === "needs-unit") {
          updateLine(key, {
            state: "needs-unit",
            note,
            ask: {
              suggested: (snap.get("suggestedUnit") as number) ?? null,
              units: (snap.get("knownUnits") as { unit: number; title: string }[]) ?? [],
            },
          });
          unsub();
          return;
        }
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

  // Reattach to this course's UNFINISHED digests — not just the ones still
  // running. A job that ended in "error" used to be filtered out entirely, so
  // a failed unit left no trace anywhere: the subject simply came back with
  // one cluster and no explanation. Anything unresolved in the last day is
  // shown, so a digest can never fail silently again.
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db(), "ingestJobs"),
            where("userId", "==", uid),
            where("courseId", "==", courseId)
          )
        );
        if (snap.empty) return;
        // A digest that fits the 300s function limit finishes (or errors)
        // within ~5 min. Anything still "working" long after that was
        // hard-killed mid-flight and will never resolve — show it as stalled.
        const STALE_MS = 15 * 60 * 1000;
        const RECENT_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const unresolved = snap.docs
          .map((d) => {
            const status = (d.get("status") as string) ?? "";
            const createdAt = (d.get("createdAt") as number) ?? now;
            const updatedAt = (d.get("updatedAt") as number) ?? createdAt;
            return { d, status, createdAt, updatedAt };
          })
          .filter(
            (j) =>
              now - j.updatedAt < RECENT_MS &&
              (j.status === "working" || j.status === "error" || j.status === "needs-unit")
          )
          .sort((a, b2) => a.createdAt - b2.createdAt);
        if (unresolved.length === 0) return;

        setLines((prev) => [
          ...prev,
          ...unresolved.map(({ d, status, updatedAt }) => {
            const name = (d.get("fileName") as string) ?? "file";
            const note = (d.get("note") as string) ?? "";
            if (status === "error") {
              return { key: d.id, name, state: "error" as JobLine["state"], note: note || "This one didn't finish." };
            }
            if (status === "needs-unit") {
              return {
                key: d.id,
                name,
                state: "error" as JobLine["state"],
                note: `${note || "Kube couldn't tell which unit this was."} Add the file again to choose its unit.`,
              };
            }
            const stale = now - updatedAt > STALE_MS;
            return {
              key: d.id,
              name,
              state: (stale ? "error" : "working") as JobLine["state"],
              note: stale
                ? "This one got stuck and stopped — add the file again, or try a smaller one."
                : note || "Kube is working…",
            };
          }),
        ]);

        unresolved.forEach(({ d, status, updatedAt }) => {
          if (status === "working" && now - updatedAt <= STALE_MS) watchJob(d.id, d.id);
        });
      } catch {
        // No visible jobs — fine.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, uid]);

  /** Send one file to be built. Returns true when the build is under way (or
   *  the file was already known) — the shelf only lets go of material once one
   *  of those is true. */
  async function submitOne(
    key: string,
    name: string,
    extracted: ExtractedMaterial,
    mode: IngestMode,
    unit?: number | "extras"
  ): Promise<boolean> {
    // Keep the payload so a "which unit?" answer can re-send it as-is.
    pending.current[key] = { name, extracted, mode };
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
          ...(unit ? { unit } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Digestion failed.");
      if (data.skipped) {
        updateLine(key, { state: "skipped", note: data.note });
        return true;
      }
      updateLine(key, { state: "working", note: mode === "fromKnowledge" ? "Building your ladder from the outline…" : "Kube is reading it…", ask: undefined });
      watchJob(data.jobId as string, key);
      return true;
    } catch (err) {
      updateLine(key, {
        state: "error",
        note: err instanceof Error ? err.message : "Digestion failed.",
      });
      return false;
    }
  }

  /** The student answered "which unit?": re-send the same file with it set. */
  function resubmitWithUnit(key: string, unit: number | "extras") {
    const p = pending.current[key];
    if (!p) return;
    updateLine(key, {
      state: "working",
      note: unit === "extras" ? "Filing into Extras…" : `Filing as Unit ${unit}…`,
      ask: undefined,
    });
    void submitOne(key, p.name, p.extracted, p.mode, unit);
  }

  // Take in a whole batch: extract every file on-device, then have Kube read
  // the SET once and confirm before anything is built. One upload, one
  // conversation — not a card per document.
  async function intake(items: { name: string; extracted: ExtractedMaterial }[]) {
    if (items.length === 0) return;
    setReading(true);
    setBatch(null);
    try {
      const res = await authedFetch("/api/course/observe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          files: items.map((it) => ({
            name: it.name,
            text: it.extracted.text,
            images: it.extracted.images,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.read) throw new Error(data.error || "read failed");
      setBatch({ items, read: data.read as Observation });
    } catch {
      // Couldn't read it — offer the choice anyway rather than deciding for them.
      setBatch({ items, read: null });
    } finally {
      setReading(false);
    }
  }

  /** The student answered the one question: build from the documents as they
   *  are, or let Kube's own knowledge fill their gaps. */
  async function proceed(useKnowledge: boolean) {
    if (!batch) return;
    const items = batch.items;
    const held = batch.fromShelf ?? [];
    setBatch(null);
    setDigestHidden(false);
    const lines: JobLine[] = items.map((it, i) => ({
      key: `${Date.now()}-${i}-${it.name}`,
      name: it.name,
      state: "working",
      note: "Starting…",
    }));
    setLines((prev) => [...prev, ...lines]);
    for (let i = 0; i < items.length; i++) {
      const ok = await submitOne(
        lines[i].key,
        items[i].name,
        items[i].extracted,
        useKnowledge ? "augmented" : "fromFile"
      );
      // Only material whose build actually started leaves the shelf. If the
      // send failed, it stays held — losing someone's file because a request
      // didn't go through is not an option.
      const source = held[i];
      if (ok && source) await removeShelfItem(source).catch(() => {});
    }
    if (held.length > 0) await refreshShelf();
  }

  /** Hold this upload instead of building it — Kube keeps it until you say go. */
  async function holdBatch() {
    if (!batch) return;
    setShelfBusy("hold");
    setShelfError(null);
    try {
      await shelveBatch(uid, courseId, batch.items, batch.read);
      setBatch(null);
      await refreshShelf();
    } catch {
      setShelfError("Couldn't put that on the shelf — check your connection and try again.");
    } finally {
      setShelfBusy(null);
    }
  }

  /** Take held material back off the shelf and ask the build question about it,
   *  exactly as if it had just been dropped in. */
  async function buildFromShelf(items: ShelfItem[]) {
    if (items.length === 0) return;
    setShelfBusy(items.length === 1 ? items[0].id : "all");
    setShelfError(null);
    try {
      const loaded = await Promise.all(
        items.map(async (it) => ({ name: it.name, extracted: await loadShelfContent(it) }))
      );
      setBatch({ items: loaded, read: items[0].read ?? null, fromShelf: items });
    } catch (err) {
      setShelfError(err instanceof Error ? err.message : "Couldn't load that from your shelf.");
    } finally {
      setShelfBusy(null);
    }
  }

  /** Take something off the shelf for good. */
  async function dropFromShelf(item: ShelfItem) {
    setShelfBusy(item.id);
    setShelfError(null);
    try {
      await removeShelfItem(item);
      await refreshShelf();
    } catch {
      setShelfError(`Couldn't remove "${item.name}" — try again.`);
    } finally {
      setShelfBusy(null);
    }
  }

  async function ingestFiles(picked: File[]) {
    if (picked.length === 0) return;
    // One upload = up to MAX_FILES_PER_UPLOAD; the rest wait for another batch.
    const overflow = picked.length > MAX_FILES_PER_UPLOAD;
    if (overflow) picked = picked.slice(0, MAX_FILES_PER_UPLOAD);
    const extractKeys: JobLine[] = picked.map((f, i) => ({
      key: `${Date.now()}-x${i}-${f.name}`,
      name: f.name,
      state: "extracting",
      note: "Reading the file on your device…",
    }));
    if (overflow) {
      extractKeys.unshift({
        key: `${Date.now()}-overflow`,
        name: "Heads up",
        state: "skipped",
        note: `Up to ${MAX_FILES_PER_UPLOAD} files per upload — took the first ${MAX_FILES_PER_UPLOAD}; add the rest in another batch.`,
      });
    }
    setLines((prev) => [...prev, ...extractKeys]);

    const items: { name: string; extracted: ExtractedMaterial }[] = [];
    for (let i = 0; i < picked.length; i++) {
      const key = extractKeys[overflow ? i + 1 : i].key;
      try {
        const extracted = await extractFileInBrowser(picked[i]);
        items.push({ name: picked[i].name, extracted });
        // Extraction is local plumbing — drop the line once it's done so the
        // batch card is the only thing asking for attention.
        setLines((ls) => ls.filter((l) => l.key !== key));
      } catch (err) {
        updateLine(key, {
          state: "error",
          note: err instanceof Error ? err.message : "Could not read this file.",
        });
      }
    }
    await intake(items);
  }

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 100) return;
    const pasted = text;
    setText("");
    await intake([{ name: "pasted text", extracted: { text: pasted, images: [] } }]);
  }

  // The full-screen digesting animation is only for the real (server) build —
  // not the on-device extract or the read/choose conversation.
  const anyWorking = lines.some((l) => l.state === "working");
  // A pending "which unit?" question must never sit behind the digest overlay.
  const anyNeedsUnit = lines.some((l) => l.state === "needs-unit");

  return (
    <>
    {anyWorking && !digestHidden && !anyNeedsUnit && (
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

      {reading && (
        <div className="mt-4 flex items-center gap-2.5 text-sm" style={{ color: "var(--ink-soft)" }}>
          <span
            className="inline-block h-3.5 w-3.5 rounded-full border-2"
            style={{ borderColor: "var(--kube-line)", borderTopColor: "var(--kube)", animation: "k-spin .8s linear infinite" }}
          />
          Kube is reading your material…
        </div>
      )}

      {shelf.length > 0 && (
        <Shelf
          items={shelf}
          busy={shelfBusy}
          onBuild={buildFromShelf}
          onDrop={dropFromShelf}
        />
      )}

      {shelfError && (
        <p className="mt-3 text-xs font-semibold" style={{ color: "var(--red)" }}>
          {shelfError}
        </p>
      )}

      {batch && (
        <BatchCard
          names={batch.items.map((i) => i.name)}
          read={batch.read}
          fromShelf={!!batch.fromShelf}
          canHold={shelfAvailable()}
          holding={shelfBusy === "hold"}
          onChoose={proceed}
          onHold={holdBatch}
          onCancel={() => setBatch(null)}
        />
      )}

      {lines.length > 0 && (
        <div className="mt-4 space-y-3">
          {lines.map((l) =>
            l.state === "needs-unit" ? (
              <UnitPicker
                key={l.key}
                name={l.name}
                note={l.note}
                ask={l.ask}
                onPick={(u) => resubmitWithUnit(l.key, u)}
              />
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

// THE SHELF — what Kube is holding, unbuilt. It exists so a student whose
// lecturer hands out one unit at a time isn't forced to build each one the
// moment it arrives: hold unit 1, add unit 2 on Friday, build them together.
// Files that arrived in the same upload stay grouped under Kube's read of it.
function Shelf({
  items,
  busy,
  onBuild,
  onDrop,
}: {
  items: ShelfItem[];
  busy: string | null;
  onBuild: (items: ShelfItem[]) => void;
  onDrop: (item: ShelfItem) => void;
}) {
  // One row of "Kube's read" per upload, not per file.
  const groups: { batchId: string; read: Observation | null; items: ShelfItem[] }[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last.batchId === it.batchId) last.items.push(it);
    else groups.push({ batchId: it.batchId, read: it.read ?? null, items: [it] });
  }

  return (
    <div
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--line)", background: "var(--bg-deep)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
          on the shelf · {items.length}
        </span>
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onBuild(items)}
            disabled={busy !== null}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--kube)" }}
          >
            {busy === "all" ? "Loading…" : `Build all ${items.length}`}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Kube is holding this material and hasn&apos;t built it yet. It stays here
        until you say go — add the rest of your units whenever they come, and
        nothing is read twice.
      </p>

      <div className="mt-3 space-y-3">
        {groups.map((g) => (
          <div key={g.batchId}>
            {g.read?.whatItIs && (
              <p className="text-xs italic" style={{ color: "var(--faint)", lineHeight: 1.5 }}>
                {g.read.whatItIs}
              </p>
            )}
            <div className="mt-1.5 space-y-1.5">
              {g.items.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: "var(--line)", background: "var(--card)" }}
                >
                  <span className="min-w-0 flex-1 text-sm" style={{ color: "var(--ink)" }}>
                    <span className="font-semibold">{it.name}</span>
                    <span className="ml-2 text-[11px]" style={{ color: "var(--faint)" }}>
                      {shelfSizeLabel(it)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onBuild([it])}
                    disabled={busy !== null}
                    className="rounded-lg border px-3 py-1 text-xs font-semibold disabled:opacity-60"
                    style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--kube-soft)" }}
                  >
                    {busy === it.id ? "…" : "Build this"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDrop(it)}
                    disabled={busy !== null}
                    className="text-xs font-semibold disabled:opacity-60"
                    style={{ color: "var(--faint)" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// The one question Kube asks only when it genuinely can't tell which unit a
// file is: pick it, and the same file re-files itself under that unit.
function UnitPicker({
  name,
  note,
  ask,
  onPick,
}: {
  name: string;
  note: string;
  ask?: { suggested: number | null; units: { unit: number; title: string }[] };
  onPick: (unit: number | "extras") => void;
}) {
  const titleByUnit = new Map((ask?.units ?? []).map((u) => [u.unit, u.title]));
  const nums = new Set<number>();
  for (let i = 1; i <= 6; i++) nums.add(i);
  for (const u of ask?.units ?? []) nums.add(u.unit);
  if (ask?.suggested) nums.add(ask.suggested);
  const options = [...nums].sort((a, b) => a - b);

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: "var(--amber-line)", background: "var(--amber-soft)" }}
    >
      <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        Which unit is this?
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}>
        {name}
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
        {note}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((u) => {
          const isSuggested = u === ask?.suggested;
          const title = titleByUnit.get(u);
          return (
            <button
              key={u}
              type="button"
              onClick={() => onPick(u)}
              title={title || `Unit ${u}`}
              className="rounded-xl border px-3 py-1.5 text-sm font-semibold"
              style={{
                borderColor: isSuggested ? "var(--kube)" : "var(--line)",
                background: isSuggested ? "var(--kube-soft)" : "var(--card)",
                color: isSuggested ? "var(--kube)" : "var(--ink)",
              }}
            >
              {u}
              {isSuggested ? " ·" : ""}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPick("extras")}
          title="Park it in Extras — taught, but outside the ordered units"
          className="rounded-xl border px-3 py-1.5 text-sm font-semibold"
          style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink-soft)" }}
        >
          Not a unit — Extras
        </button>
      </div>
      {ask?.units && ask.units.length > 0 && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--faint)" }}>
          Known units: {ask.units.map((u) => `${u.unit} ${u.title}`).join(" · ")}
        </p>
      )}
    </div>
  );
}

// Kube's read of the WHOLE upload, and the one question that follows it:
// build from these documents as they are, or let Kube's own knowledge fill
// their gaps. Two options, because that is the only real decision here.
function BatchCard({
  names,
  read,
  fromShelf,
  canHold,
  holding,
  onChoose,
  onHold,
  onCancel,
}: {
  names: string[];
  read: Observation | null;
  /** This batch came back off the shelf, so there's nothing left to hold. */
  fromShelf: boolean;
  /** False when this deployment has no shelf at all — then the offer is hidden
   *  rather than shown and failed. */
  canHold: boolean;
  holding: boolean;
  onChoose: (useKnowledge: boolean) => void;
  onHold: () => void;
  onCancel: () => void;
}) {
  const augmentedFirst = read?.recommend === "augmented";
  const asIs = (
    <button
      key="asis"
      type="button"
      onClick={() => onChoose(false)}
      className="block w-full rounded-xl px-4 py-3 text-left"
      style={
        augmentedFirst
          ? { border: "1px solid var(--kube-line)", background: "var(--card)" }
          : { background: "var(--kube)", boxShadow: "0 3px 0 rgba(20,32,43,.16)" }
      }
    >
      <span
        className="block text-sm font-semibold"
        style={{ color: augmentedFirst ? "var(--kube)" : "#fff" }}
      >
        Build from these documents
      </span>
      <span
        className="mt-0.5 block text-xs"
        style={{ color: augmentedFirst ? "var(--faint)" : "rgba(255,255,255,0.85)" }}
      >
        Only what&apos;s in your material — nothing added.
      </span>
    </button>
  );
  const augmented = (
    <button
      key="aug"
      type="button"
      onClick={() => onChoose(true)}
      className="block w-full rounded-xl px-4 py-3 text-left"
      style={
        augmentedFirst
          ? { background: "var(--kube)", boxShadow: "0 3px 0 rgba(20,32,43,.16)" }
          : { border: "1px solid var(--kube-line)", background: "var(--card)" }
      }
    >
      <span
        className="block text-sm font-semibold"
        style={{ color: augmentedFirst ? "#fff" : "var(--kube)" }}
      >
        These documents + Kube&apos;s knowledge
      </span>
      <span
        className="mt-0.5 block text-xs"
        style={{ color: augmentedFirst ? "rgba(255,255,255,0.85)" : "var(--faint)" }}
      >
        Your material leads; Kube fills the gaps it leaves.
      </span>
    </button>
  );

  return (
    <div
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--kube-line)", background: "var(--kube-soft)" }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md"
          style={{ background: "var(--kube)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}
        >
          K
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {read?.whatItIs ?? `${names.length} file${names.length === 1 ? "" : "s"} ready — how should Kube build this?`}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}>
            {names.join(" · ")}
          </div>
        </div>
      </div>

      {read?.observations && read.observations.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {read.observations.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.45 }}>
              <span aria-hidden style={{ color: "var(--kube)", marginTop: 2 }}>·</span>
              {o}
            </li>
          ))}
        </ul>
      )}

      {read?.note && (
        <p className="mt-2.5 text-xs italic" style={{ color: "var(--faint)", lineHeight: 1.5 }}>
          {read.note}
        </p>
      )}

      <div className="mt-3.5 space-y-2.5">
        {augmentedFirst ? [augmented, asIs] : [asIs, augmented]}
      </div>

      {/* The third answer, and the reason the shelf exists: the rest of the
          course hasn't been handed out yet. Kube holds this until it has. */}
      {!fromShelf && canHold && (
        <button
          type="button"
          onClick={onHold}
          disabled={holding}
          className="mt-2.5 block w-full rounded-xl px-4 py-2.5 text-left disabled:opacity-60"
          style={{ border: "1px dashed var(--kube-line)", background: "transparent" }}
        >
          <span className="block text-sm font-semibold" style={{ color: "var(--kube)" }}>
            {holding ? "Putting it on the shelf…" : "Hold it — more is coming"}
          </span>
          <span className="mt-0.5 block text-xs" style={{ color: "var(--faint)" }}>
            Kube keeps this unbuilt until you say go. Add the next unit whenever
            you get it, then build them together.
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="mt-2.5 text-xs font-semibold"
        style={{ color: "var(--faint)" }}
      >
        {fromShelf ? "Leave it on the shelf" : "Not now — remove"}
      </button>
    </div>
  );
}
