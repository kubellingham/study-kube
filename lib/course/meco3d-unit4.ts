// MECO3D Unit 4: Bench Fitting. Four-quarter circles, one concept per circle.
// Source: Workshop Practice lab manual — Experiment 9 (Tail End / Male part)
// and Experiment 10 (Groove End / Female part). Grounded strictly in the
// manual's tools, dimensions and reference-side method.
import type { Section } from "./types";

export const sectionU4: Section = {
  id: "mec-sec-u4",
  letter: "D",
  title: "Bench Fitting",
  tagline: "Working a rough piece of steel down to an exact size, by hand, until two parts fit.",
  unit: 4,
  topics: [
    // ── What fitting is ──────────────────────────────────────────────
    {
      id: "mec-fitting-idea",
      title: "What fitting is",
      unit: 4,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Both experiments are the same craft: take mild steel and bring it to an exact size and shape by hand — measure, mark, cut, file, check, repeat.",
      recap: [
        "Fitting means producing a part to an exact size and true shape by hand at the bench, from mild steel.",
        "The core cycle: measure & mark → cut → file to size → check with the try-square and calipers → repeat until right.",
        "Wet chalk is applied to the surface and left to dry so scriber lines show up clearly for marking.",
        "The learning objectives: measuring and marking, cutting, straightening, making right angles and finishing.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "**Fitting** is bench work: you take a rough piece of **mild steel** and bring it, **by hand**, to an exact size and a true shape. No machine does it for you — files and patience do.",
            },
            {
              kind: "teach",
              body: "The manual's learning objectives name the skills: **measuring and marking, cutting, straightening, making right angles, and finishing.** Every fitting job is those, in a loop.",
            },
            {
              kind: "teach",
              body: "The working cycle: **measure & mark → cut → file to size → check → repeat.** You creep up on the dimension, filing a little and checking a lot, until the size and the angles are exactly right.",
            },
            {
              kind: "teach",
              body: "One habit first: **apply wet chalk to the surface and let it dry.** The dried chalk layer makes your scriber lines stand out clearly, so the marking is easy to see and follow.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Bench fitting produces a part to exact size using…",
              options: [
                "an automatic milling machine",
                "hand work — measuring, cutting and filing to size",
                "casting molten metal",
                "arc welding",
              ],
              answer: 1,
              praise: "By hand at the bench — files and measurement, not machines.",
            },
            {
              kind: "check",
              prompt: "Why is wet chalk applied to the steel and left to dry before marking?",
              options: [
                "To harden the steel",
                "So the scribed layout lines show up clearly against the chalk",
                "To lubricate the file",
                "To prevent welding",
              ],
              answer: 1,
              praise: "The dried chalk makes the scriber lines visible — easy to mark and follow.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: which is NOT one of the fitting learning objectives?",
              options: ["Making right angles", "Finishing to size", "Soldering the corners", "Measuring and marking"],
              answer: 2,
              praise: "Soldering belongs to sheet metal — fitting is measure, mark, cut, file, square.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'In fitting you file the piece to size in one confident pass.' Why is that wrong?",
              options: [
                "Nothing, one pass is best",
                "You file a little and CHECK often, creeping up on the size — over-filing can't be undone",
                "Filing is not used in fitting",
                "You cut to size, never file",
              ],
              answer: 1,
              praise: "Right — file a little, check a lot; removed metal never comes back.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Fitting has one rule that shapes everything: **you can always remove more metal, never add it back.** So the craft is conservative — approach the line slowly, check against a square and a caliper, and stop exactly on size.\n\nThat mindset is why the next circles are about *reference sides* and *calipers*: tools that tell you precisely when to stop.",
            },
            {
              kind: "check",
              prompt: "The guiding rule of bench fitting is that you can…",
              options: [
                "add metal whenever needed",
                "always remove more metal but never add it back — so approach the size carefully",
                "weld the piece to correct mistakes",
                "ignore the dimensions",
              ],
              answer: 1,
              praise: "Remove-only — which is why fitting is careful, checked work.",
            },
          ],
        },
      ],
    },

    // ── Fitting tools ────────────────────────────────────────────────
    {
      id: "mec-fitting-tools",
      title: "Fitting tools",
      unit: 4,
      weight: "medium",
      deps: ["mec-fitting-idea"],
      whyItMatters:
        "Each fitting tool measures, marks, checks or removes. Knowing which does which turns the procedure into obvious steps.",
      recap: [
        "Mark & lay out: scriber and engineering steel scale (rule); dot punch and hammer to punch the line; dividers and odd-leg caliper to step off distances like the 48 mm.",
        "Hold & cut: bench vice grips the work; hand hacksaw cuts to rough size.",
        "Check squareness & size: try-square checks right angles; outside/inside calipers gauge width and openings; the surface plate is the flat reference to mark from.",
        "Remove metal: flat rough file (fast, coarse) then flat smooth file (fine finish).",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Fitting has a tool for every part of the cycle. Meet them grouped by job.",
            },
            {
              kind: "teach",
              body: "**Mark & lay out:** the **scriber** and **engineering steel scale** (draw and measure lines), the **dot punch + hammer** (punch dots along a line), and the **dividers / odd-leg caliper** (step off exact distances like the 48 mm mark).",
            },
            {
              kind: "teach",
              body: "**Hold & cut:** the **bench vice** grips the work firmly; the **hand hacksaw** cuts it to rough size.",
            },
            {
              kind: "teach",
              body: "**Check & remove:** the **try-square** checks right angles; the **outside and inside calipers** gauge width and openings; the **surface plate** is the perfectly flat reference you mark from. And the workhorses — the **flat rough file** (removes metal fast) and the **flat smooth file** (fine finishing).",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which tool checks that two sides meet at a true right angle?",
              options: ["Odd-leg caliper", "Try-square", "Hand hacksaw", "Dot punch"],
              answer: 1,
              praise: "The try-square — it verifies the 90° between adjacent sides.",
            },
            {
              kind: "check",
              prompt: "You remove metal fast first, then finish. Which pair of files does this?",
              options: [
                "Flat rough file, then flat smooth file",
                "Half round file, then scriber",
                "Two smooth files",
                "Hacksaw, then dot punch",
              ],
              answer: 0,
              praise: "Rough then smooth — coarse cut, then fine finish.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: to gauge the width of the piece as you file it down, you'd use the…",
              options: ["outside caliper", "try-square", "soldering iron", "mallet"],
              answer: 0,
              praise: "The outside caliper — it reads the outside width as you approach size.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The surface plate is used to file the piece flat.' What's its real job?",
              options: [
                "Nothing, you file on it",
                "It is a flat REFERENCE surface to place the work on and mark from — not something you file against",
                "It measures right angles",
                "It cuts the steel",
              ],
              answer: 1,
              praise: "Right — the surface plate is the true-flat datum for marking, not a filing surface.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Notice the coarse-then-fine pairing again, just like sheet metal: the **rough file** hogs metal off quickly, the **smooth file** brings it exactly to the line. And every removing tool has a **checking** partner — file, then caliper; cut, then try-square.\n\nThat measure-cut-check rhythm is what keeps a hand-made part accurate.",
            },
            {
              kind: "check",
              prompt: "The flat rough file and flat smooth file are used in that order because…",
              options: [
                "the smooth file is stronger",
                "the rough file removes metal quickly, the smooth file finishes precisely to the line",
                "they must match the hacksaw",
                "rough files can't touch steel",
              ],
              answer: 1,
              praise: "Fast removal, then fine finish — coarse to fine.",
            },
          ],
        },
      ],
    },

    // ── Reference-side method ────────────────────────────────────────
    {
      id: "mec-reference-side",
      title: "The reference-side method",
      unit: 4,
      weight: "heavy",
      deps: ["mec-fitting-idea", "mec-fitting-tools"],
      whyItMatters:
        "The heart of the male part (Experiment 9): make one side true, square a second to it, then work the remaining sides to size from those datums. Get this and the whole job follows.",
      recap: [
        "First file one side flat and true — the reference side — then file a second side at a right angle to it, checked with the try-square. Now two reference sides are ready.",
        "From those two datums, mark the opposite sides at 48 mm with the odd-leg caliper and punch dots.",
        "File down to the dots with the flat rough file, checking width with the outside caliper; near size, finish with the flat smooth file and check each right angle.",
        "Then file both flat faces (rough, then smooth) to reduce thickness — the piece ends as a 48 × 48 × 5 mm square.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "How do you file a rough lump into a perfect square? You don't chase all four sides at once. You build from **reference sides** — trusted, true edges that every other measurement is taken from.",
            },
            {
              kind: "teach",
              body: "**Make the first reference side.** Hold the piece in the bench vice and **remove material from one side until it's flat and true.** That edge is now your datum.",
            },
            {
              kind: "teach",
              body: "**Make the second at a right angle.** With the reference side as your guide, file the **adjacent side square to it**, checked with the **try-square**. Now **two reference sides** meet at a true 90°.",
            },
            {
              kind: "teach",
              body: "**Work the rest from them.** Apply chalk, place the piece on the **surface plate**, and mark the two *opposite* sides at **48 mm** away using the **odd-leg caliper**; punch dots along those lines. Everything is measured from the two good sides.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What is a 'reference side' in fitting?",
              options: [
                "The side left rough for gripping",
                "A first true, flat edge that all other sides are measured and squared from",
                "The thickest side",
                "The side that gets soldered",
              ],
              answer: 1,
              praise: "A trusted true edge — the datum every other side is built from.",
            },
            {
              kind: "check",
              prompt: "The second reference side is filed so that it is…",
              options: [
                "parallel to the first",
                "at a right angle to the first, checked with the try-square",
                "thinner than the first",
                "left rough",
              ],
              answer: 1,
              praise: "Square to the first — two datums at a true 90°.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Now the finishing move. File down to the marked dots with the **flat rough file**, checking the width with the **outside caliper** as you go. When the dots are half gone and the size is near **48 mm**, switch to the **flat smooth file** to finish exactly, checking every corner with the **try-square**.",
            },
            {
              kind: "check",
              prompt: "You-try-one: you're filing to the 48 mm line. When do you switch from the rough file to the smooth file?",
              options: [
                "Right at the start",
                "When the dots are half removed and the size is near 48 mm",
                "After soldering",
                "Never — one file does it all",
              ],
              answer: 1,
              praise: "Near size — rough gets you close, smooth lands you exactly on the line.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Mark and file all four sides at once, measuring from whichever edge is handy.' Why does fitting reject this?",
              options: [
                "Nothing, that's efficient",
                "Every measurement must come from the true reference sides — measuring from rough edges makes the part inaccurate",
                "You should only ever file one side",
                "Marking is not needed",
              ],
              answer: 1,
              praise: "Right — datums first; measuring from untrue edges ruins the accuracy.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Finally, the faces. Hold the piece flat and file both broad surfaces — **rough file first, then smooth** — reducing the **thickness to about half a millimetre at a time** until the job is a clean **48 × 48 × 5 mm** square.\n\nThat's the whole male part: one true side became two, two became a square, and the faces were finished last. Reference-side thinking turns an impossible 'make it perfect' into a sequence of small, checkable steps.",
            },
            {
              kind: "check",
              prompt: "The finished male (tail-end) part measures…",
              options: ["150 × 120 × 28 mm", "48 × 48 × 5 mm", "200 × 250 mm", "70 × 70 mm"],
              answer: 1,
              praise: "48 × 48 × 5 mm — squared from the reference sides, faces finished last.",
            },
          ],
        },
      ],
    },

    // ── Male & female fit ────────────────────────────────────────────
    {
      id: "mec-male-female",
      title: "Male & female parts that fit",
      unit: 4,
      weight: "medium",
      deps: ["mec-reference-side"],
      whyItMatters:
        "Experiments 9 and 10 are two halves of one idea — a tail-end (male) part and a groove-end (female) part cut so one mates into the other. Fitting's purpose, made concrete.",
      recap: [
        "Experiment 9 makes the Tail End (Male) part — the 48 × 48 × 5 mm square worked from reference sides.",
        "Experiment 10 makes the Groove End (Female) part — the same overall size but with a 24 mm groove/slot cut into it.",
        "The two are designed so the male tail seats into the female groove — a made-to-fit pair.",
        "Both use the same tools and the same measure–mark–cut–file–check discipline; only the female adds cutting an internal groove.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The two fitting experiments aren't separate — they're a **pair that mates**. Experiment 9 is the **Tail End (Male)** part; Experiment 10 is the **Groove End (Female)** part.",
            },
            {
              kind: "teach",
              body: "The **male** part is the square you just built by the reference-side method: **48 × 48 × 5 mm** of mild steel, worked true on every side.",
            },
            {
              kind: "teach",
              body: "The **female** part is the same overall size but has a **groove (a 24 mm slot)** cut into it. The male tail is made to **seat into that groove** — the two parts are a matched fit.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The Groove End (Female) part differs from the Male part because it has…",
              options: [
                "a different metal",
                "a groove/slot cut into it for the male part to seat into",
                "no need for reference sides",
                "soldered corners",
              ],
              answer: 1,
              praise: "A groove to receive the male tail — that's what makes it 'female'.",
            },
            {
              kind: "check",
              prompt: "The purpose of making a male and a female part is to…",
              options: [
                "practise welding",
                "produce two pieces that fit into each other",
                "compare two metals",
                "test the surface plate",
              ],
              answer: 1,
              praise: "A made-to-fit pair — the whole point of the fitting exercise.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: which discipline do BOTH the male and female parts share?",
              options: [
                "Soldering the joints",
                "Measure, mark, cut, file to size and check with the try-square and calipers",
                "Bending at 90°",
                "Arc welding left to right",
              ],
              answer: 1,
              praise: "The same fitting cycle for both — the female just adds an internal groove.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The male and female parts can be any two sizes and still fit.' Why is that wrong?",
              options: [
                "Nothing, size doesn't matter",
                "The groove and the tail must be made to matching sizes, or the parts won't seat together",
                "Only the female part needs to be accurate",
                "Fitting ignores dimensions",
              ],
              answer: 1,
              praise: "Right — a fit only works if both parts are worked to matching, accurate sizes.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Here's why fitting is worth all the careful filing. Two parts made **independently**, each to its own measured dimensions, come together and **fit** — because both were worked from true reference sides to exact sizes.\n\nThat is the promise of accurate hand work: parts that mate without adjustment. Every file stroke and caliper check in this unit exists to make that fit possible.",
            },
            {
              kind: "check",
              prompt: "The male and female parts fit together without adjustment because…",
              options: [
                "they were welded together",
                "each was worked accurately from true reference sides to matching sizes",
                "they are made of soft metal",
                "the groove is oversized",
              ],
              answer: 1,
              praise: "Accurate, independent work to matching sizes — the reward fitting is built for.",
            },
          ],
        },
      ],
    },

    // ── Review ───────────────────────────────────────────────────────
    {
      id: "mec-u4-review",
      title: "Unit 4 quick review",
      unit: 4,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-fitting-idea", "mec-fitting-tools", "mec-reference-side", "mec-male-female"],
        count: 5,
      },
      deps: ["mec-male-female"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
