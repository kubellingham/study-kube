import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { ingestPdf } from "@/lib/ingest";
import {
  generateUnitStream,
  parseGeneratedUnit,
  assembleUnit,
  normalizeCourse,
} from "@/lib/course/generate";
import type { Section, ExamQuestion } from "@/lib/course/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_PDF_BYTES = 25 * 1024 * 1024;

/** Digest one unit's material (PDF or pasted text) into the course via the
 *  Claude API. Streams progress bytes while the model works (keeps the
 *  connection alive through the long generation), then a final RESULT line. */
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let courseId: string;
  let unitNumber: number;
  let rawText = "";

  try {
    const form = await req.formData();
    courseId = (form.get("courseId") || "").toString();
    unitNumber = parseInt((form.get("unit") || "").toString(), 10);
    const pasted = (form.get("text") || "").toString().trim();
    const file = form.get("file");

    if (!courseId || !Number.isFinite(unitNumber) || unitNumber < 1 || unitNumber > 20) {
      return Response.json({ error: "Missing course or unit number." }, { status: 400 });
    }
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_PDF_BYTES) {
        return Response.json({ error: "PDF is too large (max 25 MB)." }, { status: 400 });
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      rawText = (await ingestPdf(bytes, file.name)).raw_text;
    } else if (pasted) {
      rawText = pasted;
    }
    if (rawText.trim().length < 200) {
      return Response.json(
        { error: "Please upload a PDF (or paste the unit text) with enough material to teach from." },
        { status: 400 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read the upload.";
    return Response.json({ error: message }, { status: 400 });
  }

  const db = adminDb();
  const courseRef = db.collection("courses").doc(courseId);
  const snap = await courseRef.get();
  if (!snap.exists || snap.get("userId") !== uid) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const courseTitle = snap.get("title") as string;
  const existingSections = (snap.get("sections") as Section[]) ?? [];
  const existingBank = (snap.get("examBank") as ExamQuestion[]) ?? [];

  // Re-digesting a unit replaces it: drop its old section + questions first.
  const keptSections = existingSections.filter((s) => s.unit !== unitNumber);
  const keptBank = existingBank.filter((q) => q.unit !== unitNumber);
  const existingTopics = keptSections
    .flatMap((s) => s.topics)
    .map((t) => ({ id: t.id, title: t.title }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("Kube is reading the unit…\n"));
        const claude = generateUnitStream(
          courseTitle,
          unitNumber,
          rawText,
          existingTopics
        );
        let jsonText = "";
        let ticks = 0;
        for await (const event of claude) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            jsonText += event.delta.text;
          }
          // A byte every few events keeps the connection alive and gives the
          // client a heartbeat to animate.
          ticks += 1;
          if (ticks % 20 === 0) controller.enqueue(encoder.encode("."));
        }

        const generated = parseGeneratedUnit(jsonText);
        const { section, questions } = assembleUnit(
          generated,
          unitNumber,
          existingTopics.map((t) => t.id)
        );
        if (section.topics.length === 0) {
          throw new Error("The model returned no usable topics — try again.");
        }

        const sections = normalizeCourse([...keptSections, section]);
        const examBank = [...keptBank, ...questions];
        await courseRef.update({ sections, examBank, updatedAt: Date.now() });

        controller.enqueue(
          encoder.encode(
            `\nRESULT ${JSON.stringify({
              ok: true,
              unit: unitNumber,
              topics: section.topics.length,
              questions: questions.length,
            })}\n`
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Digestion failed.";
        controller.enqueue(
          encoder.encode(`\nRESULT ${JSON.stringify({ ok: false, error: message })}\n`)
        );
      } finally {
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
