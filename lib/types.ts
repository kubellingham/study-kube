// Shared TypeScript types mirroring the Supabase schema and AI payloads.

export type SourceType = "pdf" | "text" | "youtube" | "article";

export interface Material {
  id: string;
  user_id: string;
  title: string;
  source_type: SourceType;
  source_url: string | null;
  raw_text: string;
  created_at: string;
}

export interface SummaryContent {
  summary: string;
  key_concepts: { term: string; explanation: string }[];
}

export interface SummaryRow {
  id: string;
  material_id: string;
  content: SummaryContent;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  material_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  // SM-2 lite spaced-repetition state
  ease: number;
  interval_days: number;
  due_at: string;
  created_at: string;
}

export interface QuizQuestionContent {
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  material_id: string;
  user_id: string;
  title: string;
  questions: QuizQuestionContent[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number; // 0..1 fraction correct
  answers: number[]; // chosen option index per question (-1 = skipped)
  taken_at: string;
}

export interface ChatMessage {
  id: string;
  material_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Normalized output every ingester returns before we persist a Material.
export interface IngestResult {
  title: string;
  source_type: SourceType;
  source_url: string | null;
  raw_text: string;
}
