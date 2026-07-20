import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { extractDocumentText } from "@/lib/ingest/office";
import {
  classifyStream,
  parseClassification,
  syllabusStream,
  parseSyllabus,
  generateUnitStream,
  parseGeneratedUnit,
  assembleUnit,
  pastPaperStream,
  parsePastPaper,
  assemblePastPaperQuestions,
  normalizeCourse,
} from "@/lib/course/generate";
import type { Section, ExamQuestion, IngestedFile } from "@/lib/course/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_PDF_BYTES = 25 * 1024 * 1024;

/** The single intake endpoint (KUBE_INTAKE_FLOW.md): accepts ANY course file,
 *  silently classifies it (syllabus / unit / past paper / notes), routes it to
 *  the right digestion, and records durable per-file memory keyed by content
 *  hash so nothing already learned is ever re-processed. Streams heartbeat
 *  bytes throughout, then a final RESULT line. */
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let courseId: string;
  let fileName = "pasted text";
  let rawText = "";

  try {
    const form = await req.formData();
    courseId = (form.get("courseId") || "").toString();
    const pasted = (form.get("text") || "").toString().trim();
    const file = form.get("file");

    if (!courseId) {
      return Response.json({ error: "Missing course." }, { status: 400 });
    }
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_PDF_BYTES) {
        return Response.json({ error: "File is too large (max 25 MB)." }, { status: 400 });
      }
      fileName = file.name;
      const bytes = new Uint8Array(await file.arrayBuffer());
      rawText = await extractDocumentText(bytes, file.name);
    } else if (pasted) {
      rawText = pasted;
    }
    if (rawText.trim().length < 100) {
      return Response.json(
        { error: "Please upload a PDF (or paste text) with enough material to work from." },
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
  const sections = ((snap.get("sections") as Section[]) ?? []).slice();
  const examBank = ((snap.get("examBank") as ExamQuestion[]) ?? []).slice();
  const files = ((snap.get("files") as IngestedFile[]) ?? []).slice();

  // Durable per-file memory: same content already digested → skip entirely.
  const fileId = createHash("sha256").update(rawText).digest("hex").slice(0, 16);
  const already = files.find((f) => f.id === fileId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const say = (s: string) => controller.enqueue(encoder.encode(s));
      const finish = (result: object) =>
        say(`\nRESULT ${JSON.stringify(result)}\n`);

      // Run a Claude stream to completion, emitting heartbeat bytes. The
      // four stream helpers have different parsed-output generics, so accept
      // the raw event iterable shape via the SDK's own event union.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async function run(claude: AsyncIterable<any>): Promise<string> {
        let jsonText = "";
        let ticks = 0;
        for await (const event of claude) {
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            jsonText += (event.delta.text as string) ?? "";
          }
          ticks += 1;
          if (ticks % 20 === 0) say(".");
        }
        return jsonText;
      }

      try {
        if (already) {
          finish({
            ok: true,
            skipped: true,
            kind: already.kind,
            label: already.label,
            message: `Kube already learned "${already.label}" — nothing re-processed.`,
          });
          return;
        }

        say(`Kube is reading ${fileName}…\n`);
        const classification = parseClassification(
          await run(classifyStream(courseTitle, rawText))
        );
        say(`\nFiled as: ${classification.label}\n`);

        const record: IngestedFile = {
          id: fileId,
          name: fileName,
          kind: classification.kind,
          unit: classification.unit ?? null,
          label: classification.label,
          topics: 0,
          questions: 0,
          digestedAt: Date.now(),
        };

        if (classification.kind === "syllabus") {
          say("Reading the shape of the whole course…\n");
          const parsed = parseSyllabus(await run(syllabusStream(courseTitle, rawText)));
          await courseRef.update({
            syllabus: parsed,
            files: [...files, record],
            updatedAt: Date.now(),
          });
          finish({
            ok: true,
            kind: "syllabus",
            label: classification.label,
            units: parsed.units.length,
            cos: parsed.cos.length,
          });
          return;
        }

        if (classification.kind === "unit") {
          const fed = sections.map((s) => s.unit);
          const unitNumber =
            classification.unit ?? (fed.length ? Math.max(...fed) + 1 : 1);
          say(`Teaching itself Unit ${unitNumber}…\n`);

          // Re-digesting a unit replaces it.
          const keptSections = sections.filter((s) => s.unit !== unitNumber);
          const keptBank = examBank.filter((q) => q.unit !== unitNumber);
          const existingTopics = keptSections
            .flatMap((s) => s.topics)
            .map((t) => ({ id: t.id, title: t.title }));

          const generated = parseGeneratedUnit(
            await run(
              generateUnitStream(courseTitle, unitNumber, rawText, existingTopics)
            )
          );
          const { section, questions } = assembleUnit(
            generated,
            unitNumber,
            existingTopics.map((t) => t.id)
          );
          if (section.topics.length === 0) {
            throw new Error("The model returned no usable topics — try again.");
          }
          record.unit = unitNumber;
          record.topics = section.topics.length;
          record.questions = questions.length;

          await courseRef.update({
            sections: normalizeCourse([...keptSections, section]),
            examBank: [...keptBank, ...questions],
            files: [...files.filter((f) => f.unit !== unitNumber || f.kind !== "unit"), record],
            updatedAt: Date.now(),
          });
          finish({
            ok: true,
            kind: "unit",
            label: classification.label,
            unit: unitNumber,
            topics: section.topics.length,
            questions: questions.length,
          });
          return;
        }

        if (classification.kind === "pastpaper") {
          const topics = sections.flatMap((s) => s.topics);
          if (topics.length === 0) {
            // Don't record memory — the paper should be re-added once the
            // ladder exists so its questions can attach to topics.
            finish({
              ok: true,
              kind: "pastpaper",
              deferred: true,
              label: classification.label,
              message:
                "Kube can see this is a past paper, but the ladder is empty — add unit material first, then add this paper again so its questions can attach to topics.",
            });
            return;
          }
          say("Reading how this course gets tested…\n");
          const parsed = parsePastPaper(
            await run(
              pastPaperStream(
                courseTitle,
                rawText,
                topics.map((t) => ({ id: t.id, title: t.title }))
              )
            )
          );
          const questions = assemblePastPaperQuestions(
            parsed,
            topics.map((t) => ({ id: t.id, unit: t.unit })),
            fileId
          );
          if (questions.length === 0) {
            throw new Error(
              "No questions could be mapped onto the ladder — try again after adding more units."
            );
          }
          record.questions = questions.length;
          await courseRef.update({
            examBank: [...examBank, ...questions],
            files: [...files, record],
            updatedAt: Date.now(),
          });
          finish({
            ok: true,
            kind: "pastpaper",
            label: classification.label,
            questions: questions.length,
          });
          return;
        }

        // notes / anything else: remember it, honestly report what happened.
        await courseRef.update({
          files: [...files, record],
          updatedAt: Date.now(),
        });
        finish({
          ok: true,
          kind: "notes",
          label: classification.label,
          message:
            "Filed as notes and remembered. Kube doesn't teach from notes yet — units and past papers drive the ladder.",
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Digestion failed.";
        finish({ ok: false, error: message });
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
