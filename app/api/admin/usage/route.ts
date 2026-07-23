import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/admin-guard";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// The digestion spend ledger (owner only). Every ingest job records the real
// token usage of its build in a `cost` field; we sum those into lifetime totals
// and return the most recent digests. This is the back-office mirror of the
// Anthropic Console — students never see it.
interface Cost {
  calls?: number;
  inputTokens?: number;
  outputTokens?: number;
  cacheWriteTokens?: number;
  cacheReadTokens?: number;
  costUsd?: number;
}

export async function GET(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;

  try {
    const db = adminDb();
    const snap = await db.collection("ingestJobs").get();

    const totals = {
      digests: 0,
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheWriteTokens: 0,
      cacheReadTokens: 0,
      costUsd: 0,
    };
    const recent: {
      fileName: string;
      courseId: string;
      userId: string;
      at: number;
      costUsd: number;
      calls: number;
      cacheReadTokens: number;
      outputTokens: number;
    }[] = [];

    snap.forEach((doc) => {
      const d = doc.data();
      const c = d.cost as Cost | undefined;
      if (!c || typeof c.costUsd !== "number") return;
      totals.digests += 1;
      totals.calls += c.calls ?? 0;
      totals.inputTokens += c.inputTokens ?? 0;
      totals.outputTokens += c.outputTokens ?? 0;
      totals.cacheWriteTokens += c.cacheWriteTokens ?? 0;
      totals.cacheReadTokens += c.cacheReadTokens ?? 0;
      totals.costUsd += c.costUsd;
      recent.push({
        fileName: (d.fileName as string) ?? "",
        courseId: (d.courseId as string) ?? "",
        userId: (d.userId as string) ?? "",
        at: (d.updatedAt as number) ?? (d.createdAt as number) ?? 0,
        costUsd: c.costUsd,
        calls: c.calls ?? 0,
        cacheReadTokens: c.cacheReadTokens ?? 0,
        outputTokens: c.outputTokens ?? 0,
      });
    });

    recent.sort((a, b) => b.at - a.at);
    totals.costUsd = Math.round(totals.costUsd * 10_000) / 10_000;
    const avgCost = totals.digests > 0 ? totals.costUsd / totals.digests : 0;

    return Response.json({
      totals,
      avgCost: Math.round(avgCost * 10_000) / 10_000,
      recent: recent.slice(0, 40),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to load usage." },
      { status: 500 }
    );
  }
}
