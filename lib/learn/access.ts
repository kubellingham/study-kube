// Which circles of a subject this account can open — the tier policy from
// lib/entitlement.ts (circleOpen), applied across a whole subject at once so
// every screen asks the same question and gets the same answer.
import { circleOpen, type Entitlement } from "@/lib/entitlement";
import type { Topic } from "@/lib/course/types";

/** A circle that has teaching in it. Climb's distilled circles don't — they
 *  carry recaps and flashcards but no quarters — so they never count towards
 *  its three, wherever they sit on the ladder. */
function taught(t: Topic): boolean {
  return (t.lessons?.length ?? 0) > 0 || (t.steps?.length ?? 0) > 0;
}

/** The ids of every open circle in this subject, in ladder order. `null`
 *  entitlement (still loading) opens nothing — the screens show their loaders. */
export function openCircleIds(e: Entitlement | null, ladder: Topic[]): Set<string> {
  const open = new Set<string>();
  if (!e) return open;
  let position = 0;
  for (const t of ladder) {
    const isTaught = t.kind !== "review" && taught(t);
    if (circleOpen(e, t, isTaught ? position : Number.MAX_SAFE_INTEGER)) open.add(t.id);
    if (isTaught) position += 1;
  }
  return open;
}
