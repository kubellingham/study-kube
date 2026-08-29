import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { getEntitlement } from "@/lib/entitlement-server";
import type { Tier } from "@/lib/entitlement";

export const runtime = "nodejs";

// ByteLabs checks whether a learner has access to paid features before serving
// them. Called server-to-server with the learner's Firebase ID token (obtained
// via /api/handoff/exchange). No body — uid comes from the verified token.
//
// POST (no body required — uid extracted from Authorization header)
// → 200 { entitled: bool, tier: "climb" | "summit" | "crew" | null }
// → 401 (invalid or expired token)
//
// POST is deliberate: uid is a PII-class identifier. A GET with ?uid= puts it
// in server logs and CDN caches. The token stays in the Authorization header.
//
// entitled is true when the user holds any active Kube tier. ByteLabs maps:
//   climb   → basic lab access (practice mode, limited assistant)
//   summit  → full lab access (ambient assistant, evaluation mode)
//   crew    → summit for a group
//
// A non-entitled user (tier: null) can still preview in ByteLabs with capped
// attempts and a "upgrade via Kube" CTA.

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });

  try {
    const ent = await getEntitlement(auth.uid);
    const tier: Tier | null = ent.tier ?? null;
    return Response.json({
      entitled: tier !== null,
      tier,
    });
  } catch {
    return Response.json({ entitled: false, tier: null });
  }
}
