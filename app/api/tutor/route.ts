import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { tutorStream, type TutorTurn } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message: string = (body.message || "").toString().trim();

  const ctx = await requireMaterial(req, body.material_id);
  if (!ctx.ok) return ctx.response;
  const { uid, material } = ctx;

  if (!message) {
    return Response.json({ error: "Message is empty." }, { status: 400 });
  }

  const db = adminDb();

  // Load this material's conversation (equality-only query — no composite
  // index needed), sort in memory, keep the last 20 turns.
  const snap = await db
    .collection("messages")
    .where("materialId", "==", material.id)
    .get();
  const prior: TutorTurn[] = snap.docs
    .map((d) => ({
      role: d.get("role") as "user" | "assistant",
      content: d.get("content") as string,
      createdAt: d.get("createdAt") as number,
    }))
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-20)
    .map(({ role, content }) => ({ role, content }));

  const history: TutorTurn[] = [...prior, { role: "user", content: message }];

  // Persist the user's message immediately.
  await db.collection("messages").add({
    materialId: material.id,
    userId: uid,
    role: "user",
    content: message,
    createdAt: Date.now(),
  });

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claude = tutorStream(material.title, material.rawText, history);
        for await (const event of claude) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const m = err instanceof Error ? err.message : "Tutor response failed.";
        controller.enqueue(encoder.encode(`\n\n[Error: ${m}]`));
      } finally {
        if (full.trim()) {
          await db.collection("messages").add({
            materialId: material.id,
            userId: uid,
            role: "assistant",
            content: full,
            createdAt: Date.now(),
          });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
