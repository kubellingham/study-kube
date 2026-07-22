// Course registry. Two kinds of courses:
//  - BUILT-IN: authored in code (CSE22D, CSE46D), gated to specific accounts.
//  - USER: created in the app, digested from PDFs by Claude, stored in
//    Firestore under the owner's uid (owner-only security rules).
import type { CourseBundle } from "./bundle";
import type { SyllabusInfo } from "./types";
import { cse22d } from "./cse22d";
import { cse46d, cse46dSyllabus } from "./cse46d";
import { meco3d, meco3dSyllabus } from "./meco3d";

export type { CourseBundle } from "./bundle";
export { buildCourseBundle } from "./bundle";

interface BuiltinCourse {
  bundle: CourseBundle;
  /** Emails allowed to see this built-in course. Undefined = everyone. */
  visibleToEmails?: string[];
  /** Course skeleton, so unfed units render as expectant placeholders. */
  syllabus?: SyllabusInfo;
}

const builtinCourses: BuiltinCourse[] = [
  { bundle: cse22d, visibleToEmails: ["ikube77@gmail.com"] },
  {
    bundle: cse46d,
    visibleToEmails: ["ikube77@gmail.com"],
    syllabus: cse46dSyllabus,
  },
  {
    bundle: meco3d,
    visibleToEmails: ["ikube77@gmail.com"],
    syllabus: meco3dSyllabus,
  },
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

export function getBuiltinSyllabus(courseId: string): SyllabusInfo | null {
  return builtinCourses.find((c) => c.bundle.course.id === courseId)?.syllabus ?? null;
}
