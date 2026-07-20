// Course registry — one CourseBundle per course code. Adding a new subject
// (e.g. CSE46D) means authoring its units, assembling a bundle like
// cse22d.ts, and listing it here; every /learn route picks it up by id.
import type { CourseBundle } from "./bundle";
import { cse22d } from "./cse22d";

export type { CourseBundle } from "./bundle";

export const courses: CourseBundle[] = [cse22d];

export function getCourseBundle(courseId: string): CourseBundle | undefined {
  return courses.find((c) => c.course.id === courseId);
}
