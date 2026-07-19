"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Material, ChatMessage } from "@/lib/types";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export default function TutorPanel({ material }: { material: Material }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("material_id", material.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setTurns(((data as ChatMessage[]) ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })));
        setLoading(false);
      });
  }, [material.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, streaming]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || streaming) return;
    setError(null);
    setInput("");
    setTurns((t) => [
      ...t,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setStreaming(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: material.id, message }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Tutor failed to respond.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setTurns((t) => {
          const copy = [...t];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tutor failed.");
      // Drop the empty assistant placeholder on error.
      setTurns((t) =>
        t[t.length - 1]?.content === "" ? t.slice(0, -1) : t
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[65vh] flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-slate-400">Loading conversation…</p>
        ) : turns.length === 0 ? (
          <div className="mt-6 text-center text-sm text-slate-400">
            <p className="font-medium text-slate-500 dark:text-slate-300">
              Ask your tutor anything about “{material.title}”.
            </p>
            <p className="mt-1">
              e.g. “Explain the main idea simply”, “Quiz me on section 2”,
              “Why is X true?”
            </p>
          </div>
        ) : (
          turns.map((t, i) => (
            <div
              key={i}
              className={`flex ${
                t.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  t.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                {t.content ||
                  (streaming && i === turns.length - 1 ? "…" : "")}
              </div>
            </div>
          ))
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your tutor…"
          disabled={streaming}
          className="flex-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
