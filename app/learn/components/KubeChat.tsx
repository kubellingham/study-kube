"use client";

// In-lesson Kube chat, baby-steps edition. Vague question → Kube offers
// sample questions to locate the exact snag (plus a built-in "walk me
// through all of it"). Specific question → the answer arrives as preloaded
// tiny beats, revealed one "Okay" at a time — nobody gets a wall of text.
// Strictly lesson-scoped; conversation lives with the parent, one per slide.
import { useEffect, useRef, useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";
import Rich, { RichInline } from "@/app/learn/components/Rich";

export interface KubeChatContext {
  courseTitle: string;
  topicTitle: string;
  lessonTitle: string;
  /** The full text of the lesson's steps — Kube's whole world. */
  lessonContent: string;
  /** Titles of topics already climbed, for backward references only. */
  coveredSoFar: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  /** Full text — what history and the struggle notes see. */
  content: string;
  /** assistant: baby-step beats, revealed one at a time. */
  beats?: string[];
  revealed?: number;
  /** assistant: clarify chips — sample questions to locate the snag. */
  intro?: string;
  options?: string[];
  pending?: boolean;
}

const WALK_ME_THROUGH = "Just walk me through all of it, slowly.";

export default function KubeChat({
  open,
  onClose,
  context,
  seed,
  turns,
  onTurns,
}: {
  open: boolean;
  onClose: () => void;
  context: KubeChatContext;
  /** Optional first question to pre-fill (e.g. after a review miss). */
  seed?: string;
  /** Conversation state lives with the PARENT, scoped to one slide — moving
   *  to a new slide starts a fresh chat; stepping back restores the old one. */
  turns: ChatTurn[];
  onTurns: (updater: (prev: ChatTurn[]) => ChatTurn[]) => void;
}) {
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
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, open]);

  async function send(questionRaw?: string) {
    const question = (questionRaw ?? input).trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    const history = turns.map((t) => ({ role: t.role, content: t.content }));
    onTurns((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "", pending: true },
    ]);
    try {
      const res = await authedFetch("/api/learn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...context, history, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error || "Kube couldn't answer just now.");
      onTurns((prev) => {
        const next = [...prev];
        if (data.kind === "clarify") {
          next[next.length - 1] = {
            role: "assistant",
            content: `${data.intro ?? ""}\n${(data.options as string[]).join("\n")}`.trim(),
            intro: data.intro ?? "Let's find the exact snag —",
            options: data.options as string[],
          };
        } else {
          const beats = (data.beats as string[]) ?? [];
          next[next.length - 1] = {
            role: "assistant",
            content: beats.join("\n\n"),
            beats,
            revealed: 1,
          };
        }
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kube couldn't answer just now.";
      onTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: message, beats: [message], revealed: 1 };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  function revealNext(turnIdx: number) {
    onTurns((prev) => {
      const next = [...prev];
      const t = next[turnIdx];
      if (t?.beats && (t.revealed ?? 0) < t.beats.length) {
        next[turnIdx] = { ...t, revealed: (t.revealed ?? 0) + 1 };
      }
      return next;
    });
  }

  if (!open) return null;

  const lastIdx = turns.length - 1;

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
              Stuck on this slide? Ask anything about it — Kube breaks it down,
              one small step at a time. (Later circles stay a surprise.)
            </p>
          )}
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div
                key={i}
                className="ml-8 rounded-2xl px-4 py-2.5 text-sm"
                style={{ background: "var(--kube-soft)", color: "var(--ink)" }}
              >
                {t.content}
              </div>
            ) : t.pending ? (
              <p key={i} className="text-sm" style={{ color: "var(--faint)" }}>
                Kube is thinking…
              </p>
            ) : t.options ? (
              /* Clarify: locate the snag before any teaching happens. */
              <div key={i} className="mr-4 space-y-2">
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  <RichInline text={t.intro ?? ""} />
                </p>
                <div className="flex flex-col gap-2">
                  {[...t.options, WALK_ME_THROUGH].map((opt, oi) => (
                    <button
                      key={oi}
                      disabled={busy || i !== lastIdx}
                      onClick={() => void send(opt)}
                      className="rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50"
                      style={{
                        borderColor: "var(--kube-line)",
                        color: "var(--kube)",
                        background: "var(--card)",
                      }}
                    >
                      <RichInline text={opt} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Answer: preloaded beats, revealed at the student's pace. */
              <div key={i} className="mr-4 space-y-3">
                {(t.beats ?? [t.content]).slice(0, t.revealed ?? 1).map((beat, bi) => (
                  <div
                    key={bi}
                    className={bi === (t.revealed ?? 1) - 1 ? "k-rise" : undefined}
                    style={{ color: "var(--ink-soft)" }}
                  >
                    <Rich body={beat} />
                  </div>
                ))}
                {t.beats && (t.revealed ?? 1) < t.beats.length && (
                  <button
                    onClick={() => revealNext(i)}
                    className="rounded-2xl px-5 py-2 text-sm font-semibold text-white"
                    style={{ background: "var(--kube)" }}
                  >
                    Okay →
                  </button>
                )}
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
