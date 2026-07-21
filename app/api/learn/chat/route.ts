import { NextRequest } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getUid } from "@/lib/api-helpers";
import { getAnthropic, CHAT_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

/** In-lesson Kube — the baby-steps edition. A student who asks for help here
 *  ALREADY didn't get it from the lesson, so the answer must never be a wall
 *  of text. Two reply kinds:
 *  - clarify: the question was vague → offer 2-4 sample questions the student
 *    might really be asking, so Kube knows exactly where the snag is.
 *  - answer: tiny beats, ONE small idea each. The client reveals them one at
 *    a time behind an "Okay" button — preloaded, but fed at a kid's pace. */

const replySchema = z.object({
  kind: z
    .enum(["clarify", "answer"])
    .describe("clarify when the question is too general to know WHERE they're stuck; answer when it's specific (or they asked for the full slow walk-through)"),
  intro: z
    .string()
    .optional()
    .describe("clarify only: ONE warm line, e.g. 'Let's find the exact snag —'"),
  options: z
    .array(z.string())
    .optional()
    .describe("clarify only: 2-4 first-person sample questions, each naming a DIFFERENT confusable piece of THIS lesson, short (<=12 words), e.g. 'Why can't memory talk to memory directly?'"),
  beats: z
    .array(z.string())
    .optional()
    .describe("answer only: 3-6 tiny steps. Each beat is ONE small idea in 1-3 short sentences. Beat 1 plants a single concrete image and NOTHING more; every later beat adds exactly ONE layer onto it. Markdown **bold** allowed."),
});

const SYSTEM_BASE = `You are Kube, a calm, warm study companion sitting INSIDE one lesson of a course ladder. A student mid-lesson is asking for help — which means the lesson alone didn't land. Slow WAY down.

HOW TO REPLY (structured):
- If their question is GENERAL or vague ("explain this", "I don't get it", "can you explain this concept a bit"): reply kind "clarify". One warm intro line + 2-4 sample questions they might really be asking, each pointing at a different piece of THIS lesson, phrased in the student's own voice. Do NOT teach yet — first find the snag. (The student also always gets a built-in "just walk me through all of it, slowly" choice — you never need to offer that one.)
- If their question is SPECIFIC — or they picked a sample question, or asked for the full walk-through: reply kind "answer" with baby-step beats. Each beat is ONE small idea, 1-3 short sentences, that can settle on its own before the student taps for the next. Start from a single concrete image or need (beat 1 is JUST that image); build one layer per beat. Never bundle the whole picture into one beat — the beats exist because a wall of text already failed this student once.

HARD RULES (unchanged):
- Stay strictly within the current lesson's content below, plus ideas the ladder already covered. If asked about LATER material, reply kind "answer" with a single beat deflecting warmly ("That one's waiting a few circles ahead — you'll see it coming. For now, let's nail this slide.") and offer help with the current slide.
- Never rewrite, criticize, or contradict the prepared lesson — clarify it in different words.
- If they're stuck on a check question, beats guide with the underlying idea — never recite which option is correct unless they explicitly ask for the answer after trying.
- Warm, specific, zero condescension. Match the lesson's tone.`;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let courseTitle = "";
  let topicTitle = "";
  let lessonTitle = "";
  let lessonContent = "";
  let coveredSoFar = "";
  let history: ChatTurn[] = [];
  let question = "";
  try {
    const body = await req.json();
    courseTitle = (body.courseTitle || "").toString().slice(0, 200);
    topicTitle = (body.topicTitle || "").toString().slice(0, 300);
    lessonTitle = (body.lessonTitle || "").toString().slice(0, 300);
    lessonContent = (body.lessonContent || "").toString().slice(0, 24_000);
    coveredSoFar = (body.coveredSoFar || "").toString().slice(0, 4_000);
    question = (body.question || "").toString().slice(0, 4_000).trim();
    if (Array.isArray(body.history)) {
      history = (body.history as ChatTurn[])
        .filter(
          (t) =>
            t && (t.role === "user" || t.role === "assistant") &&
            typeof t.content === "string"
        )
        .slice(-12)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 4_000) }));
    }
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!question || !lessonContent) {
    return Response.json({ error: "Missing question or lesson." }, { status: 400 });
  }

  const client = getAnthropic();
  const stream = client.messages.stream({
    model: CHAT_MODEL,
    max_tokens: 1500,
    output_config: { effort: "low", format: zodOutputFormat(replySchema) },
    system: [
      {
        type: "text",
        text: `${SYSTEM_BASE}

Course: ${courseTitle}
Current circle (topic): ${topicTitle}
Current slice: ${lessonTitle}

--- CURRENT LESSON CONTENT (your whole world) ---
${lessonContent}

--- TOPICS ALREADY CLIMBED (you may reference these by name) ---
${coveredSoFar || "(nothing before this — it's the first circle)"}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [...history, { role: "user" as const, content: question }],
  });

  try {
    let jsonText = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        jsonText += event.delta.text;
      }
    }
    const reply = replySchema.parse(JSON.parse(jsonText));
    // Belt & braces: a malformed mix collapses to a plain answer.
    if (reply.kind === "answer" && (!reply.beats || reply.beats.length === 0)) {
      return Response.json({
        kind: "answer",
        beats: ["Kube lost its thread — ask that again?"],
      });
    }
    if (reply.kind === "clarify" && (!reply.options || reply.options.length === 0)) {
      return Response.json({
        kind: "answer",
        beats: reply.intro ? [reply.intro] : ["Ask me something specific about this slide."],
      });
    }
    return Response.json(reply);
  } catch {
    return Response.json(
      { error: "Kube couldn't answer just now — try again." },
      { status: 502 }
    );
  }
}
