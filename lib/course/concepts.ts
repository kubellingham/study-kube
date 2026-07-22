// The shared concept pool — one per course, the SAME material the deep
// lessons are built from, gathered for the Practice Hub (KUBE_CASUAL_AND_
// PRACTICE.md §3). Every teaching topic already carries a term (its title),
// a definition (its recap lines) and fast-recognition MCQs (the exam bank),
// so all four practice tools are just different pressures on this one pool —
// no new authoring.
import type { CourseBundle } from "./bundle";
import type { ExamQuestion } from "./types";

export interface Concept {
  /** The topic id it came from. */
  id: string;
  term: string;
  unit: number;
  /** Section letter — used to cluster confusables (same area = the things
   *  students blur together). */
  section: string;
  /** The full definition: all the topic's recap lines. Kept for the glossary
   *  and anywhere the whole picture is wanted. */
  definition: string;
  /** A SHORT, one-sentence definition — the flashcard back and the drill's
   *  target. Small enough to digest one-handed. */
  brief: string;
  lines: string[];
  /** A SHORT fingerprint for the matching board — a "tell", not a paragraph. */
  tell: string;
}

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "is", "are", "and", "or", "it", "its",
  "as", "by", "for", "on", "with", "that", "this", "each", "any", "all", "so",
  "into", "from", "at", "be", "can", "not", "but", "one", "two", "which",
]);

function distinctiveCount(s: string): number {
  return s
    .split(/\s+/)
    .filter((w) => w.replace(/[^a-z]/gi, "").length >= 5 && !STOP.has(w.toLowerCase())).length;
}

/** Trim a recap line into a board-sized tell: a scannable 4–9 word clause
 *  that still fingerprints the concept. */
function toTell(line: string, term: string): string {
  let s = line.trim();
  // Drop a leading "X is/are/means …" so the tell is a fingerprint, not a
  // restatement of the term.
  s = s.replace(
    new RegExp(`^${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(is|are|means|refers to|=)\\s+`, "i"),
    ""
  );
  s = s.replace(/^(a|an|the)\s+/i, "");
  // Cut at a strong break only if what's before it is already a real clause
  // (≥4 words) — otherwise a terse fragment like "address splits" survives.
  const breakAt = s.search(/[—;:(]|\s-\s/);
  if (breakAt > 0) {
    const head = s.slice(0, breakAt).trim();
    if (head.split(/\s+/).length >= 4) s = head;
  }
  s = s.replace(/[.\s]+$/, "").trim();
  const words = s.split(/\s+/);
  if (words.length > 9) s = words.slice(0, 9).join(" ") + "…";
  return s;
}

/** Choose the recap line that best fingerprints the concept, then shrink it —
 *  scored by distinctive words and a preference for the 4–9 word sweet spot. */
function bestTell(lines: string[], term: string): string {
  const candidates = lines
    .filter((l) => l.trim().length > 8)
    .map((l) => toTell(l, term))
    .filter((t) => t.length > 0);
  if (candidates.length === 0) return term;
  const score = (t: string) => {
    const wc = t.replace(/…$/, "").split(/\s+/).length;
    const sweet = wc >= 4 && wc <= 9 ? 3 : wc < 4 ? -2 : 0;
    return distinctiveCount(t) * 2 + sweet;
  };
  return candidates.sort((a, b) => score(b) - score(a) || a.length - b.length)[0];
}

/** The single crisp definition line for a flashcard back / drill target:
 *  the pithiest recap line that reads as a definition, cut to one sentence. */
function toBrief(lines: string[]): string {
  // Prefer a line that actually defines (mentions "is/are/means" or is the
  // first line), then the shortest such — kept to one sentence, ~22 words.
  const defish = lines.filter((l) => /\b(is|are|means|refers to)\b/i.test(l));
  const pick = (defish.length ? defish : lines).slice();
  pick.sort((a, b) => a.length - b.length);
  let s = (pick[0] ?? lines[0] ?? "").trim();
  // First sentence only.
  const dot = s.search(/[.!?](\s|$)/);
  if (dot > 20) s = s.slice(0, dot + 1);
  const words = s.split(/\s+/);
  if (words.length > 24) s = words.slice(0, 24).join(" ") + "…";
  return s.replace(/\s+/g, " ").trim();
}

/** Build the course's concept pool from its teaching topics. Review nodes,
 *  and topics with no recap, are skipped. */
export function buildConceptPool(bundle: CourseBundle): Concept[] {
  const out: Concept[] = [];
  for (const topic of bundle.ladder) {
    if (topic.kind === "review") continue;
    const lines = (topic.recap ?? []).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const section = bundle.sectionOfTopic(topic.id)?.letter ?? "";
    out.push({
      id: topic.id,
      term: topic.title,
      unit: topic.unit,
      section,
      definition: lines.join(" "),
      brief: toBrief(lines),
      lines,
      tell: bestTell(lines, topic.title),
    });
  }
  return out;
}

/** Key content words of a definition, longest/most distinctive first — the
 *  words the definitions drill blanks out. */
export function keyWords(definition: string): string[] {
  const seen = new Set<string>();
  const words: { w: string; score: number }[] = [];
  for (const raw of definition.split(/\s+/)) {
    const w = raw.replace(/[^a-zA-Z0-9-]/g, "");
    const low = w.toLowerCase();
    if (w.length < 4 || STOP.has(low) || seen.has(low)) continue;
    seen.add(low);
    words.push({ w, score: w.length + (/[A-Z0-9]/.test(w.slice(1)) ? 3 : 0) });
  }
  return words.sort((a, b) => b.score - a.score).map((x) => x.w);
}

/** Fast-recognition MCQ items for the Timed Sprint — the exam bank, which is
 *  already snap-answerable. */
export function sprintItems(bundle: CourseBundle): ExamQuestion[] {
  return bundle.examBank.filter((q) => q.options?.length >= 2);
}

/** Group concepts into confusable clusters (same section) so matching and
 *  drills renew the discrimination challenge with siblings, not randoms. */
export function confusableClusters(pool: Concept[]): Concept[][] {
  const bySection = new Map<string, Concept[]>();
  for (const c of pool) {
    const key = c.section || `u${c.unit}`;
    (bySection.get(key) ?? bySection.set(key, []).get(key)!).push(c);
  }
  return [...bySection.values()];
}
