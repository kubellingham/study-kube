import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { getMyCrew } from "@/lib/crew";

export const runtime = "nodejs";

/** Create an empty course shell (code + title). Units are digested into it
 *  one at a time via /api/course/unit.
 *
 *  When the caller is in a crew and passes `share: true`, the course carries
 *  `crewId = leaderUid` so every current + future member of that crew sees
 *  it (see firestore.rules — read is granted to members, writes stay
 *  owner-only). Passing `share: true` while not in a crew is a 400. */
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const code = (body.code || "").toString().trim().toUpperCase();
  const title = (body.title || "").toString().trim();
  const share = body.share === true;

  if (!code || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) {
    return Response.json(
      { error: "Course code should be letters and digits, like CSE46D." },
      { status: 400 }
    );
  }
  if (!title || title.length > 120) {
    return Response.json({ error: "Please give the course a title." }, { status: 400 });
  }

  let crewId: string | null = null;
  if (share) {
    const crew = await getMyCrew(uid);
    if (!crew) {
      return Response.json(
        { error: "You're not in a crew yet — join or start one before sharing a subject." },
        { status: 400 }
      );
    }
    crewId = crew.leaderUid;
  }

  try {
    const ref = await adminDb().collection("courses").add({
      userId: uid,
      code,
      title,
      sections: [],
      examBank: [],
      crewId,
      createdAt: Date.now(),
    });
    return Response.json({ id: ref.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create course.";
    return Response.json({ error: message }, { status: 500 });
  }
}
