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

/** All check steps that could re-test a topic: its own checks plus its exam
 *  questions converted into gentle learning-mode checks. */
function checkPool(bundle: CourseBundle, topicId: string): CheckStep[] {
  const topic = bundle.getTopic(topicId);
  if (!topic) return [];
  const own = topicLessons(topic)
    .flatMap((l) => l.steps)
    .filter((s): s is CheckStep => s.kind === "check");
  const fromExam = bundle.examBank
    .filter((q: ExamQuestion) => q.topicId === topicId)
    .map(
      (q): CheckStep => ({
        kind: "check",
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        praise: `Right — ${q.explanation}`,
        ...(q.code ? { code: q.code } : {}),
      })
    );
  return [...own, ...fromExam];
}

/** Draw the review node's quiz: `count` checks sampled across the reviewed
 *  topics, shuffled fresh each sitting so repeats stay honest. */
export function buildReviewQuiz(bundle: CourseBundle, topic: Topic): CheckStep[] {
  const spec = topic.review;
  if (!spec) return [];
  const pools = spec.topicIds.map((id) => shuffle(checkPool(bundle, id)));
  const picked: CheckStep[] = [];
  // Round-robin across topics so a two-topic review mixes both.
  let i = 0;
  while (picked.length < spec.count && pools.some((p) => p.length > 0)) {
    const pool = pools[i % pools.length];
    const q = pool.pop();
    if (q) picked.push(q);
    i += 1;
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
