// Course registry. Two kinds of courses:
//  - BUILT-IN: authored in code (CSE22D), gated to specific accounts.
//  - USER: created in the app, digested from PDFs by Claude, stored in
//    Firestore under the owner's uid (owner-only security rules).
import type { CourseBundle } from "./bundle";
import { cse22d } from "./cse22d";

export type { CourseBundle } from "./bundle";
export { buildCourseBundle } from "./bundle";

interface BuiltinCourse {
  bundle: CourseBundle;
  /** Emails allowed to see this built-in course. Undefined = everyone. */
  visibleToEmails?: string[];
}

const builtinCourses: BuiltinCourse[] = [
  { bundle: cse22d, visibleToEmails: ["ikube77@gmail.com"] },
];

export function listBuiltinBundles(email: string | null | undefined): CourseBundle[] {
  return builtinCourses
    .filter(
      (c) => !c.visibleToEmails || (!!email && c.visibleToEmails.includes(email))
    )
    .map((c) => c.bundle);
}

export function getBuiltinBundle(
  courseId: string,
  email: string | null | undefined
): CourseBundle | undefined {
  return listBuiltinBundles(email).find((b) => b.course.id === courseId);
}
