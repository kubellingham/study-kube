import type { IngestResult } from "@/lib/types";
import { ingestText } from "./text";
import { ingestPdf } from "./pdf";
import { ingestYoutube, isYoutubeUrl } from "./youtube";
import { ingestArticle } from "./article";

export { ingestText, ingestPdf, ingestYoutube, ingestArticle, isYoutubeUrl };

/** Dispatch a link to the right ingester (YouTube transcript vs web article). */
export async function ingestLink(url: string): Promise<IngestResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Please enter a valid http(s) URL.");
  }
  return isYoutubeUrl(trimmed)
    ? ingestYoutube(trimmed)
    : ingestArticle(trimmed);
}
