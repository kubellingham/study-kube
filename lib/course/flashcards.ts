// Model-authored flashcards. The old deck stapled a topic's TITLE (a broad
// heading) to one truncated recap line (a narrow detail) — front and back at
// different altitudes, so the cards read off. Here the model writes both sides
// as a matched pair: the front is a real prompt, the back a complete answer to
// that exact front. Grounded strictly in the topic's recap, so no new facts are
// invented. Batched on the budget model — a few cents for a whole course.
import { z } from "zod";
import { chatJSON, CLIMB_MODEL } from "@/lib/openrouter";
import type { UsageMeter } from "@/lib/usage";

export interface FlashcardPair {
  front: string;
  back: string;
}

const schema = z.object({
  cards: z.array(
    z.object({
      topicId: z.string(),
      items: z
        .array(z.object({ front: z.string(), back: z.string() }))
        .min(1)
        .max(4),
    })
  ),
});

const SYSTEM =
  "You write study flashcards. Each card is a self-contained front↔back pair a student tests themselves with. The FRONT is a real prompt — a question, or a term to define — NEVER just a topic heading or category name. The BACK is a complete, correct answer to THAT EXACT front, in one or two tight sentences a student can read at a glance. Front and back must line up: reading the front, the back is exactly what you'd want to recall. Ground everything strictly in the recap given for each topic; never add facts the recap doesn't contain.";

// Keep each request bounded — 25 topics of recap fits comfortably in the
// budget model's context and one response.
const CHUNK = 25;

/**
 * Generate 2–3 matched flashcards per topic from each topic's recap lines.
 * Best-effort: a chunk that fails to parse simply leaves its topics on the
 * title↔recap fallback. Returns topicId → cards.
 */
export async function generateCourseFlashcards(
  courseTitle: string,
  topics: { id: string; title: string; recap: string[] }[],
  meter?: UsageMeter
): Promise<Record<string, FlashcardPair[]>> {
  const usable = topics.filter((t) => (t.recap ?? []).some((l) => l.trim()));
  const out: Record<string, FlashcardPair[]> = {};

  for (let i = 0; i < usable.length; i += CHUNK) {
    const batch = usable.slice(i, i + CHUNK);
    const listing = batch
      .map(
        (t) =>
          `topicId: ${t.id}\ntitle: ${t.title}\nrecap:\n${t.recap
            .map((l) => "  - " + l.trim())
            .filter((l) => l.trim().length > 4)
            .join("\n")}`
      )
      .join("\n\n");

    const prompt = `Course: ${courseTitle}

For EACH topic below, write 2–3 flashcards from ITS OWN recap. Where the recap supports it, mix a term→definition card with a "why/how" question card. Never write a card whose front is just the topic title.

Return ONLY JSON, no prose, of exactly this shape:
{"cards":[{"topicId": string, "items":[{"front": string, "back": string}]}]}

--- TOPICS ---
${listing}`;

    try {
      const { data, usage } = await chatJSON({
        model: CLIMB_MODEL,
        system: SYSTEM,
        content: prompt,
        maxTokens: 4000,
      });
      meter?.add(usage);
      const parsed = schema.parse(data);
      const known = new Set(batch.map((t) => t.id));
      for (const c of parsed.cards) {
        if (!known.has(c.topicId)) continue; // ignore hallucinated ids
        const items = c.items
          .map((x) => ({ front: x.front.trim(), back: x.back.trim() }))
          .filter((x) => x.front && x.back);
        if (items.length) out[c.topicId] = items.slice(0, 4);
      }
    } catch {
      // Best effort — leave this chunk's topics on the fallback deck.
    }
  }

  return out;
}
