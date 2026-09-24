import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { joinCrew } from "@/lib/crew";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// An invite code buys Summit access, so the same rule as promo codes applies:
// no guessing at speed.
const JOIN_LIMIT = 10;
const JOIN_WINDOW_MS = 10 * 60_000;

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  let body: { code?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  if (typeof body.code !== "string" || !body.code.trim()) return Response.json({ error: "Enter a code." }, { status: 400 });

  const rl = checkRateLimit(`crewjoin:${auth.uid}`, JOIN_LIMIT, JOIN_WINDOW_MS);
  if (!rl.ok) {
    const seconds = Math.ceil(rl.retryAfterMs / 1000);
    return Response.json(
      { error: `Too many tries. Give it ${Math.ceil(seconds / 60)} minute${seconds > 60 ? "s" : ""}.` },
      { status: 429, headers: { "Retry-After": String(seconds) } }
    );
  }
  const res = await joinCrew(body.code, auth.uid);
  if (!res.ok) return Response.json({ error: res.reason }, { status: 400 });
  return Response.json({ ok: true, leaderEmail: res.leaderEmail });
}
