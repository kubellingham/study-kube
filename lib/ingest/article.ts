import { extract } from "@extractus/article-extractor";
import type { IngestResult } from "@/lib/types";

/** Strip HTML tags to readable plain text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Fetch a web article and extract its readable content. */
export async function ingestArticle(url: string): Promise<IngestResult> {
  let article;
  try {
    article = await extract(url);
  } catch {
    throw new Error("Could not fetch or parse this article URL.");
  }

  if (!article || !article.content) {
    throw new Error("No readable article content found at this URL.");
  }

  const raw = htmlToText(article.content);
  if (!raw) {
    throw new Error("The article had no extractable text.");
  }

  return {
    title: article.title?.trim() || "Web article",
    source_type: "article",
    source_url: url,
    raw_text: raw,
  };
}
