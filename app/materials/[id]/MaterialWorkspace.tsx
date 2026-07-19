"use client";

import { useState } from "react";
import Link from "next/link";
import type { Material } from "@/lib/types";
import SummaryPanel from "./panels/SummaryPanel";
import FlashcardsPanel from "./panels/FlashcardsPanel";
import QuizPanel from "./panels/QuizPanel";
import TutorPanel from "./panels/TutorPanel";

type Tab = "summary" | "flashcards" | "quiz" | "tutor";

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
  { id: "tutor", label: "Tutor" },
];

export default function MaterialWorkspace({
  material,
  uid,
}: {
  material: Material;
  uid: string;
}) {
  const [tab, setTab] = useState<Tab>("summary");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-indigo-600"
        >
          ← All materials
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {material.title}
        </h1>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 font-medium ${
              tab === t.id ? "bg-white shadow dark:bg-slate-700" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && <SummaryPanel material={material} />}
      {tab === "flashcards" && <FlashcardsPanel material={material} uid={uid} />}
      {tab === "quiz" && <QuizPanel material={material} uid={uid} />}
      {tab === "tutor" && <TutorPanel material={material} uid={uid} />}
    </main>
  );
}
