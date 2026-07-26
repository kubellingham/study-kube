// INT42D — Internet and Web Technologies (Lovely Professional University).
// Units 4 and 5 authored from their slide decks, merged into one continuous
// dependency-ordered ladder.
import { buildCourseBundle } from "./bundle";
import type { SyllabusInfo } from "./types";
import { sectionA, unit4Exam } from "./int42d-unit4";
import { sectionB, unit5Exam as int42dUnit5Exam } from "./int42d-unit5";

export const int42d = buildCourseBundle(
  {
    id: "int42d",
    code: "INT42D",
    title: "Internet and Web Technologies",
    sections: [sectionA, sectionB],
  },
  [...unit4Exam, ...int42dUnit5Exam]
);

/** Only the fed units are listed — the rest of the course can join later. */
export const int42dSyllabus: SyllabusInfo = {
  units: [
    { unit: 4, title: "Tables & Forms" },
    { unit: 5, title: "Cascading Style Sheets" },
  ],
  cos: [],
};
