// CSE22D — Computer Programming Using C (Lovely Professional University).
// All six units merged into ONE continuous dependency-ordered ladder.
import { buildCourseBundle } from "./bundle";
import { sectionA, sectionB, unit1Exam } from "./unit1";
import { sectionC, unit2Exam } from "./unit2";
import { sectionD, unit3Exam } from "./unit3";
import { sectionE, unit4Exam } from "./unit4";
import { sectionF, unit5Exam } from "./unit5";
import { sectionG, unit6Exam } from "./unit6";

export const cse22d = buildCourseBundle(
  {
    id: "cse22d",
    code: "CSE22D",
    title: "Computer Programming Using C",
    sections: [sectionA, sectionB, sectionC, sectionD, sectionE, sectionF, sectionG],
  },
  [...unit1Exam, ...unit2Exam, ...unit3Exam, ...unit4Exam, ...unit5Exam, ...unit6Exam]
);
