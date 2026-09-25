// The one shape left from the original materials app: what the server-side
// PDF reader (lib/ingest/pdf.ts) returns. The build uses it as a fallback when
// a file arrives as bytes rather than as text extracted in the browser.
export type SourceType = "pdf" | "text" | "youtube" | "article";

export interface IngestResult {
  title: string;
  source_type: SourceType;
  source_url: string | null;
  raw_text: string;
}
