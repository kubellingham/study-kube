"use client";

// Retention — the "you learned this 21 days ago, still got it?" layer. Kube
// already runs spaced repetition on flashcards (lib/learn/practice.ts, SM-2):
// each card carries a dueAt that drifts out as you get it right and snaps back
// when you don't. Retention reuses that schedule at the TOPIC level and adds
// the one thing it was missing — a sense of WHEN you learned something — so the
// ladder can gently pull a topic back at the right moment instead of letting it
// quietly fade. Pure + read-only; the actual re-spacing still happens in the
// flashcard deck.
import type { CardState } from "@/lib/learn/practice";

const DAY = 86_400_000;

export interface RetentionItem {
  topicId: string;
  title: string;
  unit: number;
  daysAgo: number | null;
  label: string;
}

export function learnedAgoLabel(daysAgo: number | null): string {
  if (daysAgo == null) return "You learned this a while back";
  if (daysAgo <= 0) return "You learned this today";
  if (daysAgo === 1) return "You learned this yesterday";
  if (daysAgo < 14) return `You learned this ${daysAgo} days ago`;
  const weeks = Math.round(daysAgo / 7);
  if (weeks < 9) return `You learned this ${weeks} weeks ago`;
  return `You learned this ${Math.round(daysAgo / 30)} months ago`;
}

/** Card states belonging to a topic — cards are keyed `topicId` or
 *  `topicId#i` (one per authored flashcard, see concepts.ts). */
function cardsForTopic(
  topicId: string,
  cards: Record<string, CardState>
): CardState[] {
  const out: CardState[] = [];
  for (const [id, c] of Object.entries(cards)) {
    const tid = id.includes("#") ? id.slice(0, id.indexOf("#")) : id;
    if (tid === topicId) out.push(c);
  }
  return out;
}

/**
 * Which completed topics are worth a retention nudge right now. A topic
 * surfaces when it's had a little time to fade AND its flashcards are actually
 * due to come back — or when it was learned a week+ ago and never drilled, so
 * nothing has tested whether it stuck. Freshly learned or freshly practised
 * topics stay quiet. Longest-ago first.
 */
export function retentionDue(
  topics: { id: string; title: string; unit: number; kind?: string }[],
  completed: Record<string, true>,
  completedAt: Record<string, number>,
  cards: Record<string, CardState>,
  now: number,
  limit = 3
): RetentionItem[] {
  const scored: (RetentionItem & { sort: number })[] = [];

  for (const t of topics) {
    if (t.kind === "review" || !completed[t.id]) continue;
    const at = completedAt[t.id] ?? null;
    const daysAgo = at != null ? Math.floor((now - at) / DAY) : null;
    const tc = cardsForTopic(t.id, cards);
    const seen = tc.some((c) => c.reps > 0);
    const due = tc.some((c) => c.reps > 0 && c.dueAt <= now);

    const worth =
      (daysAgo != null && daysAgo >= 3 && due) ||
      (daysAgo != null && daysAgo >= 7 && !seen) ||
      (daysAgo == null && due);
    if (!worth) continue;

    scored.push({
      topicId: t.id,
      title: t.title,
      unit: t.unit,
      daysAgo,
      label: learnedAgoLabel(daysAgo),
      // Longest-ago first; unknown-date topics (pre-stamp completions) sort
      // last so precise "21 days ago" prompts lead.
      sort: daysAgo ?? -1,
    });
  }

  return scored
    .sort((a, b) => b.sort - a.sort)
    .slice(0, limit)
    .map((r) => ({
      topicId: r.topicId,
      title: r.title,
      unit: r.unit,
      daysAgo: r.daysAgo,
      label: r.label,
    }));
}
