import { YoutubeTranscript } from "youtube-transcript";
import type { IngestResult } from "@/lib/types";

export function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(
    url
  );
}

async function fetchYoutubeTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

/** Fetch a YouTube video's transcript and title. */
export async function ingestYoutube(url: string): Promise<IngestResult> {
  let items: { text: string }[];
  try {
    items = await YoutubeTranscript.fetchTranscript(url);
  } catch {
    throw new Error(
      "Could not fetch a transcript for this video. It may have captions disabled."
    );
  }

  const raw = items
    .map((i) => i.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) {
    throw new Error("This video has no usable transcript.");
  }

  const title = (await fetchYoutubeTitle(url)) || "YouTube video";
  return {
    title,
    source_type: "youtube",
    source_url: url,
    raw_text: raw,
  };
}
