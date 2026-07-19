"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Material, Quiz, QuizAttempt } from "@/lib/types";
import { Skeleton, Empty } from "./SummaryPanel";

export default function QuizPanel({ material }: { material: Material }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAttempts(quizId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .order("taken_at", { ascending: false });
    setAttempts((data as QuizAttempt[]) ?? []);
  }

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("material_id", material.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const latest = (data as Quiz[])?.[0] ?? null;
      setQuiz(latest);
      if (latest) {
        setAnswers(new Array(latest.questions.length).fill(-1));
        await loadAttempts(latest.id);
      }
      setLoading(false);
    })();
  }, [material.id]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: material.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz.");
      const q = data.quiz as Quiz;
      setQuiz(q);
      setAnswers(new Array(q.questions.length).fill(-1));
      setSubmitted(false);
      setAttempts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!quiz) return;
    const correct = quiz.questions.reduce(
      (n, q, i) => (answers[i] === q.answer_index ? n + 1 : n),
      0
    );
    const score = correct / quiz.questions.length;
    setSubmitted(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score,
        answers,
      });
      await loadAttempts(quiz.id);
    }
  }

  function retake() {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSubmitted(false);
  }

  if (loading) return <Skeleton />;

  if (!quiz) {
    return (
      <Empty
        title="No quiz yet"
        description="Generate a multiple-choice practice quiz from this material."
        actionLabel={busy ? "Generating…" : "Generate quiz"}
        onAction={generate}
        busy={busy}
        error={error}
      />
    );
  }

  const correctCount = quiz.questions.reduce(
    (n, q, i) => (answers[i] === q.answer_index ? n + 1 : n),
    0
  );
  const allAnswered = answers.every((a) => a >= 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {quiz.questions.length} questions
          {attempts.length > 0 &&
            ` · best ${Math.round(
              Math.max(...attempts.map((a) => a.score)) * 100
            )}%`}
        </span>
        <button
          onClick={generate}
          disabled={busy}
          className="hover:text-indigo-600 disabled:opacity-60"
        >
          {busy ? "Generating…" : "↻ New quiz"}
        </button>
      </div>

      {submitted && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="text-lg font-semibold">
            Score: {correctCount} / {quiz.questions.length} (
            {Math.round((correctCount / quiz.questions.length) * 100)}%)
          </p>
          <button
            onClick={retake}
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
          >
            Retake
          </button>
        </div>
      )}

      <ol className="space-y-5">
        {quiz.questions.map((q, qi) => (
          <li
            key={qi}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="mb-3 font-medium">
              {qi + 1}. {q.prompt}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = q.answer_index === oi;
                let cls =
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ";
                if (submitted) {
                  if (isCorrect)
                    cls +=
                      "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40";
                  else if (chosen)
                    cls += "border-rose-400 bg-rose-50 dark:bg-rose-950/40";
                  else cls += "border-slate-200 dark:border-slate-700";
                } else {
                  cls += chosen
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-slate-200 hover:border-indigo-300 dark:border-slate-700";
                }
                return (
                  <label key={oi} className={cls}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={chosen}
                      disabled={submitted}
                      onChange={() =>
                        setAnswers((a) => {
                          const copy = [...a];
                          copy[qi] = oi;
                          return copy;
                        })
                      }
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {allAnswered ? "Submit answers" : "Answer all questions to submit"}
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
