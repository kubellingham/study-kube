"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import type { Material, SourceType } from "@/lib/types";

const SOURCE_LABEL: Record<SourceType, string> = {
  pdf: "PDF",
  text: "Note",
  youtube: "YouTube",
  article: "Article",
};

const SOURCE_BADGE: Record<SourceType, string> = {
  pdf: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  text: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  youtube: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  article: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
};

type Tab = "pdf" | "text" | "link";

export default function DashboardClient({
  initialMaterials,
}: {
  initialMaterials: Material[];
}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let res: Response;
      if (tab === "pdf") {
        if (!file) throw new Error("Choose a PDF file first.");
        const form = new FormData();
        form.append("file", file);
        res = await fetch("/api/materials", { method: "POST", body: form });
      } else if (tab === "text") {
        res = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "text", text, title }),
        });
      } else {
        res = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "link", url }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add material.");
      setMaterials((m) => [data.material as Material, ...m]);
      setText("");
      setTitle("");
      setUrl("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add material.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this material and everything generated from it?"))
      return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("materials").delete().eq("id", id);
    if (user) {
      await supabase.storage.from("materials").remove([`${user.id}/${id}.pdf`]);
    }
    setMaterials((m) => m.filter((x) => x.id !== id));
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-lg font-semibold">Add study material</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Upload a PDF, paste your notes, or drop a YouTube / article link.
        </p>

        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {(["text", "pdf", "link"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 font-medium capitalize ${
                tab === t
                  ? "bg-white shadow dark:bg-slate-700"
                  : "text-slate-500"
              }`}
            >
              {t === "text" ? "Paste text" : t === "pdf" ? "Upload PDF" : "Paste link"}
            </button>
          ))}
        </div>

        <form onSubmit={addMaterial} className="space-y-3">
          {tab === "text" && (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your notes here…"
                rows={6}
                className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              />
            </>
          )}
          {tab === "pdf" && (
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500 dark:text-slate-300"
            />
          )}
          {tab === "link" && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…  or  https://article-url"
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
            />
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add material"}
          </button>
        </form>
      </section>

      <h2 className="mb-3 text-lg font-semibold">Your materials</h2>
      {materials.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          Nothing yet. Add your first material above to generate summaries,
          flashcards, quizzes and start tutoring.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {materials.map((m) => (
            <li
              key={m.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/materials/${m.id}`} className="min-w-0 flex-1">
                  <span
                    className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_BADGE[m.source_type]}`}
                  >
                    {SOURCE_LABEL[m.source_type]}
                  </span>
                  <p className="truncate font-medium group-hover:text-indigo-600">
                    {m.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </Link>
                <button
                  onClick={() => remove(m.id)}
                  aria-label="Delete material"
                  className="text-slate-300 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
