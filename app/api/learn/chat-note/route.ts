import { NextRequest, after } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { getEntitlement } from "@/lib/entitlement-server";
import { checkAllowance, recordSpend } from "@/lib/spend";
import { UsageMeter } from "@/lib/usage";
import { adminDb } from "@/lib/firebase/admin";
import { getAnthropic, CHAT_MODEL } from "@/lib/anthropic";
import { chatJSON, CHAT_BUDGET_MODEL } from "@/lib/openrouter";
import { budgetEngineReady } from "@/lib/course/generate";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Background record of an in-lesson chat: when a student leaves a slide
 *  where they talked to Kube, the transcript is assessed quietly and a short
 *  struggle note is stored — "this student needed help HERE, on THIS idea,
 *  and it was/wasn't resolved". Nothing surfaces to the student today; the
 *  notes feed reviews and personalized questions later, and let Kube keep a
 *  close check on the parts that needed help. */

const noteSchema = z.object({
  struggled: z
    .boolean()
    .describe("true if the student needed real help with an idea (not just curiosity or small talk)"),
  concept: z
    .string()
    .describe("the specific idea they needed help with, a few words, e.g. '2's complement +1 step'"),
  resolved: z
    .boolean()
    .describe("true if by the end of the chat they seemed to get it"),
  summary: z
    .string()
    .describe("1-2 sentences: what confused them and how it was cleared up — written for Kube's future self"),
});

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  const uid = auth.uid;
  // A note follows a tutor chat, so it can't honestly outrun the chat's own
  // limit. Past that, skip quietly — the note is a nicety, never an error.
  if (!checkRateLimit(`chatnote:${uid}`, 30, 10 * 60 * 1000).ok) {
    return Response.json({ ok: true, skipped: true });
  }

  let courseId = "";
  let topicId = "";
  let topicTitle = "";
  let lessonId = "";
  let lessonTitle = "";
  let stepIdx = 0;
  let transcript: Turn[] = [];
  try {
    const body = await req.json();
    courseId = (body.courseId || "").toString().slice(0, 120);
    topicId = (body.topicId || "").toString().slice(0, 120);
    topicTitle = (body.topicTitle || "").toString().slice(0, 300);
    lessonId = (body.lessonId || "").toString().slice(0, 120);
    lessonTitle = (body.lessonTitle || "").toString().slice(0, 300);
    stepIdx = Number(body.stepIdx) || 0;
    if (Array.isArray(body.transcript)) {
      transcript = (body.transcript as Turn[])
        .filter(
          (t) =>
            t && (t.role === "user" || t.role === "assistant") &&
            typeof t.content === "string" && t.content.trim()
        )
        .slice(0, 24)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 3000) }));
    }
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  // One question + one answer minimum — otherwise there's nothing to assess.
  if (!courseId || !topicId || transcript.length < 2) {
    return Response.json({ ok: true, skipped: true });
  }

  // Past the month's allowance the note is skipped quietly, like the limit
  // above: it's a nicety, and the student never asked for it.
  if (!(await checkAllowance(uid, auth.email, await getEntitlement(uid), "study")).ok) {
    return Response.json({ ok: true, skipped: true });
  }

  // Respond immediately; assess and record in the background.
  after(async () => {
    const meter = new UsageMeter();
    try {
      const SYSTEM = "You assess a short tutoring chat that happened INSIDE one lesson slide, and write Kube's private note about it. Judge honestly: 'struggled' only when the student genuinely needed help understanding something (confusion, repeated questions, misconceptions) — not for curiosity, testing the tutor, or off-topic chatter.";
      const userMsg = `Topic: ${topicTitle}\nSlice: ${lessonTitle}\n\n--- CHAT TRANSCRIPT ---\n${transcript
        .map((t) => `${t.role === "user" ? "STUDENT" : "KUBE"}: ${t.content}`)
        .join("\n\n")}`;
      let jsonText: string;
      if (budgetEngineReady()) {
        const { data, usage } = await chatJSON({
          model: CHAT_BUDGET_MODEL,
          system: SYSTEM,
          content: userMsg + `\n\nReply as JSON only, no prose or fences, matching the note shape.`,
          maxTokens: 800,
        });
        meter.add(usage);
        jsonText = JSON.stringify(data);
      } else {
        const stream = getAnthropic().messages.stream({
          model: CHAT_MODEL,
          max_tokens: 800,
          output_config: { effort: "low", format: zodOutputFormat(noteSchema) },
          system: SYSTEM,
          messages: [{ role: "user", content: userMsg }],
        });
        jsonText = "";
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            jsonText += event.delta.text;
          }
        }
        meter.add((await stream.finalMessage()).usage);
      }
      const note = noteSchema.parse(JSON.parse(jsonText));
      // Quiet chats leave no trail — only real struggles are worth a record.
      if (!note.struggled) return;
      await adminDb().collection("chatNotes").add({
        userId: uid,
        courseId,
        topicId,
        topicTitle,
        lessonId,
        lessonTitle,
        stepIdx,
        concept: note.concept,
        resolved: note.resolved,
        summary: note.summary,
        turns: transcript.length,
        createdAt: Date.now(),
      });
    } catch {
      // A lost note must never surface as an error to the student.
    } finally {
      await recordSpend(uid, meter.costUsd(), "note");
    }
  });

  return Response.json({ ok: true });
}
