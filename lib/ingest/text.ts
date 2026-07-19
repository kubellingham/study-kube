import type { IngestResult } from "@/lib/types";

/** Normalize pasted / typed text into a Material payload. */
export function ingestText(text: string, title?: string): IngestResult {
  const trimmed = text.trim();
  const derivedTitle =
    title?.trim() ||
    trimmed.split("\n").find((l) => l.trim().length > 0)?.slice(0, 80) ||
    "Untitled note";
  return {
    title: derivedTitle,
    source_type: "text",
    source_url: null,
    raw_text: trimmed,
  };
}
