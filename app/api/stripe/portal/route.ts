import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeReady } from "@/lib/stripe";

export const runtime = "nodejs";

// Stripe billing portal — manage/cancel a subscription.
export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!stripeReady()) return Response.json({ error: "Payments aren't switched on yet." }, { status: 400 });

  const customerId = (await adminDb().collection("entitlements").doc(auth.uid).get()).data()?.stripeCustomerId as string | undefined;
  if (!customerId) return Response.json({ error: "No billing account yet." }, { status: 400 });

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  try {
    const portal = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: `${proto}://${host}/learn` });
    return Response.json({ url: portal.url });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not open billing." }, { status: 500 });
  }
}
