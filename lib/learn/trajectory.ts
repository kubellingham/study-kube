"use client";

// Trajectory — the growth story. Reads lesson_check events (each carries
// whether the FIRST attempt was correct) and compares how the student did
// early on versus lately, so Kube can say the thing a progress bar never can:
// "you used to need a few tries, now you pass most first time." Person-level;
// stays quiet until there are enough checks to be honest.
import { loadEvents } from "@/lib/learn/events";

export interface Trajectory {
  enough: boolean;
  earlyRate: number;
  recentRate: number;
  trend: "up" | "steady" | "down";
  line: string | null;
}

function rate(rows: { correct?: boolean }[]): number {
  if (rows.length === 0) return 0;
  return Math.round((100 * rows.filter((c) => c.correct).length) / rows.length);
}

export function computeTrajectory(checks: { ts: number; correct?: boolean }[]): Trajectory {
  const rows = checks
    .filter((c) => typeof c.correct === "boolean")
    .sort((a, b) => a.ts - b.ts);

  // Below ~10 first-try checks there isn't enough to compare halves honestly.
  if (rows.length < 10) {
    return { enough: false, earlyRate: 0, recentRate: 0, trend: "steady", line: null };
  }

  const half = Math.floor(rows.length / 2);
  const early = rows.slice(0, half);
  const recent = rows.slice(rows.length - half);
  const earlyRate = rate(early);
  const recentRate = rate(recent);
  const diff = recentRate - earlyRate;
  const trend = diff >= 8 ? "up" : diff <= -8 ? "down" : "steady";

  let line: string;
  if (trend === "up") {
    line = `You're getting sharper — first-try correct climbed from ${earlyRate}% early on to ${recentRate}% lately.`;
  } else if (trend === "down") {
    line = `First-try accuracy has dipped from ${earlyRate}% to ${recentRate}% — a good moment to slow down and review.`;
  } else {
    line = `Steady — you pass about ${recentRate}% of checks on the first try.`;
  }

  return { enough: true, earlyRate, recentRate, trend, line };
}

export async function loadTrajectory(uid: string): Promise<Trajectory> {
  const events = await loadEvents(uid, { types: ["lesson_check"] });
  return computeTrajectory(events);
}
