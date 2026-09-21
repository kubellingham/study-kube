import { createHash } from "crypto";
import { NextRequest, after } from "next/server";
import { requireEntitlement, getEntitlement } from "@/lib/entitlement-server";
import { isOwner } from "@/lib/owner";
import { OWNER_MODEL, OWNER_PRICE_IN, OWNER_PRICE_OUT } from "@/lib/anthropic";
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
  generateUnitSkeletonCheap,
  generateTopicLessonsCheap,
  generateExamBankCheap,
  classifyCheap,
  syllabusCheap,
  budgetEngineReady,
  assembleClimbUnit,
  mapWithConcurrency,
  composeGeneratedUnit,
  assembleUnit,
  pastPaperStream,
  parsePastPaper,
  assemblePastPaperQuestions,
  normalizeCourse,
  type GenMode,
} from "@/lib/course/generate";
import {
  verifyLessons,
  verifyExamQuestions,
  emptyReport,
  reportLine,
  type VerifyReport,
} from "@/lib/course/verify";
import { EXTRAS_UNIT, EXTRAS_TITLE } from "@/lib/course/types";
import type { Section, ExamQuestion, IngestedFile, SyllabusInfo, CourseMode } from "@/lib/course/types";
import { UsageMeter, formatCost } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { CLIMB_PRICE_IN, CLIMB_PRICE_OUT, SUMMIT_PRICE_IN, SUMMIT_PRICE_OUT, SUMMIT_MODEL, SUMMIT_VISION_MODEL, CHAT_BUDGET_MODEL } from "@/lib/openrouter";

// Per-user cap for the digest endpoint. A real digest takes minutes and burns
// tokens, so five in ten minutes is generous for a genuine user and
// devastating to a bored replay-the-PDF loop.
const INGEST_LIMIT = 5;
const INGEST_WINDOW_MS = 10 * 60_000;

export const runtime = "nodejs";
// 300s is the hard ceiling on Vercel's Hobby plan — it can't be raised. The
// win comes from the generation pipeline being chunked + parallel (skeleton →
// per-topic drills + exam bank all at once), so wall-clock is the slowest
// single call, not a 48k-token serial stream. That fits comfortably inside
// 300s where the old one-shot call did not.
export const maxDuration = 300;

/** Resolves to "timeout" after ms — used as a soft budget, never throws. */
function softDeadline(ms: number): Promise<"timeout"> {
  return new Promise((res) => setTimeout(() => res("timeout"), ms));
}

// Skeleton runs first (fast); the drills get the rest of the 300s budget. If
// the budget runs out we KEEP whatever finished rather than discarding it — a
// half-built ladder is worth far more than a bill for nothing.
const DRILL_BUDGET_MS = 215_000;
// A syllabus-only "build from knowledge" invents its own scope, so bound it to
// a focused first ladder that reliably finishes; more depth comes from adding
// actual unit files (which are NOT capped).
const KNOWLEDGE_TOPIC_CAP = 8;

/** Read an explicit unit choice from the request (JSON number or form string).
 *  Accepts 1..99, or the literal "extras" to park the file in the Extras bay;
 *  anything else (absent, junk, out of range) means "auto". */
function parseUnitOverride(raw: unknown): number | null {
  if (typeof raw === "string" && raw.trim().toLowerCase() === "extras") return EXTRAS_UNIT;
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  return Number.isInteger(n) && n >= 1 && n <= 99 ? n : null;
}

/** Merge the units Kube already knows — from the ladder it's built and from a
 *  parsed syllabus — into one deduped, titled list to hand the classifier. */
function knownUnitsFor(
  sections: Section[],
  syllabus: SyllabusInfo | undefined
): { unit: number; title: string }[] {
  const byUnit = new Map<number, string>();
  for (const s of sections) if (!byUnit.has(s.unit)) byUnit.set(s.unit, s.title);
  for (const u of syllabus?.units ?? []) if (!byUnit.has(u.unit)) byUnit.set(u.unit, u.title);
  return [...byUnit.entries()].map(([unit, title]) => ({ unit, title })).sort((a, b) => a.unit - b.unit);
}

/** Drill topics concurrently, but stop waiting at the soft budget and return
 *  whatever completed (nulls for the rest). Never throws on timeout, so the
 *  caller can assemble and SAVE the partial ladder. */
async function drillWithinBudget<T, R>(
  topics: T[],
  budgetMs: number,
  fn: (item: T, index: number) => Promise<R | null>
): Promise<{ results: (R | null)[]; complete: boolean }> {
  const results: (R | null)[] = new Array(topics.length).fill(null);
  const work = mapWithConcurrency(topics, 5, async (t, i) => {
    results[i] = await fn(t, i).catch(() => null);
    return null;
  });
  const outcome = await Promise.race([
    work.then(() => "complete" as const),
    softDeadline(budgetMs),
  ]);
  return { results, complete: outcome === "complete" };
}

// Answer-checking is cheap (questions only — no material) but it must never be
// the reason a paid digest fails to save. It gets its own small budget, and on
// timeout the unit ships exactly as authored.
const VERIFY_BUDGET_MS = 45_000;

/** Re-mark a freshly generated unit: every drill check and every exam question
 *  is solved again, independently, by a checker that never sees the key. See
 *  lib/course/verify.ts for why this exists. Returns the unit unchanged if the
 *  checker can't finish in its budget. */
async function checkAnswers<
  G extends {
    topics: { title: string; lessons: { steps: unknown[] }[] }[];
    examQuestions: { prompt: string; options: string[]; answer: number }[];
  },
>(generated: G, model: string, meter: UsageMeter): Promise<{ generated: G; report: VerifyReport }> {
  const work = (async () => {
    let report = emptyReport();
    const topics = await mapWithConcurrency(generated.topics, 3, async (t) => {
      const r = await verifyLessons(
        t.lessons as { steps: { kind: string; prompt?: string; code?: string; options?: string[]; answer?: number }[] }[],
        t.title,
        { model, meter }
      ).catch(() => null);
      if (!r) return t;
      report = {
        checked: report.checked + r.report.checked,
        repaired: report.repaired + r.report.repaired,
        dropped: report.dropped + r.report.dropped,
        unverified: report.unverified + r.report.unverified,
      };
      return { ...t, lessons: r.lessons };
    });
    const ex = await verifyExamQuestions(generated.examQuestions, { model, meter }).catch(() => null);
    if (ex) {
      report = {
        checked: report.checked + ex.report.checked,
        repaired: report.repaired + ex.report.repaired,
        dropped: report.dropped + ex.report.dropped,
        unverified: report.unverified + ex.report.unverified,
      };
    }
    return {
      generated: { ...generated, topics, examQuestions: ex ? ex.questions : generated.examQuestions } as G,
      report,
    };
  })();
  const outcome = await Promise.race([work, softDeadline(VERIFY_BUDGET_MS)]);
  return outcome === "timeout" ? { generated, report: emptyReport() } : outcome;
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

  // Owner bypass — the account behind Kube needs to run demos and admin work
  // without tripping its own rate limits. Everyone else runs through.
  if (!isOwner(gate.email)) {
    const rl = checkRateLimit(`ingest:${uid}`, INGEST_LIMIT, INGEST_WINDOW_MS);
    if (!rl.ok) {
      const seconds = Math.ceil(rl.retryAfterMs / 1000);
      const wait = seconds < 60 ? `${seconds}s` : `${Math.ceil(seconds / 60)}m`;
      return Response.json(
        {
          error: `Kube's catching its breath — you've digested ${rl.limit} files in the last ten minutes. Try again in ${wait}.`,
        },
        { status: 429, headers: { "Retry-After": String(seconds) } }
      );
    }
  }

  // Tier decides the engine: Climb DISTILLS (concept map + exams on the budget
  // model, no drilling); Summit+ gets the deep four-quarter teaching on Sonnet.
  const ent = await getEntitlement(uid);
  // Optional: the OWNER account can run the PREMIUM deep path (top Claude model)
  // to A/B against the budget engine on the same file. OFF by default so an
  // owner upload never silently costs Opus money — set OWNER_PREMIUM=1 to enable.
  const owner = isOwner(gate.email) && process.env.OWNER_PREMIUM === "1";
  const isClimbOnly = ent.tier === "climb" && !owner;
  // Summit's deep tier is tested on the budget engine first (owner excluded —
  // owner is premium). Flip to the premium Anthropic path with SUMMIT_ENGINE.
  const summitBudget = !isClimbOnly && !owner && process.env.SUMMIT_ENGINE !== "sonnet";
  const summitOpts = { model: SUMMIT_MODEL, vision: SUMMIT_VISION_MODEL } as const;
  // Model override for the Anthropic (premium) path: owner → top model.
  const premiumModel = owner ? OWNER_MODEL : undefined;
  // The cheap mechanical steps (classify, syllabus parse) follow the budget
  // engine whenever the owner isn't on the premium path — one funded key runs
  // the whole pipeline instead of stalling on an empty Anthropic balance.
  const useBudgetSteps = !owner && budgetEngineReady();
  // The answer checker always runs on the budget engine, on every tier. It sees
  // questions only — never the source material — so it's a rounding error on
  // the bill, and marking a wrong answer right is the one failure no tier can
  // be allowed to ship.
  const checkerModel = CHAT_BUDGET_MODEL;
  // Set once the body is parsed: "file" = build strictly from the upload;
  // "augmented" = the upload leads, Kube's own knowledge fills its gaps.
  let genMode: GenMode = "file";

  let courseId = "";
  let fileName = "pasted text";
  let rawText = "";
  let images: IngestImage[] = [];
  // Optional explicit unit chosen by the student (when Kube couldn't tell which
  // unit a file was, or they picked one up front). Overrides auto-detection.
  let unitOverride: number | null = null;
  // "fromFile" = digest the upload as teaching content (default). "fromKnowledge"
  // = treat the upload as a syllabus/outline and build the ladder from Kube's own
  // knowledge (the intake-read path).
  let mode: "fromFile" | "fromKnowledge" | "augmented" = "fromFile";

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      courseId = (body.courseId || "").toString();
      fileName = (body.name || "pasted text").toString().slice(0, 200);
      rawText = (body.text || "").toString();
      images = sanitizeImages(body.images);
      if (body.mode === "fromKnowledge") mode = "fromKnowledge";
      else if (body.mode === "augmented") { mode = "augmented"; genMode = "augmented"; }
      unitOverride = parseUnitOverride(body.unit);
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
      unitOverride = parseUnitOverride(form.get("unit"));
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
    // One meter for the whole digest — every model call adds its real token
    // usage here, so the finished job can show its cost. Climb is priced at the
    // budget model's rate; Summit+ at Sonnet's (the default).
    const meter = owner
      ? new UsageMeter(OWNER_PRICE_IN, OWNER_PRICE_OUT)
      : isClimbOnly
        ? new UsageMeter(CLIMB_PRICE_IN, CLIMB_PRICE_OUT)
        : summitBudget
          ? new UsageMeter(SUMMIT_PRICE_IN, SUMMIT_PRICE_OUT)
          : new UsageMeter();

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


    try {
      // Building from just an outline (Kube's own knowledge) is a Summit power —
      // Climb is grounded-only, it distills the material you actually give it.
      if (mode === "fromKnowledge" && isClimbOnly) {
        await setJob({
          status: "error",
          note: "Building a course from just an outline is a Summit feature. On Climb, upload your unit material (notes, slides, a chapter) and Kube distills it into practice, notes and mock exams.",
        });
        return;
      }

      // ── The intake-read path: build the ladder from a syllabus/outline using
      // Kube's own knowledge, no unit files needed. Skips classification. ──
      if (mode === "fromKnowledge") {
        const preSections = (snap.get("sections") as Section[]) ?? [];
        const fed = preSections.map((s) => s.unit);
        const unitNumber = fed.length ? Math.max(...fed) + 1 : 1;
        // Building from an outline is inherently a structured course → a Path.
        if (!snap.get("mode") && preSections.length === 0) {
          await courseRef.set({ mode: "path" as CourseMode }, { merge: true }).catch(() => {});
        }
        // Prior context for the generator = topics from units that come
        // earlier in the LADDER order (not upload order). fromKnowledge
        // always creates a new unit at Max+1, so every existing topic
        // qualifies — the filter is defensive but consistent with the
        // classified-unit path below.
        const existingTopics = preSections
          .filter((s) => s.unit <= unitNumber)
          .flatMap((s) => s.topics)
          .map((t) => ({ id: t.id, title: t.title }));
        await setJob({ note: "Reading your outline and planning the ladder from Kube's own knowledge…", label: "built from your outline", kind: "unit" });

        const fullSkeleton = summitBudget
          ? await generateUnitSkeletonCheap(courseTitle, unitNumber, rawText, existingTopics, images, meter, { ...summitOpts, cram: false, mode: "knowledge" })
          : await generateUnitSkeleton(courseTitle, unitNumber, rawText, existingTopics, images, "knowledge", meter, premiumModel);
        // Bound a knowledge build so it reliably finishes inside the function
        // limit; the rest of the outline is covered by adding unit files later.
        const kTopics = fullSkeleton.topics.slice(0, KNOWLEDGE_TOPIC_CAP);
        const skeleton = { ...fullSkeleton, topics: kTopics };
        await setJob({ note: `Mapped ${kTopics.length} concept${kTopics.length === 1 ? "" : "s"} — teaching each from scratch…` });
        const titles = kTopics.map((t) => t.title);
        let done = 0;
        // Exam bank runs alongside the drills; we take it if it lands in time.
        let examQuestions: Awaited<ReturnType<typeof generateExamBank>> = [];
        const examP = (summitBudget
          ? generateExamBankCheap(courseTitle, unitNumber, rawText, kTopics, images, meter, { ...summitOpts, mode: "knowledge" })
          : generateExamBank(courseTitle, unitNumber, rawText, kTopics, images, "knowledge", meter, premiumModel))
          .then((q) => { examQuestions = q; })
          .catch(() => {});
        const { results: lessonsByTopic, complete } = await drillWithinBudget(kTopics, DRILL_BUDGET_MS, async (topic) => {
          const lessons = summitBudget
            ? await generateTopicLessonsCheap(courseTitle, unitNumber, rawText, topic, titles, images, meter, { ...summitOpts, mode: "knowledge" })
            : await generateTopicLessons(courseTitle, unitNumber, rawText, topic, titles, images, "knowledge", meter, premiumModel);
          done += 1;
          await setJob({ note: `Building lessons — ${done}/${kTopics.length} done…` });
          return lessons;
        });
        await Promise.race([examP, softDeadline(4000)]);
        const composed = composeGeneratedUnit(skeleton, lessonsByTopic, examQuestions);
        await setJob({ note: "Checking every answer key…" });
        const { generated, report: vr } = await checkAnswers(composed, checkerModel, meter);

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
            throw new Error("Kube couldn't finish any lessons in time — try adding a unit file directly rather than building from the outline.");
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
        const kBase = complete
          ? `Built ${added} concept${added === 1 ? "" : "s"} from your outline. Add your notes anytime to ground it in your exact course.`
          : `Built ${added} concept${added === 1 ? "" : "s"} before time ran out — your ladder's up and saved. Add your unit files to go deeper.`;
        const kNote = reportLine(vr) ? `${kBase} (Answer check: ${reportLine(vr)}.)` : kBase;
        await setJob({ status: "done", cost: meter.summary(), note: kNote });
        return;
      }

      // Classification is a cheap mechanical step — run it on the budget engine
      // when one is configured so a budget digest needs no Anthropic credit.
      // (A few images are enough to classify; generation gets them all.)
      // We hand it two extra signals so it rarely has to guess the unit: the
      // file's own name, and the units this course already knows (syllabus +
      // ladder), so a file can be matched to a unit by its topics.
      const knownUnits = knownUnitsFor(
        (snap.get("sections") as Section[]) ?? [],
        snap.get("syllabus") as SyllabusInfo | undefined
      );
      const hints = { fileName, knownUnits };
      const classification = useBudgetSteps
        ? await classifyCheap(courseTitle, rawText, images.slice(0, 4), meter, summitOpts, hints)
        : parseClassification(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await runToText(classifyStream(courseTitle, rawText, images.slice(0, 4), hints) as AsyncIterable<any>)
          );

      // The student's explicit choice always wins over the guess. Choosing a
      // unit also means "treat this as teaching material for that unit".
      const detectedKind = unitOverride != null ? "unit" : classification.kind;
      const detectedUnit = unitOverride ?? classification.unit;

      // The one honest move when Kube genuinely can't tell which unit a piece of
      // teaching material is: ASK, rather than silently parking it at the end.
      // (Syllabus / past paper / notes don't need a unit, so they never ask.)
      if (detectedKind === "unit" && detectedUnit == null) {
        const fed = ((snap.get("sections") as Section[]) ?? []).map((s) => s.unit);
        const suggestedUnit = fed.length ? Math.max(...fed) + 1 : 1;
        await setJob({
          status: "needs-unit",
          note: `Kube couldn't tell which unit “${fileName}” belongs to. Which unit is it?`,
          label: classification.label,
          suggestedUnit,
          knownUnits,
        });
        return;
      }

      // Decide the subject's SHAPE from its very first material, once. A
      // syllabus or a clearly-numbered unit means the course has a known
      // order → a Path (the ladder). A loose first file (unnumbered notes, a
      // past paper, scattered material) means there's no true order yet → a
      // Map (topic clusters). Never overwrites a mode already set (Kube's
      // earlier read, or the student's manual switch).
      const existingMode = snap.get("mode") as CourseMode | undefined;
      const hadContent = ((snap.get("sections") as Section[]) ?? []).length > 0;
      let courseMode: CourseMode = existingMode ?? "path";
      if (!existingMode && !hadContent) {
        const structured =
          detectedKind === "syllabus" ||
          (detectedKind === "unit" && detectedUnit != null) ||
          !!snap.get("syllabus");
        courseMode = structured ? "path" : "map";
        await courseRef.set({ mode: courseMode }, { merge: true }).catch(() => {});
      }
      // In a Map, teaching material — including plain notes — becomes standalone,
      // theme-clustered topics (not units). The ladder's ordering/dependencies
      // are switched off; each file becomes its own cluster.
      const isMap = courseMode === "map";

      // The Extras bay: material that belongs to no unit. Either the student
      // said so ("not a unit — put it in Extras"), or it's a stray handout in a
      // Path, which used to be merely "remembered" and never taught. Extras
      // material is taught STANDALONE — it has no place in the order to lean on.
      const toExtras =
        unitOverride === EXTRAS_UNIT || (!isMap && detectedKind === "notes");

      await setJob({ note: `Filed as: ${classification.label}. Digesting…`, label: classification.label, kind: detectedKind });

      const record: IngestedFile = {
        id: fileId,
        name: fileName,
        kind: detectedKind,
        unit: detectedUnit ?? null,
        label: classification.label,
        topics: 0,
        questions: 0,
        digestedAt: Date.now(),
      };

      if (detectedKind === "syllabus") {
        const parsed = useBudgetSteps
          ? await syllabusCheap(courseTitle, rawText, images, meter, summitOpts)
          : parseSyllabus(
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
          note: `Syllabus read — ${parsed.units.length} units${parsed.cos.length ? `, ${parsed.cos.length} Course Outcomes` : ""}. The course skeleton is up.`,
        });
        return;
      }

      if (detectedKind === "unit" || (isMap && detectedKind === "notes") || toExtras) {
        const preSections = (snap.get("sections") as Section[]) ?? [];
        const fed = preSections.map((s) => s.unit).filter((u) => u !== EXTRAS_UNIT);
        // Extras: always the bay's sentinel, so every stray file accumulates in
        // the one Extras section (and it sorts last on a ladder).
        // Map: every file is a NEW theme cluster — next index, never merges.
        // Path: the file lands in its detected unit, merging into it if present.
        const unitNumber = toExtras
          ? EXTRAS_UNIT
          : isMap
            ? (fed.length ? Math.max(...fed) + 1 : 1)
            : detectedUnit ?? (fed.length ? Math.max(...fed) + 1 : 1);
        // Both a Map cluster and an Extras entry are taught material, whatever
        // the file was originally classified as.
        if (isMap || toExtras) record.kind = "unit";
        // Standalone teaching for anything with no position in an order.
        const standalone = isMap || toExtras;
        // Prior context for the generator = topics from units that come
        // earlier in the LADDER order, or the same unit (a follow-up
        // upload extending it), NOT units uploaded earlier that will
        // sort AFTER this one. A student who uploaded Unit 5 first and
        // is now adding Unit 2 must not have Unit 5 topics fed back as
        // "already-known prior material" — normalizeCourse sorts by unit
        // number, so Unit 2 will land BEFORE Unit 5 in the ladder and
        // the AI's teach steps should reflect that. `allIds` (below,
        // for assembleUnit's collision check) still uses the full set —
        // dedupe integrity is separate from teaching context.
        const existingTopics = standalone
          ? []
          : preSections
              .filter((s) => s.unit <= unitNumber)
              .flatMap((s) => s.topics)
              .map((t) => ({ id: t.id, title: t.title }));
        // Deep, self-contained concepts (not many tiny slivers) when standalone.
        const skelOpts = standalone ? { standalone: true, cram: false } : undefined;

        // ── CLIMB: distill only. Concept map + exams on the budget model; NO
        // drilling (the deep teaching is Summit). Feeds practice, notes, exams;
        // the tree shows those topics locked-behind-glass. Cheap and fast. ──
        if (isClimbOnly) {
          const skeleton = await generateUnitSkeletonCheap(courseTitle, unitNumber, rawText, existingTopics, images, meter, skelOpts);
          if (standalone) skeleton.topics = skeleton.topics.map((t) => ({ ...t, deps: [] }));
          await setJob({ note: `Mapped ${skeleton.topics.length} concept${skeleton.topics.length === 1 ? "" : "s"} — writing your practice & exams…` });
          const rawQuestions = await generateExamBankCheap(courseTitle, unitNumber, rawText, skeleton.topics, images, meter).catch(() => []);
          await setJob({ note: "Checking every answer key…" });
          const climbCheck = await Promise.race([
            verifyExamQuestions(rawQuestions, { model: checkerModel, meter }).catch(() => null),
            softDeadline(VERIFY_BUDGET_MS),
          ]);
          const questionsRaw =
            climbCheck && climbCheck !== "timeout" ? climbCheck.questions : rawQuestions;
          const climbReport = climbCheck && climbCheck !== "timeout" ? climbCheck.report : emptyReport();
          record.cost = meter.summary();
          let addedC = 0;
          let addedCQ = 0;
          await db.runTransaction(async (tx) => {
            const fresh = await tx.get(courseRef);
            const sections = ((fresh.get("sections") as Section[]) ?? []).slice();
            const examBank = ((fresh.get("examBank") as ExamQuestion[]) ?? []).slice();
            const files = ((fresh.get("files") as IngestedFile[]) ?? []).filter((f) => f.id !== fileId);
            const allIds = sections.flatMap((s) => s.topics).map((t) => t.id);
            const { section, questions } = assembleClimbUnit(skeleton, questionsRaw, unitNumber, allIds);
            if (toExtras) {
              section.extras = true;
              section.title = EXTRAS_TITLE;
              section.tagline = "Stray material that belongs to no unit — still fully taught.";
            }
            if (section.topics.length === 0) {
              throw new Error("This material didn't add anything new — its topics are already on the ladder.");
            }
            const existing = sections.find((s) => s.unit === unitNumber);
            if (existing) existing.topics = [...existing.topics, ...section.topics];
            else sections.push(section);
            addedC = section.topics.length;
            addedCQ = questions.length;
            record.unit = unitNumber;
            record.topics = addedC;
            record.questions = addedCQ;
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
            note:
              `${toExtras ? "Added to Extras" : isMap ? "New cluster added" : `Unit ${unitNumber} distilled`} — ${addedC} concept${addedC === 1 ? "" : "s"} with recap, flashcards & ${addedCQ} exam question${addedCQ === 1 ? "" : "s"}. Practice and notes are ready.` +
              (reportLine(climbReport) ? ` (Answer check: ${reportLine(climbReport)}.)` : ""),
          });
          return;
        }

        // Chunked + parallel generation (see lib/course/generate.ts): a fast
        // skeleton call, then every topic's four-quarter drill and the exam
        // bank generated concurrently. If the whole thing can't finish inside
        // the function limit we KEEP the topics that did (drillWithinBudget)
        // rather than throwing away a heavy file's worth of tokens.
        const skeleton = summitBudget
          ? await generateUnitSkeletonCheap(courseTitle, unitNumber, rawText, existingTopics, images, meter, { ...summitOpts, cram: false, mode: genMode, standalone })
          : await generateUnitSkeleton(courseTitle, unitNumber, rawText, existingTopics, images, genMode, meter, premiumModel, standalone);
        if (standalone) skeleton.topics = skeleton.topics.map((t) => ({ ...t, deps: [] }));
        await setJob({
          note: `Mapped ${skeleton.topics.length} concept${skeleton.topics.length === 1 ? "" : "s"} — drilling each into a full circle…`,
        });

        const titles = skeleton.topics.map((t) => t.title);
        let done = 0;
        let examQuestions: Awaited<ReturnType<typeof generateExamBank>> = [];
        const examP = (summitBudget
          ? generateExamBankCheap(courseTitle, unitNumber, rawText, skeleton.topics, images, meter, { ...summitOpts, mode: genMode })
          : generateExamBank(courseTitle, unitNumber, rawText, skeleton.topics, images, genMode, meter, premiumModel))
          .then((q) => { examQuestions = q; })
          .catch(() => {});
        const { results: lessonsByTopic, complete } = await drillWithinBudget(skeleton.topics, DRILL_BUDGET_MS, async (topic) => {
          const lessons = summitBudget
            ? await generateTopicLessonsCheap(courseTitle, unitNumber, rawText, topic, titles, images, meter, { ...summitOpts, mode: genMode, standalone })
            : await generateTopicLessons(courseTitle, unitNumber, rawText, topic, titles, images, genMode, meter, premiumModel, standalone);
          done += 1;
          await setJob({ note: `Drilling circles — ${done}/${skeleton.topics.length} done…` });
          return lessons;
        });
        await Promise.race([examP, softDeadline(4000)]);
        const composed = composeGeneratedUnit(skeleton, lessonsByTopic, examQuestions);
        await setJob({ note: "Checking every answer key…" });
        const { generated, report: vr } = await checkAnswers(composed, checkerModel, meter);

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
          const { section, questions } = assembleUnit(generated, unitNumber, allIds, !standalone);
          if (toExtras) {
            section.extras = true;
            section.title = EXTRAS_TITLE;
            section.tagline = "Stray material that belongs to no unit — still fully taught.";
          }
          if (section.topics.length === 0 && questions.length === 0) {
            throw new Error(
              "This material didn't add anything new — its topics are already on the ladder."
            );
          }

          // Multiple files can feed one unit (lecture decks): APPEND new
          // topics to an existing section instead of replacing it. The review
          // node is the exception — a unit has exactly ONE, always last. The
          // incoming one supersedes the old (same id, so progress carries),
          // otherwise a unit fed twice grew two identical review circles and
          // the second one led nowhere.
          const existing = sections.find((s) => s.unit === unitNumber);
          if (existing) {
            const incomingReview = section.topics.filter((t) => t.kind === "review");
            const incomingRest = section.topics.filter((t) => t.kind !== "review");
            const keptOld = existing.topics.filter((t) => t.kind !== "review");
            const carriedReview =
              incomingReview.length > 0
                ? incomingReview
                : existing.topics.filter((t) => t.kind === "review");
            existing.topics = [...keptOld, ...incomingRest, ...carriedReview];
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
          note:
            (complete
              ? `${toExtras ? "Added to Extras" : isMap ? "New cluster added" : `Unit ${unitNumber} digested`} — ${added} new topic${added === 1 ? "" : "s"}, ${addedQ} exam question${addedQ === 1 ? "" : "s"}.`
              : `${toExtras ? "Extras" : isMap ? "Cluster added" : `Unit ${unitNumber}`}: saved the ${added} topic${added === 1 ? "" : "s"} that finished before time ran out (add this file again to build the rest${isMap ? "" : " onto the same unit"}).`) +
            (reportLine(vr) ? ` (Answer check: ${reportLine(vr)}.)` : ""),
        });
        return;
      }

      if (detectedKind === "pastpaper") {
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
      // Always record what was spent, even on failure — otherwise the back
      // office shows 0 for a job that really did burn tokens (the bug that hid
      // a whole failed digest's cost).
      const spent = meter.summary();
      await setJob({
        status: "error",
        cost: spent,
        note: spent.costUsd > 0 ? `${message} (Kube still spent ~${formatCost(spent.costUsd)} getting there.)` : message,
      });
    }
  });

  return Response.json({ jobId: jobRef.id });
}
