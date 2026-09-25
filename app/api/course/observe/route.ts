import { NextRequest } from "next/server";
import { requireBuildAccess } from "@/lib/entitlement-server";
import {
  generateObservation,
  generateObservationCheap,
  budgetEngineReady,
  type IntakeFile,
} from "@/lib/course/generate";
import { UsageMeter } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkAllowance, recordSpend } from "@/lib/spend";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT = 400_000;
const MAX_FILES = 5;
const MAX_IMAGES = 12;
const MAX_IMAGE_B64 = 400_000;

type Img = { mediaType: string; data: string };
function sanitizeImages(raw: unknown): Img[] {
  if (!Array.isArray(raw)) return [];
  const out: Img[] = [];
  for (const item of raw) {
    if (out.length >= MAX_IMAGES) break;
    if (!item || typeof item !== "object") continue;
    const data = (item as { data?: unknown }).data;
    const mediaType = (item as { mediaType?: unknown }).mediaType;
    if (typeof data !== "string" || !data.length || data.length > MAX_IMAGE_B64) continue;
    out.push({ mediaType: mediaType === "image/png" ? "image/png" : "image/jpeg", data });
  }
  return out;
}

// Kube's "read": before building anything, look at the WHOLE batch the student
// just dropped in and report back — what it is, what's worth knowing, and
// whether to build straight from it or also draw on Kube's own knowledge.
export async function POST(req: NextRequest) {
  // The read costs a model call, so it follows the same gate as the build
  // it precedes: a plan, or free allowance still on the account.
  const gate = await requireBuildAccess(req);
  if (!gate.ok) return gate.response;
  // One read comes before every build, so this sits a little above the build
  // limit (5 per 10 min) to leave room for a dropped connection or a retry.
  const rl = checkRateLimit(`observe:${gate.uid}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    const seconds = Math.ceil(rl.retryAfterMs / 1000);
    return Response.json(
      { error: `That's a lot of files in a few minutes. Try again in ${Math.ceil(seconds / 60)} minute${seconds > 60 ? "s" : ""}.` },
      { status: 429, headers: { "Retry-After": String(seconds) } }
    );
  }
  // The read is the first step of a build, so it answers to the same
  // monthly allowance — better to hear it now than after choosing options.
  const allowance = await checkAllowance(gate.uid, gate.email, gate.ent, "build");
  if (!allowance.ok) return allowance.response;

  let body: { courseTitle?: string; files?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const courseTitle = (body.courseTitle || "").toString().slice(0, 200);

  const files: IntakeFile[] = [];
  if (Array.isArray(body.files)) {
    for (const raw of body.files.slice(0, MAX_FILES)) {
      if (!raw || typeof raw !== "object") continue;
      const f = raw as { name?: unknown; text?: unknown; images?: unknown };
      const text = (f.text || "").toString().slice(0, MAX_TEXT).trim();
      const images = sanitizeImages(f.images);
      if (text.length < 20 && images.length === 0) continue;
      files.push({
        name: (f.name || "your file").toString().slice(0, 200),
        text,
        images,
      });
    }
  }
  if (files.length === 0) {
    return Response.json({ error: "That upload had too little to read." }, { status: 400 });
  }

  const meter = new UsageMeter();
  try {
    // The read is a small, mechanical job — run it on the budget engine when
    // one is configured, so a budget-tier digest never needs Anthropic credit.
    const read = budgetEngineReady()
      ? await generateObservationCheap(courseTitle, files, meter)
      : await generateObservation(courseTitle, files, meter);
    return Response.json({ read, cost: meter.summary() });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Kube couldn't read that material." },
      { status: 502 }
    );
  } finally {
    await recordSpend(gate.uid, meter.costUsd(), "read");
  }
}
