// Kube marks its own homework — so someone else re-marks it.
//
// The generator writes a question, its options and the index of the correct
// one in a single pass, and nothing ever checked that index. It got one wrong
// in the worst possible way: a "P(heart OR king)" drill whose praise correctly
// said "you accounted for the overlap" while the key pointed at 5/13 — the
// exact double-counting mistake the question was written to catch. A student
// who worked it out right was marked wrong; one who double-counted was
// congratulated. That is worse than having no drill at all, because it teaches
// the error and spends the student's trust doing it.
//
// So every question now faces a second, INDEPENDENT solve that never sees the
// proposed key. Agree and it ships. Disagree and a tie-break with visible
// working decides whether the key gets repaired or the question gets dropped.
// Dropping costs us one question. Shipping a lie costs us the student.
//
// Two things make this cheap enough to always run: the verifier sees only the
// questions (never the source material, which is the expensive part of every
// other call), and it works in batches. A full unit costs a fraction of a cent.

import { z } from "zod";
import { chatJSON } from "@/lib/openrouter";
import type { UsageMeter } from "@/lib/usage";
import type { Section, ExamQuestion, CheckStep } from "@/lib/course/types";

/** Anything with options and a claimed answer index. */
export interface Checkable {
  prompt: string;
  code?: string;
  options: string[];
  /** The author's claimed index — never shown to the verifier. */
  answer: number;
  /** Optional topic context, so a question that leans on its lesson is still
   *  solvable standalone. */
  context?: string;
}

export interface VerifyReport {
  /** Questions that went through the checker. */
  checked: number;
  /** Answer keys corrected to the independently-solved option. */
  repaired: number;
  /** Questions removed — broken, ambiguous, or unresolvably disputed. */
  dropped: number;
  /** Left as authored because the checker couldn't reach a verdict. */
  unverified: number;
}

export const emptyReport = (): VerifyReport => ({
  checked: 0,
  repaired: 0,
  dropped: 0,
  unverified: 0,
});

function addReport(a: VerifyReport, b: VerifyReport): VerifyReport {
  return {
    checked: a.checked + b.checked,
    repaired: a.repaired + b.repaired,
    dropped: a.dropped + b.dropped,
    unverified: a.unverified + b.unverified,
  };
}

/** Human line for the digest note / admin panel. Empty when nothing moved. */
export function reportLine(r: VerifyReport): string {
  const bits: string[] = [];
  if (r.repaired) bits.push(`${r.repaired} answer key${r.repaired === 1 ? "" : "s"} corrected`);
  if (r.dropped) bits.push(`${r.dropped} unsound question${r.dropped === 1 ? "" : "s"} dropped`);
  return bits.join(" · ");
}

/* ------------------------- free structural checks ------------------------- */

const norm = (s: string) =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!]+$/, "").trim();

/** Read a bare quantity — "4/13", "0.25", "25%" — so two options that say the
 *  same number different ways are caught as ambiguous. Null for prose. */
function numericValue(s: string): number | null {
  const t = s.replace(/\s+/g, "").replace(/^[≈~=]/, "");
  let m = /^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (m) {
    const d = Number(m[2]);
    return d === 0 ? null : Number(m[1]) / d;
  }
  m = /^([+-]?\d+(?:\.\d+)?)%$/.exec(t);
  if (m) return Number(m[1]) / 100;
  m = /^[+-]?\d+(?:\.\d+)?$/.exec(t);
  if (m) return Number(t);
  return null;
}

/** Deterministic faults no model call is needed to see. Returns a reason when
 *  the question is unsalvageable, or null when it's worth verifying. */
export function structuralFault(q: Checkable): string | null {
  if (!q.prompt || !q.prompt.trim()) return "empty prompt";
  const opts = q.options ?? [];
  if (opts.length < 3) return "fewer than 3 options";
  if (opts.length > 6) return "more than 6 options";
  if (opts.some((o) => !o || !o.trim())) return "blank option";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= opts.length) {
    return "answer index out of range";
  }
  const seen = new Set<string>();
  for (const o of opts) {
    const k = norm(o);
    if (seen.has(k)) return "two options say the same thing";
    seen.add(k);
  }
  // Same number wearing different clothes ("1/2" and "0.5") — no single
  // defensible key exists, so the question can't be marked fairly.
  const nums: number[] = [];
  for (const o of opts) {
    const v = numericValue(o);
    if (v === null) continue;
    if (nums.some((p) => Math.abs(p - v) < 1e-9)) return "two options are numerically equal";
    nums.push(v);
  }
  return null;
}

/* ---------------------------- the second solve ---------------------------- */

const SOLVE_SYSTEM =
  "You are the answer checker for a study app. You are shown multiple-choice questions WITHOUT the author's answer key — the author is sometimes wrong, and your whole job is to catch it. Solve each question yourself, from first principles. Do the arithmetic properly; never pattern-match to the option that merely looks familiar. Watch especially for overlap/double-counting, off-by-one, unit slips, and negation. Pick the single best option. If two options are equally defensible, if none is correct, or if the question cannot be answered from what it gives you, set sure=false — that is a useful answer, not a failure.";

const batchSchema = z.object({
  answers: z.array(
    z.object({
      n: z.number().int().describe("the question number as labelled"),
      pick: z.number().int().describe("0-based index of the correct option"),
      sure: z.boolean().describe("false if ambiguous, unanswerable, or no option is right"),
    })
  ),
});

const tieSchema = z.object({
  work: z.string().describe("the actual working, briefly"),
  pick: z.number().int().describe("0-based index of the correct option"),
  sure: z.boolean(),
});

function renderQuestion(q: Checkable, n: number): string {
  const opts = q.options.map((o, i) => `  [${i}] ${o}`).join("\n");
  return [
    `Question ${n}${q.context ? ` (topic: ${q.context})` : ""}:`,
    q.prompt,
    q.code ? `\n${q.code}\n` : "",
    opts,
  ]
    .filter(Boolean)
    .join("\n");
}

/** One batched independent solve. Throws on transport failure. */
async function solveBatch(
  items: Checkable[],
  model: string,
  meter?: UsageMeter
): Promise<Map<number, { pick: number; sure: boolean }>> {
  const body = items.map((q, i) => renderQuestion(q, i + 1)).join("\n\n");
  const { data, usage } = await chatJSON({
    model,
    system: SOLVE_SYSTEM,
    content: `${body}

Answer every question above. Reply as JSON only:
{"answers":[{"n":1,"pick":0,"sure":true}, ...]}
"pick" is the 0-based index into that question's options.`,
    maxTokens: 1200,
  });
  meter?.add(usage);
  const out = new Map<number, { pick: number; sure: boolean }>();
  for (const a of batchSchema.parse(data).answers) {
    out.set(a.n - 1, { pick: a.pick, sure: a.sure });
  }
  return out;
}

/** The decider for a disputed question: solve it once more, showing working. */
async function tieBreak(
  q: Checkable,
  model: string,
  meter?: UsageMeter
): Promise<{ pick: number; sure: boolean } | null> {
  try {
    const { data, usage } = await chatJSON({
      model,
      system: SOLVE_SYSTEM,
      content: `${renderQuestion(q, 1)}

Work this one out step by step before answering — two earlier attempts disagreed, so the trap in it is real. Reply as JSON only:
{"work":"...","pick":0,"sure":true}`,
      maxTokens: 900,
    });
    meter?.add(usage);
    const t = tieSchema.parse(data);
    return { pick: t.pick, sure: t.sure };
  } catch {
    return null;
  }
}

/* ------------------------------ the pipeline ------------------------------ */

const BATCH = 8;
const CONCURRENCY = 4;

async function pooled<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

export type Ruling =
  | { verdict: "keep" }
  | { verdict: "repair"; answer: number }
  | { verdict: "drop"; reason: string }
  | { verdict: "unverified" };

/**
 * Rule on a list of questions without touching them. Callers apply the rulings
 * to whatever structure the questions live in — drill steps, an exam bank, a
 * stored course — so this stays the single place the policy is written down.
 *
 * Policy, deliberately conservative in the author's favour except where the
 * disagreement is confident and repeated:
 *   structurally broken            → drop
 *   checker agrees                 → keep
 *   checker disagrees, unsure      → keep (an unsure checker doesn't outrank the author)
 *   checker disagrees, sure        → tie-break decides: repair, keep, or drop
 *   checker unreachable            → keep, counted as unverified
 */
export async function ruleOnQuestions(
  items: Checkable[],
  opts: { model: string; meter?: UsageMeter }
): Promise<{ rulings: Ruling[]; report: VerifyReport }> {
  const rulings: Ruling[] = items.map(() => ({ verdict: "unverified" }));
  const report = emptyReport();

  // Structural pass first — free, and it keeps junk out of the paid pass.
  const live: number[] = [];
  items.forEach((q, i) => {
    const fault = structuralFault(q);
    if (fault) {
      rulings[i] = { verdict: "drop", reason: fault };
      report.dropped += 1;
    } else {
      live.push(i);
    }
  });
  report.checked = items.length;
  if (live.length === 0) return { rulings, report };

  // Batched independent solve.
  const batches: number[][] = [];
  for (let i = 0; i < live.length; i += BATCH) batches.push(live.slice(i, i + BATCH));
  const solved = await pooled(batches, CONCURRENCY, async (idxs) => {
    try {
      return await solveBatch(
        idxs.map((i) => items[i]),
        opts.model,
        opts.meter
      );
    } catch {
      return null; // a failed batch leaves its questions as authored
    }
  });

  const disputed: number[] = [];
  batches.forEach((idxs, bi) => {
    const got = solved[bi];
    idxs.forEach((idx, k) => {
      const v = got?.get(k);
      if (!v || !Number.isInteger(v.pick) || v.pick < 0 || v.pick >= items[idx].options.length) {
        report.unverified += 1;
        rulings[idx] = { verdict: "unverified" };
        return;
      }
      if (v.pick === items[idx].answer) {
        rulings[idx] = { verdict: "keep" };
        return;
      }
      if (!v.sure) {
        // Disagreement without confidence isn't evidence — the author wrote it
        // with the material in front of them and the checker did not.
        rulings[idx] = { verdict: "keep" };
        return;
      }
      disputed.push(idx);
    });
  });

  if (disputed.length) {
    const ties = await pooled(disputed, CONCURRENCY, (idx) =>
      tieBreak(items[idx], opts.model, opts.meter)
    );
    disputed.forEach((idx, k) => {
      const t = ties[k];
      const q = items[idx];
      if (!t || !Number.isInteger(t.pick) || t.pick < 0 || t.pick >= q.options.length) {
        report.unverified += 1;
        rulings[idx] = { verdict: "unverified" };
        return;
      }
      if (t.pick === q.answer) {
        // The tie-break came back to the author. Keep it.
        rulings[idx] = { verdict: "keep" };
        return;
      }
      if (t.sure) {
        // Two independent solves, both confident, both against the key. The
        // prose is usually already written for the right idea — the author
        // just pointed at the wrong row — so correcting the index is the
        // repair that keeps the question whole.
        rulings[idx] = { verdict: "repair", answer: t.pick };
        report.repaired += 1;
        return;
      }
      // Three readings, no agreement: the question itself is the problem.
      rulings[idx] = { verdict: "drop", reason: "no agreed correct option" };
      report.dropped += 1;
    });
  }

  return { rulings, report };
}

/* -------------------- appliers for Kube's actual shapes -------------------- */

/** A lesson-ish thing: the generated shape and the stored shape both fit. */
interface StepLike {
  kind: string;
  prompt?: string;
  code?: string;
  options?: string[];
  answer?: number;
}
interface LessonLike {
  steps: StepLike[];
}

const isCheck = (s: StepLike) =>
  s.kind === "check" && Array.isArray(s.options) && typeof s.answer === "number";

/**
 * Verify the check steps inside a topic's lessons. Returns a new lessons array
 * with keys repaired and unsound checks removed. A lesson that loses all its
 * checks keeps its teaching — the explaining was never in doubt.
 */
export async function verifyLessons<L extends LessonLike>(
  lessons: L[],
  context: string,
  opts: { model: string; meter?: UsageMeter }
): Promise<{ lessons: L[]; report: VerifyReport }> {
  const at: Array<[number, number]> = [];
  const items: Checkable[] = [];
  lessons.forEach((lesson, li) => {
    lesson.steps.forEach((s, si) => {
      if (!isCheck(s)) return;
      at.push([li, si]);
      items.push({
        prompt: s.prompt ?? "",
        code: s.code,
        options: s.options!,
        answer: s.answer!,
        context,
      });
    });
  });
  if (items.length === 0) return { lessons, report: emptyReport() };

  const { rulings, report } = await ruleOnQuestions(items, opts);
  const dropAt = new Set<string>();
  const fixAt = new Map<string, number>();
  at.forEach(([li, si], k) => {
    const r = rulings[k];
    if (r.verdict === "drop") dropAt.add(`${li}:${si}`);
    else if (r.verdict === "repair") fixAt.set(`${li}:${si}`, r.answer);
  });

  const out = lessons.map((lesson, li) => ({
    ...lesson,
    steps: lesson.steps
      .map((s, si) => {
        const fix = fixAt.get(`${li}:${si}`);
        return fix === undefined ? s : { ...s, answer: fix };
      })
      .filter((_, si) => !dropAt.has(`${li}:${si}`)),
  })) as L[];
  return { lessons: out, report };
}

/** Verify an exam bank in place of its authored keys. */
export async function verifyExamQuestions<Q extends Checkable>(
  questions: Q[],
  opts: { model: string; meter?: UsageMeter }
): Promise<{ questions: Q[]; report: VerifyReport }> {
  if (questions.length === 0) return { questions, report: emptyReport() };
  const { rulings, report } = await ruleOnQuestions(questions, opts);
  const out: Q[] = [];
  questions.forEach((q, i) => {
    const r = rulings[i];
    if (r.verdict === "drop") return;
    out.push(r.verdict === "repair" ? { ...q, answer: r.answer } : q);
  });
  return { questions: out, report };
}

/**
 * Re-check a whole stored course — every drill check in every topic plus the
 * exam bank — so courses built before the checker existed can be repaired
 * without rebuilding (and re-paying for) them.
 */
export async function verifyStoredCourse(
  sections: Section[],
  examBank: ExamQuestion[],
  opts: { model: string; meter?: UsageMeter }
): Promise<{ sections: Section[]; examBank: ExamQuestion[]; report: VerifyReport }> {
  let report = emptyReport();

  // Topic drills: one pass per topic so the checker gets the topic as context.
  // Run them pooled — a big course is 30+ topics, and sequential re-marking
  // would run past the function's time limit long before it ran out of money.
  type Addr = { si: number; ti: number };
  const addrs: Addr[] = [];
  sections.forEach((s, si) => s.topics.forEach((_, ti) => addrs.push({ si, ti })));

  const outSections: Section[] = sections.map((s) => ({ ...s, topics: s.topics.slice() }));
  const done = await pooled(addrs, CONCURRENCY, async ({ si, ti }) => {
    const topic = sections[si].topics[ti];
    const ctx = topic.title;
    let next = topic;
    let r = emptyReport();
    if (topic.lessons?.length) {
      const v = await verifyLessons(topic.lessons, ctx, opts).catch(() => null);
      if (v) {
        r = addReport(r, v.report);
        next = { ...next, lessons: v.lessons };
      }
    }
    if (topic.steps?.length) {
      // Topics that carry bare steps rather than lesson slices.
      const v = await verifyLessons([{ steps: topic.steps as StepLike[] }], ctx, opts).catch(
        () => null
      );
      if (v) {
        r = addReport(r, v.report);
        next = { ...next, steps: v.lessons[0].steps as unknown as typeof topic.steps };
      }
    }
    return { si, ti, topic: next, report: r };
  });
  for (const d of done) {
    outSections[d.si].topics[d.ti] = d.topic;
    report = addReport(report, d.report);
  }

  const ex = await verifyExamQuestions(
    examBank.map((q) => ({ ...q, context: q.topicId })),
    opts
  );
  report = addReport(report, ex.report);
  const outBank = ex.questions.map((q) => {
    const { context: _drop, ...rest } = q as ExamQuestion & { context?: string };
    return rest as ExamQuestion;
  });

  return { sections: outSections, examBank: outBank, report };
}

/** Kept exported for callers that want the narrow type. */
export type { CheckStep };
