// The bits inside the circle (brief §4): every topic exposes lesson slices.
// Explicitly authored lessons win; otherwise steps are split at each teach
// step, so even generated topics get tappable slices. Review nodes build
// their compulsory quiz from the reviewed topics' checks + exam questions.
import type { Topic, Lesson, CheckStep, ExamQuestion } from "./types";
import type { CourseBundle } from "./bundle";

export function topicLessons(topic: Topic): Lesson[] {
  if (topic.lessons && topic.lessons.length > 0) return topic.lessons;
  if (topic.kind === "review") {
    return [{ id: `${topic.id}-quiz`, title: "Review quiz", steps: [] }];
  }
  const lessons: Lesson[] = [];
  let current: Lesson | null = null;
  let n = 0;
  for (const step of topic.steps) {
    if (step.kind === "teach" || current === null) {
      n += 1;
      current = {
        id: `${topic.id}-l${n}`,
        title:
          (step.kind === "teach" && step.title) || `Part ${n}`,
        steps: [],
      };
      lessons.push(current);
    }
    current.steps.push(step);
  }
  // A trailing teach with no checks is fine; an empty topic yields one shell.
  if (lessons.length === 0) {
    lessons.push({ id: `${topic.id}-l1`, title: topic.title, steps: topic.steps });
  }
  return lessons;
}

export function lessonKey(topicId: string, lessonId: string): string {
  return `${topicId}::${lessonId}`;
}

/** The questions that can re-test a topic, in two tiers:
 *  FRESH — exam-bank questions the learner has NOT met inside the lessons
 *  (reviews are assessments; a crammer must not recognize the question), and
 *  SEEN — the topic's own lesson checks, kept only as a last-resort filler
 *  for topics with no exam-bank coverage yet. */
/** A review check remembers which topic it assesses, so a miss can be
 *  flagged against that topic (and Kube can offer help on it). */
export type ReviewCheck = CheckStep & { sourceTopicId: string };

function checkPools(
  bundle: CourseBundle,
  topicId: string
): { fresh: ReviewCheck[]; seen: ReviewCheck[] } {
  const topic = bundle.getTopic(topicId);
  if (!topic) return { fresh: [], seen: [] };
  const seen = topicLessons(topic)
    .flatMap((l) => l.steps)
    .filter((s): s is CheckStep => s.kind === "check")
    .map((s): ReviewCheck => ({ ...s, sourceTopicId: topicId }));
  const fresh = bundle.examBank
    .filter((q: ExamQuestion) => q.topicId === topicId)
    .map(
      (q): ReviewCheck => ({
        kind: "check",
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        praise: `Right — ${q.explanation}`,
        sourceTopicId: topicId,
        ...(q.code ? { code: q.code } : {}),
      })
    );
  return { fresh, seen };
}

/** Draw the review node's quiz: `count` checks sampled across the reviewed
 *  topics, fresh (unseen-in-lessons) questions strictly first, shuffled each
 *  sitting. Lesson checks only ever appear when a topic has nothing fresh. */
export function buildReviewQuiz(bundle: CourseBundle, topic: Topic): ReviewCheck[] {
  const spec = topic.review;
  if (!spec) return [];
  const pools = spec.topicIds.map((id) => {
    const { fresh, seen } = checkPools(bundle, id);
    return { fresh: shuffle(fresh), seen: shuffle(seen) };
  });
  const picked: ReviewCheck[] = [];
  // Round-robin across topics, draining every topic's FRESH tier before any
  // topic's SEEN tier is touched.
  for (const tier of ["fresh", "seen"] as const) {
    let i = 0;
    let idle = 0;
    while (picked.length < spec.count && idle < pools.length) {
      const pool = pools[i % pools.length][tier];
      const q = pool.pop();
      if (q) {
        picked.push(q);
        idle = 0;
      } else {
        idle += 1;
      }
      i += 1;
    }
    if (picked.length >= spec.count) break;
  }
  return shuffle(picked);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
