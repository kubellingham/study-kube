import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { leaveCrew } from "@/lib/crew";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  await leaveCrew(auth.uid);
  return Response.json({ ok: true });
}
