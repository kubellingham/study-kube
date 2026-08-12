import { createHash } from "crypto";

// A stable, privacy-preserving key for an email — used for the "we don't fully
// forget you" ledger. When an account is deleted we record this key (not the
// raw email) so a returning account can't reclaim the first-month intro price.
export function emailKey(email: string | null | undefined): string | null {
  if (!email) return null;
  const norm = email.trim().toLowerCase();
  if (!norm) return null;
  return createHash("sha256").update(norm).digest("hex").slice(0, 40);
}

// Every Firestore collection that holds a user's data, all keyed by a `userId`
// field. Deleting an account wipes the user's docs across all of these.
export const USER_DATA_COLLECTIONS = [
  "courses",
  "ingestJobs",
  "examAttempts",
  "learnProgress",
  "mistakes",
  "practiceState",
  "questionFlags",
  "slideFeedback",
  "studyPlan",
] as const;
