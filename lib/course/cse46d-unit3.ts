// CSE46D Unit 3: Stack Organization & Program Control. Four-quarter circles
// per KUBE_LESSON_DEPTH.md. Source: the image-based back half of
// Data_Tranfer_and_Manipulation.ppt (stack, RPN, instruction formats,
// program control, interrupts) — read slide by slide from the carved images.
import type { Section } from "./types";

export const sectionU3: Section = {
  id: "ca-sec-u3",
  letter: "D",
  title: "Stack Organization & Program Control",
  tagline: "The LIFO structure that runs your programs — and the instructions that steer them.",
  unit: 3,
  topics: [
    // ── The stack itself ─────────────────────────────────────────────
    {
      id: "ca-stack-lifo",
      title: "The stack & LIFO",
      unit: 3,
      weight: "medium",
      deps: ["ca-rev-modes"],
      whyItMatters:
        "Everything in this unit — RPN, zero-address machines, CALL/RET — stands on this one data structure. Get LIFO into your reflexes first.",
      recap: [
        "A stack is a special data structure in memory that follows LIFO — Last In, First Out.",
        "The LAST element pushed is the FIRST one removed. Think of a stack of plates: new plate on top, and you take from the top.",
        "Only the TOP of the stack is accessible at any moment.",
        "Computers use stacks for function calls, expression evaluation, and memory management.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Unit 3 opens with a single, simple idea that quietly runs every program you've ever used.\n\nA **stack** is a special region of memory with one strict rule about how things go in and come out.",
            },
            {
              kind: "teach",
              body: "The rule is **LIFO — Last In, First Out**.\n\nThe last element you insert is the first one you can remove. Nothing else is reachable.",
            },
            {
              kind: "teach",
              body: "Your slides give the perfect picture: a **stack of plates**.\n\nA new plate goes **on top**. When you need a plate, you take it **from the top**. You never slide one out of the middle — the pile would topple.",
            },
            {
              kind: "teach",
              body: "Why does a CPU carry a plate pile around? The slides list three jobs:\n\n**function calls** (remembering where to come back to), **expression evaluation** (coming up in the RPN circles), and **memory management**.\n\nOne structure, three superpowers. Let's check it took.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A stack follows which ordering principle?",
              options: ["FIFO — First In, First Out", "LIFO — Last In, First Out", "Random access", "Priority order"],
              answer: 1,
              praise: "LIFO — last in, first out. That's the one rule the whole unit leans on.",
            },
            {
              kind: "check",
              prompt: "Which part of a stack can you access directly?",
              options: ["Any element", "The bottom", "Only the top", "The middle"],
              answer: 2,
              praise: "Only the top — like the plate pile. Everything else waits its turn.",
            },
            {
              kind: "check",
              prompt: "Which of these is NOT one of the stack's classic jobs from your slides?",
              options: ["Function calls", "Expression evaluation", "Memory management", "Speeding up multiplication"],
              answer: 3,
              praise: "Right — multiplication belongs to the ALU (and Unit 4). Calls, expressions, memory: those are the stack's three.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Watch one work",
              body: "Push the letters **A**, then **B**, then **C** onto an empty stack.\n\nThe pile now reads C on top, B under it, A at the bottom.\n\nPop three times and they come back **C, B, A** — the exact reverse of how they went in. A stack is a built-in order-reverser.",
            },
            {
              kind: "check",
              prompt: "You push 1, then 2, then 3. You pop twice. Which values came out, in order?",
              options: ["1 then 2", "3 then 2", "2 then 3", "1 then 3"],
              answer: 1,
              praise: "3 first (it was last in), then 2. The reverser in action.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"The first element pushed onto a stack is the first to be removed.\" What's wrong?",
              options: [
                "Nothing — that's LIFO",
                "That describes FIFO (a queue); a stack removes the LAST-pushed element first",
                "Stacks never remove elements",
                "The first element can't be removed at all",
              ],
              answer: 1,
              praise: "First-in-first-out is a queue at a ticket counter. The stack is the plate pile — last in, first out. Two structures, opposite personalities.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-stack-sp",
      title: "The Stack Pointer: PUSH & POP mechanics",
      unit: 3,
      weight: "heavy",
      deps: ["ca-stack-lifo"],
      whyItMatters:
        "PUSH and POP with the SP arithmetic is exactly the kind of small mechanical question papers love — and CALL/RET later makes no sense without it.",
      recap: [
        "The Stack Pointer (SP) is a REGISTER that holds the ADDRESS of the top of the stack.",
        "PUSH (descending stack): SP = SP − 1, then store the data at the new top.",
        "POP: retrieve the top value, then SP = SP + 1.",
        "SP tracks where the last data was stored — or where it will be retrieved from.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The stack lives in ordinary memory. So one question decides everything:\n\n*where exactly is the top right now?*\n\nThe CPU keeps the answer in a dedicated register: the **Stack Pointer (SP)**.",
            },
            {
              kind: "teach",
              body: "**SP holds the address of the top of the stack.** Nothing more, nothing less.\n\nIt tracks where the last data was stored — or from where the next value will be retrieved.",
            },
            {
              kind: "teach",
              body: "**PUSH** — insert data.\n\nIn a *descending* stack (the common kind — it grows toward lower addresses), PUSH does two things:\n\n**SP = SP − 1** (make room at a new top), then **store the data** at that new top.",
            },
            {
              kind: "teach",
              body: "**POP** — remove data.\n\nMirror image: **retrieve the top value**, then **SP = SP + 1** (the top slides back down the pile).\n\nNotice the symmetry — PUSH moves SP *before* storing, POP moves it *after* reading.",
            },
            {
              kind: "teach",
              body: "Why 'descending'? Convention: the stack starts at a high address and grows DOWNWARD, so subtracting makes room.\n\nDon't memorize the minus sign blindly — memorize *push makes the stack grow, pop shrinks it*, and the direction follows from where it grows.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The Stack Pointer (SP) is…",
              options: [
                "a memory location holding data",
                "a register holding the ADDRESS of the top of the stack",
                "the top value itself",
                "an ALU flag",
              ],
              answer: 1,
              praise: "A register, holding an address — the top's address. Value vs address again, same razor as the addressing modes.",
            },
            {
              kind: "check",
              prompt: "In a descending stack, PUSH does what, in what order?",
              options: [
                "Store data, then SP = SP + 1",
                "SP = SP − 1, then store data at the new top",
                "SP = SP + 1, then store",
                "Just stores — SP never moves",
              ],
              answer: 1,
              praise: "Make room first (SP goes down by one), then place the data. That order is the exam detail.",
            },
            {
              kind: "check",
              prompt: "And POP?",
              options: [
                "Retrieve the top value, then SP = SP + 1",
                "SP = SP − 1, then retrieve",
                "Retrieve the bottom value",
                "Erase the whole stack",
              ],
              answer: 0,
              praise: "Read the top, then let SP climb back up. Push and pop are perfect mirrors.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked example",
              body: "Say **SP = 1000** and you run `PUSH X` on a descending stack.\n\nStep 1: SP = SP − 1 → SP = **999**.\nStep 2: X is stored at address **999**.\n\nNow `PUSH Y`: SP becomes **998**, Y lands at 998. The stack has grown downward, two floors deep, and SP always points at the newest tenant.",
            },
            {
              kind: "check",
              prompt: "Continue it yourself: SP = 998 (Y on top). You run one POP. What happens?",
              options: [
                "Y is retrieved, SP becomes 999",
                "X is retrieved, SP becomes 997",
                "Y is retrieved, SP becomes 997",
                "X is retrieved, SP stays 998",
              ],
              answer: 0,
              praise: "Y (the newest) comes off, and SP climbs to 999 — where X now waits on top. You just ran the mechanics unaided.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"POP decrements SP, because the stack shrinks.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — in a descending stack, shrinking means SP moves UP (SP = SP + 1); it's PUSH that decrements",
                "POP never changes SP",
                "SP only changes on errors",
              ],
              answer: 1,
              praise: "The trap everyone falls into once — 'shrink' feels like minus. But a descending stack grows down, so it shrinks UP. Growth direction first, sign second.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why a register at all?",
              body: "Imagine no SP: to find the stack's top you'd have to *search memory*. Absurd.\n\nOne register makes the top a single lookup — which is why PUSH and POP can be single fast instructions, and why the stack can hide inside zero-address machines and CALL/RET (both coming in this unit).\n\nSP is the stack's entire address book, one entry long.",
            },
            {
              kind: "check",
              prompt: "Three PUSHes then three POPs run on a descending stack starting at SP = 500. Where is SP at the end?",
              options: ["497", "503", "500 — right back where it started", "Cannot tell"],
              answer: 2,
              praise: "Down three, up three — home again. Balanced pushes and pops always return SP to base. Keep that instinct: it's how you'll debug CALL/RET later.",
            },
          ],
        },
      ],
      steps: [],
    },
    // ── RPN ──────────────────────────────────────────────────────────
    {
      id: "ca-rpn-notation",
      title: "Reverse Polish Notation",
      unit: 3,
      weight: "heavy",
      deps: ["ca-stack-sp"],
      whyItMatters:
        "Infix→postfix conversion is a bank-able exam mark, and RPN is the reason stack machines need no addresses at all.",
      recap: [
        "Reverse Polish Notation (RPN) = postfix notation: operators come AFTER their operands.",
        "Infix (3 + 5) * 2 becomes postfix 3 5 + 2 *.",
        "Infix (4 + 5) * (6 − 2) becomes 4 5 + 6 2 − *.",
        "No parentheses are ever needed — operator placement alone fixes the order of operations.",
        "Advantages: no parentheses, no precedence rules, efficient for stack-based calculation.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "You write math like this: **(3 + 5) * 2**. Operators *between* operands — that's called **infix** notation.\n\nComputers prefer a stranger arrangement.",
            },
            {
              kind: "teach",
              body: "**Reverse Polish Notation (RPN)**, also called **postfix**: operators come **after** their operands.\n\n3 + 5 becomes **3 5 +**. Say it like a recipe: 'take 3, take 5… now add.'",
            },
            {
              kind: "teach",
              body: "The full example from your slides:\n\nInfix: **(3 + 5) * 2**\nPostfix: **3 5 + 2 ***\n\nRead it left to right: 3 and 5 get added; that result and 2 get multiplied. The order of operations is baked into the *positions*.",
            },
            {
              kind: "teach",
              body: "And here's the magic your slides highlight: **no parentheses are needed** — ever.\n\nIn infix, (3 + 5) * 2 and 3 + 5 * 2 differ only by brackets. In postfix they're simply *different strings*: 3 5 + 2 * versus 3 5 2 * +. Placement replaces punctuation.",
            },
            {
              kind: "teach",
              body: "One more, with two bracketed groups:\n\nInfix: **(4 + 5) * (6 − 2)**\nPostfix: **4 5 + 6 2 − ***\n\nEach group converts on its own, then the * joins the two results at the end. Keep this one — you'll evaluate it yourself next circle.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In RPN, operators are placed…",
              options: ["before the operands", "between the operands", "after the operands", "anywhere"],
              answer: 2,
              praise: "After — 'post'-fix. Operands first, verdict last.",
            },
            {
              kind: "check",
              prompt: "The RPN form of A + B is…",
              options: ["+ A B", "A B +", "A + B", "B + A"],
              answer: 1,
              praise: "A B + — the smallest possible postfix expression, and the template for every bigger one.",
            },
            {
              kind: "check",
              prompt: "Why does RPN need no parentheses?",
              options: [
                "Expressions are kept short",
                "The position of each operator fully determines the order of operations",
                "It only supports addition",
                "Calculators add brackets internally",
              ],
              answer: 1,
              praise: "Position IS punctuation in postfix. That's the whole reason this notation exists.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked conversion",
              body: "Convert **(2 + 6) * 4** step by step.\n\nInnermost group first: 2 + 6 → **2 6 +**.\nThat result is multiplied by 4: take the converted group, then 4, then the operator: **2 6 + 4 ***.\n\nMethod: convert each bracketed piece, then append the joining operator last.",
            },
            {
              kind: "check",
              prompt: "Your turn: convert (4 + 5) * (6 − 2) to RPN.",
              options: ["4 5 + 6 2 − *", "4 + 5 * 6 − 2", "* + 4 5 − 6 2", "4 5 6 2 + − *"],
              answer: 0,
              praise: "Each group converted, * appended last: 4 5 + 6 2 − *. Straight off your slide — and you produced it, not memorized it.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a friend converts 3 + 5 * 2 (no brackets!) to '3 5 + 2 *'. What went wrong?",
              options: [
                "Nothing — that's correct",
                "Precedence: * binds first, so it's 3 5 2 * + — their version computes (3+5)*2 instead",
                "RPN can't express this",
                "The 3 should come last",
              ],
              answer: 1,
              praise: "Sharp — without brackets, multiplication happens first, so 5 2 * nests inside: 3 5 2 * +. Postfix never lies about order; you just have to translate the true order in.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why machines love it",
              body: "Your slides list RPN's three advantages:\n\n**No parentheses needed** — order is clear from placement.\n**Efficient for stack-based calculation** — used in calculators and processors.\n**Easier to evaluate** — no operator-precedence rules to consult.\n\nNotice the middle one: *stack-based*. The pile of plates from two circles ago is exactly the machine that eats this notation — next circle shows how.",
            },
            {
              kind: "check",
              prompt: "Deepest reason RPN suits computers: evaluating it requires…",
              options: [
                "a precedence table and bracket matcher",
                "just a stack — each symbol triggers one push or one pop-compute-push",
                "converting back to infix first",
                "special hardware for parentheses",
              ],
              answer: 1,
              praise: "One stack, one pass, zero grammar. You've connected notation to hardware — which is precisely where this unit is heading.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rpn-stack",
      title: "Evaluating RPN with a stack",
      unit: 3,
      weight: "heavy",
      deps: ["ca-rpn-notation"],
      whyItMatters:
        "The step-by-step stack trace is a ready-made 10-mark answer, and it's the bridge to zero-address machines two circles from now.",
      recap: [
        "Rule 1: element is a NUMBER → push it onto the stack.",
        "Rule 2: element is an OPERATOR → pop the required operands, compute, push the result back.",
        "Rule 3: repeat until the expression is fully processed; the final stack value is the answer.",
        "3 5 + 2 * : push 3, push 5, + pops 3,5 pushes 8, push 2, * pops 8,2 pushes 16. Result 16.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "You can now *write* RPN. Time to *run* it — with the stack you already own.\n\nThe whole algorithm is two rules and a loop.",
            },
            {
              kind: "teach",
              body: "**Rule 1 — number?** Push it onto the stack.\n\nNumbers just wait their turn on the pile.",
            },
            {
              kind: "teach",
              body: "**Rule 2 — operator?** Pop the operands it needs (two, for + − * /), **compute**, and **push the result back**.\n\nThe answer takes the operands' place on the pile.",
            },
            {
              kind: "teach",
              body: "**Rule 3 — repeat** until the expression is fully processed.\n\nWhatever single value remains on the stack *is* the answer. No precedence table, no brackets — just push, pop, compute.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "While evaluating RPN, you meet a number. You…",
              options: ["pop it", "push it onto the stack", "compute immediately", "skip it"],
              answer: 1,
              praise: "Numbers get pushed. They act only when an operator calls on them.",
            },
            {
              kind: "check",
              prompt: "You meet a + operator. The stack holds …, 3, 5 (5 on top). What happens?",
              options: [
                "Push the +",
                "Pop 5 and 3, compute 8, push 8",
                "Pop only 5",
                "Clear the stack",
              ],
              answer: 1,
              praise: "Two off, one back on: 3 and 5 leave, 8 arrives. That pop-compute-push move is the engine of the whole method.",
            },
            {
              kind: "check",
              prompt: "When the expression is fully processed, the answer is…",
              options: [
                "the bottom of the stack",
                "the single value left on the stack",
                "in the flags register",
                "printed automatically",
              ],
              answer: 1,
              praise: "One survivor on the pile — the result. A clean run always ends with exactly one value.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked trace: 3 5 + 2 *",
              body: "The table from your slide, row by row:\n\n**3** → push → stack: 3\n**5** → push → stack: 3 5\n**+** → pop 3,5 → compute 3+5=8 → push → stack: 8\n**2** → push → stack: 8 2\n***** → pop 8,2 → compute 8×2=16 → push → stack: 16\n\n**Final result = 16.** That's (3+5)*2 — the infix we started from, evaluated with zero brackets.",
            },
            {
              kind: "check",
              prompt: "Your turn — evaluate 4 5 + 6 2 − * with the two rules. Result?",
              options: ["36", "13", "28", "42"],
              answer: 0,
              praise: "4 5 + gives 9, 6 2 − gives 4, then 9 × 4 = 36. You traced a two-group expression solo — exam-answer material.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: evaluating 3 5 + 2 *, a student pops 3 and 5 for the +, computes 8… and writes 8 down on paper instead of pushing it. Why does everything now collapse?",
              options: [
                "It doesn't — writing it down is fine",
                "The * will find only 2 on the stack — the 8 had to go BACK on the pile to be an operand later",
                "The stack overflows",
                "8 was the wrong sum",
              ],
              answer: 1,
              praise: "Exactly — intermediate results are future operands. Push-back isn't bookkeeping, it's the step that lets big expressions build from small ones.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "From algorithm to architecture",
              body: "Look at what you never needed during that trace: a temporary variable, a named register, an address.\n\nThe stack held everything; the notation supplied the order. Real machines are built on exactly this — **stack-based CPUs** where ADD names no operands at all.\n\nThat's the zero-address machine, two circles ahead. You've already met its soul.",
            },
            {
              kind: "check",
              prompt: "Evaluating 7 2 − 3 *: what's on the stack at its LARGEST moment, and what's the result?",
              options: [
                "Largest 7 2, result 15",
                "Largest 7 2 (then 5 3), result 15",
                "Largest 7 2 3, result 3",
                "Largest 5 3, result 8",
              ],
              answer: 1,
              praise: "7 2 → − makes 5 → push 3 → * makes 15. The pile never exceeded two — RPN keeps stacks shallow and machines happy.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-stack",
      title: "Quick review: stacks & RPN",
      unit: 3,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-stack-lifo", "ca-stack-sp", "ca-rpn-notation", "ca-rpn-stack"],
        count: 5,
      },
      deps: ["ca-rpn-stack"],
      whyItMatters:
        "LIFO, SP arithmetic, postfix, the trace — five questions to lock the stack story before instruction formats build on it.",
      recap: [],
      steps: [],
    },
    // ── Instruction formats ──────────────────────────────────────────
    {
      id: "ca-fmt-styles",
      title: "Instruction formats: the three styles",
      unit: 3,
      weight: "medium",
      deps: ["ca-rev-stack"],
      whyItMatters:
        "Single-accumulator, general-register, stack — every address-count question starts by knowing which machine family you're on.",
      recap: [
        "An instruction format defines how an instruction is structured in terms of operands and addressing modes.",
        "Single Address format: one address field + an implicit accumulator. ADD A means AC ← AC + M[A].",
        "General Register format: multiple registers reduce memory access. ADD R1, R2 adds R2 into R1.",
        "Stack Organization format: no registers or explicit addresses — operands come implicitly from the stack.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Same job — add two numbers — but different CPUs write the instruction completely differently.\n\nAn **instruction format** defines how an instruction is structured: how many operands it names, and how they're addressed. Your slides give three main styles.",
            },
            {
              kind: "teach",
              body: "**a) Single Address format.** One address field, plus a hidden helper: the **accumulator** register, always implied.\n\n`ADD A` — fetch memory location A, add it to the accumulator, result stays in the accumulator. One name written, two operands involved.",
            },
            {
              kind: "teach",
              body: "**b) General Register format.** The CPU has several registers, and instructions name them to **reduce memory access**.\n\n`ADD R1, R2` — add R2's contents into R1. Fast, because registers beat memory trips.",
            },
            {
              kind: "teach",
              body: "**c) Stack Organization format.** No registers named, no addresses named — **operands come implicitly from the stack**.\n\n`ADD` alone pops two values, adds, pushes the result. Your RPN trace WAS this machine running.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In the single-address format, the second operand hides in…",
              options: ["another memory cell", "the accumulator register", "the stack", "the instruction itself"],
              answer: 1,
              praise: "The accumulator — the implicit partner in every single-address instruction.",
            },
            {
              kind: "check",
              prompt: "The general-register format exists mainly to…",
              options: [
                "make instructions shorter",
                "reduce memory access by keeping operands in registers",
                "eliminate the ALU",
                "support parentheses",
              ],
              answer: 1,
              praise: "Registers are close and fast — naming them dodges slow memory trips. That's the slide's exact selling point.",
            },
            {
              kind: "check",
              prompt: "In the stack format, ADD finds its operands…",
              options: ["in the address field", "implicitly on the stack", "in R1 and R2", "in the accumulator"],
              answer: 1,
              praise: "Implicitly, from the top of the stack — no names needed. RPN's machine, formalized.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "One addition, three dialects",
              body: "Compute C = A + B in each style:\n\n**Single address:** LOAD A → ADD B → STORE C (accumulator carries everything).\n**General register:** MOV R1, A → ADD R1, B-ish moves… registers carry it.\n**Stack:** PUSH A → PUSH B → ADD → POP C.\n\nSame math, three grammars. The next two circles count the addresses in each grammar precisely.",
            },
            {
              kind: "check",
              prompt: "Classify: `ADD R1, R2` (adds R1 and R2, result in R1) belongs to which format?",
              options: ["Single address", "General register", "Stack organization", "None"],
              answer: 1,
              praise: "Registers named, memory avoided — general register format, straight from the slide.",
            },
            {
              kind: "check",
              prompt: "Classify: a bare `ADD` with no operands at all?",
              options: ["Single address", "General register", "Stack organization", "Invalid instruction"],
              answer: 2,
              praise: "No names = stack machine. You can now identify a CPU family from one instruction's silhouette.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-fmt-01",
      title: "Zero- & one-address instructions",
      unit: 3,
      weight: "heavy",
      deps: ["ca-fmt-styles"],
      whyItMatters:
        "The 0/1/2/3-address family is a named Part B exam topic. This circle owns the implicit half of the family.",
      recap: [
        "The number of addresses in an instruction determines how operands are accessed and how compact the instruction is.",
        "Zero-address (stack-based): no explicit operands; all operations use the stack. PUSH A, PUSH B, ADD, POP C. Used in the JVM and HP calculators.",
        "One-address (accumulator-based): a single address field, accumulator implicit. LOAD A (AC←A), ADD B (AC←AC+B), STORE C (C←AC).",
        "One-address advantage: simpler, less memory per instruction. Disadvantage: frequent memory access slows execution.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Now the sharper question your exam asks: exactly **how many addresses** does one instruction carry?\n\nThe count — 0, 1, 2, or 3 — determines how operands are accessed and how compact the instruction is. This circle: the quiet ones, 0 and 1.",
            },
            {
              kind: "teach",
              body: "**Zero-address** — the stack-based architecture.\n\nNo explicit operands anywhere. Everything happens on the stack (LIFO), operands taken implicitly from the top.",
            },
            {
              kind: "teach",
              body: "Computing C = A + B on a zero-address machine:\n\n`PUSH A` — A onto stack\n`PUSH B` — B onto stack\n`ADD` — pop both, add, push result\n`POP C` — store result in C\n\nThe ADD itself carries **zero** addresses. The pushes and pops do the fetching.",
            },
            {
              kind: "teach",
              body: "Who actually builds this? Your slides name two: the **Java Virtual Machine** and **HP calculators**.\n\nEvery Java program you've run executed on a zero-address design.",
            },
            {
              kind: "teach",
              body: "**One-address** — the accumulator-based architecture.\n\nOne address field per instruction; the **accumulator (AC)** is the implicit second operand and the implicit destination:\n\n`LOAD A` — AC ← A\n`ADD B` — AC ← AC + B\n`STORE C` — C ← AC\n\n**Advantage:** simpler, needs less memory per instruction. **Disadvantage:** frequent memory access slows execution.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Zero-address instructions get their operands from…",
              options: ["the accumulator", "explicit memory addresses", "implicitly, the stack", "the program counter"],
              answer: 2,
              praise: "The stack, silently. Zero names, full computation.",
            },
            {
              kind: "check",
              prompt: "Which real systems use zero-address (stack-based) execution?",
              options: [
                "The Java Virtual Machine and HP calculators",
                "All x86 desktops",
                "DMA controllers",
                "Cache memories",
              ],
              answer: 0,
              praise: "JVM and HP calculators — the slide's two, and a favorite factual question.",
            },
            {
              kind: "check",
              prompt: "In `ADD B` on a one-address machine, where does the OTHER operand come from — and where does the result go?",
              options: [
                "Both in memory",
                "The accumulator, both times: AC ← AC + B",
                "The stack",
                "Register R1",
              ],
              answer: 1,
              praise: "AC in, AC out — the accumulator is partner and destination at once. That double duty is the whole format.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked example: same program, both machines",
              body: "Compute C = A + B.\n\n**Zero-address:** PUSH A · PUSH B · ADD · POP C — four instructions, but each tiny (most carry no address).\n\n**One-address:** LOAD A · ADD B · STORE C — three instructions, each carrying exactly one address, accumulator shuttling in between.\n\nCount instructions, count addresses — the trade shows itself.",
            },
            {
              kind: "check",
              prompt: "You try: on a one-address machine, compute D = X + Y. Which sequence is right?",
              options: [
                "LOAD X · ADD Y · STORE D",
                "PUSH X · PUSH Y · ADD · POP D",
                "ADD X, Y, D",
                "MOV D, X · ADD D, Y",
              ],
              answer: 0,
              praise: "Load, add, store — the accumulator waltz. (The PUSH version is the zero-address dialect; the others belong to bigger address counts.)",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"PUSH A is a zero-address instruction, since it's on a stack machine.\" What's off?",
              options: [
                "Nothing",
                "PUSH A carries the address A — it's the ADD that's zero-address; stack machines still need addressed pushes/pops to touch memory",
                "PUSH doesn't exist on stack machines",
                "A is a register, not an address",
              ],
              answer: 1,
              praise: "Subtle and exam-relevant — the ARITHMETIC is zero-address; the loads at the edges still name memory. Precision like this separates the top answers.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Zero vs one, head to head",
              body: "**Zero-address:** shortest instructions, but more of them — and everything funnels through the stack.\n\n**One-address:** simpler hardware, less memory per instruction — but the accumulator is a bottleneck and **frequent memory access slows execution** (the slide's stated disadvantage).\n\nBoth are 'small machine' designs. The next circle adds registers and buys speed with bits.",
            },
            {
              kind: "check",
              prompt: "Why does one-address code hit memory so often?",
              options: [
                "The stack lives in memory",
                "With only AC to hold values, almost every operand must come from (or return to) memory",
                "LOAD is a slow instruction",
                "It doesn't",
              ],
              answer: 1,
              praise: "One register to live in means memory for everything else. You've derived the disadvantage instead of memorizing it — that's the depth this circle wanted.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-fmt-23",
      title: "Two- & three-address instructions",
      unit: 3,
      weight: "heavy",
      deps: ["ca-fmt-01"],
      whyItMatters:
        "The comparison across all four counts is the exam's favorite table — Part B has asked exactly this family before.",
      recap: [
        "Two-address (general register): two explicit fields, source and destination share. ADD R1, R2 means R1 ← R1 + R2. Fewer instructions than one-address, but more bits each.",
        "Three-address (general-purpose register machines): two operands + one result address. ADD R1, R2, R3 means R1 ← R2 + R3. Faster, fewer memory accesses; instructions take more space.",
        "Comparison: Zero → implicit stack (stack CPUs); One → accumulator (simple CPUs); Two → general registers; Three → high-performance CPUs.",
        "Trade-off axis: compactness of each instruction vs number of instructions and memory traffic.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Now the explicit half of the family — machines that name **two** or **three** operands outright.\n\nMore names per instruction = fewer instructions per job. The question is what it costs.",
            },
            {
              kind: "teach",
              body: "**Two-address** — the general register architecture.\n\nTwo explicit fields: source and destination. The destination does double duty:\n\n`ADD R1, R2` → **R1 ← R1 + R2**. R1 is an input AND the output — one operand gets overwritten.",
            },
            {
              kind: "teach",
              body: "The slides' verdict on two-address:\n\n**Advantage:** fewer instructions than the one-address format.\n**Disadvantage:** more bits needed per instruction — two full fields to encode.",
            },
            {
              kind: "teach",
              body: "**Three-address** — general-purpose register machines.\n\nTwo addresses for operands, one for the result. Nothing is overwritten:\n\n`ADD R1, R2, R3` → **R1 ← R2 + R3**.\n\n**Advantage:** faster execution, fewer memory accesses. **Disadvantage:** instructions take more space — three fields is a wide word.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "ADD R1, R2 on a two-address machine computes…",
              options: ["R2 ← R1 + R2", "R1 ← R1 + R2", "R3 ← R1 + R2", "nothing without a third field"],
              answer: 1,
              praise: "R1 ← R1 + R2 — destination doubles as first operand. The overwrite is the format's signature.",
            },
            {
              kind: "check",
              prompt: "ADD R1, R2, R3 on a three-address machine computes…",
              options: ["R1 ← R2 + R3", "R3 ← R1 + R2", "R2 ← R1 + R3", "R1 ← R1 + R2 + R3"],
              answer: 0,
              praise: "First field is the destination, the other two are sources: R1 ← R2 + R3. No operand is harmed in this format.",
            },
            {
              kind: "check",
              prompt: "The stated COST of the three-address format is…",
              options: [
                "slower execution",
                "more memory accesses",
                "instructions take more space (three address fields)",
                "it needs a stack",
              ],
              answer: 2,
              praise: "Space — three fields make wide instructions. Its gifts are speed and fewer memory trips; width is the bill.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The comparison table (your slide, complete)",
              body: "**Zero-address** — operands implicit (stack) — `ADD` — stack-based CPUs.\n**One-address** — 1 operand (accumulator) — `ADD A` — simple CPUs.\n**Two-address** — 2 operands — `ADD A, B` — general-purpose register machines.\n**Three-address** — 3 operands — `ADD A, B, C` — high-performance CPUs.\n\nFour rows. If you can rebuild this table from memory, you own the topic.",
            },
            {
              kind: "check",
              prompt: "Your turn: X = (A + B) on a three-address machine, in ONE instruction. Which is it?",
              options: ["ADD X, A, B", "ADD A, B", "LOAD A · ADD B · STORE X", "PUSH A · PUSH B · ADD · POP X"],
              answer: 0,
              praise: "ADD X, A, B — destination first, sources after, done in one line. The other options are the 2-, 1-, and 0-address dialects; you now speak all four.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"ADD R1, R2 preserves both operands.\" Diagnose.",
              options: [
                "Correct — registers are never overwritten",
                "Wrong — two-address writes the result INTO R1, destroying its old value; preserving both needs three-address",
                "Wrong — R2 is destroyed, not R1",
                "Both are destroyed",
              ],
              answer: 1,
              praise: "R1's old value dies in the overwrite. Needing it later is exactly when an architect reaches for the third address.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The whole family, one trade-off",
              body: "Walk the counts 0 → 3 and watch two dials move in opposite directions:\n\n**Instruction width** grows (more fields each).\n**Instruction count and memory traffic** shrink (each line does more).\n\nZero-address: tiny lines, long programs. Three-address: wide lines, short fast programs. Nobody is 'best' — the exam wants you to name the trade, not a winner.",
            },
            {
              kind: "check",
              prompt: "Which of the following is NOT a valid instruction format? (a past paper asked exactly this)",
              options: ["Zero-address", "One-address", "Two-address", "Four-address"],
              answer: 3,
              praise: "The family stops at three — 'four-address' is the invented option. A free mark for knowing where the table ends.",
            },
            {
              kind: "check",
              prompt: "A high-performance CPU designer prioritizing fewest memory accesses per computation picks…",
              options: ["zero-address", "one-address", "three-address", "whichever is shortest"],
              answer: 2,
              praise: "Three-address — the slide's own pairing of format to machine class. You've matched design goal to format, which is the L4 version of this question.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-formats",
      title: "Quick review: instruction formats",
      unit: 3,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-rpn-stack", "ca-fmt-styles", "ca-fmt-01", "ca-fmt-23"],
        count: 5,
      },
      deps: ["ca-fmt-23"],
      whyItMatters:
        "The address-count family plus the RPN engine underneath it — five questions before program control changes the subject.",
      recap: [],
      steps: [],
    },
    // ── Program control ──────────────────────────────────────────────
    {
      id: "ca-flow-anatomy",
      title: "Program control & its four components",
      unit: 3,
      weight: "medium",
      deps: ["ca-rev-formats"],
      whyItMatters:
        "PC, IR, SP, flags — CO3 is 'describe the role of program control instructions', and these four registers are the cast list.",
      recap: [
        "Program control = the mechanisms that manage the flow of execution — how a program moves from one instruction to another.",
        "Program Counter (PC): holds the memory address of the NEXT instruction; auto-increments after each one.",
        "Instruction Register (IR): stores the CURRENT instruction being executed.",
        "Stack & SP: store return addresses during subroutine calls (LIFO). Flags register: condition codes (Zero, Carry, Sign, Overflow) for conditional execution.",
        "Execution cycle: Fetch (PC→IR) → Decode → Execute → check branching/interrupt → update PC → next instruction.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Unit 2 taught what instructions ARE. The last stretch of Unit 3 asks: **who decides which instruction runs next?**\n\n**Program control** — the mechanisms that manage the flow of execution, how a program moves from one instruction to another.",
            },
            {
              kind: "teach",
              body: "Meet the cast — four components, from your slides:\n\n**a) Program Counter (PC).** Holds the memory address of the **next** instruction. Automatically increments after each instruction — that auto-increment IS sequential execution.",
            },
            {
              kind: "teach",
              body: "**b) Instruction Register (IR).** Stores the **current** instruction while it executes.\n\nPC looks forward, IR holds now. Two registers, two tenses.",
            },
            {
              kind: "teach",
              body: "**c) Stack & Stack Pointer.** Their program-control job: storing **return addresses** during subroutine calls, in LIFO order. (Your stack circles were preparation for exactly this.)\n\n**d) Flags register.** Condition codes — **Zero, Carry, Sign, Overflow** — that conditional instructions consult.",
            },
            {
              kind: "teach",
              body: "And the loop that ties them together, from the flow diagram:\n\n**Fetch** (PC → IR) → **Decode** → **Execute** → **check for branching / interrupt** → **update PC** → next instruction.\n\nEvery program ever run is this loop, spinning.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The Program Counter holds…",
              options: [
                "the current instruction",
                "the address of the NEXT instruction to execute",
                "the top of the stack",
                "condition codes",
              ],
              answer: 1,
              praise: "Next instruction's address — and it auto-increments, which is why programs flow forward by default.",
            },
            {
              kind: "check",
              prompt: "The current instruction being executed sits in…",
              options: ["the PC", "the Instruction Register (IR)", "the flags register", "main memory only"],
              answer: 1,
              praise: "The IR — 'now' lives there while PC already points at 'next'.",
            },
            {
              kind: "check",
              prompt: "Which four condition codes does the flags register hold (per your slides)?",
              options: [
                "Zero, Carry, Sign, Overflow",
                "Add, Sub, Mul, Div",
                "Fetch, Decode, Execute, Update",
                "PC, IR, SP, AC",
              ],
              answer: 0,
              praise: "Zero, Carry, Sign, Overflow — the same flags your Unit 2 control word chose to update. The two units just shook hands.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "One instruction's journey",
              body: "Say PC = 2000.\n\n**Fetch:** the instruction at 2000 is copied into the IR; PC increments toward 2001.\n**Decode:** the control unit reads what the IR holds.\n**Execute:** the ALU or buses do the work.\n**Check:** any branch taken? any interrupt waiting?\n**Update PC** accordingly — and the loop spins again.\n\nSequential flow is just this loop with the checks answering 'no'.",
            },
            {
              kind: "check",
              prompt: "Put the cycle in order:",
              options: [
                "Fetch → Decode → Execute → check branch/interrupt → update PC",
                "Decode → Fetch → Execute → update PC",
                "Execute → Fetch → Decode → halt",
                "Update PC → Execute → Fetch → Decode",
              ],
              answer: 0,
              praise: "Fetch, decode, execute, check, update — the heartbeat, in rhythm.",
            },
            {
              kind: "check",
              prompt: "During a subroutine call, which pair does the return-address bookkeeping?",
              options: [
                "PC and the ALU",
                "The stack and SP",
                "The IR and flags",
                "Cache and ROM",
              ],
              answer: 1,
              praise: "The stack (LIFO) with SP tracking its top — the program-control job your stack circles trained for. Next circles: the instructions that exploit all this machinery.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-jumps-loops",
      title: "Jumps, conditions & loops",
      unit: 3,
      weight: "heavy",
      deps: ["ca-flow-anatomy"],
      whyItMatters:
        "JMP/JZ/JNZ plus the DEC-JNZ loop pattern are the working vocabulary of every program-control exam question.",
      recap: [
        "Sequential execution is the default: instructions run one after another in memory order.",
        "Unconditional jump: JMP 2000H moves execution straight to address 2000H — no questions asked.",
        "Conditional jumps consult the flags: JZ 3000H jumps if the Zero flag is set; JNZ 4000H jumps if it is NOT set.",
        "Loop control repeats a block: MOV CX, 10 → LOOP_LABEL: … DEC CX → JNZ LOOP_LABEL runs the body 10 times.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "By default a program is a straight road: **sequential execution**, one instruction after another in memory order — the PC auto-incrementing.\n\nProgram control instructions are the turnings off that road.",
            },
            {
              kind: "teach",
              body: "**The unconditional jump.**\n\n`JMP 2000H` — execution moves to address 2000H. Always. No condition consulted.\n\nMechanically: the jump simply **overwrites the PC** with 2000H, and the fetch loop obediently continues from there.",
            },
            {
              kind: "teach",
              body: "**Conditional jumps** ask the flags register first:\n\n`JZ 3000H` — jump to 3000H **if the Zero flag is set**.\n`JNZ 4000H` — jump to 4000H **if the Zero flag is NOT set**.\n\nSome earlier instruction (a subtraction, a compare, a decrement) raised or cleared that flag. Condition codes are how the past whispers to the future.",
            },
            {
              kind: "teach",
              body: "**Loop control** — repetition built from a conditional jump:\n\n```\nMOV CX, 10      ; load loop counter\nLOOP_LABEL:\n  DEC CX        ; decrement counter\n  JNZ LOOP_LABEL ; jump back if CX ≠ 0\n```\n\nDEC CX sets the Zero flag when CX hits 0 — and JNZ stops jumping. The loop ends itself.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "JMP 2000H does what?",
              options: [
                "Jumps to 2000H only if Zero is set",
                "Moves execution to address 2000H unconditionally",
                "Calls a subroutine at 2000H",
                "Stores 2000H on the stack",
              ],
              answer: 1,
              praise: "Unconditional — PC becomes 2000H, full stop.",
            },
            {
              kind: "check",
              prompt: "JNZ 4000H jumps when…",
              options: [
                "the Zero flag IS set",
                "the Zero flag is NOT set",
                "the Carry flag is set",
                "always",
              ],
              answer: 1,
              praise: "Jump-if-Not-Zero — the flag's absence is the trigger. JZ is its mirror twin.",
            },
            {
              kind: "check",
              prompt: "A conditional jump makes its decision by reading…",
              options: ["the stack pointer", "the flags register", "the instruction register", "ROM"],
              answer: 1,
              praise: "The flags — Zero, Carry, Sign, Overflow — set by earlier instructions. (A past paper asked exactly this.)",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked trace: the loop, unrolled",
              body: "Run the slide's loop with a smaller counter, MOV CX, 3:\n\n**Pass 1:** DEC → CX=2, not zero → JNZ jumps back.\n**Pass 2:** DEC → CX=1, not zero → jumps back.\n**Pass 3:** DEC → CX=0 → **Zero flag sets** → JNZ falls through.\n\nBody ran 3 times; the counter's death set the flag that freed the program. That's the whole pattern.",
            },
            {
              kind: "check",
              prompt: "Your turn: with MOV CX, 10, how many times does the loop body execute before falling through?",
              options: ["9", "10", "11", "Forever"],
              answer: 1,
              praise: "10 — once per decrement from 10 down to 0. Counter value = repetition count, exactly as designed.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student writes the loop with JZ LOOP_LABEL instead of JNZ. What happens?",
              options: [
                "Same behavior",
                "The body runs ONCE — CX=9 isn't zero, so JZ doesn't jump back, and the loop exits immediately",
                "Infinite loop",
                "The program crashes",
              ],
              answer: 1,
              praise: "One pass and gone — jump-back needs 'not zero yet' as its condition. One letter, opposite program. Flags demand precision.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Every jump is a PC assignment",
              body: "Connect this to the anatomy circle: sequential flow is *PC auto-increment*; JMP is *PC overwrite*; a conditional jump is *PC overwrite, if the flags approve*.\n\nThere is no magic in program control — just different rules for the 'update PC' step of the fetch-decode-execute loop you already know.",
            },
            {
              kind: "check",
              prompt: "Why must DEC come BEFORE JNZ inside the loop, not after it?",
              options: [
                "Order doesn't matter",
                "JNZ reads the Zero flag that DEC just set — the test must follow the update it's testing",
                "DEC only works at labels",
                "JNZ decrements automatically",
              ],
              answer: 1,
              praise: "The jump judges the freshest flag — DEC writes it, JNZ reads it, in that order. You're now reasoning about flag dataflow, which is the deep skill here.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-call-ret",
      title: "CALL & RET: subroutines",
      unit: 3,
      weight: "heavy",
      deps: ["ca-jumps-loops"],
      whyItMatters:
        "CALL/RET is where the stack and program control fuse — and 'where is the return address stored?' is a recurring one-mark gift.",
      recap: [
        "Subroutines enable modular programming: a function executes, then control returns to the caller.",
        "CALL: saves the current (return) address — pushed onto the stack — and jumps to the subroutine.",
        "RET: pops the saved address off the stack and returns there.",
        "Nested calls work because the stack is LIFO: the most recent CALL's address pops first.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A jump never looks back. But real programs need trips with a **return ticket** — run a function, then continue where you left off.\n\nThat's the **subroutine call**, the heart of modular programming.",
            },
            {
              kind: "teach",
              body: "**CALL** does two things at once:\n\n**saves the current address** (where to come back to), and **jumps to the subroutine**.\n\nFrom your slides:\n```\nCALL FUNCTION\n...\nFUNCTION:\n    ...\n    RET\n```",
            },
            {
              kind: "teach",
              body: "**RET** is the return ticket being used: it **returns to the saved address** after the subroutine finishes.\n\nBut saved *where*? You already know the answer from the anatomy circle…",
            },
            {
              kind: "teach",
              body: "**On the stack.** CALL pushes the return address; RET pops it.\n\nAnd because the stack is LIFO, **nested calls unwind perfectly**: if A calls B and B calls C, C's RET pops back into B, and B's RET pops back into A. Last called, first returned — LIFO was built for this.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "CALL's two simultaneous jobs are…",
              options: [
                "decode and execute",
                "save the current (return) address and jump to the subroutine",
                "push all registers and halt",
                "set the Zero flag and loop",
              ],
              answer: 1,
              praise: "Save, then go — the jump with a memory.",
            },
            {
              kind: "check",
              prompt: "During a subroutine call, the return address is stored…",
              options: ["in the ALU", "on the stack", "in ROM", "in the cache"],
              answer: 1,
              praise: "On the stack — pushed by CALL, popped by RET. This exact question has appeared for one mark.",
            },
            {
              kind: "check",
              prompt: "RET does what, mechanically?",
              options: [
                "Jumps to address 0",
                "Pops the saved return address off the stack into the PC",
                "Pushes the PC",
                "Clears the flags",
              ],
              answer: 1,
              praise: "Pop into PC — the fetch loop resumes at the caller's next line, as if the detour never happened.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked trace: nested calls",
              body: "MAIN at address 100 calls HELPER; HELPER at 500 calls PRINT.\n\n**CALL HELPER** (from 100): push return address 101 → stack: [101].\n**CALL PRINT** (from 500): push 501 → stack: [101, 501].\n**PRINT's RET:** pop 501 → back inside HELPER. Stack: [101].\n**HELPER's RET:** pop 101 → back inside MAIN. Stack: empty.\n\nTwo levels deep, two clean returns — LIFO matched each RET to the right CALL automatically.",
            },
            {
              kind: "check",
              prompt: "Your turn: A calls B, B calls C, C calls D. When D's RET runs, execution lands in…",
              options: ["A", "B", "C — the most recent caller, whose address is on top of the stack", "D again"],
              answer: 2,
              praise: "C — its return address was pushed last, so it pops first. Three levels, zero confusion, all thanks to the plate pile.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"A subroutine could store its return address in a fixed register instead of the stack — same thing.\" What breaks?",
              options: [
                "Nothing breaks",
                "Nested calls: the second CALL would overwrite the first's return address — only a stack keeps them ALL, in the right order",
                "Registers are too slow",
                "RET can't read registers",
              ],
              answer: 1,
              praise: "One register holds one address; nesting needs a pile of them. This is exactly WHY the stack exists in program control — you've reconstructed the design decision.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "CALL vs JMP, one line apart",
              body: "Compare the two travelers:\n\n**JMP** overwrites the PC and forgets. **CALL** pushes the PC's value first, *then* overwrites — a jump that leaves a trail.\n\nAnd RET is just 'POP into PC'. Every piece of this circle is a combination of things you already own: PC updates + stack push/pop. Program control has no new machinery — only new choreography.",
            },
            {
              kind: "check",
              prompt: "Balanced CALLs and RETs return SP to its starting value (your SP circle's instinct). What does an EXTRA RET — with no matching CALL — do?",
              options: [
                "Nothing; it's ignored",
                "Pops whatever happens to be on the stack into the PC — execution leaps to a garbage address",
                "Resets the program safely",
                "Sets the Zero flag",
              ],
              answer: 1,
              praise: "It pops garbage into PC and the program teleports into chaos — the classic stack-corruption bug. You've just reasoned about failure, which is the surest sign the mechanism is truly yours.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-interrupts",
      title: "Interrupts",
      unit: 3,
      weight: "heavy",
      deps: ["ca-call-ret"],
      whyItMatters:
        "Interrupt types — hardware vs software, maskable vs NMI, internal vs external, priority — are a classification question the paper loves, and the concept returns in Unit 5's I/O.",
      recap: [
        "An interrupt is a signal that an event needs immediate attention: the CPU temporarily halts current execution, handles the event, then resumes.",
        "Hardware interrupts: from external devices (keyboard, mouse, printer). Maskable (IRQ — CPU may disable, e.g. timer) vs Non-Maskable (NMI — cannot be ignored, e.g. hardware failure).",
        "Software interrupts: from instructions. Intentional (system calls/debugging, e.g. INT 21h in DOS) vs unintentional (errors like divide-by-zero — exceptions).",
        "Internal interrupts (exceptions) arise inside the processor (divide-by-zero, invalid opcode, page fault); external ones come from devices via an interrupt controller.",
        "Priority interrupts: simultaneous interrupts are handled by priority — hardware failure overrides keyboard input.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Everything so far had the *program* steering its own flow. One force can seize the wheel from outside:\n\nan **interrupt** — a signal to the processor that an event needs **immediate attention**.",
            },
            {
              kind: "teach",
              body: "The CPU's response: **temporarily halt** the current execution, **handle** the interrupting event, then **resume normal operations**.\n\nSound familiar? It's CALL/RET's save-and-return dance — except the hardware makes the call, not your code.",
            },
            {
              kind: "teach",
              body: "**Hardware interrupts** — raised by external devices: keyboard input, mouse movement, printer requests.\n\nTwo grades: **Maskable (IRQ)** — the CPU may disable/postpone them (e.g. timer interrupts) — and **Non-Maskable (NMI)** — cannot be ignored, reserved for critical events like hardware failure.",
            },
            {
              kind: "teach",
              body: "**Software interrupts** — raised by instructions.\n\n**Intentional:** system calls and debugging — like `INT 21h` in DOS asking the OS for service.\n**Unintentional:** errors — divide-by-zero and friends — better known as **exceptions**.",
            },
            {
              kind: "teach",
              body: "The slides add two more lenses:\n\n**Internal interrupts (exceptions)** arise *inside* the processor: divide-by-zero, invalid opcode, page fault. **External interrupts** arrive from devices through an **interrupt controller** (e.g. power-failure signals).\n\nAnd **priority interrupts**: when several fire at once, higher priority wins — a hardware failure overrides a keyboard press.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "An interrupt makes the CPU…",
              options: [
                "shut down",
                "temporarily halt, handle the event, then resume",
                "skip the next instruction",
                "clear the stack",
              ],
              answer: 1,
              praise: "Halt–handle–resume. The program continues afterward as if merely paused.",
            },
            {
              kind: "check",
              prompt: "A Non-Maskable Interrupt (NMI) is one the CPU…",
              options: [
                "can disable at will",
                "cannot ignore — reserved for critical events like hardware failure",
                "only receives from software",
                "uses for timers",
              ],
              answer: 1,
              praise: "Cannot be ignored — that's the 'non-maskable' in the name. Timers ride the maskable IRQ lane instead.",
            },
            {
              kind: "check",
              prompt: "INT 21h in DOS is an example of…",
              options: [
                "a hardware interrupt",
                "an intentional software interrupt (system call)",
                "an NMI",
                "a page fault",
              ],
              answer: 1,
              praise: "Code deliberately raising an interrupt to request OS service — the intentional kind, versus the divide-by-zero accidents.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Classify by asking two questions",
              body: "Every interrupt sorts itself with two questions:\n\n**Who raised it?** A device → hardware/external. An instruction or the processor itself → software/internal.\n\n**Was it meant?** Deliberate (syscall, timer) or an error (exception, failure)?\n\nDivide-by-zero: raised inside, not meant → internal exception / unintentional software interrupt. Keyboard press: device, routine → maskable hardware interrupt.",
            },
            {
              kind: "check",
              prompt: "Your turn: a page fault is…",
              options: [
                "a hardware interrupt from the keyboard",
                "an internal interrupt (exception) generated within the processor",
                "an intentional software interrupt",
                "not an interrupt",
              ],
              answer: 1,
              praise: "Internal, error-born — the slides list it right beside divide-by-zero and invalid opcode. Two questions, instant classification.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Interrupts and subroutine calls are identical — both save an address and come back.\" What's the key difference?",
              options: [
                "Nothing — they are identical",
                "A CALL is invoked by the program at a planned point; an interrupt arrives unpredictably from outside the program's control",
                "Interrupts never resume",
                "CALLs don't use the stack",
              ],
              answer: 1,
              praise: "Same save-and-return skeleton, opposite trigger: one is scheduled by your code, the other barges in. That contrast is the essay-question version of this topic.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Priority, and the bigger picture",
              body: "When multiple interrupts fire simultaneously, **priority** decides: a high-priority hardware-failure interrupt overrides a lower-priority keyboard interrupt.\n\nZoom out: interrupts are why your fetch-decode-execute loop has that 'check for branching / **interrupt**' step. The loop glances up every cycle, asking: anything urgent? That glance is how one CPU juggles a whole machine — and Unit 5 will build interrupt-driven I/O on exactly this foundation.",
            },
            {
              kind: "check",
              prompt: "A keyboard interrupt and a hardware-failure interrupt arrive in the same instant. The CPU…",
              options: [
                "handles the keyboard first — first come, first served",
                "handles the hardware failure first — higher priority overrides",
                "ignores both",
                "crashes",
              ],
              answer: 1,
              praise: "Priority rules the tie: failure outranks keystroke. You've completed the interrupt taxonomy — and with it, Unit 3's whole story: the stack, the notation it evaluates, the formats built on it, and the control flow that runs it all.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-unit3",
      title: "Unit 3 review: the whole story",
      unit: 3,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-stack-sp", "ca-rpn-stack", "ca-fmt-01", "ca-fmt-23", "ca-jumps-loops", "ca-call-ret", "ca-interrupts"],
        count: 6,
      },
      deps: ["ca-interrupts"],
      whyItMatters:
        "SP mechanics, RPN evaluation, address counts, jumps, CALL/RET, interrupts — six questions across the unit before Computer Arithmetic begins.",
      recap: [],
      steps: [],
    },
  ],
};
