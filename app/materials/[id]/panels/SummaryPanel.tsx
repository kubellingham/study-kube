"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Material, SummaryContent } from "@/lib/types";

export default function SummaryPanel({ material }: { material: Material }) {
  const [content, setContent] = useState<SummaryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("summaries")
      .select("content")
      .eq("material_id", material.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setContent(data.content as SummaryContent);
        setLoading(false);
      });
  }, [material.id]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: material.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary.");
      setContent(data.summary.content as SummaryContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Skeleton />;

  if (!content) {
    return (
      <Empty
        title="No summary yet"
        description="Generate a clear summary and the key concepts from this material."
        actionLabel={busy ? "Generating…" : "Generate summary"}
        onAction={generate}
        busy={busy}
        error={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={generate}
          disabled={busy}
          className="text-sm text-slate-500 hover:text-indigo-600 disabled:opacity-60"
        >
          {busy ? "Regenerating…" : "↻ Regenerate"}
        </button>
      </div>

      <article className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-900">
        {content.summary}
      </article>

      {content.key_concepts.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Key concepts
          </h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {content.key_concepts.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <dt className="font-semibold text-indigo-600">{c.term}</dt>
                <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {c.explanation}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-24 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function Empty({
  title,
  description,
  actionLabel,
  onAction,
  busy,
  error,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <button
        onClick={onAction}
        disabled={busy}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {actionLabel}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
