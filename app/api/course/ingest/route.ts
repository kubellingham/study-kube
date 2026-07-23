import { createHash } from "crypto";
import { NextRequest, after } from "next/server";
import { requireEntitlement } from "@/lib/entitlement-server";
import { adminDb } from "@/lib/firebase/admin";
import { extractDocumentText } from "@/lib/ingest/office";
import {
  classifyStream,
  parseClassification,
  syllabusStream,
  parseSyllabus,
  generateUnitSkeleton,
  generateTopicLessons,
  generateExamBank,
  mapWithConcurrency,
  composeGeneratedUnit,
  assembleUnit,
  pastPaperStream,
  parsePastPaper,
  assemblePastPaperQuestions,
  normalizeCourse,
} from "@/lib/course/generate";
import type { Section, ExamQuestion, IngestedFile } from "@/lib/course/types";
import { UsageMeter, formatCost } from "@/lib/usage";

export const runtime = "nodejs";
// 300s is the hard ceiling on Vercel's Hobby plan — it can't be raised. The
// win comes from the generation pipeline being chunked + parallel (skeleton →
// per-topic drills + exam bank all at once), so wall-clock is the slowest
// single call, not a 48k-token serial stream. That fits comfortably inside
// 300s where the old one-shot call did not.
export const maxDuration = 300;

// Bail with a friendly status a little before the hard 300s limit, so an
// unusually heavy file reports something actionable instead of being killed
// mid-flight (which would leave the job stuck "working"/"Digesting…" forever).
const DIGEST_DEADLINE_MS = 270_000;

/** Reject if the wrapped work outruns the deadline, so the catch can write a
 *  clean error status before Vercel hard-kills the function. */
function withDeadline<T>(work: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const guard = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([work, guard]).finally(() => clearTimeout(timer)) as Promise<T>;
}

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
  // Building/digesting a subject needs at least Climb (protects digestion spend
  // and enforces the "every digested user has paid something" rule).
  const gate = await requireEntitlement(req, "climb");
  if (!gate.ok) return gate.response;
  const uid = gate.uid;

  let courseId = "";
  let fileName = "pasted text";
  let rawText = "";
  let images: IngestImage[] = [];
  // "fromFile" = digest the upload as teaching content (default). "fromKnowledge"
  // = treat the upload as a syllabus/outline and build the ladder from Kube's own
  // knowledge (the intake-read path).
  let mode: "fromFile" | "fromKnowledge" = "fromFile";

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      courseId = (body.courseId || "").toString();
      fileName = (body.name || "pasted text").toString().slice(0, 200);
      rawText = (body.text || "").toString();
      images = sanitizeImages(body.images);
      if (body.mode === "fromKnowledge") mode = "fromKnowledge";
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
    // One meter for the whole digest — every Claude call (streamed or parsed)
    // adds its real token usage here, so the finished job can show its cost.
    const meter = new UsageMeter();

    const setJob = (fields: Record<string, unknown>) =>
      jobRef.update({ ...fields, updatedAt: Date.now() }).catch(() => {});

    // Streamed calls report usage across two events: `message_start` carries
    // the input (and any cache) tokens, `message_delta` the running output
    // count. We fold both into the meter as one call.
    async function runToText(
      claude: AsyncIterable<{
        type: string;
        delta?: { type: string; text?: string };
        message?: { usage?: import("@/lib/usage").RawUsage };
        usage?: import("@/lib/usage").RawUsage;
      }>
    ): Promise<string> {
      let jsonText = "";
      const u: import("@/lib/usage").RawUsage = {};
      for await (const event of claude) {
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          jsonText += event.delta.text ?? "";
        } else if (event.type === "message_start" && event.message?.usage) {
          u.input_tokens = event.message.usage.input_tokens ?? 0;
          u.cache_creation_input_tokens = event.message.usage.cache_creation_input_tokens ?? 0;
          u.cache_read_input_tokens = event.message.usage.cache_read_input_tokens ?? 0;
        } else if (event.type === "message_delta" && event.usage) {
          u.output_tokens = event.usage.output_tokens ?? u.output_tokens ?? 0;
        }
      }
      meter.add(u);
      return jsonText;
    }

    // A compact line for the digest receipt, e.g. "· cost ~0.5¢ (real tokens)".
    const costNote = () => {
      const s = meter.summary();
      return s.calls > 0 ? ` · cost ~${formatCost(s.costUsd)}` : "";
    };

    try {
      // ── The intake-read path: build the ladder from a syllabus/outline using
      // Kube's own knowledge, no unit files needed. Skips classification. ──
      if (mode === "fromKnowledge") {
        const preSections = (snap.get("sections") as Section[]) ?? [];
        const fed = preSections.map((s) => s.unit);
        const unitNumber = fed.length ? Math.max(...fed) + 1 : 1;
        const existingTopics = preSections.flatMap((s) => s.topics).map((t) => ({ id: t.id, title: t.title }));
        await setJob({ note: "Reading your outline and planning the ladder from Kube's own knowledge…", label: "built from your outline", kind: "unit" });

        const generated = await withDeadline(
          (async () => {
            const skeleton = await generateUnitSkeleton(courseTitle, unitNumber, rawText, existingTopics, images, "knowledge", meter);
            await setJob({ note: `Mapped ${skeleton.topics.length} concept${skeleton.topics.length === 1 ? "" : "s"} — teaching each from scratch…` });
            const titles = skeleton.topics.map((t) => t.title);
            let done = 0;
            const [lessonsByTopic, examQuestions] = await Promise.all([
              mapWithConcurrency(skeleton.topics, 5, async (topic) => {
                const lessons = await generateTopicLessons(courseTitle, unitNumber, rawText, topic, titles, images, "knowledge", meter).catch(() => null);
                done += 1;
                await setJob({ note: `Building lessons — ${done}/${skeleton.topics.length} done…` });
                return lessons;
              }),
              generateExamBank(courseTitle, unitNumber, rawText, skeleton.topics, images, "knowledge", meter).catch(() => []),
            ]);
            return composeGeneratedUnit(skeleton, lessonsByTopic, examQuestions);
          })(),
          DIGEST_DEADLINE_MS,
          "Kube ran out of time building this from the outline. Try a tighter scope, or add the material directly."
        );

        let added = 0;
        let addedQ = 0;
        await db.runTransaction(async (tx) => {
          const fresh = await tx.get(courseRef);
          const sections = ((fresh.get("sections") as Section[]) ?? []).slice();
          const examBank = ((fresh.get("examBank") as ExamQuestion[]) ?? []).slice();
          const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter((f) => f.id !== fileId);
          const allIds = sections.flatMap((s) => s.topics).map((t) => t.id);
          const { section, questions } = assembleUnit(generated, unitNumber, allIds);
          if (section.topics.length === 0 && questions.length === 0) {
            throw new Error("Kube couldn't build a ladder from that outline — try adding the material directly.");
          }
          sections.push(section);
          added = section.topics.length;
          addedQ = questions.length;
          const kRecord: IngestedFile = { id: fileId, name: fileName, kind: "unit", unit: unitNumber, label: "Built from your outline", topics: added, questions: addedQ, digestedAt: Date.now(), cost: meter.summary() };
          tx.update(courseRef, {
            sections: normalizeCourse(sections),
            examBank: [...examBank, ...questions],
            files: [...files, kRecord],
            updatedAt: Date.now(),
          });
        });
        await setJob({ status: "done", cost: meter.summary(), note: `Built ${added} concept${added === 1 ? "" : "s"} from your outline${costNote()}. Add your notes anytime to ground it in your exact course.` });
        return;
      }

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
        record.cost = meter.summary();
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
          cost: meter.summary(),
          note: `Syllabus read — ${parsed.units.length} units${parsed.cos.length ? `, ${parsed.cos.length} Course Outcomes` : ""}${costNote()}. The course skeleton is up.`,
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

        // Chunked + parallel generation (see lib/course/generate.ts): a fast
        // skeleton call, then every topic's four-quarter drill and the exam
        // bank generated concurrently. Each call is small, so wall-clock is
        // the slowest single call — not a 48k-token serial stream that would
        // outrun the function limit.
        const generated = await withDeadline(
          (async () => {
            const skeleton = await generateUnitSkeleton(
              courseTitle,
              unitNumber,
              rawText,
              existingTopics,
              images,
              "file",
              meter
            );
            await setJob({
              note: `Mapped ${skeleton.topics.length} concept${skeleton.topics.length === 1 ? "" : "s"} — drilling each into a full circle…`,
            });

            const titles = skeleton.topics.map((t) => t.title);
            let done = 0;
            const [lessonsByTopic, examQuestions] = await Promise.all([
              mapWithConcurrency(skeleton.topics, 5, async (topic) => {
                const lessons = await generateTopicLessons(
                  courseTitle,
                  unitNumber,
                  rawText,
                  topic,
                  titles,
                  images,
                  "file",
                  meter
                ).catch(() => null);
                done += 1;
                await setJob({
                  note: `Drilling circles — ${done}/${skeleton.topics.length} done…`,
                });
                return lessons;
              }),
              generateExamBank(courseTitle, unitNumber, rawText, skeleton.topics, images, "file", meter).catch(
                () => []
              ),
            ]);

            return composeGeneratedUnit(skeleton, lessonsByTopic, examQuestions);
          })(),
          DIGEST_DEADLINE_MS,
          "This file was heavy and Kube ran out of time digesting it in one go. Split it into smaller chunks (e.g. per lecture) and add each — every piece will digest and stack onto the same unit."
        );

        record.cost = meter.summary();
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
          cost: meter.summary(),
          note: `Unit ${unitNumber} digested — ${added} new topic${added === 1 ? "" : "s"}, ${addedQ} exam question${addedQ === 1 ? "" : "s"}${costNote()}.`,
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
        record.cost = meter.summary();
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
          cost: meter.summary(),
          note: `Past paper read — ${questions.length} exam-realistic questions added${questions.some((q) => q.co) ? " with their CO tags" : ""}${costNote()}.`,
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
