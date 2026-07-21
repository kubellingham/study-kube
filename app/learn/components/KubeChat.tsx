"use client";

// In-lesson Kube chat: a bottom sheet available on every slide. Strictly
// lesson-scoped — the server prompt only knows THIS lesson (and earlier
// topic titles), so questions about later rungs get a warm "you'll see it
// coming". Conversation is ephemeral: it lives for this lesson sitting.
import { useEffect, useRef, useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";
import Rich from "@/app/learn/components/Rich";

export interface KubeChatContext {
  courseTitle: string;
  topicTitle: string;
  lessonTitle: string;
  /** The full text of the lesson's steps — Kube's whole world. */
  lessonContent: string;
  /** Titles of topics already climbed, for backward references only. */
  coveredSoFar: string;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export default function KubeChat({
  open,
  onClose,
  context,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  context: KubeChatContext;
  /** Optional first question to pre-fill (e.g. after a review miss). */
  seed?: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  const seededFor = useRef<string | null>(null);

  useEffect(() => {
    if (open && seed && seededFor.current !== seed) {
      seededFor.current = seed;
      setInput(seed);
    }
  }, [open, seed]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [turns, open]);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    const history = turns;
    setTurns((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);
    try {
      const res = await authedFetch("/api/learn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...context, history, question }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Kube couldn't answer just now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setTurns((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: snapshot };
          return next;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kube couldn't answer just now.";
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: message };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-label="Ask Kube">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(15, 23, 42, 0.45)" }}
      />
      <div
        className="k-rise relative mx-auto flex w-full max-w-lg flex-col rounded-t-3xl border px-4 pb-4 pt-3"
        style={{ background: "var(--card)", borderColor: "var(--line)", maxHeight: "78dvh" }}
      >
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
            ask Kube · this lesson only
          </span>
          <button onClick={onClose} className="text-xs" style={{ color: "var(--faint)" }}>
            close
          </button>
        </div>
        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
          {turns.length === 0 && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--faint)" }}>
              Stuck on this slide? Ask anything about it — Kube explains it
              another way. (Anything from later circles stays a surprise.)
            </p>
          )}
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="ml-8 rounded-2xl px-4 py-2.5 text-sm" style={{ background: "var(--kube-soft)", color: "var(--ink)" }}>
                {t.content}
              </div>
            ) : (
              <div key={i} className="mr-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {t.content ? <Rich body={t.content} /> : <span style={{ color: "var(--faint)" }}>Kube is thinking…</span>}
              </div>
            )
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="mt-2 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this slide…"
            className="min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--kube)" }}
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
