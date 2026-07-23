import { NextRequest } from "next/server";
import { requireEntitlement } from "@/lib/entitlement-server";
import { generateObservation } from "@/lib/course/generate";
import { UsageMeter } from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT = 400_000;
const MAX_IMAGES = 30;
const MAX_IMAGE_B64 = 400_000;

type Img = { mediaType: string; data: string };
function sanitize(raw: unknown): Img[] {
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

// Kube's "read": before digesting, look at the file and report back — what it
// is, what's in it, whether it can be taught from knowledge, and what to do.
export async function POST(req: NextRequest) {
  const gate = await requireEntitlement(req, "climb");
  if (!gate.ok) return gate.response;

  let body: { courseTitle?: string; name?: string; text?: string; images?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  const courseTitle = (body.courseTitle || "").toString().slice(0, 200);
  const name = (body.name || "your file").toString().slice(0, 200);
  const text = (body.text || "").toString().slice(0, MAX_TEXT).trim();
  const images = sanitize(body.images);
  if (text.length < 40 && images.length === 0) {
    return Response.json({ error: "That file had too little to read." }, { status: 400 });
  }

  try {
    const meter = new UsageMeter();
    const read = await generateObservation(courseTitle, name, text, images, meter);
    return Response.json({ read, cost: meter.summary() });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Kube couldn't read that file." }, { status: 502 });
  }
}
