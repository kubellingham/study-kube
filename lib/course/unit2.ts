// Unit 2 — Control structures (CSE22D). Section C: Control Flow.
import type { Section, ExamQuestion } from "./types";

export const sectionC: Section = {
  id: "sec-c",
  letter: "C",
  title: "Control Flow",
  tagline: "Teaching your program to decide, repeat, and jump.",
  unit: 2,
  topics: [
    {
      id: "selection-if",
      title: "if & if-else",
      unit: 2,
      weight: "heavy",
      deps: ["operators", "io"],
      whyItMatters:
        "Selection is half of Unit 2's marks, and 'nonzero means true' explains a whole family of trick questions.",
      recap: [
        "Control structures come in three kinds: sequence (top to bottom), selection (choose a path), repetition (loop).",
        "if (condition) runs its block only when the condition is nonzero — in C, 0 is false and ANY nonzero value is true.",
        "if-else picks exactly one of two paths.",
        "Ternary shortcut: max = (a > b) ? a : b; — condition ? value-if-true : value-if-false.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three shapes of flow",
          body: "By default a program runs in **sequence** — top to bottom, one statement after another. **Control structures** change that:\n\n**Selection** — choose between paths (`if`, `switch`).\n**Repetition** — repeat a block (`while`, `for`).\n\nEverything in Unit 2 is one of these two, layered on plain sequence.",
        },
        {
          kind: "teach",
          title: "if, and what 'true' means in C",
          body: "`if (condition) { ... }` runs the block only when the condition is true. And in C, truth is numeric:\n\n**0 is false. Anything nonzero is true.** Even `-5`. Even `if (7)`.\n\n`if-else` adds the other path:",
          code: "if (marks >= 40) {\n    printf(\"Pass\");\n} else {\n    printf(\"Fail\");\n}",
        },
        {
          kind: "teach",
          title: "The ternary shortcut",
          body: "For tiny either-or choices there's a one-line form, the **conditional (ternary) operator**:\n\n`max = (a > b) ? a : b;`\n\nRead it as: *condition* `?` *value if true* `:` *value if false*. Same meaning as an if-else that assigns — just compressed.",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "int x = -3;\nif (x)\n    printf(\"yes\");\nelse\n    printf(\"no\");",
          options: ["no", "yes", "Nothing — it's an error", "-3"],
          answer: 1,
          praise:
            "That's the rule doing real work — -3 is nonzero, and nonzero IS true in C. Only 0 lands in the else.",
        },
        {
          kind: "check",
          prompt: "Which single line puts the smaller of a and b into min?",
          options: [
            "min = (a < b) ? a : b;",
            "min = (a < b) : a ? b;",
            "min = a < b;",
            "min = ? (a < b) a : b;",
          ],
          answer: 0,
          praise:
            "Clean ternary — condition, then ?, then the two outcomes split by :. You've compressed a four-line if-else into one honest line.",
        },
      ],
    },
    {
      id: "selection-nested",
      title: "Nested if & the else-if ladder",
      unit: 2,
      weight: "medium",
      deps: ["selection-if"],
      whyItMatters:
        "Grade-band questions (marks → A/B/C) are near-guaranteed, and they're all else-if ladders.",
      recap: [
        "Nested if = an if inside another if — the inner one is only reached when the outer is true.",
        "else-if ladder: conditions checked top-down; the FIRST true branch runs and the rest are skipped.",
        "Final else = catch-all when nothing matched.",
        "Order matters: put the most restrictive condition first (>= 90 before >= 80).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Ifs inside ifs, and the ladder",
          body: "A **nested if** is an if inside another — the inner check only happens once the outer one has passed.\n\nWhen you're choosing between *many* bands, chain them into an **else-if ladder**. C checks top-down and runs the **first true branch only** — everything below is skipped:",
          code: "if (marks >= 90)\n    grade = 'A';\nelse if (marks >= 80)\n    grade = 'B';\nelse if (marks >= 70)\n    grade = 'C';\nelse\n    grade = 'F';",
        },
        {
          kind: "teach",
          title: "Why order matters",
          body: "Take marks = 95 in the ladder above. It satisfies `>= 90`, `>= 80` AND `>= 70` — but only the first true branch fires, so the grade is 'A'.\n\nNow imagine writing `>= 70` first: 95 would match it immediately and get a 'C'. **The ladder must go from most restrictive to least.** That single insight answers every 'what's wrong with this ladder' question.",
        },
        {
          kind: "check",
          prompt: "With the ladder as written above, what grade does marks = 85 get?",
          options: ["A", "B", "C", "F"],
          answer: 1,
          praise:
            "Right — 85 fails the >= 90 test, passes >= 80, and the ladder stops there. First true branch wins; the rest never run.",
        },
        {
          kind: "check",
          prompt:
            "A student writes the ladder with else if (marks >= 70) FIRST, before >= 90. What happens for marks = 95?",
          options: [
            "Grade A, as intended",
            "Grade C — the first true condition wins even though a better match exists below",
            "A compile error",
            "All three branches run",
          ],
          answer: 1,
          praise:
            "Exactly the bug — the ladder doesn't look for the BEST match, only the FIRST. Most-restrictive-first is the fix, and now you can explain why.",
        },
      ],
    },
    {
      id: "switch",
      title: "switch, case & break",
      unit: 2,
      weight: "medium",
      deps: ["selection-nested"],
      whyItMatters:
        "The rules of switch — what case labels may be, and what happens without break — are two of Unit 2's most reliable exam questions.",
      recap: [
        "switch(expression) jumps to the matching case label; default runs when nothing matches.",
        "Case labels must be unique CONSTANT int or char values — no floats, no variables, no relational expressions (case > 5 is illegal).",
        "Without break, execution FALLS THROUGH into the next case's statements.",
        "default can appear anywhere in the switch, not just last.",
      ],
      steps: [
        {
          kind: "teach",
          title: "A many-way jump",
          body: "`switch` compares one expression against a set of **case labels** and jumps straight to the match:",
          code: "switch (day) {\n    case 1: printf(\"Mon\"); break;\n    case 2: printf(\"Tue\"); break;\n    default: printf(\"Other\");\n}",
        },
        {
          kind: "teach",
          title: "The rules examiners test",
          body: "**Case labels must be constant int or char values, each unique.** `case 5:` and `case 'a':` are fine. These are NOT:\n\n`case 4.5:` — no floats\n`case x:` — no variables\n`case marks > 40:` — no relational expressions\n\n**break matters:** without it, execution **falls through** — it keeps running into the next case's statements until it hits a break or the end. Sometimes useful, usually a bug.\n\nAnd `default` — the no-match branch — may sit **anywhere** in the switch, though last is conventional.",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "int n = 1;\nswitch (n) {\n    case 1: printf(\"one \");\n    case 2: printf(\"two \");\n    case 3: printf(\"three\"); break;\n    default: printf(\"none\");\n}",
          options: ["one", "one two three", "one two", "none"],
          answer: 1,
          praise:
            "Fall-through, spotted — no break after case 1 or 2, so execution pours straight down through them until the break in case 3.",
        },
        {
          kind: "check",
          prompt: "Which case label is LEGAL in C?",
          options: ["case 2.5:", "case x:", "case 'b':", "case n > 10:"],
          answer: 2,
          praise:
            "Right — a char constant is really just a small constant int, so it qualifies. Floats, variables, and comparisons all break the constant-int rule.",
        },
      ],
    },
    {
      id: "while-dowhile",
      title: "while & do-while",
      unit: 2,
      weight: "heavy",
      deps: ["selection-if"],
      whyItMatters:
        "Entry-controlled vs exit-controlled — and 'do-while always runs at least once' — is one of the highest-frequency questions in this course.",
      recap: [
        "while (condition) { } — ENTRY-controlled: condition checked BEFORE the body; may run zero times.",
        "do { } while (condition); — EXIT-controlled: body first, condition after; ALWAYS runs at least once. Note the semicolon after while(...).",
        "Loop = init before, condition on top, update inside — forget the update and you've built an infinite loop (finiteness, again!).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Repeat while true",
          body: "A **while loop** repeats its body as long as the condition holds. It's **entry-controlled**: the condition is checked *before* each pass — including the first. If the condition starts false, the body runs **zero times**.",
          code: "int i = 1;\nwhile (i <= 5) {\n    printf(\"%d \", i);\n    i++;\n}\n// prints: 1 2 3 4 5",
        },
        {
          kind: "teach",
          title: "do-while: act first, ask later",
          body: "A **do-while** flips the order — body first, condition after. It's **exit-controlled**, so the body **always runs at least once**, even when the condition is false from the start.\n\nNote the shape: `do { ... } while (condition);` — with a **semicolon** at the end.\n\nWhen is that useful? Menus: show the menu, take a choice, *then* decide whether to loop again. You always want at least one showing.\n\nAnd notice: forget the `i++` inside either loop and the condition never changes — an **infinite loop**. That's the finiteness rule from Unit 1 breaking in real code.",
          code: "int i = 10;\ndo {\n    printf(\"%d\", i);\n    i++;\n} while (i < 5);\n// prints: 10  (ran once despite a false condition)",
        },
        {
          kind: "check",
          prompt: "How many times does the body run?",
          code: "int i = 8;\nwhile (i < 5) {\n    printf(\"hi\");\n    i++;\n}",
          options: ["Once", "Zero times", "Infinite", "Three times"],
          answer: 1,
          praise:
            "Right — entry-controlled means the gate is checked before you're ever let in. 8 < 5 is false, so the body never runs. This is THE difference from do-while.",
        },
        {
          kind: "check",
          prompt: "Same start, but as a do-while. How many times does the body run now?",
          code: "int i = 8;\ndo {\n    printf(\"hi\");\n    i++;\n} while (i < 5);",
          options: ["Zero times", "Once", "Infinite", "Five times"],
          answer: 1,
          praise:
            "Exactly — exit-controlled loops pay the condition check only AFTER the body, so one pass is guaranteed. Same numbers, opposite outcome: that's the whole exam point.",
        },
        {
          kind: "check",
          prompt: "What's wrong with this loop?",
          code: "int i = 1;\nwhile (i <= 5) {\n    printf(\"%d \", i);\n}",
          options: [
            "The condition should use < not <=",
            "Nothing — it prints 1 to 5",
            "i is never updated, so it loops forever printing 1",
            "while needs a semicolon",
          ],
          answer: 2,
          praise:
            "You spotted the missing update — i stays 1, the condition stays true, and the loop never ends. An algorithm that lost its finiteness.",
        },
      ],
    },
    {
      id: "for-loops",
      title: "for & nested loops",
      unit: 2,
      weight: "heavy",
      deps: ["while-dowhile"],
      whyItMatters:
        "for is the workhorse of every counting question, and nested loops (patterns, tables) are a standing exam section.",
      recap: [
        "for (init; condition; update) — all three loop pieces on one line. Runs: init once → check → body → update → check → …",
        "for (;;) with nothing in it is an infinite loop.",
        "Nested loops: the inner loop runs COMPLETELY for each single pass of the outer loop — outer 3 × inner 4 = 12 runs of the inner body.",
        "Patterns: outer loop = rows, inner loop = what's printed in a row, printf(\"\\n\") after the inner loop ends the row.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The counting loop",
          body: "A **for loop** gathers the three loop pieces — initialise, test, update — into one header:\n\n`for (init; condition; update)`\n\nThe order of events: **init** runs once → **condition** checked → body runs → **update** runs → condition checked again → … So it's entry-controlled, like while.\n\nLeave all three slots empty — `for (;;)` — and there's nothing to stop it: an infinite loop by design.",
          code: "for (int i = 1; i <= 5; i++) {\n    printf(\"%d \", i);\n}\n// prints: 1 2 3 4 5",
        },
        {
          kind: "teach",
          title: "Loops inside loops",
          body: "Put a loop inside a loop and the **inner loop runs completely for every single pass of the outer loop**. Outer runs 3 times, inner 4 → the inner body runs 3 × 4 = **12** times.\n\nThat's the whole secret of pattern printing: the **outer loop walks the rows**, the **inner loop prints across one row**, and a `printf(\"\\n\")` after the inner loop closes the row:",
          code: "for (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= i; j++) {\n        printf(\"*\");\n    }\n    printf(\"\\n\");\n}\n// *\n// **\n// ***",
        },
        {
          kind: "check",
          prompt: "How many times does printf run in total?",
          code: "for (int i = 1; i <= 3; i++)\n    for (int j = 1; j <= 4; j++)\n        printf(\"x\");",
          options: ["7", "3", "12", "4"],
          answer: 2,
          praise:
            "Multiply, don't add — 3 outer passes, each carrying 4 full inner passes: 12. Once you see nested loops as multiplication, every counting question opens up.",
        },
        {
          kind: "check",
          prompt: "In the star-triangle code above, what makes row 2 print exactly TWO stars?",
          options: [
            "The outer condition i <= 3",
            "The inner condition j <= i, because i is 2 on that row",
            "The printf(\"\\n\")",
            "Luck",
          ],
          answer: 1,
          praise:
            "That's the key move — the inner loop's limit depends on the outer counter, so each row grows with i. Every triangle pattern on the exam is this one trick.",
        },
        {
          kind: "check",
          prompt: "What does for(;;) do?",
          options: [
            "Compile error — the slots can't be empty",
            "Runs exactly once",
            "Never runs",
            "Loops forever — an infinite loop",
          ],
          answer: 3,
          praise:
            "Right — empty condition counts as always-true, so nothing ever stops it. It's the idiomatic infinite loop, escaped only by break.",
        },
      ],
    },
    {
      id: "jumps",
      title: "break, continue & goto",
      unit: 2,
      weight: "medium",
      deps: ["for-loops", "switch"],
      whyItMatters:
        "break-vs-continue inside a loop is a precision question — one word different, completely different output.",
      recap: [
        "break: exits the ENTIRE loop (or switch) immediately.",
        "continue: skips the REST of this pass and jumps to the next iteration (the update/condition).",
        "goto label; jumps to label: — legal but discouraged (spaghetti code).",
        "return exits the whole function, loop and all.",
        "In nested loops, break only exits the loop it sits in.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Two ways to cut a loop short",
          body: "**break** abandons the whole loop at once — execution continues after the loop's closing brace.\n\n**continue** abandons only the *current pass* — it jumps straight to the update/condition and the loop keeps going.\n\nOne leaves the building; the other skips to the next lap.",
          code: "for (int i = 1; i <= 5; i++) {\n    if (i == 3) break;\n    printf(\"%d \", i);\n}\n// prints: 1 2\n\nfor (int i = 1; i <= 5; i++) {\n    if (i == 3) continue;\n    printf(\"%d \", i);\n}\n// prints: 1 2 4 5",
        },
        {
          kind: "teach",
          title: "goto and return",
          body: "**goto** jumps to a named label anywhere in the function: `goto end;` … `end:`. It exists, it works, and the material (like every teacher since 1968) tells you to avoid it — unstructured jumps make **spaghetti code** nobody can follow.\n\n**return** is the strongest exit of all: it leaves the entire *function*, taking any loop with it.\n\nOne more subtlety: in **nested** loops, a break only escapes the **innermost** loop it lives in — the outer loop carries on.",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "for (int i = 1; i <= 4; i++) {\n    if (i % 2 == 0) continue;\n    printf(\"%d \", i);\n}",
          options: ["1 3", "2 4", "1 2 3 4", "1"],
          answer: 0,
          praise:
            "Right — continue tosses out the even passes mid-lap but the loop itself survives to the end. Swap in break and you'd get just '1' — one word, whole different program.",
        },
        {
          kind: "check",
          prompt: "Inside the INNER of two nested loops, break is executed. What stops?",
          options: [
            "Both loops",
            "Only the inner loop — the outer continues",
            "Only the outer loop",
            "The whole program",
          ],
          answer: 1,
          praise:
            "Exactly — break has a one-loop blast radius. To leave both you'd need a flag, a return, or (shudder) a goto.",
        },
      ],
    },
  ],
};

export const unit2Exam: ExamQuestion[] = [
  {
    id: "u2q1",
    topicId: "selection-if",
    unit: 2,
    prompt: "In C, which values count as TRUE in a condition?",
    options: [
      "Only 1",
      "Only positive numbers",
      "Any nonzero value",
      "Only the keyword true",
    ],
    answer: 2,
    hint: "Even negative numbers pass an if. What's the single value that doesn't?",
    explanation: "C treats 0 as false and every nonzero value — positive or negative — as true.",
  },
  {
    id: "u2q2",
    topicId: "selection-if",
    unit: 2,
    prompt: "What is stored in y?",
    code: "int x = 10;\nint y = (x > 5) ? 100 : 200;",
    options: ["10", "100", "200", "5"],
    answer: 1,
    hint: "Read ternary as: condition ? if-true : if-false.",
    explanation: "x > 5 is true, so the ternary picks the value before the colon: 100.",
  },
  {
    id: "u2q3",
    topicId: "selection-nested",
    unit: 2,
    prompt: "In an else-if ladder, what happens when TWO conditions are both true?",
    options: [
      "Both branches run",
      "The last true branch runs",
      "Only the FIRST true branch (top-down) runs",
      "It's a compile error",
    ],
    answer: 2,
    hint: "The ladder is checked top-down and stops at the first success.",
    explanation:
      "Ladders evaluate top-down and commit to the first true condition; every later branch is skipped. That's why order matters.",
  },
  {
    id: "u2q4",
    topicId: "switch",
    unit: 2,
    prompt: "Which of these CANNOT be used as a case label in a switch?",
    options: ["case 3:", "case 'x':", "case 2.5:", "case 100:"],
    answer: 2,
    hint: "Case labels must be constant values of a particular kind — what kind?",
    explanation:
      "Case labels must be constant integers or characters. Floating-point values, variables and expressions like n > 5 are all illegal.",
  },
  {
    id: "u2q5",
    topicId: "switch",
    unit: 2,
    prompt: "What does this print?",
    code: "int c = 2;\nswitch (c) {\n    case 1: printf(\"A\");\n    case 2: printf(\"B\");\n    case 3: printf(\"C\");\n    default: printf(\"D\");\n}",
    options: ["B", "BCD", "BC", "ABCD"],
    answer: 1,
    hint: "There are no breaks anywhere — what does execution do after matching case 2?",
    explanation:
      "Execution jumps to case 2 and, with no break statements, falls through case 3 and default, printing B, C, then D.",
  },
  {
    id: "u2q6",
    topicId: "while-dowhile",
    unit: 2,
    prompt: "The key difference between while and do-while is that do-while…",
    options: [
      "runs faster",
      "checks the condition before the body",
      "always executes its body at least once",
      "cannot loop more than once",
    ],
    answer: 2,
    hint: "One is entry-controlled, the other exit-controlled — which order do body and check happen in?",
    explanation:
      "do-while is exit-controlled: the body runs first, the condition is tested after, so one execution is guaranteed even if the condition is false.",
  },
  {
    id: "u2q7",
    topicId: "while-dowhile",
    unit: 2,
    prompt: "What is the output?",
    code: "int i = 5;\nwhile (i > 0) {\n    printf(\"%d \", i);\n    i = i - 2;\n}",
    options: ["5 3 1", "5 4 3 2 1", "5 3", "5 3 1 -1"],
    answer: 0,
    hint: "Trace it: i drops by 2 each pass, and the gate is i > 0.",
    explanation:
      "i takes values 5, 3, 1 — each printed while positive. At i = -1 the condition fails BEFORE printing (entry-controlled).",
  },
  {
    id: "u2q8",
    topicId: "for-loops",
    unit: 2,
    prompt: "How many times does the inner printf execute?",
    code: "for (int i = 0; i < 2; i++)\n    for (int j = 0; j < 5; j++)\n        printf(\"*\");",
    options: ["7", "10", "5", "2"],
    answer: 1,
    hint: "The inner loop runs fully for EACH outer pass — multiply.",
    explanation: "2 outer passes × 5 inner passes = 10 executions. Nested loops multiply.",
  },
  {
    id: "u2q9",
    topicId: "jumps",
    unit: 2,
    prompt: "What is the output?",
    code: "for (int i = 1; i <= 5; i++) {\n    if (i == 4) break;\n    printf(\"%d\", i);\n}",
    options: ["12345", "123", "1235", "45"],
    answer: 1,
    hint: "break doesn't skip a pass — it ends the loop entirely.",
    explanation:
      "The loop prints 1, 2, 3; at i = 4 break terminates the loop before printing. continue would instead have given 1235.",
  },
  {
    id: "u2q10",
    topicId: "jumps",
    unit: 2,
    prompt: "Which statement skips the rest of the current iteration but keeps the loop running?",
    options: ["break", "goto", "continue", "return"],
    answer: 2,
    hint: "You want to skip a lap, not leave the race.",
    explanation:
      "continue jumps to the loop's update/condition, abandoning only the current pass. break exits the loop; return exits the whole function.",
  },
];
