"use client";

// Study rhythm — the person-level "how you actually study" read, derived from
// the S4 event log (study pings + lesson checks carry timestamps). Rhythm is
// about the STUDENT, not one course, so it's computed across all their events.
// Stays quiet until there's enough history to say something true.
import { loadEvents, type LearningEvent } from "@/lib/learn/events";

const DAY = 86_400_000;

export interface Rhythm {
  /** Enough distinct study days to say anything at all. */
  enough: boolean;
  /** Distinct calendar days studied in the last 7. */
  daysLast7: number;
  /** Consecutive days up to today (or yesterday) with any activity. */
  streak: number;
  /** e.g. "8 PM" — the hour you study most, or null when it isn't clear yet. */
  favoriteHourLabel: string | null;
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function hourLabel(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${period}`;
}

/** Pure: fold a list of timestamped events into a rhythm read. */
export function computeRhythm(events: { ts: number }[], now: number): Rhythm {
  const days = new Set<string>();
  const hours = new Array(24).fill(0) as number[];
  for (const e of events) {
    days.add(dayKey(e.ts));
    hours[new Date(e.ts).getHours()] += 1;
  }

  // Days studied in the last 7 calendar days (including today).
  let daysLast7 = 0;
  for (let i = 0; i < 7; i++) {
    if (days.has(dayKey(now - i * DAY))) daysLast7 += 1;
  }

  // Streak: walk back from today (or yesterday, if today's quiet so far).
  let streak = 0;
  let cursor = days.has(dayKey(now)) ? now : now - DAY;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }

  // Favorite hour: the modal hour, but only once there's a real signal —
  // a handful of events and a clear peak.
  const total = hours.reduce((a, b) => a + b, 0);
  let favoriteHourLabel: string | null = null;
  if (total >= 5) {
    let best = 0;
    for (let h = 1; h < 24; h++) if (hours[h] > hours[best]) best = h;
    if (hours[best] >= 2) favoriteHourLabel = hourLabel(best);
  }

  return {
    enough: days.size >= 2,
    daysLast7,
    streak,
    favoriteHourLabel,
  };
}

/** Load this user's whole event history and derive their rhythm. */
export async function loadRhythm(uid: string, now: number = Date.now()): Promise<Rhythm> {
  const events: LearningEvent[] = await loadEvents(uid);
  return computeRhythm(events, now);
}
