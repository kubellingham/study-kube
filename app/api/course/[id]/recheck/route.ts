import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { verifyStoredCourse, reportLine } from "@/lib/course/verify";
import { CHAT_BUDGET_MODEL } from "@/lib/openrouter";
import { budgetEngineReady } from "@/lib/course/generate";
import { UsageMeter } from "@/lib/usage";
import { CLIMB_PRICE_IN, CLIMB_PRICE_OUT } from "@/lib/openrouter";
import type { Section, ExamQuestion } from "@/lib/course/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Re-mark an existing course. Every drill check and exam question is solved
 * again by a checker that never sees the stored key; wrong keys are corrected
 * and unsound questions removed (lib/course/verify.ts).
 *
 * This exists because the checker was added AFTER courses had already been
 * built and paid for. Rebuilding a subject to fix a handful of bad keys would
 * mean paying for the whole digest twice; this re-marks in place for a fraction
 * of a cent, because the checker reads questions only, never the material.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await getUid(req);
  if (!uid) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!budgetEngineReady()) {
    return Response.json({ error: "The answer checker isn't configured." }, { status: 503 });
  }

  const ref = adminDb().collection("courses").doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.get("userId") !== uid) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const sections = (snap.get("sections") as Section[]) ?? [];
  const examBank = (snap.get("examBank") as ExamQuestion[]) ?? [];
  if (sections.length === 0 && examBank.length === 0) {
    return Response.json({ error: "Nothing to check yet — digest a file first." }, { status: 400 });
  }

  const meter = new UsageMeter(CLIMB_PRICE_IN, CLIMB_PRICE_OUT);
  try {
    const out = await verifyStoredCourse(sections, examBank, {
      model: CHAT_BUDGET_MODEL,
      meter,
    });
    // Only write when something actually moved — a clean course shouldn't get a
    // pointless updatedAt bump (or a needless write).
    if (out.report.repaired || out.report.dropped) {
      await ref.set(
        { sections: out.sections, examBank: out.examBank, updatedAt: Date.now() },
        { merge: true }
      );
    }
    const line = reportLine(out.report);
    return Response.json({
      ok: true,
      report: out.report,
      cost: meter.summary(),
      note: line
        ? `Re-marked ${out.report.checked} question${out.report.checked === 1 ? "" : "s"} — ${line}.`
        : `Re-marked ${out.report.checked} question${out.report.checked === 1 ? "" : "s"} — every answer key checks out.`,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "The answer check failed." },
      { status: 502 }
    );
  }
}
