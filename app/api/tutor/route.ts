import { NextRequest } from "next/server";
import { requireMaterial } from "@/lib/api-helpers";
import { tutorStream, type TutorTurn } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message: string = (body.message || "").toString().trim();

  const ctx = await requireMaterial(body.material_id);
  if (!ctx.ok) return ctx.response;
  const { supabase, userId, material } = ctx;

  if (!message) {
    return Response.json({ error: "Message is empty." }, { status: 400 });
  }

  // Load recent conversation (oldest first), keep the last 20 turns.
  const { data: prior } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("material_id", material.id)
    .order("created_at", { ascending: true })
    .limit(20);

  const history: TutorTurn[] = [
    ...((prior as TutorTurn[]) ?? []),
    { role: "user", content: message },
  ];

  // Persist the user's message immediately.
  await supabase.from("chat_messages").insert({
    material_id: material.id,
    user_id: userId,
    role: "user",
    content: message,
  });

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claude = tutorStream(material.title, material.raw_text, history);
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
        const message =
          err instanceof Error ? err.message : "Tutor response failed.";
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
      } finally {
        if (full.trim()) {
          await supabase.from("chat_messages").insert({
            material_id: material.id,
            user_id: userId,
            role: "assistant",
            content: full,
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
