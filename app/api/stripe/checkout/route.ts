import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeReady, lookupKey, introCouponId, type Interval } from "@/lib/stripe";

export const runtime = "nodejs";

// Start a subscription checkout. Body: { tier: "climb"|"summit", interval }.
export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!stripeReady()) return Response.json({ error: "Payments aren't switched on yet." }, { status: 400 });

  let body: { tier?: string; interval?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  const tier = body.tier === "climb" || body.tier === "summit" ? body.tier : null;
  const interval: Interval = body.interval === "annual" ? "annual" : "month";
  if (!tier) return Response.json({ error: "Pick a plan." }, { status: 400 });

  const s = stripe();
  const cfg = (await adminDb().collection("config").doc("stripe").get()).data() as { prices?: Record<string, string> } | undefined;
  const priceId = cfg?.prices?.[lookupKey(tier, interval)];
  if (!priceId) return Response.json({ error: "Plans aren't set up yet — run Stripe setup in /admin." }, { status: 400 });

  // Reuse (or create) this user's Stripe customer.
  const entRef = adminDb().collection("entitlements").doc(auth.uid);
  let customerId = (await entRef.get()).data()?.stripeCustomerId as string | undefined;
  if (!customerId) {
    const c = await s.customers.create({ email: auth.email ?? undefined, metadata: { uid: auth.uid } });
    customerId = c.id;
    await entRef.set({ stripeCustomerId: customerId }, { merge: true });
    await adminDb().collection("stripeCustomers").doc(customerId).set({ uid: auth.uid });
  }

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  // First-month intro discount on monthly only.
  const discounts = interval === "month" ? [{ coupon: introCouponId(tier) }] : undefined;

  try {
    const session = await s.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: auth.uid,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts,
      allow_promotion_codes: discounts ? undefined : true,
      subscription_data: { metadata: { uid: auth.uid, tier } },
      success_url: `${origin}/learn?upgraded=1`,
      cancel_url: `${origin}/learn/upgrade`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Checkout failed." }, { status: 500 });
  }
}
