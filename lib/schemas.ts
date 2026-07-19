import { z } from "zod";

// Zod schemas reused for (a) Claude structured-output JSON schemas and
// (b) validating/parsing the model's response before we persist it.

export const summarySchema = z.object({
  summary: z
    .string()
    .describe("A clear, well-structured summary of the material in markdown."),
  key_concepts: z
    .array(
      z.object({
        term: z.string().describe("A key term or concept."),
        explanation: z
          .string()
          .describe("A concise explanation of the term in the student's words."),
      })
    )
    .describe("The most important concepts a student must understand."),
});
export type SummaryParsed = z.infer<typeof summarySchema>;

export const flashcardsSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string().describe("The prompt / question side of the card."),
        back: z.string().describe("The answer / explanation side of the card."),
      })
    )
    .describe("A set of study flashcards covering the material."),
});
export type FlashcardsParsed = z.infer<typeof flashcardsSchema>;

export const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string().describe("The question text."),
        options: z
          .array(z.string())
          .describe("Answer choices. Provide exactly 4."),
        answer_index: z
          .number()
          .int()
          .describe("Zero-based index into options of the correct answer."),
        explanation: z
          .string()
          .describe("Why the correct answer is right (and others are wrong)."),
      })
    )
    .describe("Multiple-choice practice questions."),
});
export type QuizParsed = z.infer<typeof quizSchema>;
