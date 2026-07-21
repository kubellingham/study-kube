import { createHash } from "crypto";
import { NextRequest, after } from "next/server";
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

const MAX_FILE_BYTES = 4 * 1024 * 1024; // fallback multipart path only
const MAX_TEXT_CHARS = 400_000;
const MAX_IMAGES = 30;
const MAX_IMAGE_B64 = 400_000; // per image, base64 chars (~300 KB binary)

type IngestImage = { mediaType: string; data: string };

function sanitizeImages(raw: unknown): IngestImage[] {
  if (!Array.isArray(raw)) return [];
  const out: IngestImage[] = [];
  for (const item of raw) {
    if (out.length >= MAX_IMAGES) break;
    if (!item || typeof item !== "object") continue;
    const mediaType = (item as { mediaType?: unknown }).mediaType;
    const data = (item as { data?: unknown }).data;
    if (typeof data !== "string" || data.length === 0 || data.length > MAX_IMAGE_B64) continue;
    if (!/^[A-Za-z0-9+/=]+$/.test(data.slice(0, 256))) continue;
    out.push({
      mediaType: mediaType === "image/png" ? "image/png" : "image/jpeg",
      data,
    });
  }
  return out;
}

/** Intake endpoint (KUBE_INTAKE_FLOW.md), background-job edition. The client
 *  extracts text in the browser and POSTs JSON {courseId, name, text}; this
 *  handler classifies-and-digests AFTER responding, writing progress to an
 *  ingestJobs doc the client watches. Closing the tab is safe — the job
 *  finishes on its own and the course updates when it's done. */
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let courseId = "";
  let fileName = "pasted text";
  let rawText = "";
  let images: IngestImage[] = [];

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      courseId = (body.courseId || "").toString();
      fileName = (body.name || "pasted text").toString().slice(0, 200);
      rawText = (body.text || "").toString();
      images = sanitizeImages(body.images);
    } else {
      // Fallback for clients that couldn't extract locally (small files only).
      const form = await req.formData();
      courseId = (form.get("courseId") || "").toString();
      const pasted = (form.get("text") || "").toString().trim();
      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_FILE_BYTES) {
          return Response.json(
            { error: "File is too large to upload directly — the app extracts text on your device for big files; try again from the app." },
            { status: 400 }
          );
        }
        fileName = file.name;
        const bytes = new Uint8Array(await file.arrayBuffer());
        rawText = await extractDocumentText(bytes, file.name);
      } else {
        rawText = pasted;
      }
    }
    if (!courseId) {
      return Response.json({ error: "Missing course." }, { status: 400 });
    }
    rawText = rawText.slice(0, MAX_TEXT_CHARS).trim();
    // Image-carried material (photos of notes, scanned papers, picture-heavy
    // decks) is welcome with little or no text — Kube reads the images.
    if (rawText.length < 100 && images.length === 0) {
      return Response.json(
        { error: "That file had too little readable text to work from." },
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
  const priorFiles = ((snap.get("files") as IngestedFile[]) ?? []).slice();

  // Durable per-file memory: same content already digested → nothing to do.
  // Images count as content — a deck whose text is identical but whose
  // pictures differ is a different file.
  const hasher = createHash("sha256").update(rawText);
  for (const img of images) hasher.update(img.data.slice(0, 4096));
  const fileId = hasher.digest("hex").slice(0, 16);
  const already = priorFiles.find((f) => f.id === fileId);
  if (already) {
    return Response.json({
      skipped: true,
      note: `Kube already learned "${already.label}" — nothing re-processed.`,
    });
  }

  // Create the job doc, respond immediately, digest in the background.
  const jobRef = db.collection("ingestJobs").doc();
  await jobRef.set({
    userId: uid,
    courseId,
    fileName,
    status: "working",
    note: "Kube is reading it…",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  after(async () => {
    const setJob = (fields: Record<string, unknown>) =>
      jobRef.update({ ...fields, updatedAt: Date.now() }).catch(() => {});

    async function runToText(
      claude: AsyncIterable<{ type: string; delta?: { type: string; text?: string } }>
    ): Promise<string> {
      let jsonText = "";
      for await (const event of claude) {
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          jsonText += event.delta.text ?? "";
        }
      }
      return jsonText;
    }

    try {
      const classification = parseClassification(
        // A few images are enough to classify; generation gets them all.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await runToText(classifyStream(courseTitle, rawText, images.slice(0, 4)) as AsyncIterable<any>)
      );
      await setJob({ note: `Filed as: ${classification.label}. Digesting…`, label: classification.label, kind: classification.kind });

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
        const parsed = parseSyllabus(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await runToText(syllabusStream(courseTitle, rawText, images) as AsyncIterable<any>)
        );
        await db.runTransaction(async (tx) => {
          const fresh = await tx.get(courseRef);
          const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter(
            (f) => f.id !== fileId
          );
          tx.update(courseRef, {
            syllabus: parsed,
            files: [...files, record],
            updatedAt: Date.now(),
          });
        });
        await setJob({
          status: "done",
          note: `Syllabus read — ${parsed.units.length} units${parsed.cos.length ? `, ${parsed.cos.length} Course Outcomes` : ""}. The course skeleton is up.`,
        });
        return;
      }

      if (classification.kind === "unit") {
        const preSections = (snap.get("sections") as Section[]) ?? [];
        const fed = preSections.map((s) => s.unit);
        const unitNumber =
          classification.unit ?? (fed.length ? Math.max(...fed) + 1 : 1);
        const existingTopics = preSections
          .flatMap((s) => s.topics)
          .map((t) => ({ id: t.id, title: t.title }));

        const generated = parseGeneratedUnit(
          await runToText(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            generateUnitStream(courseTitle, unitNumber, rawText, existingTopics, images) as AsyncIterable<any>
          )
        );

        let added = 0;
        let addedQ = 0;
        await db.runTransaction(async (tx) => {
          const fresh = await tx.get(courseRef);
          const sections = ((fresh.get("sections") as Section[]) ?? []).slice();
          const examBank = ((fresh.get("examBank") as ExamQuestion[]) ?? []).slice();
          const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter(
            (f) => f.id !== fileId
          );

          const allIds = sections.flatMap((s) => s.topics).map((t) => t.id);
          const { section, questions } = assembleUnit(generated, unitNumber, allIds);
          if (section.topics.length === 0 && questions.length === 0) {
            throw new Error(
              "This material didn't add anything new — its topics are already on the ladder."
            );
          }

          // Multiple files can feed one unit (lecture decks): APPEND new
          // topics to an existing section instead of replacing it.
          const existing = sections.find((s) => s.unit === unitNumber);
          if (existing) {
            existing.topics = [...existing.topics, ...section.topics];
          } else {
            sections.push(section);
          }
          added = section.topics.length;
          addedQ = questions.length;
          record.unit = unitNumber;
          record.topics = added;
          record.questions = addedQ;

          tx.update(courseRef, {
            sections: normalizeCourse(sections),
            examBank: [...examBank, ...questions],
            files: [...files, record],
            updatedAt: Date.now(),
          });
        });
        await setJob({
          status: "done",
          note: `Unit ${unitNumber} digested — ${added} new topic${added === 1 ? "" : "s"}, ${addedQ} exam question${addedQ === 1 ? "" : "s"}.`,
        });
        return;
      }

      if (classification.kind === "pastpaper") {
        const topics = ((snap.get("sections") as Section[]) ?? []).flatMap(
          (s) => s.topics
        );
        if (topics.length === 0) {
          await setJob({
            status: "skipped",
            note: "This is a past paper, but the ladder is empty — add unit material first, then add this paper again so its questions can attach to topics.",
          });
          return;
        }
        const parsed = parsePastPaper(
          await runToText(
            pastPaperStream(
              courseTitle,
              rawText,
              topics.map((t) => ({ id: t.id, title: t.title })),
              images
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as AsyncIterable<any>
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
        await db.runTransaction(async (tx) => {
          const fresh = await tx.get(courseRef);
          const examBank = ((fresh.get("examBank") as ExamQuestion[]) ?? []).slice();
          const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter(
            (f) => f.id !== fileId
          );
          tx.update(courseRef, {
            examBank: [...examBank, ...questions],
            files: [...files, record],
            updatedAt: Date.now(),
          });
        });
        await setJob({
          status: "done",
          note: `Past paper read — ${questions.length} exam-realistic questions added${questions.some((q) => q.co) ? " with their CO tags" : ""}.`,
        });
        return;
      }

      // notes / anything else: remember it, honestly report what happened.
      await db.runTransaction(async (tx) => {
        const fresh = await tx.get(courseRef);
        const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter(
          (f) => f.id !== fileId
        );
        tx.update(courseRef, { files: [...files, record], updatedAt: Date.now() });
      });
      await setJob({
        status: "done",
        note: "Filed as notes and remembered. Kube doesn't teach from notes yet — units and past papers drive the ladder.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Digestion failed.";
      await setJob({ status: "error", note: message });
    }
  });

  return Response.json({ jobId: jobRef.id });
}
