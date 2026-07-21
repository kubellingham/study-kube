import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

/** In-lesson Kube: a student can ask about the slide/lesson they are IN,
 *  any time. Strictly scoped — Kube clarifies THIS lesson's content and
 *  warmly deflects questions about later rungs ("you'll see it coming").
 *  It converses; it never rewrites the prepared notes. */

const SYSTEM_BASE = `You are Kube, a calm, warm study companion sitting INSIDE one lesson of a course ladder. A student mid-lesson has a question.

Hard rules:
- Answer ONLY within the current lesson's content (provided below) and, where needed, ideas the ladder has ALREADY covered before this point. That is your whole world right now.
- If asked about material that comes LATER on the ladder, do not teach it. Deflect warmly and briefly, e.g. "That one's waiting a few circles ahead — you'll see it coming. For now, let's nail this slide." One sentence of deflection, then offer help with the current lesson.
- Never rewrite, criticize, or contradict the prepared lesson — clarify it. Re-explain in different words, give a tiny extra example, connect it to what came earlier.
- Match the lesson's tone: encouraging, specific, zero condescension. Short answers — 2 to 6 sentences unless a worked example genuinely needs more.
- If the student is stuck on a check question, guide with a hint or the underlying idea rather than reciting which option is correct — unless they explicitly ask for the answer after trying.`;

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
    model: MODEL,
    max_tokens: 1200,
    output_config: { effort: "low" },
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

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n(Kube lost the connection — try asking again.)")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
