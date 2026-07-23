import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

async function ownCourse(req: NextRequest, id: string) {
  const uid = await getUid(req);
  if (!uid) return { ok: false as const, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  const ref = adminDb().collection("courses").doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.get("userId") !== uid) {
    return { ok: false as const, response: Response.json({ error: "Course not found." }, { status: 404 }) };
  }
  return { ok: true as const, uid, ref };
}

// Rename a course (code + title). Built-in courses live in code and can't be
// reached here — only the caller's own Firestore courses.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await ownCourse(req, id);
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => ({}));
  const code = (body.code || "").toString().trim().toUpperCase();
  const title = (body.title || "").toString().trim();
  if (!code || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) {
    return Response.json({ error: "Course code should be letters and digits, like CSE46D." }, { status: 400 });
  }
  if (!title || title.length > 120) {
    return Response.json({ error: "Please give the course a title." }, { status: 400 });
  }
  try {
    await gate.ref.set({ code, title }, { merge: true });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not save." }, { status: 500 });
  }
}

// Delete a course and its in-flight ingest jobs. Per-user progress/practice
// docs are keyed by (uid, courseId) and harmlessly orphaned — a fresh course
// gets a new id, so they never collide.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await ownCourse(req, id);
  if (!gate.ok) return gate.response;
  try {
    const jobs = await adminDb().collection("ingestJobs").where("courseId", "==", id).where("userId", "==", gate.uid).get();
    await Promise.all(jobs.docs.map((d) => d.ref.delete()));
    await gate.ref.delete();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not delete." }, { status: 500 });
  }
}
