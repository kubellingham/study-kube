"use client";

// Feed Kube one unit's material (PDF or pasted text). The server streams
// heartbeat bytes while Claude digests it, then a RESULT line.
import { useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";

export default function AddUnit({
  courseId,
  suggestedUnit,
  existingUnits,
  onDone,
}: {
  courseId: string;
  suggestedUnit: number;
  existingUnits: number[];
  onDone: () => void;
}) {
  const [unit, setUnit] = useState(suggestedUnit);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"pdf" | "text">("pdf");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function digest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setProgress("Uploading…");
    try {
      const form = new FormData();
      form.append("courseId", courseId);
      form.append("unit", String(unit));
      if (tab === "pdf") {
        if (!file) throw new Error("Choose a PDF first.");
        form.append("file", file);
      } else {
        form.append("text", text);
      }
      const res = await authedFetch("/api/course/unit", {
        method: "POST",
        body: form,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Digestion failed.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let all = "";
      let dots = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        all += chunk;
        dots += (chunk.match(/\./g) || []).length;
        setProgress(
          `Kube is thinking through Unit ${unit}… ${"·".repeat((dots % 6) + 1)}`
        );
      }
      const match = all.match(/RESULT (\{.*\})/);
      if (!match) throw new Error("The digestion was interrupted — please try again.");
      const result = JSON.parse(match[1]) as {
        ok: boolean;
        error?: string;
        topics?: number;
        questions?: number;
      };
      if (!result.ok) throw new Error(result.error || "Digestion failed.");
      setProgress(
        `Done — ${result.topics} topics and ${result.questions} exam questions added.`
      );
      setFile(null);
      setText("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Digestion failed.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  }

  const replacing = existingUnits.includes(unit);

  return (
    <div className="k-card mt-8 px-6 py-6">
      <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
        feed kube a unit
      </span>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Upload the unit&apos;s PDF (or paste its text). Kube reads it with Claude and
        builds the topics, checks, and exam questions onto this course&apos;s ladder.
        It usually takes a couple of minutes.
      </p>

      <form onSubmit={digest} className="mt-4">
        <div className="flex items-center gap-3">
          <label className="k-eyebrow">unit number</label>
          <input
            type="number"
            min={1}
            max={20}
            value={unit}
            onChange={(e) => setUnit(parseInt(e.target.value || "1", 10))}
            className="w-20 rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
          />
          {replacing && (
            <span className="text-xs" style={{ color: "var(--amber)" }}>
              re-digesting replaces this unit
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
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
              {t === "pdf" ? "Upload PDF" : "Paste text"}
            </button>
          ))}
        </div>

        {tab === "pdf" ? (
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-sm"
            style={{ color: "var(--ink-soft)" }}
          />
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste the unit's material here…"
            className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
          />
        )}

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}
        {progress && !error && (
          <p className="mt-3 text-sm" style={{ color: "var(--kube)" }}>
            {progress}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--kube)" }}
        >
          {busy ? "Digesting…" : `Digest Unit ${unit}`}
        </button>
      </form>
    </div>
  );
}
