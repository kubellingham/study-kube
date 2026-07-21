// CSE46D Unit 1, second half: Signed Numbers, Reals & Codes.
// Four-quarter circles per KUBE_LESSON_DEPTH.md; BCD is the calibration
// circle (the addendum's own test case). Sources: Unit_1_1.pptx, Unit_12.pptx.
import type { Section } from "./types";

export const sectionU1B: Section = {
  id: "ca-sec-u1b",
  letter: "B",
  title: "Signed Numbers, Reals & Codes",
  tagline: "Minus signs, decimal points, and the codes machines agree on.",
  unit: 1,
  topics: [
    {
      id: "ca-sign-magnitude",
      title: "The sign bit & sign-magnitude",
      unit: 1,
      weight: "medium",
      deps: ["ca-rev-conv"],
      whyItMatters:
        "The sign bit is the doorway to all signed arithmetic — misread it and every later answer flips.",
      recap: [
        "Digital systems must handle negatives, but there's no minus symbol in hardware — the sign is a BIT.",
        "A signed binary number = sign + magnitude. The LEFTMOST bit (MSB) is the sign: 0 = positive, 1 = negative.",
        "Three signed forms exist: sign-magnitude, 1's complement, 2's complement.",
        "Sign-magnitude: sign bit + the plain value, e.g. 1 1010 = −10, 0 1010 = +10.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A machine's wires carry 0s and 1s — nothing else. So here's a genuine puzzle: **where does the minus sign live?**",
            },
            {
              kind: "teach",
              body: "The answer: it doesn't. The minus sign is **spent one bit** instead.\n\nA signed binary number carries two pieces of information: the **sign** and the **magnitude** (the value). The sign takes the **leftmost bit** — the MSB you met earlier.",
            },
            {
              kind: "teach",
              body: "The convention, universal across this whole course:\n\n**0 → positive. 1 → negative.**\n\nSo in 5 bits: `0 1010` is **+10** and `1 1010` is **−10**. Same magnitude bits, one bit of difference.",
            },
            {
              kind: "teach",
              body: "This simplest scheme — sign bit + plain value — is called **sign-magnitude**. The slides list three signed forms in total:\n\n1. **Sign-magnitude** (this circle)\n2. **1's complement** (next circle)\n3. **2's complement** (the one hardware actually uses)\n\nEach improves on the last; walk them in order and the third feels inevitable.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A sign bit of 1 means the number is…",
              options: ["positive", "negative", "zero", "invalid"],
              answer: 1,
              praise:
                "1 = negative, 0 = positive — the convention every later circle silently assumes. Check that bit FIRST on any signed question.",
            },
            {
              kind: "check",
              prompt: "In sign-magnitude, what is 1 0011 (5 bits)?",
              options: ["+3", "−3", "+19", "−19"],
              answer: 1,
              praise:
                "Sign 1 → negative; magnitude 0011 → 3. Two reads, one answer: −3.",
            },
            {
              kind: "check",
              prompt: "Why can't hardware just store a minus symbol?",
              options: [
                "It could, but bits are cheaper",
                "Wires carry only two states — every fact, including sign, must be a bit",
                "Minus signs are ambiguous",
                "It stores them in ROM",
              ],
              answer: 1,
              praise:
                "Exactly — in a two-state world, even 'negative' must be spelled in binary. The sign bit is the minus sign, translated.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "You try, then a wrinkle",
              body: "Write **−13** in 5-bit sign-magnitude: 13 = `1101`, prepend sign 1 → `1 1101`.\n\nNow the wrinkle that motivates the next circles: in sign-magnitude, `0 0000` is +0 and `1 0000` is **−0**. Two zeros! Hardware hates ambiguity like that — and ordinary adders give wrong answers on sign-magnitude numbers. Something better is needed…",
            },
            {
              kind: "check",
              prompt: "In 5-bit sign-magnitude, +13 and −13 differ in…",
              options: [
                "every bit",
                "only the sign bit",
                "the last bit",
                "no bits",
              ],
              answer: 1,
              praise:
                "One bit flips, the value negates — elegant to read, awkward to compute with. That tension is exactly why complements exist.",
            },
            {
              kind: "check",
              prompt: "Spot the flaw the slides hint at: sign-magnitude has…",
              options: [
                "no way to write zero",
                "two representations of zero (+0 and −0)",
                "no positive numbers",
                "no flaw",
              ],
              answer: 1,
              praise:
                "The double zero — a wasted pattern and an ambiguity. Keep score: 2's complement will fix this exact defect two circles from now.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-ones-comp",
      title: "1's complement",
      unit: 1,
      weight: "medium",
      deps: ["ca-sign-magnitude"],
      whyItMatters:
        "'Find the 1's complement' is a directly-asked paper question — and it's step one of every 2's complement you'll ever take.",
      recap: [
        "1's complement of a binary number: flip every bit — each 0→1, each 1→0. Nothing else.",
        "110100010 → 001011101 (your slides' example).",
        "As a negative-number scheme it still has two zeros — better than sign-magnitude, not yet perfect.",
        "Its real job today: the first step of the 2's complement.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "The **1's complement** of a binary number is disarmingly simple:\n\n**Flip every bit.** Each 0 becomes 1, each 1 becomes 0. That's the entire operation — the slides call it *inverting* the number.",
            },
            {
              kind: "teach",
              body: "From your slides:\n\n`110100010` → `001011101`\n`001011101` → `110100010`\n\nNotice it's perfectly reversible — flipping twice returns the original. The complement of the complement is the number itself.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The 1's complement of 1011001 — your sample paper's exact question — is…",
              options: ["0100110", "1100110", "1010110", "0100111"],
              answer: 0,
              praise:
                "Every bit flipped, nothing added — 0100110. That's a real paper mark, banked.",
            },
            {
              kind: "check",
              prompt: "What is the 1's complement of 0000?",
              options: ["0000", "1111", "0001", "1000"],
              answer: 1,
              praise:
                "All zeros flip to all ones. Tuck this away — it's about to expose the two-zeros problem again.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "The near-miss negative scheme",
              body: "1's complement can represent negatives: −n is the flip of +n. `0101` (+5) → `1010` (−5). The sign bit still works — negatives all start with 1.\n\nBut check zero: `0000` flips to `1111`… so +0 and −0 are DIFFERENT patterns. **Still two zeros.** So close. One tiny addition fixes everything — literally an addition — in the next circle.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: asked for the 1's complement of 1100111100010001, a student flips the bits AND adds 1. Diagnose.",
              options: [
                "Perfect technique",
                "The +1 belongs to the 2's complement — 1's complement is the flip alone: 0011000011101110",
                "They should flip only the sign bit",
                "They should subtract 1",
              ],
              answer: 1,
              praise:
                "The two complements blur together under exam pressure — you've just inoculated yourself. 1's = flip; 2's = flip THEN add 1.",
            },
            {
              kind: "check",
              prompt: "You try one: the 1's complement of 101010 is…",
              options: ["010101", "101011", "010110", "111111"],
              answer: 0,
              praise:
                "Clean flip — alternating bits alternate the other way. The operation is officially reflexive for you now.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-twos-comp",
      title: "2's complement",
      unit: 1,
      weight: "heavy",
      deps: ["ca-ones-comp"],
      whyItMatters:
        "The negative-number system real hardware uses — and the engine of Unit 4's subtraction circuit. This is the unit's most load-bearing circle.",
      recap: [
        "2's complement = 1's complement + 1: FLIP every bit, then ADD 1 to the LSB.",
        "Example: 0011 → flip → 1100 → +1 → 1101.",
        "It has exactly ONE zero, and subtraction becomes addition: A − B = A + (2's complement of B).",
        "That's why computers use it — one adder circuit handles both + and −.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Two circles of build-up, one payoff. The **2's complement** is:\n\n**Step 1 — flip every bit** (the 1's complement you just mastered).\n**Step 2 — add 1** to the least significant bit.\n\nThat +1 looks tiny. It changes computing.",
            },
            {
              kind: "teach",
              body: "Watch it on 0011 (3):\n\nflip → `1100`\nadd 1 → `1101`\n\nSo −3 in 4-bit 2's complement is `1101`. The sign bit is 1, as a negative should be.",
            },
            {
              kind: "teach",
              body: "First payoff — the zero problem dies. Take 0000: flip → 1111, add 1 → carries ripple → `0000` (the overflow bit falls off the end).\n\n**Zero's complement is zero itself. One zero, exactly.** The defect that haunted both earlier schemes — fixed by a single +1.",
            },
            {
              kind: "teach",
              body: "Second payoff, the big one: with 2's complement, **subtraction becomes addition**.\n\n`A − B = A + (2's complement of B)`\n\nSo a computer needs no subtractor circuit at all — one adder does both jobs. When Unit 4 shows you the add/subtract hardware, its complementer + carry-in trick is THIS fact, welded into wires.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The 2's complement of 0011 is…",
              options: ["1100", "1101", "0100", "1011"],
              answer: 1,
              praise:
                "Flip to 1100, add 1 → 1101. The +1 is the whole difference from 1's complement — and you kept it.",
            },
            {
              kind: "check",
              prompt: "How many representations of zero does 2's complement have?",
              options: ["Two, like the others", "Exactly one", "None", "Depends on width"],
              answer: 1,
              praise:
                "One — the ambiguity finally dies. This is half the reason hardware chose 2's complement.",
            },
            {
              kind: "check",
              prompt: "Computers perform A − B by…",
              options: [
                "a dedicated subtractor",
                "adding A to the 2's complement of B",
                "converting to decimal",
                "swapping A and B",
              ],
              answer: 1,
              praise:
                "Subtraction is addition wearing a complement — the other half of the reason. One adder, both operations: hardware's favourite bargain.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: a real subtraction",
              body: "Compute **10 − 3** the machine's way (5 bits):\n\n3 = `0 0011` → flip `1 1100` → +1 → `1 1101` (that's −3)\n\n`0 1010` (+10)\n`+ 1 1101` (−3)\n`= 10 0111` → drop the overflow bit → `0 0111` = **7** ✓\n\nNo subtractor was harmed — or used.",
            },
            {
              kind: "check",
              prompt: "You try one: the 2's complement of 01100 is…",
              options: ["10011", "10100", "01101", "11100"],
              answer: 1,
              praise:
                "Flip → 10011, add 1 → 10100. Ritual complete; this exact shape scores on the paper.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: to find −6, a student flips 0110 to 1001 and declares done. What's missing?",
              options: [
                "Nothing — 1001 is −6",
                "The +1 — they computed the 1's complement; −6 is 1010",
                "The sign bit",
                "They flipped the wrong bits",
              ],
              answer: 1,
              praise:
                "The forgotten +1 — the single most common complement error on papers. You now catch it in others, which means you'll never commit it yourself.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The three schemes, judged",
              body: "Line up −5 in 4 bits:\n\n**Sign-magnitude** `1101` — readable, two zeros, breaks adders.\n**1's complement** `1010` — flip only, still two zeros.\n**2's complement** `1011` — one zero, and arithmetic just WORKS.\n\nThat's why the third one won the world. Every signed number in every computer you've ever touched is 2's complement.",
            },
            {
              kind: "check",
              prompt: "A shortcut check: taking the 2's complement TWICE returns…",
              options: ["the 1's complement", "the original number", "zero", "garbage"],
              answer: 1,
              praise:
                "The original — negating twice is doing nothing, so −(−n) = n holds in bits exactly as in algebra. Use it to self-verify on the paper.",
            },
            {
              kind: "check",
              prompt: "In 2's complement, you can spot a negative number instantly because…",
              options: [
                "it ends in 1",
                "its MSB is 1",
                "it has more 1s than 0s",
                "you can't",
              ],
              answer: 1,
              praise:
                "The MSB survived every scheme change as the sign flag. Three circles of build-up and the sign bit still rules them all.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-signed",
      title: "Quick review: signed numbers",
      unit: 1,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-sign-magnitude", "ca-ones-comp", "ca-twos-comp"], count: 5 },
      deps: ["ca-twos-comp"],
      whyItMatters:
        "Sign bit, flip, flip-plus-one — five questions so the three schemes never blur again.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-fixed-point",
      title: "Fixed-point representation",
      unit: 1,
      weight: "medium",
      deps: ["ca-rev-signed"],
      whyItMatters:
        "The range-vs-precision freeze is the WHY behind floating point — and a tidy theory answer on its own.",
      recap: [
        "Fixed point stores real numbers with a FIXED number of bits for integer and fraction parts — three fields: sign, integer, fraction.",
        "The radix point never moves. All integers are fixed-point numbers.",
        "Example: 10 bits as 1 sign + 6 integer + 4 fraction → nothing below 0.0625 or above 63.9375.",
        "Once the format is frozen, RANGE and PRECISION are both frozen — more fraction bits costs integer bits and vice versa.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Whole numbers are settled. But the real world has **10.625** and **0.0001** — numbers with fractional parts. How does a fixed-width row of bits hold a decimal point?\n\nFirst answer: **nail the point down.**",
            },
            {
              kind: "teach",
              body: "**Fixed-point representation** splits the bits into three fields:\n\n`[ sign | integer part | fraction part ]`\n\nThe slides' example: 10 bits as **1 + 6 + 4**. Six bits count wholes (up to 63), four bits count sixteenths. The point sits, permanently, between the fields.",
            },
            {
              kind: "teach",
              body: "Feel the walls: with 6+4, the largest value is **63.9375** and the smallest positive one is **0.0625**. Want to store 64? Impossible. Want 0.01? Impossible. \n\nAnd if you steal fraction bits to widen the range, precision dies instead. **Once the point is frozen, range and precision are both frozen.** That single sentence is the whole topic.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The three fields of a fixed-point number are…",
              options: [
                "sign, exponent, mantissa",
                "sign, integer, fraction",
                "base, digit, point",
                "MSB, LSB, carry",
              ],
              answer: 1,
              praise:
                "Sign-integer-fraction — keep 'exponent and mantissa' on the shelf; they belong to the NEXT circle. Confusing the two field-lists is a classic exam slip.",
            },
            {
              kind: "check",
              prompt: "In a fixed-point format, taking bits from the integer field to gain precision costs you…",
              options: ["nothing", "range", "the sign", "speed"],
              answer: 1,
              praise:
                "Range — the bits must come from somewhere. This zero-sum trade is exactly the prison floating point escapes.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "The breaking point",
              body: "Try to store the **mass of the Earth** (~10²⁵) in fixed point: you'd need over 80 integer bits. The **mass of an atom** (~10⁻²⁵)? Eighty fraction bits. One format holding BOTH? Absurd.\n\nSo the slides ask the obvious next question: what if the point could **move** — slide right for huge numbers, left for tiny ones? That question IS the next circle.",
            },
            {
              kind: "check",
              prompt: "You try one: in a 1+6+4 format, which number is representable?",
              options: ["64", "22.0125", "63.5", "0.01"],
              answer: 2,
              praise:
                "63.5 fits (63 + 8/16); the others break range (64) or precision (0.0125, 0.01 aren't multiples of 1/16). You just FELT the frozen walls.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"fixed point can't store integers.\" Diagnose.",
              options: [
                "True",
                "Backwards — ALL integers are fixed-point numbers (fraction field zero, point fixed after the units)",
                "Only even integers work",
                "Integers need floating point",
              ],
              answer: 1,
              praise:
                "Straight from the slides — integers are the SIMPLEST fixed-point numbers. The scheme's problem is flexibility, never wholes.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-floating-point",
      title: "Floating point & normalization",
      unit: 1,
      weight: "heavy",
      deps: ["ca-fixed-point"],
      whyItMatters:
        "Mantissa-and-exponent is a 10-mark Part B question on your sample paper, word for word.",
      recap: [
        "Floating point lets the radix point MOVE: shift right for range (mass of Earth), left for precision (mass of atom) — both good range AND good precision.",
        "A number is stored as MANTISSA × base^EXPONENT — scientific notation in bits.",
        "Normalized form: exactly ONE non-zero digit before the point (e.g. 1.010101 × 2³) — a uniform spelling for every number.",
        "Fixed point freezes the trade-off; floating point re-negotiates it per number.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "You already write floating point by hand. The mass of the Earth isn't written as 5972000000000000000000000 kg — it's **5.972 × 10²⁴**.\n\nA compact value, times the base raised to a power. That's the whole invention.",
            },
            {
              kind: "teach",
              body: "The two parts have names:\n\n**Mantissa** — the significant digits (`5.972`).\n**Exponent** — how far the point really belongs from where it's written (`24`).\n\nStore those two, and the point effectively **floats**: a big exponent slides it right (range), a negative one slides it left (precision).",
            },
            {
              kind: "teach",
              body: "One number can be spelled many ways: 59.72×10²³ = 5.972×10²⁴ = 0.5972×10²⁵. Machines hate choices, so we **normalize**:\n\n**Exactly one non-zero digit before the point.**\n\n`5.972 × 10²⁴` ✓ — and in binary, `1.010101 × 2³`. Every number gets one canonical spelling.",
            },
            {
              kind: "teach",
              body: "Now the payoff over fixed point: mass of the Earth AND mass of an atom — **same format**, different exponents. The slides' verdict: floating point provides *both good range and good precision*.\n\nThe trade-off fixed point froze forever is re-negotiated per number, by the exponent.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In 6.02 × 10²³, the mantissa is…",
              options: ["10", "23", "6.02", "10²³"],
              answer: 2,
              praise:
                "The significant digits — 6.02. The 23 is the exponent doing the point-carrying. Name the parts and the Part B question is half-answered.",
            },
            {
              kind: "check",
              prompt: "Which is in NORMALIZED form?",
              options: ["0.301 × 10⁵", "30.1 × 10³", "3.01 × 10⁴", "301 × 10²"],
              answer: 2,
              praise:
                "One non-zero digit before the point — 3.01. The other three are the same value, mis-spelled by the normalization rule.",
            },
            {
              kind: "check",
              prompt: "Floating point beats fixed point because it offers…",
              options: [
                "only more range",
                "only more precision",
                "both good range and precision, by moving the point via the exponent",
                "simpler circuits",
              ],
              answer: 2,
              praise:
                "Both — the exponent slides the point wherever THIS number needs it. That's the sentence your paper is fishing for.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: normalize in binary",
              body: "Normalize `(1010.101)₂`:\n\nSlide the point left 3 places to leave one non-zero digit in front:\n\n`1.010101 × 2³`\n\nMantissa `1.010101`, exponent `3`. Every leftward slide of the point costs +1 on the exponent — the exponent is literally a count of how far the point moved.",
            },
            {
              kind: "check",
              prompt: "You try one: normalize (110.11)₂.",
              options: [
                "1.1011 × 2²",
                "11.011 × 2¹",
                "0.11011 × 2³",
                "1.1011 × 2³",
              ],
              answer: 0,
              praise:
                "Point slides two left, exponent 2 — 1.1011 × 2². You'll do this exact move inside every IEEE 754 question.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student normalizes 0.00101 × 2⁵ to 1.01 × 2⁸, adding 3 to the exponent. Diagnose.",
              options: [
                "Correct",
                "The point moved RIGHT 3 places, so the exponent must DECREASE: 1.01 × 2²",
                "Should be 1.01 × 2⁵",
                "Can't normalize numbers below 1",
              ],
              answer: 1,
              praise:
                "Direction matters — right-slide shrinks the exponent, left-slide grows it. Balance the books and normalization can never betray you.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "From idea to standard",
              body: "One piece is missing: how many bits does the mantissa get, and how is the exponent stored? Leave that to taste and no two computers could exchange numbers.\n\nSo the industry agreed on one layout — **IEEE 754** — and it's the next circle. Everything there is just this circle's mantissa-and-exponent, given fixed addresses.",
            },
            {
              kind: "check",
              prompt: "Why must the mantissa/exponent layout be standardized at all?",
              options: [
                "Aesthetics",
                "So every machine reads the same bits as the same number — interchange demands one layout",
                "To use less power",
                "It isn't standardized",
              ],
              answer: 1,
              praise:
                "Interchange — numbers cross machines constantly, so the format is a treaty. IEEE 754 is that treaty, signed by the whole industry.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-ieee754",
      title: "IEEE 754",
      unit: 1,
      weight: "heavy",
      deps: ["ca-floating-point"],
      whyItMatters:
        "The 10.625 encoding is your slides' showpiece AND the exam's — sign, biased exponent, padded mantissa, full marks.",
      recap: [
        "IEEE 754 = the standard layout for floating point; single precision (32-bit) and double precision (64-bit) are the common sizes.",
        "Single precision: 1 sign bit + 8 exponent bits + 23 mantissa bits.",
        "The exponent is stored BIASED: stored = actual + 127.",
        "10.625 → (1010.101)₂ → 1.010101×2³ → sign 0, exponent 3+127=130=10000010, mantissa 010101 padded right to 23 bits.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "**IEEE 754** is the agreed home for floating-point numbers. Two common sizes: **single precision** (32 bits) and **double precision** (64 bits).\n\nSingle precision splits its 32 bits:\n\n`[ 1 sign | 8 exponent | 23 mantissa ]`",
            },
            {
              kind: "teach",
              body: "The sign bit you know. The mantissa is the fraction digits after `1.` — normalized numbers ALWAYS start `1.`, so the standard doesn't even store that 1.\n\nThe exponent hides one trick: it's stored **biased**. Real exponent **+127**, so exponents from −127 to +128 all store as positive bit patterns. `stored = actual + 127` — memorize that line.",
            },
            {
              kind: "teach",
              body: "Your slides' full encoding of **10.625**, the exam's favourite walk:\n\n1. To binary: `10.625 = (1010.101)₂`\n2. Normalize: `1.010101 × 2³`\n3. Sign: positive → `0`\n4. Exponent: `3 + 127 = 130 = 10000010`\n5. Mantissa: `010101` padded right to 23 bits\n\n`0 | 10000010 | 01010100000000000000000` — done.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Single precision splits 32 bits as…",
              options: [
                "1 sign, 8 exponent, 23 mantissa",
                "8 sign, 1 exponent, 23 mantissa",
                "1 sign, 23 exponent, 8 mantissa",
                "2 sign, 10 exponent, 20 mantissa",
              ],
              answer: 0,
              praise:
                "1-8-23 — the address plan of every float on Earth. Write it at the top of any IEEE question before you think.",
            },
            {
              kind: "check",
              prompt: "For 10.625, the stored exponent bits are 10000010 because…",
              options: [
                "the exponent 3 is biased by +127, giving 130",
                "10.625 rounds to 130",
                "the mantissa is 130 bits",
                "the sign is 130",
              ],
              answer: 0,
              praise:
                "3 + 127 = 130 — the bias in action, straight off your sample paper. Actual-plus-127, always.",
            },
            {
              kind: "check",
              prompt: "The mantissa field for 1.010101 × 2³ is 010101 padded to 23 bits — where did the leading 1 go?",
              options: [
                "It's stored in the sign bit",
                "Normalized numbers always start 1., so the standard leaves it implicit",
                "It was rounded off",
                "It's in the exponent",
              ],
              answer: 1,
              praise:
                "The hidden bit — a free bit of precision because normalization guarantees it. The subtlest fact in the format, and you own it.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "You drive the whole pipeline",
              body: "Encode **5.5** yourself, step by step, then check below:\n\n5.5 = `101.1`₂ → normalize `1.011 × 2²` → sign `0` → exponent `2+127 = 129 = 10000001` → mantissa `011` + zeros.\n\n`0 | 10000001 | 01100000000000000000000`\n\nSame five moves as 10.625 — the pipeline never changes, only the number riding it.",
            },
            {
              kind: "check",
              prompt: "You try the key step: for 5.5, the stored exponent is…",
              options: ["2", "10000001 (129)", "10000010 (130)", "01111111 (127)"],
              answer: 1,
              praise:
                "2 + 127 = 129 — bias applied without hesitation. You can now encode any decimal the paper dares to print.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student encodes −10.625 identically to 10.625, then says \"negative numbers need the 2's complement of the mantissa.\" Diagnose.",
              options: [
                "They're right",
                "IEEE 754 is sign-magnitude at heart — just set the sign bit to 1; mantissa and exponent stay the same",
                "The exponent should be negated",
                "Negatives can't be stored",
              ],
              answer: 1,
              praise:
                "Neat irony — after three circles of complements, floats go back to a simple sign bit. Flip bit 31 and −10.625 is done.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-real",
      title: "Quick review: real numbers",
      unit: 1,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-fixed-point", "ca-floating-point", "ca-ieee754"], count: 5 },
      deps: ["ca-ieee754"],
      whyItMatters:
        "Fixed vs floating vs IEEE — five questions so the three layers stay distinct under exam pressure.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-code-bcd",
      title: "BCD (the 8421 code)",
      unit: 1,
      weight: "heavy",
      deps: ["ca-rev-real"],
      whyItMatters:
        "BCD is the paper's favourite code question — and the 'per digit, not whole number' idea is the trap it always sets.",
      recap: [
        "A code = a group of binary symbols standing for a number, letter or word; digital data is stored and moved as binary codes.",
        "BCD (Binary Coded Decimal, the 8421 code): each DECIMAL DIGIT separately becomes 4 bits, weighted 8-4-2-1.",
        "(96)₁₀ → 9=1001, 6=0110 → 1001 0110. Never convert the whole number!",
        "BCD is a WEIGHTED code (each bit position has a value). BCD of 13 = 0001 0011 — NOT 1101 (that's plain binary).",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Before BCD, one step back: **what even is a code?**\n\nWhen numbers, letters or words are represented by a specific group of symbols, we say they're **encoded**, and the group of symbols is a **code**. Everything a computer stores or transmits — numbers, text, all of it — travels as groups of binary bits.",
            },
            {
              kind: "teach",
              body: "Now a puzzle. Plain binary conversion of a big decimal number is work — divisions, remainders. But what do humans type and read all day? **Decimal digits.**\n\nWhat if we skipped converting the *number*… and just encoded each *digit* on its own?",
            },
            {
              kind: "teach",
              body: "A single decimal digit is 0–9. Four bits cover that (0000–1001) with room to spare.\n\nSo: **take each decimal digit, write its own 4-bit binary.** Digit by digit, no division, no remainders, no thinking about the number as a whole.",
            },
            {
              kind: "teach",
              body: "That's **BCD — Binary Coded Decimal**, also called the **8421 code**, because the 4 bits carry their usual place weights: 8, 4, 2, 1.\n\nBecause each bit position has a value, BCD is a **weighted code** — a label you'll need when its unweighted cousins arrive.",
            },
            {
              kind: "teach",
              body: "Read one together — `1001 0110` in BCD:\n\n`1001` → 8+1 = **9**\n`0110` → 4+2 = **6**\n\nSo it's **96**. Two nibbles, two digits, read separately. That's the entire skill.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In BCD, how much of the decimal number is converted at once?",
              options: [
                "The whole number",
                "One digit at a time — each gets its own 4 bits",
                "Two digits at a time",
                "Only the first digit",
              ],
              answer: 1,
              praise:
                "Digit by digit — the one fact that IS BCD. Whole-number conversion is plain binary's business, never BCD's.",
            },
            {
              kind: "check",
              prompt: "BCD is called the 8421 code because…",
              options: [
                "it was invented in 1842",
                "the four bits carry the weights 8, 4, 2, 1",
                "it has 8421 combinations",
                "the digits go up to 8421",
              ],
              answer: 1,
              praise:
                "The weights name the code — and those weights are why it counts as a WEIGHTED code. One name, two facts.",
            },
            {
              kind: "check",
              prompt: "What is (45)₁₀ in BCD?",
              options: ["101101", "0100 0101", "0101 0100", "1000 0100"],
              answer: 1,
              praise:
                "4 → 0100, 5 → 0101, side by side. (101101 is plain binary 45 — the imposter answer BCD questions always plant.)",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: through the decimal point",
              body: "Your slides encode **(96.73)₁₀** — yes, BCD strolls straight through decimal points, digit by digit:\n\n`9 → 1001 · 6 → 0110 . 7 → 0111 · 3 → 0011`\n\n`1001 0110 . 0111 0011`\n\nNo fraction machinery needed — the point just sits between digit codes.",
            },
            {
              kind: "check",
              prompt: "You try one: (28)₁₀ in BCD is…",
              options: ["0010 1000", "11100", "0010 0100", "1000 0010"],
              answer: 0,
              praise:
                "2 → 0010, 8 → 1000. (11100 is plain binary 28 — spotted and ignored like a pro.)",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: asked for BCD of 13, a student writes 1101. Diagnose.",
              options: [
                "Correct",
                "That's PLAIN BINARY 13 — BCD encodes each digit: 0001 0011",
                "Should be 1100",
                "13 can't be BCD-encoded",
              ],
              answer: 1,
              praise:
                "The exact trap on your sample paper — binary-vs-BCD confusion. 0001 0011, digit by digit, and that mark is yours on sight.",
            },
            {
              kind: "check",
              prompt: "Which 4-bit pattern can NEVER appear inside valid BCD?",
              options: ["1001", "0000", "1010", "0111"],
              answer: 2,
              praise:
                "1010 is ten — and no single decimal digit is ten. Patterns 1010–1111 are BCD's six forbidden faces; recognising them proves real understanding.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "BCD vs plain binary — the honest trade",
              body: "Compare 96 both ways:\n\n**Plain binary:** `1100000` — 7 bits, compact, arithmetic-friendly.\n**BCD:** `1001 0110` — 8 bits, slightly wasteful (six patterns unused per nibble)… but each digit is instantly readable, no conversion ever.\n\nThat's why calculators and digital displays love BCD while CPUs compute in binary. Neither is 'better' — they serve different masters.",
            },
            {
              kind: "check",
              prompt: "Why does BCD use more bits than plain binary for the same number?",
              options: [
                "It doesn't",
                "Each nibble wastes the six patterns above 1001, since digits stop at 9",
                "It stores the digits twice",
                "It includes the sign",
              ],
              answer: 1,
              praise:
                "The six ghost patterns — readability purchased with a little waste. Naming the cost as well as the benefit is what a compare question wants.",
            },
            {
              kind: "check",
              prompt: "A digital clock shows digits directly. Which encoding suits its display driver best?",
              options: ["Plain binary", "BCD", "IEEE 754", "2's complement"],
              answer: 1,
              praise:
                "BCD — each displayed digit maps to its own nibble, no conversion circuitry. You just made a design decision, not just an exam answer.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-excess3",
      title: "Excess-3 code",
      unit: 1,
      weight: "medium",
      deps: ["ca-code-bcd"],
      whyItMatters:
        "A quick, reliable definition mark — and your first NON-weighted code, a label the paper tests.",
      recap: [
        "Excess-3 (XS-3): a NON-weighted code for decimal digits.",
        "Each digit's code = its BCD + 3 (add 0011).",
        "2 → 0101 · 6 → 1001 · so 26 → 0101 1001.",
        "Non-weighted = bit positions carry no fixed place values (unlike 8421 BCD).",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "In BCD, every bit had a weight — 8, 4, 2, 1. Some codes throw that away: in a **non-weighted code**, bit positions carry **no fixed values**. The pattern is the meaning.\n\nYour slides name two: **Excess-3** (this circle) and **Gray code** (next).",
            },
            {
              kind: "teach",
              body: "**Excess-3 (XS-3)** is built straight out of BCD:\n\n**each digit's code = BCD + 3** (add `0011`).\n\nSo 2 → 0010+0011 = `0101`. 6 → 0110+0011 = `1001`. The digit 5 → `1000`. Everything sits three seats along from where BCD put it — hence the name.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The Excess-3 code of a decimal digit is…",
              options: [
                "its BCD minus 3",
                "its BCD plus 3 (add 0011)",
                "its bits flipped",
                "its Gray code",
              ],
              answer: 1,
              praise:
                "Plus three, digit by digit — the whole recipe is in the name. XS-3 = 'excess of 3 over BCD'.",
            },
            {
              kind: "check",
              prompt: "Excess-3 is classified as…",
              options: [
                "a weighted code like 8421",
                "a non-weighted code — its bit positions have no fixed values",
                "an error-correcting code",
                "a base-3 system",
              ],
              answer: 1,
              praise:
                "Non-weighted — add 3 and the tidy 8-4-2-1 meanings shatter. That classification is precisely what definition questions check.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Use & compare",
          steps: [
            {
              kind: "teach",
              title: "Worked, from the slides",
              body: "Encode **15** in XS-3, digit by digit:\n\n`1 → 0001+0011 = 0100`\n`5 → 0101+0011 = 1000`\n\n**0100 1000**. Same per-digit rhythm as BCD — the +3 is the only new move.",
            },
            {
              kind: "check",
              prompt: "You try one: (26)₁₀ in Excess-3 is…",
              options: ["0010 0110", "0101 1001", "0110 1010", "0101 0110"],
              answer: 1,
              praise:
                "2→0101, 6→1001 — the slides' own example, now done from your head. Notice option (a) was plain BCD lying in wait.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student decodes XS-3 1000 as decimal 8. Diagnose.",
              options: [
                "Correct",
                "They forgot to SUBTRACT 3 on the way out — 1000 is 8−3 = digit 5",
                "1000 is invalid XS-3",
                "It decodes to 11",
              ],
              answer: 1,
              praise:
                "Add 3 in, subtract 3 out — decoding reverses the excess. Symmetry restored, mark secured.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-gray",
      title: "Gray code",
      unit: 1,
      weight: "heavy",
      deps: ["ca-excess3"],
      whyItMatters:
        "'Unit distance code' is a guaranteed definition mark, and binary↔Gray conversion showed up in your slides as worked drills.",
      recap: [
        "Gray code: non-weighted, non-arithmetic — exactly ONE bit changes between consecutive values.",
        "Hence its titles: unit-distance code; also cyclic.",
        "Binary → Gray: keep the MSB; each next Gray bit = XOR of adjacent binary bits. 11010 → 10111.",
        "Gray → Binary: keep the MSB; each next binary bit = previous BINARY bit XOR next Gray bit. 10111 → 11010.",
        "Used in position encoders: one-bit-at-a-time changes mean no flickery multi-bit misreads.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Watch ordinary binary count from 3 to 4: `011 → 100`. **All three bits changed at once.**\n\nNow imagine a spinning shaft's position sensor reading those bits a hair out of sync — mid-change it might see `111` or `000`. Wild, wrong values, from one tick of rotation.",
            },
            {
              kind: "teach",
              body: "**Gray code** is the cure: an ordering of binary patterns where **consecutive values differ in exactly ONE bit**.\n\n0→00, 1→01, 2→11, 3→10 — walk it and watch: every step flips a single bit. No in-between chaos is possible.",
            },
            {
              kind: "teach",
              body: "Its formal titles, all exam-worthy:\n\n**Non-weighted** (positions mean nothing fixed), **non-arithmetic** (you don't compute with it), a **unit distance code** (the one-bit property), and **cyclic** (the last value steps back to the first — also one bit).\n\nIts home turf: **position encoders**, exactly the spinning-shaft scenario above.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The defining property of Gray code is…",
              options: [
                "weights of 8-4-2-1",
                "consecutive values differ in exactly one bit",
                "it's shorter than binary",
                "it stores negatives",
              ],
              answer: 1,
              praise:
                "One honest bit per step — say 'unit distance code' in the exam and collect the definition mark.",
            },
            {
              kind: "check",
              prompt: "Why do rotary position encoders use Gray code?",
              options: [
                "It's faster to compute",
                "A single-bit change per step means a misread mid-transition can never produce a wildly wrong value",
                "It compresses the data",
                "Tradition",
              ],
              answer: 1,
              praise:
                "The engineering WHY — multi-bit flickers are physically impossible when only one bit ever moves. Understanding beats memorising here.",
            },
            {
              kind: "check",
              prompt: "Gray code is called CYCLIC because…",
              options: [
                "it repeats every 4 values",
                "the last value differs from the first by one bit too — the sequence closes into a loop",
                "it spins with the encoder",
                "it isn't",
              ],
              answer: 1,
              praise:
                "The loop closes at unit distance — perfect for things that literally rotate back to the start.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: both conversions",
              body: "**Binary → Gray** (keep MSB, then XOR neighbours) on `11010`:\n\nkeep `1` · 1⊕1=`0` · 1⊕0=`1` · 0⊕1=`1` · 1⊕0=`1` → **10111** ✓ (your slides' drill)\n\n**Gray → Binary** (keep MSB, then previous BINARY ⊕ next Gray) on `10111`:\n\nkeep `1` · 1⊕0=`1` · 1⊕1=`0` · 0⊕1=`1` · 1⊕1=`0` → **11010** ✓ — right back where we started.",
            },
            {
              kind: "check",
              prompt: "You try one: binary 100110 → Gray? (slides' other drill)",
              options: ["110101", "101101", "110011", "100110"],
              answer: 0,
              praise:
                "Keep 1, then 1⊕0,0⊕0,0⊕1,1⊕1,1⊕0 → 110101. XOR neighbours, left to right — the drill is yours now.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: converting Gray→binary, a student XORs adjacent GRAY bits throughout. Diagnose.",
              options: [
                "That's correct",
                "Decoding chains off the BINARY result — each new bit = previous binary bit ⊕ next Gray bit",
                "Gray can't be decoded",
                "They should add 3",
              ],
              answer: 1,
              praise:
                "The subtle asymmetry — encoding XORs the source, decoding chains the result. Knowing which is which puts you past most of the room.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The three codes, one table",
              body: "Digit 6, three ways:\n\n**BCD** `0110` — weighted, per-digit, display-friendly.\n**Excess-3** `1001` — BCD+3, non-weighted.\n**Gray** `0101` — non-weighted, unit-distance, built for sensors.\n\nThree codes, three jobs. The exam's compare question is exactly this table — and after three circles of drilling each one alone, it reads like a summary instead of a challenge.",
            },
            {
              kind: "check",
              prompt: "Which label-pairing is CORRECT?",
              options: [
                "BCD non-weighted · Gray weighted",
                "BCD weighted · Excess-3 and Gray non-weighted",
                "All three weighted",
                "All three non-weighted",
              ],
              answer: 1,
              praise:
                "8421 carries weights; the other two dropped them. The classification question, answered with total confidence — that's the circle doing its job.",
            },
            {
              kind: "check",
              prompt: "You need a code for a robot arm's angle sensor. Pick, with the right reason:",
              options: [
                "BCD — it's weighted",
                "Excess-3 — it's newer",
                "Gray — one-bit transitions can't misread mid-motion",
                "Plain binary — it's shortest",
              ],
              answer: 2,
              praise:
                "Right code, right reason — the unit-distance property applied to a fresh scenario. That's transfer, the final proof a concept is truly yours.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-logic-gates",
      title: "Logic gates essentials",
      unit: 1,
      weight: "light",
      deps: [],
      whyItMatters:
        "Not in the decks — but your sample paper tests gates under CO1 (XNOR, the universal gate, truth-table sizes), so a lean circle guards those marks.",
      recap: [
        "A truth table for n variables has 2ⁿ rows — 3 variables → 8 rows.",
        "NAND (and NOR) are UNIVERSAL gates: any circuit can be built from them alone.",
        "XOR = AB' + A'B (true when inputs differ). XNOR = AB + A'B' (true when they match).",
        "AND = both · OR = either · NOT = invert.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "Your slide decks skip logic gates, but your sample paper doesn't — three questions wear the CO1 tag. Here is exactly what they ask, lean and complete.\n\nThe basics: **AND** outputs 1 only if both inputs are 1. **OR** if either is. **NOT** inverts. A **truth table** lists every input combination — n variables need **2ⁿ rows**, so 3 variables → 8.",
            },
            {
              kind: "teach",
              body: "Two more facts finish the paper's syllabus:\n\n**NAND is a universal gate** (NOR too) — every other gate can be built from NANDs alone.\n\n**XOR** is true when inputs *differ*: `AB' + A'B`. **XNOR** when they *match*: `AB + A'B'`. Difference detector, agreement detector.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "How many truth-table rows for a three-variable function?",
              options: ["4", "6", "8", "16"],
              answer: 2,
              praise:
                "2³ = 8 — the formula is the answer, and this exact question sits on your paper.",
            },
            {
              kind: "check",
              prompt: "The Boolean expression for XNOR is…",
              options: ["AB' + A'B", "AB + A'B'", "A + B", "A ⊕ B"],
              answer: 1,
              praise:
                "Agreement — both 1 or both 0. Its rival AB'+A'B is XOR; the paper loves making you tell the twins apart.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Use & compare",
          steps: [
            {
              kind: "check",
              prompt: "Which gate is 'universal', and what does that claim mean?",
              options: [
                "AND — it's the most common",
                "NAND — any Boolean circuit can be built from NANDs alone",
                "XOR — it detects everything",
                "NOT — it's in every circuit",
              ],
              answer: 1,
              praise:
                "NAND, with the meaning attached — sufficiency to build anything. Definition plus significance = the full mark.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"a 4-variable truth table needs 8 rows, double a 3-variable one minus the overlap.\" Diagnose.",
              options: [
                "Correct",
                "Rows DOUBLE per variable with no 'overlap': 2⁴ = 16",
                "It needs 12 rows",
                "Truth tables cap at 8 rows",
              ],
              answer: 1,
              praise:
                "2ⁿ, cleanly — each new variable doubles the world. Sixteen rows, no folklore.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-unit1",
      title: "Unit 1 review: the whole climb",
      unit: 1,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-group-shortcuts", "ca-twos-comp", "ca-ieee754", "ca-code-bcd", "ca-gray"],
        count: 5,
      },
      deps: ["ca-gray"],
      whyItMatters:
        "One last pass over Unit 1's five heaviest ideas before the next unit arrives — this is the rung that makes the whole unit permanent.",
      recap: [],
      steps: [],
    },
  ],
};
