import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { getCrewForLeader, getCrewForMember } from "@/lib/crew";

export const runtime = "nodejs";

// This user's crew standing: the crew they lead (if any) and the one they're a
// member of (if any). Emails of members are omitted — only counts + the code.
export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  const [led, member] = await Promise.all([getCrewForLeader(auth.uid), getCrewForMember(auth.uid)]);
  return Response.json({
    leader: led && led.active
      ? { inviteCode: led.inviteCode, size: led.size, count: led.memberUids?.length ?? 1 }
      : null,
    member: member && member.leaderUid !== auth.uid
      ? { leaderEmail: member.leaderEmail, size: member.size, count: member.memberUids?.length ?? 1 }
      : null,
  });
}
