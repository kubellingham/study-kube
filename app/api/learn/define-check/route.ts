import { NextRequest } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getUid } from "@/lib/api-helpers";
import { getAnthropic, CHAT_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Definitions drill judge (KUBE_CASUAL_AND_PRACTICE.md §3a). Grades by
 *  MEANING, never spelling — the user's own words and synonyms are right;
 *  empty jargon that misses the idea is not. On "almost", teaches into the
 *  fix: better wording first, then two candidate corrections to pick between
 *  (one clearly better). On "wrong", states the idea plainly. */

const verdictSchema = z.object({
  verdict: z
    .enum(["right", "almost", "wrong"])
    .describe("right = captures the idea (any phrasing); almost = partly there or imprecise; wrong = misses or empty"),
  better: z
    .string()
    .describe("Kube's own crisp one-sentence wording of the correct idea — shown first, teaches the target"),
  corrections: z
    .array(z.string())
    .length(2)
    .optional()
    .describe("almost ONLY: two candidate corrections to choose between, one clearly better than the other — both plausible, so the user is taught into the fix rather than guessing blind"),
  note: z
    .string()
    .optional()
    .describe("one short warm line of feedback, e.g. what was missing (<=18 words)"),
});

export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Not signed in." }, { status: 401 });

  let term = "";
  let definition = "";
  let level = "normal";
  let answer = "";
  try {
    const body = await req.json();
    term = (body.term || "").toString().slice(0, 300);
    definition = (body.definition || "").toString().slice(0, 4000);
    level = (body.level || "normal").toString();
    answer = (body.answer || "").toString().slice(0, 4000).trim();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!term || !definition || !answer) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  const client = getAnthropic();
  const stream = client.messages.stream({
    model: CHAT_MODEL,
    max_tokens: 700,
    output_config: { effort: "low", format: zodOutputFormat(verdictSchema) },
    system:
      "You judge whether a student's definition captures the MEANING of a concept, for a recall drill. Grade by meaning, NEVER by spelling or exact wording — the student's own words and correct synonyms are fully right. But do NOT be fooled by empty words or jargon that dodge the actual idea. Reward understanding; do not reward hollow phrasing. When it's ALMOST there, give your crisp better wording, then TWO candidate corrections to choose between (one clearly better, one plausible-but-off) so the student is taught into the fix. Warm, brief, never condescending — a miss is how it sticks.",
    messages: [
      {
        role: "user",
        content: `Concept: ${term}\nReference definition (the lesson's own): ${definition}\nDifficulty the student picked: ${level}\n\nStudent's answer: ${answer}`,
      },
    ],
  });

  try {
    let jsonText = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        jsonText += event.delta.text;
      }
    }
    const parsed = verdictSchema.parse(JSON.parse(jsonText));
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Kube couldn't check that just now." }, { status: 502 });
  }
}
