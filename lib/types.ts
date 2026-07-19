// Shared TypeScript types mirroring the Firestore documents and AI payloads.
// Firestore collections: materials, summaries, decks, cards, quizzes, attempts,
// messages. Every doc carries `userId` and is guarded by security rules.

export type SourceType = "pdf" | "text" | "youtube" | "article";

export interface Material {
  id: string;
  userId: string;
  title: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  rawText: string;
  createdAt: number; // epoch millis
}

export interface SummaryContent {
  summary: string;
  key_concepts: { term: string; explanation: string }[];
}

export interface SummaryDoc {
  id: string; // == materialId (one summary per material)
  materialId: string;
  userId: string;
  content: SummaryContent;
  createdAt: number;
}

export interface Deck {
  id: string;
  materialId: string;
  userId: string;
  title: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  userId: string;
  front: string;
  back: string;
  // SM-2 lite spaced-repetition state
  ease: number;
  intervalDays: number;
  dueAt: number; // epoch millis
  createdAt: number;
}

export interface QuizQuestionContent {
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  materialId: string;
  userId: string;
  title: string;
  questions: QuizQuestionContent[];
  createdAt: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number; // 0..1 fraction correct
  answers: number[]; // chosen option index per question (-1 = skipped)
  takenAt: number;
}

export interface ChatMessage {
  id: string;
  materialId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

// Normalized output every ingester returns before we persist a Material.
export interface IngestResult {
  title: string;
  source_type: SourceType;
  source_url: string | null;
  raw_text: string;
}
