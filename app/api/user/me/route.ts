import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { ensureUserDoc, getUserDoc, referralsToNextReward, REFERRAL_CONFIG } from "@/lib/referral";

export const runtime = "nodejs";

/** Returns the calling user's profile + referral state, for the account
 *  page. Auto-creates the doc if the client somehow skipped /api/user/init. */
export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const doc = (await getUserDoc(auth.uid)) ?? (await ensureUserDoc(auth.uid, null));
  return Response.json({
    user: doc,
    referral: {
      code: doc.referralCode,
      count: doc.referralCount,
      monthsGranted: doc.referralMonthsGranted,
      toNextReward: referralsToNextReward(doc.referralCount),
      perReward: REFERRAL_CONFIG.perReward,
      rewardDays: REFERRAL_CONFIG.rewardDays,
    },
  });
}
