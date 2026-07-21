// CSE46D Unit 4: Computer Arithmetic. Four-quarter circles per
// KUBE_LESSON_DEPTH.md. Source: UNIT_4_CSE46D.ppt — signed addition,
// subtraction via 2's complement, the add/subtract hardware (A, B, As, Bs,
// E, AVF, complementer, mode control M), shift-and-add multiplication,
// and Booth's algorithm.
import type { Section } from "./types";

export const sectionU4: Section = {
  id: "ca-sec-u4",
  letter: "E",
  title: "Computer Arithmetic",
  tagline: "How the machine actually adds, subtracts and multiplies — including Booth's famous shortcut.",
  unit: 4,
  topics: [
    // ── Addition & subtraction ───────────────────────────────────────
    {
      id: "ca-add-signed",
      title: "Adding signed numbers",
      unit: 4,
      weight: "medium",
      deps: ["ca-rev-unit3"],
      whyItMatters:
        "CO4 is 'the basics of addition and subtraction in binary' — this circle is the addition half, with the exact worked example your deck uses.",
      recap: [
        "Numbers carry a sign bit ahead of the magnitude: +10 = 0 1010, +3 = 0 0011.",
        "Same signs → add the magnitudes, keep the common sign: (+10) + (+3) = 0 1101 = +13.",
        "The full case family: additions (+10)+(+3), (+10)+(−3), (−10)+(+3) and subtractions (+10)−(+3), (+10)−(−3), (−10)−(+3), (−10)−(−3).",
        "Mixed signs turn addition into a magnitude comparison — which the 2's-complement trick (next circle) handles mechanically.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Unit 1 taught you how numbers are *written*. Unit 4 asks the machine's next question: how are they **computed**?\n\nStart where the deck starts — addition, with the sign bit riding in front.",
            },
            {
              kind: "teach",
              body: "The deck's worked example, digit for digit:\n\n**(+10) + (+3)**\n\n+10 = **0 1010**\n+3 = **0 0011**\n\nSign bit first (0 = positive), then the 4-bit magnitude. Familiar pieces — Unit 1's signed representation, back on duty.",
            },
            {
              kind: "teach",
              body: "Both signs are the same, so the rule is the friendly one:\n\n**add the magnitudes, keep the sign.**\n\n```\n  0 1010\n+ 0 0011\n  0 1101\n```\n\n0 1101 = **+13**. No surprises — binary column addition with carries, exactly like decimal.",
            },
            {
              kind: "teach",
              body: "But the deck then lists the whole family waiting for you:\n\n**Addition:** (+10)+(+3), (+10)+(−3), (−10)+(+3)\n**Subtraction:** (+10)−(+3), (+10)−(−3), (−10)−(+3), (−10)−(−3)\n\nMixed signs are where 'just add magnitudes' stops working — and where the next circle's 2's-complement machinery takes over.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "(+10) + (+3) in 5-bit signed binary (0 1010 + 0 0011) equals…",
              options: ["0 1101", "1 1101", "0 1011", "1 0111"],
              answer: 0,
              praise: "0 1101 = +13 — magnitudes added, sign bit calmly staying 0.",
            },
            {
              kind: "check",
              prompt: "When two numbers have the SAME sign, addition is…",
              options: [
                "add the magnitudes, keep the common sign",
                "always positive",
                "impossible without 2's complement",
                "subtract the smaller magnitude",
              ],
              answer: 0,
              praise: "Same signs = easy street. The complications only start when signs differ.",
            },
            {
              kind: "check",
              prompt: "Which situation does 'add magnitudes, keep sign' NOT cover?",
              options: [
                "(+10) + (+3)",
                "(−10) + (−3)",
                "(+10) + (−3) — the signs differ",
                "(+5) + (+5)",
              ],
              answer: 2,
              praise: "Mixed signs break the simple rule — the magnitudes now COMPETE instead of accumulating. That's the problem the next circle solves.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Watch a carry ripple",
              body: "Try (+11) + (+3): magnitudes 1011 + 0011.\n\nColumn by column from the right: 1+1 = 10 (write 0, carry 1) → 1+1+1 = 11 (write 1, carry 1) → 0+0+1 = 1 → 1+0 = 1.\n\nResult: 0 1110 = **+14**. The carries chain leftward — remember that ripple; the hardware circle gives it a machine to live in.",
            },
            {
              kind: "check",
              prompt: "Your turn: (+6) + (+5) as 5-bit signed binary is…",
              options: ["0 1011", "0 1100", "1 1011", "0 1010"],
              answer: 0,
              praise: "0110 + 0101 = 1011, sign 0 → +11. Carries handled, sign untouched.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"(+10) + (+3): I added the sign bits too — 0+0=0 — so sign bits are just another column.\" What's the danger?",
              options: [
                "None — signs are always addable",
                "Sign bits are NOT magnitude — treating them as a column breaks the moment signs differ or a carry reaches them",
                "Sign bits should be multiplied",
                "There is no sign bit in binary",
              ],
              answer: 1,
              praise: "It 'worked' here by luck. Sign is a label, not a digit — mixing it into arithmetic is exactly the bug 2's complement was invented to remove.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-sub-2comp",
      title: "Subtraction by 2's complement",
      unit: 4,
      weight: "heavy",
      deps: ["ca-add-signed"],
      whyItMatters:
        "'Subtract using 2's complement' is a standing exam computation — and the reason one adder circuit can do all of arithmetic.",
      recap: [
        "Computers don't subtract — they ADD the 2's complement of the subtrahend: A − B = A + (2's complement of B).",
        "Deck example (−10) − (−3): magnitude of 3 is 0011 → 1's complement 1100 → +1 → 1101.",
        "1010 + 1101 = (1) 0111 — discard the end carry; the result keeps A's sign: 1 0111 = −7.",
        "An end carry of 1 signals the result is correct as-is; the whole trick means the same parallel adder performs both + and −.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Here's the secret of this whole unit: **computers don't subtract.**\n\nThere's no subtraction circuit. There's an adder — and a disguise.",
            },
            {
              kind: "teach",
              body: "The disguise is your Unit 1 friend, the **2's complement**:\n\n**A − B = A + (2's complement of B)**\n\nFlip B's bits, add 1, then simply ADD. Subtraction becomes addition wearing a mask.",
            },
            {
              kind: "teach",
              body: "The deck's worked example: **(−10) − (−3)** — which is really −10 + 3 = **−7**.\n\nFirst, build the 2's complement of 3's magnitude:\n\n3 = 0011 → 1's complement = **1100** → add 1 → **1101**.",
            },
            {
              kind: "teach",
              body: "Now add it to 10's magnitude:\n\n```\n  1010\n+ 1101\n(1)0111\n```\n\nAn **end carry of 1** pops out — discard it; it's the signal the result is already correct. Magnitude **0111 = 7**, and the sign follows A: negative.\n\n**1 0111 = −7.** Exactly what −10 + 3 should be.",
            },
            {
              kind: "teach",
              body: "Step back and admire the economy:\n\nOne adder + one complementer = addition AND subtraction, for any of the deck's seven sign combinations. No case analysis in hardware, no second circuit.\n\nThe next circle shows the actual machine that does this.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Computers subtract B from A by…",
              options: [
                "a dedicated subtraction circuit",
                "adding the 2's complement of B to A",
                "swapping the operands",
                "repeated decrement",
              ],
              answer: 1,
              praise: "A + 2's-comp(B) — the complement trick that makes one adder do everything.",
            },
            {
              kind: "check",
              prompt: "The 2's complement of 0011 (3) is…",
              options: ["1100", "1101", "0011", "1110"],
              answer: 1,
              praise: "Flip to 1100, add 1 → 1101. The flip-then-add-one reflex from Unit 1, now earning its keep.",
            },
            {
              kind: "check",
              prompt: "In the worked example, 1010 + 1101 produced an end carry of 1. What do you do with it?",
              options: [
                "Add it back to the result",
                "Discard it — it signals the result is correct as-is",
                "It becomes the sign bit",
                "Start over",
              ],
              answer: 1,
              praise: "Discard, and trust it — end carry 1 means the difference came out right side up.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked again, fresh numbers",
              body: "Compute 12 − 5 by complement (magnitudes only, 4 bits):\n\n5 = 0101 → 1's comp 1010 → +1 → **1011**.\n\n```\n  1100   (12)\n+ 1011\n(1)0111\n```\n\nEnd carry 1 → discard → **0111 = 7**. ✓\n\nSame recipe, any numbers: complement the subtrahend, add, drop the carry.",
            },
            {
              kind: "check",
              prompt: "Your turn: 9 − 4 via 2's complement (4-bit magnitudes: 1001 and 0100). The addition step is…",
              options: [
                "1001 + 1100 = (1)0101 → 5",
                "1001 + 1011 = (1)0100 → 4",
                "1001 + 0100 = 1101 → 13",
                "1001 − 0100 directly",
              ],
              answer: 0,
              praise: "2's comp of 0100 is 1100; 1001 + 1100 = (1)0101, carry off, answer 5. You just subtracted without subtracting.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student computes 8 − 3 as 1000 + 1100 (using the 1's complement of 3). What did they forget?",
              options: [
                "Nothing — 1's complement is fine",
                "The +1 — 2's complement is flip THEN add one; without it the answer comes out one short",
                "They should have flipped A instead",
                "The end carry",
              ],
              answer: 1,
              praise: "1's comp alone gives 8 − 3 − 1 = 4, one short. That missing +1 is the classic exam slip — you've now vaccinated yourself against it.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why the end carry means 'correct'",
              body: "Adding the 2's complement of B is really adding (16 − B) in 4-bit arithmetic. So A + (16 − B) = (A − B) + 16 — and that '+16' is precisely the end carry leaving through the top.\n\nCarry out = the 16 departing = a clean positive difference left behind. No carry would mean A < B — the result needs re-complementing.\n\nYou don't just know the rule now; you know why it works.",
            },
            {
              kind: "check",
              prompt: "Deep check: A − B where A = B (say 6 − 6). What does the adder produce?",
              options: [
                "Garbage",
                "0110 + 1010 = (1)0000 — end carry 1 and a zero result",
                "1111",
                "An error flag",
              ],
              answer: 1,
              praise: "(1)0000 — the carry departs, zero remains. Even the edge case obeys the machinery. That's the confidence the exam wants to see.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-addsub-hw",
      title: "The add/subtract hardware",
      unit: 4,
      weight: "heavy",
      deps: ["ca-sub-2comp"],
      whyItMatters:
        "Registers A/B, sign flip-flops, E, AVF, the complementer and mode control M — this diagram is a named Part B question on your sample paper.",
      recap: [
        "The circuit holds registers A and B with sign flip-flops As and Bs; addition runs through a parallel adder whose output feeds back into register A.",
        "The complementer outputs B or B's complement depending on mode control M.",
        "M = 0: B passes unchanged, input carry 0 → output = A + B (addition).",
        "M = 1: 1's complement of B + input carry 1 → output = A + B' + 1 = A − B (subtraction).",
        "E receives the adder's output carry; AVF holds the overflow bit when A and B are added.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "You know the trick (add the complement). Now meet the machine that plays it — the deck's add/subtract hardware, one component at a time.",
            },
            {
              kind: "teach",
              body: "**The registers.** Two operand registers, **A** and **B**, each with its own sign flip-flop — **As** and **Bs**.\n\nThe **parallel adder** adds A and B's outputs — all bit columns at once — and its result is applied back to the **input of register A**. A is both operand and destination, like an accumulator.",
            },
            {
              kind: "teach",
              body: "**The complementer** sits between B and the adder — the disguise department.\n\nIt outputs either **B unchanged** or **B's complement**, depending on one control wire: the **mode control M**.",
            },
            {
              kind: "teach",
              body: "The two modes, exactly as the deck states them:\n\n**M = 0:** B passes through untouched, input carry = 0 → adder output = **A + B**. Addition.\n\n**M = 1:** the **1's complement** of B goes in, input carry = **1** → output = **A + B′ + 1 = A − B**. Subtraction.\n\nSpot the elegance: the '+1' of the 2's complement arrives as the input carry — no separate incrementer needed.",
            },
            {
              kind: "teach",
              body: "Two flip-flops watch the result:\n\n**E** receives the adder's **output carry** (your 'discard the end carry' from last circle — it lands here).\n\n**AVF** holds the **overflow bit** when A and B are added — the alarm for a result too big for the register.\n\nFull cast: A, B, As, Bs, parallel adder, complementer, M, E, AVF. That list IS the exam answer.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Mode control M = 0 makes the circuit output…",
              options: ["A − B", "A + B", "B − A", "A + B′ + 1"],
              answer: 1,
              praise: "M=0 is honesty mode: plain B, carry 0, straightforward A + B.",
            },
            {
              kind: "check",
              prompt: "With M = 1, why is the input carry set to 1?",
              options: [
                "To signal an error",
                "It supplies the '+1' of the 2's complement — so A + B′ + 1 = A − B",
                "To speed up the adder",
                "It's always 1",
              ],
              answer: 1,
              praise: "The carry-in IS the +1 — 1's complement from the complementer, plus one from the carry, equals 2's complement. Beautiful economy.",
            },
            {
              kind: "check",
              prompt: "Which flip-flop receives the adder's output carry?",
              options: ["AVF", "E", "As", "M"],
              answer: 1,
              praise: "E takes the carry; AVF is busy holding the overflow bit. Two watchers, two different alarms.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Trace one subtraction through the metal",
              body: "Run 12 − 5 on the hardware:\n\nA = 1100, B = 0101, and the controller sets **M = 1**.\n\nComplementer: B → 1010 (1's comp). Input carry: 1.\nParallel adder: 1100 + 1010 + 1 = (1)0111.\nThe 0111 loads back into **A**; the end carry 1 lands in **E**.\n\nA now holds 7. Same numbers as your paper exercise last circle — but this time you watched each wire.",
            },
            {
              kind: "check",
              prompt: "Your turn: to make this hardware ADD 9 + 4, the controller sets…",
              options: [
                "M = 1, so the complementer flips B",
                "M = 0 — B passes unchanged, carry-in 0, adder gives A + B",
                "E = 1",
                "AVF = 1",
              ],
              answer: 1,
              praise: "M=0, and the machine is a plain adder: 1001 + 0100 = 1101. One wire chooses the operation.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"AVF stores the end carry, and E stores overflow.\" Diagnose.",
              options: [
                "Correct",
                "Swapped — E gets the output CARRY, AVF holds the OVERFLOW bit",
                "Both store the carry",
                "Neither exists",
              ],
              answer: 1,
              praise: "Swapped roles — the classic mix-up. E = carry out, AVF = overflow flag. Say it twice; it's a one-mark gift on the paper.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why carry and overflow are different alarms",
              body: "Carry (E) says: a bit left the top of the adder. Routine in subtraction — you discard it.\n\nOverflow (AVF) says: the RESULT doesn't fit — adding two same-sign numbers produced the opposite sign. 7 + 7 in 4 bits gives 1110: carry 0, but overflow!\n\nDifferent questions: 'did a bit escape?' vs 'is the answer trustworthy?'. Hardware needs both answers, so it keeps both flip-flops.",
            },
            {
              kind: "check",
              prompt: "Connect it back: this one circuit replaces how many dedicated units?",
              options: [
                "None — it only adds",
                "Two — an adder and a separate subtractor, merged by the complementer + M into one",
                "Four",
                "It replaces the ALU entirely",
              ],
              answer: 1,
              praise: "One adder, one complementer, one mode wire — and the subtractor circuit becomes unnecessary. This design IS the 2's-complement idea, cast in silicon. Diagram question: solved.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-addsub",
      title: "Quick review: add & subtract",
      unit: 4,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-add-signed", "ca-sub-2comp", "ca-addsub-hw"],
        count: 5,
      },
      deps: ["ca-addsub-hw"],
      whyItMatters:
        "Signed addition, the complement trick, and the hardware cast list — five questions before multiplication raises the stakes.",
      recap: [],
      steps: [],
    },
    // ── Multiplication ───────────────────────────────────────────────
    {
      id: "ca-mult-shiftadd",
      title: "Multiplication by shift-and-add",
      unit: 4,
      weight: "medium",
      deps: ["ca-rev-addsub"],
      whyItMatters:
        "Shift-and-add is the baseline Booth improves on — and the sample paper asks about it directly.",
      recap: [
        "Signed-magnitude multiplication is done by successive SHIFT and ADD operations — binary long multiplication.",
        "Each multiplier bit that is 1 contributes a copy of the multiplicand, shifted left to that bit's position; 0 bits contribute nothing.",
        "The hardware version accumulates one partial product at a time: add (if the bit is 1), then shift.",
        "The sign of the product is handled separately: XOR of the operand signs.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Multiplication enters — and the deck's sentence is refreshingly plain:\n\nsigned-magnitude multiplication is done **with successive shift and add operations**.\n\nYou already know this method. You learned it in primary school.",
            },
            {
              kind: "teach",
              body: "Binary long multiplication, 5 × 3 (101 × 011):\n\n```\n    101\n  × 011\n    101   ← bit 0 is 1: copy of 101\n   101    ← bit 1 is 1: 101 shifted left\n  000     ← bit 2 is 0: nothing\n  01111\n```\n\n= 15. Each 1-bit of the multiplier donates a **shifted copy of the multiplicand**. Each 0-bit donates silence.",
            },
            {
              kind: "teach",
              body: "Binary makes this easier than decimal ever was: the only 'times table' entries are ×0 (skip) and ×1 (copy).\n\nSo the machine needs just two moves — **add** the multiplicand or don't, then **shift**. Hence the name.",
            },
            {
              kind: "teach",
              body: "The hardware version (the deck shows a flowchart) walks the multiplier bit by bit: examine a bit → if 1, add the multiplicand into a partial-product register → shift → repeat.\n\nSigns travel separately: the product's sign is the **XOR** of the operand signs. Magnitude machinery and sign logic never mix.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Basic signed-magnitude binary multiplication is performed by successive…",
              options: ["divide and conquer", "shift and add operations", "complement and swap", "compare and branch"],
              answer: 1,
              praise: "Shift and add — the paper's phrasing, and the whole method in three words.",
            },
            {
              kind: "check",
              prompt: "A multiplier bit of 0 contributes…",
              options: [
                "a shifted multiplicand",
                "nothing — only a shift happens",
                "a subtraction",
                "an overflow",
              ],
              answer: 1,
              praise: "Zero bits are free — just shift past them. Keep this fact warm; it's the seed of Booth's entire optimization.",
            },
            {
              kind: "check",
              prompt: "The sign of the product comes from…",
              options: [
                "the multiplier's sign only",
                "the XOR of the two operand signs",
                "always positive",
                "the last carry",
              ],
              answer: 1,
              praise: "Same signs → positive, different → negative: XOR in one word. Signs and magnitudes live separate lives in this method.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Count the work",
              body: "Multiply by 0111 (7): three 1-bits = **three additions**. By 1111 (15): four additions.\n\nNow imagine 32-bit operands full of 1s — dozens of additions, each with rippling carries. Shift-and-add is honest but *expensive on runs of 1s*.\n\nHold that thought for exactly one circle: a 1951 idea makes those runs almost free.",
            },
            {
              kind: "check",
              prompt: "Your turn: 6 × 5 = 110 × 101 by shift-and-add. Which copies of 110 get added?",
              options: [
                "Positions 0 and 2 (bits that are 1 in 101): 110 + 11000 = 11110 (30)",
                "All three positions",
                "Position 1 only",
                "None — 5 is odd",
              ],
              answer: 0,
              praise: "101 has 1s at positions 0 and 2 → 110 and 110 shifted twice → 30. You ran the algorithm, not the times table.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Multiplying two 4-bit numbers needs a 4-bit result register.\" What's wrong?",
              options: [
                "Nothing",
                "Products can need up to 8 bits (e.g. 15×15=225) — the result register must be DOUBLE width",
                "Products fit in 2 bits",
                "Registers can't multiply",
              ],
              answer: 1,
              praise: "n bits × n bits → up to 2n bits. That's why the hardware keeps the product in a register PAIR — which Booth's A and Q are about to demonstrate.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-booth-idea",
      title: "Booth's algorithm: the idea",
      unit: 4,
      weight: "medium",
      deps: ["ca-mult-shiftadd"],
      whyItMatters:
        "Booth's is a named Part B exam topic. Before the mechanics, own the three facts: what it multiplies, who invented it, and why it wins.",
      recap: [
        "Booth's algorithm multiplies two SIGNED numbers in 2's complement representation directly.",
        "Invented by Andrew Donald Booth in 1951.",
        "It uses a small number of additions and shift operations to do the work of multiplication.",
        "The win: runs of identical bits in the multiplier cost only shifts — a run of 1s becomes one subtract at its start and one add after its end.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Shift-and-add has two sore points: it's signed-**magnitude** only, and runs of 1s cost an addition each.\n\nIn **1951**, **Andrew Donald Booth** fixed both at once.",
            },
            {
              kind: "teach",
              body: "**Booth's algorithm** multiplies two **signed numbers in 2's complement** — directly.\n\nNo separating signs from magnitudes, no XOR patch-up at the end. Negative numbers go in as themselves; the right signed product comes out.",
            },
            {
              kind: "teach",
              body: "And the efficiency claim, as the deck puts it: Booth uses a **small number of additions and shift operations** to do multiplication's work.\n\nThe insight: a run of 1s like 0111 means 8 − 1. So instead of three additions, do **one subtract** when the run starts and **one add** when it ends. Everything in between? Just shifts.",
            },
            {
              kind: "teach",
              body: "So Booth watches the multiplier for **changes** — where 1s begin and end — rather than acting on every bit.\n\nHow it detects those edges (a clever two-bit window) is the next circle. First, lock in the three exam facts: *signed 2's complement · Booth 1951 · fewer additions.*",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Booth's algorithm is designed to multiply…",
              options: [
                "unsigned numbers only",
                "signed numbers in 2's complement representation",
                "BCD numbers",
                "floating point numbers",
              ],
              answer: 1,
              praise: "Signed, 2's complement, natively — no sign-handling bolt-ons.",
            },
            {
              kind: "check",
              prompt: "Booth's algorithm was invented by…",
              options: ["John von Neumann", "Andrew Donald Booth, in 1951", "Charles Babbage", "Blaise Pascal"],
              answer: 1,
              praise: "Booth, 1951 — name and date, exactly as the deck records them.",
            },
            {
              kind: "check",
              prompt: "Booth's main advantage in binary multiplication is…",
              options: [
                "reduced number of additions",
                "reduced number of shifts",
                "reduced memory usage",
                "better precision",
              ],
              answer: 0,
              praise: "Fewer additions — runs of identical bits ride through on shifts alone. (Your sample paper asks this verbatim.)",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "See the run-trick with numbers",
              body: "Multiply anything by 30 = 11110₂.\n\nShift-and-add: four 1-bits → **four additions**.\nBooth sees 11110 as 32 − 2: **one subtract** (entering the run) + **one add** (leaving it) → two operations total.\n\nThe longer the run, the bigger the win — for 0111111110 the savings are enormous. Booth charges per *edge*, not per bit.",
            },
            {
              kind: "check",
              prompt: "Your turn: multiplying by 0111 (7 = 8 − 1), Booth performs…",
              options: [
                "three additions",
                "one subtraction (run begins) and one addition (run ends)",
                "seven shifts only",
                "one multiplication",
              ],
              answer: 1,
              praise: "Subtract at the run's start, add past its end — 7 becomes 8−1 in hardware. You've internalized the core trick before even seeing the rules table.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Booth is faster because it skips the shifting.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — shifts happen EVERY cycle regardless; Booth saves ADDITIONS, replacing runs of adds with shift-only steps",
                "Booth has no shifts at all",
                "Booth skips both",
              ],
              answer: 1,
              praise: "The shift is the metronome — it never stops. What Booth thins out is the expensive add/subtract work between shifts. Precisely the distinction the multiple-choice options are built to test.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-booth-rules",
      title: "Booth's algorithm: the rules",
      unit: 4,
      weight: "heavy",
      deps: ["ca-booth-idea"],
      whyItMatters:
        "The register setup and the four bit-pair rules ARE the algorithm — every Booth exam question is decided here.",
      recap: [
        "Setup (deck's example): multiplicand M = 0111 (7), multiplier Q = 0011 (3), A = 0000, Qn (the extra bit right of Q) = 0, count = number of bits = 4.",
        "Each step examines the pair (Q's LSB, previous LSB Qn): 00 → arithmetic shift right; 11 → arithmetic shift right.",
        "10 → SUBTRACT the multiplicand from the left half (A = A − M), then shift.",
        "01 → ADD the multiplicand to the left half (A = A + M), then shift.",
        "Repeat while count ≠ 0; when count reaches 0, the product sits in A:Q.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Time for the machinery. Booth runs on four registers — the deck's own example values:\n\n**M** (multiplicand) = 0111 (7)\n**Q** (multiplier) = 0011 (3)\n**A** = 0000 (the accumulating left half)\n**Qn** = 0 — one extra bit sitting just RIGHT of Q\n**count** = number of bits = 4.",
            },
            {
              kind: "teach",
              body: "That little **Qn** is Booth's eye. Each step looks at a two-bit window:\n\n**(Q's LSB, Qn)** — the current lowest bit and the bit that was there before.\n\nThis pair detects edges: is a run of 1s starting, ending, or just continuing?",
            },
            {
              kind: "teach",
              body: "The four verdicts, straight from the deck:\n\n**00** → arithmetic shift right. (No run activity.)\n**11** → arithmetic shift right. (Deep inside a run — still free.)\n\nSame-bit pairs cost nothing but the shift. This is the run-trick from last circle, mechanized.",
            },
            {
              kind: "teach",
              body: "The edges do the work:\n\n**10** → a run of 1s BEGINS → **subtract**: A = A − M, then shift.\n**01** → a run of 1s just ENDED → **add**: A = A + M, then shift.\n\nMnemonic: read the pair right-to-left as time — Qn was 'before', LSB is 'now'. 0→1 entering a run: subtract. 1→0 leaving: add.",
            },
            {
              kind: "teach",
              body: "And the loop control (deck's STEP 3):\n\ncount ≠ 0 → keep going (one examine + one shift per pass, count decrements).\ncount = 0 → **END** — the signed product fills the register pair **A:Q**.\n\nSetup, window, four rules, countdown. That's all of Booth.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In Booth's algorithm, the bit pair 01 triggers…",
              options: [
                "shift only",
                "add the multiplicand to A, then shift",
                "subtract the multiplicand, then shift",
                "end of algorithm",
              ],
              answer: 1,
              praise: "01 = a run just ended = add M back. Its mirror 10 subtracts.",
            },
            {
              kind: "check",
              prompt: "Pairs 00 and 11 both cause…",
              options: [
                "addition",
                "just an arithmetic shift right — no add, no subtract",
                "subtraction",
                "a restart",
              ],
              answer: 1,
              praise: "Nothing but the shift — the free steps that give Booth its speed.",
            },
            {
              kind: "check",
              prompt: "What is Qn, before the first step runs?",
              options: [
                "The sign of M",
                "An extra bit to the right of Q, initialized to 0",
                "The carry flag",
                "The count register",
              ],
              answer: 1,
              praise: "A phantom 0 sitting below Q's LSB — it gives the first real bit something to pair with. Forgetting it is the most common Booth exam error.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: classify every step of Q = 0011",
              body: "Multiplier 0011, Qn = 0. Watch the window across four steps (LSB first):\n\nStep 1: LSB 1, Qn 0 → **10** → subtract, shift.\nStep 2: pair becomes **11** → shift only.\nStep 3: pair **01** → add, shift.\nStep 4: pair **00** → shift only.\n\nOne subtract + one add for the whole multiply-by-3 — because 0011's single run has exactly one start and one end.",
            },
            {
              kind: "check",
              prompt: "Your turn: multiplier Q = 0110, Qn = 0. Reading from the LSB, the first pair is (0,0). The SECOND step's pair (after one shift brings the next bit down) is (1,0). Its action?",
              options: [
                "Shift only",
                "Subtract M from A, then shift — 10 means a run is starting",
                "Add M, then shift",
                "End the algorithm",
              ],
              answer: 1,
              praise: "(now=1, before=0) → entering the run of 1s → subtract. You're reading the window like Booth does — as a run-edge detector.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Pair 10 means add, because 1 is bigger.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — 10 (0→1 in time) means a run BEGINS, which is the SUBTRACT; the add belongs to 01, the run's end",
                "10 means end the algorithm",
                "Both pairs shift only",
              ],
              answer: 1,
              praise: "The pair isn't a size comparison — it's a story in time: before 0, now 1, run starting, subtract. Get the story right and the rules never scramble again.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why SUBTRACT at the start of a run",
              body: "A run of 1s from position i to j is worth 2^(j+1) − 2^i.\n\nBooth pays the **−2^i** the moment it enters the run (subtract at the low edge) and collects the **+2^(j+1)** just after leaving it (add one position above the high edge). Every bit in between: shift, shift, shift.\n\nThe rules table isn't arbitrary — it's that identity, executed edge by edge.",
            },
            {
              kind: "check",
              prompt: "Why must the shift be an ARITHMETIC right shift (sign bit copied), not a plain logical shift?",
              options: [
                "Tradition",
                "A holds signed 2's-complement partial results — a logical shift would corrupt negative values by injecting a 0 sign",
                "It's faster",
                "Q requires it",
              ],
              answer: 1,
              praise: "After a subtract, A can be negative — only sign-extending shifts keep 2's complement numbers true. That one word 'arithmetic' carries the whole signed-ness of Booth. Next circle: run the full table, start to finish.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-booth-run",
      title: "Booth's algorithm: a full run",
      unit: 4,
      weight: "heavy",
      deps: ["ca-booth-rules"],
      whyItMatters:
        "The exam asks for the full table — A, Q, Qn, count per step. This circle runs 7 × 3 to the last shift, then hands you the deck's practice set.",
      recap: [
        "7 × 3: M = 0111, −M = 1001, A = 0000, Q = 0011, Qn = 0, count = 4.",
        "Step 1: pair 10 → A = A − M = 1001; ASR → A=1100 Q=1001 Qn=1.",
        "Step 2: pair 11 → ASR only → A=1110 Q=0100 Qn=1.",
        "Step 3: pair 01 → A = A + M = 0101; ASR → A=0010 Q=1010 Qn=0.",
        "Step 4: pair 00 → ASR only → A=0001 Q=0101. Product A:Q = 0001 0101 = 21. ✓",
        "The deck's other worked case: −9 × −13 = +117; practice: 7×3, −6×7, 14×−5.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Rules known. Now the full performance — **7 × 3**, the deck's own setup, every register visible.\n\n**M = 0111**, and precompute **−M = 1001** (2's complement — the subtract steps will need it).\n\nStart: **A = 0000, Q = 0011, Qn = 0, count = 4.**",
            },
            {
              kind: "teach",
              body: "**Step 1.** Window: Q's LSB = 1, Qn = 0 → **10** → subtract:\n\nA = A − M = 0000 + 1001 = **1001**.\n\nNow arithmetic-shift-right the whole A:Q:Qn train: A = **1100**, Q = **1001**, Qn = **1**. (See the sign bit 1 copying itself — that's the 'arithmetic' part.) count → 3.",
            },
            {
              kind: "teach",
              body: "**Step 2.** Window: LSB = 1, Qn = 1 → **11** → shift only:\n\nA = **1110**, Q = **0100**, Qn = **1**. count → 2.\n\nInside the run — a free step, exactly as promised.",
            },
            {
              kind: "teach",
              body: "**Step 3.** Window: LSB = 0, Qn = 1 → **01** → the run ended → add:\n\nA = A + M = 1110 + 0111 = **0101** (carry out, discarded).\n\nShift: A = **0010**, Q = **1010**, Qn = **0**. count → 1.",
            },
            {
              kind: "teach",
              body: "**Step 4.** Window: LSB = 0, Qn = 0 → **00** → shift only:\n\nA = **0001**, Q = **0101**. count → 0 → **END**.\n\nRead the product from the pair **A:Q = 0001 0101 = 21**. And 7 × 3 = 21. ✓\n\nOne subtract, one add, four shifts — Booth, complete.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In step 1 (pair 10), 'A = A − M' was computed as…",
              options: [
                "0000 − 0111 with a borrow circuit",
                "A + 2's complement of M: 0000 + 1001 = 1001",
                "0111 − 0000",
                "a shift",
              ],
              answer: 1,
              praise: "Even inside Booth, subtraction is complement-and-add — the Unit 4 trick all the way down.",
            },
            {
              kind: "check",
              prompt: "Where does the final product live when count hits 0?",
              options: ["In A alone", "In Q alone", "In the register pair A:Q", "In M"],
              answer: 2,
              praise: "A:Q together — 8 bits from two 4-bit registers, the double-width home every product needs.",
            },
            {
              kind: "check",
              prompt: "After step 1's shift, A went 1001 → 1100. Why did a 1 enter from the left?",
              options: [
                "Random",
                "Arithmetic shift copies the sign bit — A was negative, and stays negative",
                "The carry flag leaked in",
                "Q pushed it",
              ],
              answer: 1,
              praise: "Sign-extension in action: 1001 is negative, so its sign 1 rides along. The 'arithmetic' in ASR, doing its one crucial job.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The same table, compressed",
              body: "Exam format — four columns, five rows:\n\n```\nstep pair action        A    Q    Qn cnt\ninit  —    —            0000 0011 0  4\n1     10   A=A−M, ASR   1100 1001 1  3\n2     11   ASR          1110 0100 1  2\n3     01   A=A+M, ASR   0010 1010 0  1\n4     00   ASR          0001 0101 0  0\n```\n\nProduct 0001 0101 = **21**. Practice writing THIS table — it's the 10-mark answer's skeleton. (The deck's big example: **−9 × −13 = +117** — same dance, negative inputs, correct signed output.)",
            },
            {
              kind: "check",
              prompt: "Your turn, first move only: run 3 × 7 the OTHER way — M = 0011, Q = 0111, Qn = 0. Step 1's pair and action?",
              options: [
                "10 → A = A − M = 1101, then shift",
                "11 → shift only",
                "01 → A = A + M",
                "00 → shift only",
              ],
              answer: 0,
              praise: "LSB 1, Qn 0 → 10 → A = 0000 + 1101 = 1101, shift. Different operand order, same rules — the table writes itself once the window is read right.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student's 7×3 table shows step 2 as 'pair 11 → A = A + M'. What goes wrong downstream?",
              options: [
                "Nothing — 11 can add",
                "An extra +7 poisons A; every later value inherits the error and A:Q ends ≠ 21 — 11 must shift ONLY",
                "The count resets",
                "Q reverses",
              ],
              answer: 1,
              praise: "One illegal add and the whole table drifts — which is why examiners can grade Booth at a glance. Same-bit pairs are sacred: shift, nothing else.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Your practice set (from the deck)",
              body: "The deck leaves three exercises: **7 × 3** (you own it), **−6 × 7**, and **14 × −5**.\n\nFor the negatives: write the operand in 2's complement first (−6 in 4 bits = 1010; −5 = 1011), precompute −M, then run the same four-step dance. The product pops out correctly signed in A:Q — no sign patch-up, ever. That's Booth's whole promise.\n\nDo −6 × 7 on paper tonight; the BCD circle taught you how good that feels.",
            },
            {
              kind: "check",
              prompt: "Final stretch: for −9 × −13, Booth's answer +117 emerges with NO extra sign step. Why?",
              options: [
                "Booth guesses the sign",
                "2's complement arithmetic is closed — subtracts and sign-extending shifts keep every intermediate value correctly signed, so the product's sign is built in",
                "Negative numbers become positive when shifted",
                "The examiner fixes it",
              ],
              answer: 1,
              praise: "Closed arithmetic: every add, subtract and ASR respects 2's complement, so signs take care of themselves — the deepest reason Booth beats sign-magnitude methods. Unit 4's arithmetic story is complete: you can add, subtract, and multiply like the machine does.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-unit4",
      title: "Unit 4 review: arithmetic, end to end",
      unit: 4,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-sub-2comp", "ca-addsub-hw", "ca-mult-shiftadd", "ca-booth-rules", "ca-booth-run"],
        count: 6,
      },
      deps: ["ca-booth-run"],
      whyItMatters:
        "Complement subtraction, the hardware, shift-and-add and both Booth circles — six questions to seal the unit before I/O organization begins.",
      recap: [],
      steps: [],
    },
  ],
};
