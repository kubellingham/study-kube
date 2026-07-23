import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeReady, PLANS, lookupKey, introCouponId, CREW, CREW_SIZES, crewLookup } from "@/lib/stripe";

export const runtime = "nodejs";

// One-time (idempotent) provisioning: create the Kube products, their monthly +
// annual prices (with stable lookup_keys), and the first-month intro coupons.
// Owner runs it once from /admin. Re-running is safe — existing items are reused.
export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  if (!stripeReady()) return Response.json({ error: "Set STRIPE_SECRET_KEY in Vercel first." }, { status: 400 });

  const s = stripe();
  const cfgRef = adminDb().collection("config").doc("stripe");
  const cfg = ((await cfgRef.get()).data() as { products?: Record<string, string> } | undefined) || {};
  const products: Record<string, string> = { ...(cfg.products || {}) };
  const prices: Record<string, string> = {};

  try {
    for (const key of ["climb", "summit"] as const) {
      const plan = PLANS[key];
      if (!products[key]) {
        const p = await s.products.create({ name: plan.name, description: plan.blurb, metadata: { tier: plan.tier } });
        products[key] = p.id;
      }
      for (const interval of ["month", "annual"] as const) {
        const lk = lookupKey(key, interval);
        const found = await s.prices.list({ lookup_keys: [lk], limit: 1 });
        if (found.data[0]) { prices[lk] = found.data[0].id; continue; }
        const created = await s.prices.create({
          product: products[key],
          currency: "usd",
          unit_amount: interval === "month" ? plan.month : plan.annual,
          recurring: { interval: interval === "month" ? "month" : "year" },
          lookup_key: lk,
          transfer_lookup_key: true,
          metadata: { tier: plan.tier, interval },
        });
        prices[lk] = created.id;
      }
      // First-month intro coupon (amount off, once).
      const couponId = introCouponId(key);
      const off = plan.month - plan.introMonth;
      try {
        await s.coupons.retrieve(couponId);
      } catch {
        await s.coupons.create({ id: couponId, amount_off: off, currency: "usd", duration: "once", name: `${plan.name} intro` });
      }
    }
    // ── Kube Crew (group billing) — one product, a price per seat size × interval ──
    if (!products.crew) {
      const p = await s.products.create({ name: CREW.name, description: CREW.blurb, metadata: { tier: "crew" } });
      products.crew = p.id;
    }
    for (const size of CREW_SIZES) {
      for (const interval of ["month", "annual"] as const) {
        const lk = crewLookup(size, interval);
        const found = await s.prices.list({ lookup_keys: [lk], limit: 1 });
        if (found.data[0]) { prices[lk] = found.data[0].id; continue; }
        const created = await s.prices.create({
          product: products.crew,
          currency: "usd",
          unit_amount: interval === "month" ? CREW.sizes[size].month : CREW.sizes[size].annual,
          recurring: { interval: interval === "month" ? "month" : "year" },
          lookup_key: lk,
          transfer_lookup_key: true,
          metadata: { tier: "crew", size: String(size), interval },
        });
        prices[lk] = created.id;
      }
    }

    await cfgRef.set({ products, prices, updatedAt: Date.now() }, { merge: true });
    return Response.json({ ok: true, products, prices });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Stripe setup failed." }, { status: 500 });
  }
}
