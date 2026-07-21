// CSE46D Unit 1, first half: Number Systems & Conversions.
// Built per KUBE_LESSON_DEPTH.md: one concept per circle, four quarters
// (Meet it slowly → Question it → Again, differently → Stretch & compare),
// depth dialed by weight, every rep a fresh angle. Source: Unit_1_1.pptx.
import type { Section } from "./types";

export const sectionU1A: Section = {
  id: "ca-sec-u1a",
  letter: "A",
  title: "Number Systems",
  tagline: "One idea — base and position — worn four different ways.",
  unit: 1,
  topics: [
    {
      id: "ca-base-idea",
      title: "The idea of a base",
      unit: 1,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Every conversion, complement and code in this unit is this one idea reused — position times base. Own it here and the rest of CO1 is downhill.",
      recap: [
        "A number system = a set of symbols + one rule: each position is worth BASE times the position to its right.",
        "The base (radix) = how many symbols the system has.",
        "Decimal: base 10, symbols 0–9, positional — in 5319 the 3 means 300 because of where it stands.",
        "Same digit, different position → different value. That's the whole machine.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Start with a question you've never needed to ask: when you read the number **5319**, how do you know what it's worth?",
            },
            {
              kind: "teach",
              body: "You don't add the digits — 5+3+1+9 is 18, nonsense. You read **positions**: the 9 is worth 9, the 1 is worth 10, the 3 is worth **300**, the 5 is worth **5000**.\n\nSame symbols, different places, different values.",
            },
            {
              kind: "teach",
              body: "Look at the pattern of those position values: 1, 10, 100, 1000 — each one is **ten times** the one before.\n\nWhy ten? Because decimal has **ten symbols**: 0 through 9. When a position runs out of symbols, you carry into the next one.",
            },
            {
              kind: "teach",
              body: "That number — how many symbols the system has — is called the **base** (or **radix**).\n\nAnd here's the secret of this whole unit: *nothing else about numbers changes when the base changes.* Ten symbols → positions worth powers of 10. Two symbols → powers of 2. Sixteen → powers of 16. One idea, many costumes.",
            },
            {
              kind: "teach",
              body: "So a **number system** is just: a set of symbols, plus the rule that each position is worth **base × the position to its right**. Systems like this are called **positional value systems**.\n\nDecimal is the one you were raised in. The next circles introduce three more — and they'll all feel familiar, because you already know the machine.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In 5319, what is the digit 3 actually worth?",
              options: ["3", "30", "300", "3000"],
              answer: 2,
              praise:
                "Right — third position from the right, so ×100. You just used the positional rule consciously for maybe the first time in your life.",
            },
            {
              kind: "check",
              prompt: "The base (radix) of a number system tells you…",
              options: [
                "the largest number it can write",
                "how many symbols it uses",
                "how many digits a number needs",
                "how fast it is",
              ],
              answer: 1,
              praise:
                "Exactly — count the symbols, know the base. Ten symbols, base 10; the definition is that short.",
            },
            {
              kind: "check",
              prompt: "Why is each decimal position worth ten times the one to its right?",
              options: [
                "Tradition",
                "Because decimal has ten symbols — a position carries over when they run out",
                "Because 10 is a round number",
                "It isn't — it's worth twice",
              ],
              answer: 1,
              praise:
                "That's the WHY most people never learn — run out of symbols, carry to the next position. Base and place value are the same fact seen twice.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: expand a number",
              body: "Take **(1234)₁₀** apart with the rule:\n\n`1×1000 + 2×100 + 3×10 + 4×1 = 1234`\n\nWriting a number as digit-times-place-value is called **expanding** it. It looks trivial in base 10 — but this exact expansion is how you'll convert ANY base to decimal two circles from now. You're practising the future.",
            },
            {
              kind: "check",
              prompt: "You try one — the expansion of 907 is…",
              options: [
                "9×100 + 0×10 + 7×1",
                "9×1000 + 0×100 + 7×10",
                "9 + 0 + 7",
                "90 + 7",
              ],
              answer: 0,
              praise:
                "Clean — and notice the 0 still holds its position open. That's WHY zero exists in positional systems: it's a place-keeper.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student says \"in 482, the 4 is worth 4 because digits mean themselves.\" What did they miss?",
              options: [
                "Nothing — they're right",
                "The 4 sits in the hundreds position, so it's worth 400 — position multiplies value",
                "The 4 is worth 40",
                "482 isn't a valid number",
              ],
              answer: 1,
              praise:
                "You caught the exact misconception this circle exists to kill — digits never 'mean themselves' in a positional system. Position multiplies.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Peek over the fence",
              body: "Now stretch the idea past ten. Imagine a system with only **two** symbols, 0 and 1. Positions would be worth 1, 2, 4, 8… — **doubling**, because the base is 2.\n\nOr **sixteen** symbols: positions worth 1, 16, 256… \n\nYou haven't 'learned binary' yet — but you already know how it must work. That's the power of owning the base idea.",
            },
            {
              kind: "check",
              prompt: "In a base-5 system (symbols 0–4), the third position from the right is worth…",
              options: ["5", "15", "25", "125"],
              answer: 2,
              praise:
                "5² = 25 — you just handled a base you've never seen, using nothing but the rule. Every system in this unit will fall the same way.",
            },
            {
              kind: "check",
              prompt: "Which of these could NOT be a numeral in base 4 (symbols 0–3)?",
              options: ["302", "123", "231", "134"],
              answer: 3,
              praise:
                "Right — a 4 can't appear in base 4, just as there's no single digit 'ten' in decimal. Symbols always stop one short of the base.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-binary",
      title: "Binary",
      unit: 1,
      weight: "heavy",
      deps: ["ca-base-idea"],
      whyItMatters:
        "Binary is the machine's native tongue — every later topic (complements, arithmetic, codes) is written in it.",
      recap: [
        "Binary = base 2: symbols 0 and 1 only. Positions worth 1, 2, 4, 8, 16… (doubling).",
        "All modern digital devices — computers, combinational & sequential circuits — operate in binary.",
        "Why: a circuit is ON or OFF; two states map perfectly onto two symbols.",
        "Valid binary uses only 0s and 1s: (1101)₂ ✓, (1021)₂ ✗.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A wire inside a computer can do exactly two things: carry voltage, or not. **On, or off.** No third option.\n\nSo whatever language machines count in, it can only have **two symbols**.",
            },
            {
              kind: "teach",
              body: "Two symbols means **base 2**. We write the symbols 0 and 1, and call the system **binary**.\n\nBy the rule you already own: positions are worth 1, 2, 4, 8, 16, 32… — each **double** the one to its right.",
            },
            {
              kind: "teach",
              body: "Read **(1101)₂** with those place values, right to left: 1, 0, 4, 8 present…\n\n`1×8 + 1×4 + 0×2 + 1×1 = 13`\n\nA binary number is just a shopping list of which powers of two are included.",
            },
            {
              kind: "teach",
              body: "This is why the slides say *all modern digital devices* — computers, combinational circuits, sequential circuits — run on binary. It's not a preference; it's physics. Hardware IS two-state, so its numbers are too.\n\nEven fractions work: `(10110.001)₂` — positions right of the point are worth ½, ¼, ⅛…",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Why base 2, fundamentally?",
              options: [
                "Binary numbers are shorter",
                "Hardware has exactly two states — on and off",
                "It was invented first",
                "Two is the smallest number",
              ],
              answer: 1,
              praise:
                "The physical truth — a circuit is on or off, so two symbols fit reality perfectly. Binary isn't chosen; it's inherited from the hardware.",
            },
            {
              kind: "check",
              prompt: "Which is a VALID binary number?",
              options: ["(1021)₂", "(1101)₂", "(12)₂", "(A01)₂"],
              answer: 1,
              praise:
                "Right — only 0s and 1s allowed. Spotting the illegal 2 or A instantly is a free exam mark.",
            },
            {
              kind: "check",
              prompt: "In binary, the position values grow by…",
              options: ["adding 2", "doubling", "adding 10", "squaring"],
              answer: 1,
              praise:
                "Doubling — 1, 2, 4, 8, 16. Base times the previous position, and the base is 2. The rule from the last circle, wearing its new costume.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: read one",
              body: "Read **(1010)₂** aloud the shopping-list way, left to right: an 8? *yes*. A 4? *no*. A 2? *yes*. A 1? *no*.\n\n`8 + 2 = 10`\n\n(1010)₂ is ten — binary's little joke: it spells '10-10'.",
            },
            {
              kind: "check",
              prompt: "You try one: (111)₂ = ?",
              options: ["7", "6", "111", "3"],
              answer: 0,
              praise:
                "4+2+1 = 7 — all positions present. A run of N ones is always 2ⁿ−1; you'll meet that pattern again in complements.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student reads (1101)₂ as 1+1+0+1 = 3. What went wrong?",
              options: [
                "Nothing — 3 is correct",
                "They ignored place values — each 1 is worth its POSITION (8, 4, 1), so it's 13",
                "They should have multiplied the digits",
                "The number is invalid",
              ],
              answer: 1,
              praise:
                "Exactly the base-idea violation — digits never 'mean themselves'. Position multiplies, in base 2 as in base 10.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The cost of two symbols",
              body: "Compare: decimal 200 takes 3 digits; in binary it's **11001000** — eight. Two symbols means numbers get **long**.\n\nThat length is binary's one weakness, and it's exactly why the next two circles exist: octal and hexadecimal are **compressions of binary** for human eyes. The machine never leaves base 2; we just need shorter ways to read it.",
            },
            {
              kind: "check",
              prompt: "Binary numbers are much longer than decimal ones because…",
              options: [
                "computers are slow",
                "with only two symbols, each digit carries less information",
                "binary includes extra zeros for safety",
                "they aren't longer",
              ],
              answer: 1,
              praise:
                "Right — fewer symbols per digit, more digits per number. Hold that thought: it's the entire reason hex exists.",
            },
            {
              kind: "check",
              prompt: "A binary number ends in 0. What do you instantly know?",
              options: [
                "It's negative",
                "It's even — the 1s place is empty",
                "It's a fraction",
                "Nothing",
              ],
              answer: 1,
              praise:
                "Sharp — the 1s position is the only odd place value, so its emptiness means even. Reading facts straight off the bits is what fluency looks like.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-octal",
      title: "Octal",
      unit: 1,
      weight: "light",
      deps: ["ca-binary"],
      whyItMatters:
        "A lean but real circle — octal appears in conversion questions on your paper, riding its exact-3-bits kinship with binary.",
      recap: [
        "Octal = base 8: symbols 0–7. Positions worth 1, 8, 64…",
        "An 8 or 9 in a supposed octal number makes it invalid.",
        "Why octal exists: 8 = 2³, so ONE octal digit = exactly THREE bits — a clean compression of binary.",
        "Examples: (124)₈, (345)₈, (1725.43)₈.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "**Octal** is base **8**: symbols 0 through 7, positions worth 1, 8, 64…\n\nIf you're wondering *who ordered base 8* — look at what 8 is: **2³**. Every octal digit corresponds to exactly **three binary bits**. Octal isn't a rival to binary; it's binary folded in threes for shorter reading.",
            },
            {
              kind: "teach",
              body: "So `(124)₈` is a legitimate number (worth 1×64 + 2×8 + 4 = 84), and even fractions like `(1725.43)₈` work by the same positional rule.\n\nOne trap to arm now: the digits stop at **7**. An 8 or a 9 in a claimed octal number is a contradiction.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which of these is NOT a valid octal number?",
              options: ["(345)₈", "(107)₈", "(238)₈", "(777)₈"],
              answer: 2,
              praise:
                "The 8 gives it away — octal's symbols end at 7. Validity checks like this are the paper's favourite freebie.",
            },
            {
              kind: "check",
              prompt: "Octal exists mainly because…",
              options: [
                "8 is lucky",
                "8 = 2³, so one octal digit stands for exactly three bits",
                "computers run on octal",
                "decimal was taken",
              ],
              answer: 1,
              praise:
                "Exactly — it's a reading aid for binary, three bits at a time. That kinship becomes a conversion shortcut two circles ahead.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Use & compare",
          steps: [
            {
              kind: "teach",
              title: "Worked, then stretch",
              body: "Expand `(345)₈`: `3×64 + 4×8 + 5 = 229`. Same expansion machine as ever, powers of 8.\n\nCompare the neighbours: binary spends 8 digits saying what octal says in 3. Compression is octal's entire job — hexadecimal, next circle, just compresses harder (four bits per digit instead of three).",
            },
            {
              kind: "check",
              prompt: "You try one: (17)₈ in decimal is…",
              options: ["17", "15", "23", "71"],
              answer: 1,
              praise:
                "1×8 + 7 = 15 — powers of eight, no drama. You now read three bases fluently; one more to go.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-hex",
      title: "Hexadecimal",
      unit: 1,
      weight: "heavy",
      deps: ["ca-binary"],
      whyItMatters:
        "Hex is the industry's binary shorthand and your paper's favourite conversion target — the letters A–F must be reflexes.",
      recap: [
        "Hexadecimal = base 16: symbols 0–9 then A=10, B=11, C=12, D=13, E=14, F=15.",
        "Positions worth 1, 16, 256…",
        "Used heavily in microprocessors/microcontrollers because hex is MUCH shorter than binary for the same value — and 16 = 2⁴ means one hex digit = exactly four bits (one nibble).",
        "Examples: (1AF)₁₆, (2C9B)₁₆, (EBF1.A2)₁₆.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Base 16 needs **sixteen symbols** — but we only have ten digits. So after 9, hexadecimal borrows letters:\n\n**A=10 · B=11 · C=12 · D=13 · E=14 · F=15**\n\nSix letters, counting up from A. That's the entire new vocabulary.",
            },
            {
              kind: "teach",
              body: "Positions are worth 1, 16, 256, 4096… — powers of 16, by the same base rule as always.\n\nSo `(1AF)₁₆` reads: `1×256 + A×16 + F×1` = `256 + 160 + 15` = **431**. The letters are just digits wearing disguises.",
            },
            {
              kind: "teach",
              body: "Why does the industry love it? **16 = 2⁴** — one hex digit is exactly **four bits**. A 32-bit value becomes 8 comfortable hex characters instead of 32 exhausting bits.\n\nThat's why the slides say hex is used extensively in microprocessors and microcontrollers: same information as binary, a quarter the width, and instantly convertible.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The symbol C in hexadecimal stands for…",
              options: ["3", "11", "12", "16"],
              answer: 2,
              praise:
                "Count up from A=10: B 11, C 12. Three seconds of letter-counting beats any memorised table.",
            },
            {
              kind: "check",
              prompt: "Why is hex preferred over binary for humans?",
              options: [
                "Computers run on hex internally",
                "Same value, a quarter the symbols — far more readable",
                "Hex has no zero",
                "Binary can't do large numbers",
              ],
              answer: 1,
              praise:
                "The honest reason — hex is compression for reading, while the machine stays in binary underneath. Straight off your paper's question list.",
            },
            {
              kind: "check",
              prompt: "How many bits does ONE hex digit represent?",
              options: ["2", "3", "4", "8"],
              answer: 2,
              praise:
                "Four — because 16 = 2⁴. One hex digit = one nibble; that equality powers the conversion shortcut coming up.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: letters in the middle",
              body: "Expand `(2A5)₁₆`:\n\n`2×256 + A×16 + 5×1` → `512 + 160 + 5` = **677**\n\nThe only skill the letters demand is translation-on-sight: see A, think 10. Everything else is the expansion you've done three times already.",
            },
            {
              kind: "check",
              prompt: "You try one: (1F)₁₆ = ?",
              options: ["115", "31", "16", "21"],
              answer: 1,
              praise:
                "16 + 15 = 31 — F pulling its full weight as fifteen. The letters stop being scary the third time you use them.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student expands (B2)₁₆ as 11×10 + 2 = 112. What went wrong?",
              options: [
                "B is 12, not 11",
                "They multiplied by 10 instead of the base, 16 — it's 11×16 + 2 = 178",
                "They should have added B and 2",
                "Nothing — 112 is right",
              ],
              answer: 1,
              praise:
                "Caught it — the decimal reflex snuck in. In base 16, positions are worth 16s, not 10s. That slip is exactly what examiners bait.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The family portrait",
              body: "All four systems, one number — twenty-nine:\n\n**Decimal** `29` · **Binary** `11101` · **Octal** `35` · **Hex** `1D`\n\nSame value, four spellings. Binary for machines, hex and octal for reading binary, decimal for humans. From here on, 'convert' just means re-spelling — the value never changes.",
            },
            {
              kind: "check",
              prompt: "Which system spells a given value in the FEWEST digits?",
              options: ["Binary", "Octal", "Decimal", "Hexadecimal"],
              answer: 3,
              praise:
                "Hex — the biggest base packs the most into each digit. Bigger base, shorter number: a rule worth keeping.",
            },
            {
              kind: "check",
              prompt: "(2C9B)₁₆ is valid hex. Which claim about it is TRUE?",
              options: [
                "C stands for 12 and B for 11",
                "It can't contain both letters and digits",
                "C stands for 13",
                "It's invalid because of the 9",
              ],
              answer: 0,
              praise:
                "Right on both letters — mixing digits and letters is exactly how hex normally looks. You read it like a native now.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-bits",
      title: "Bits, nibbles & bytes",
      unit: 1,
      weight: "light",
      deps: ["ca-binary"],
      whyItMatters:
        "Quick vocabulary marks — and MSB/LSB become load-bearing when the sign bit arrives.",
      recap: [
        "Bit = one binary digit (0 or 1). Nibble = 4 bits. Byte = 8 bits.",
        "MSB = most significant bit = LEFTMOST (highest place value).",
        "LSB = least significant bit = RIGHTMOST (lowest place value).",
        "One nibble = one hex digit — the vocab and the compression are the same fact.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "Binary's units of measurement, smallest to biggest:\n\n**Bit** — one binary digit, a single 0 or 1.\n**Nibble** — a group of **4 bits** (0101).\n**Byte** — a group of **8 bits** (01001011).\n\nAnd notice: a nibble is exactly **one hex digit**. The vocabulary and the hex compression are the same fact.",
            },
            {
              kind: "teach",
              body: "Two more names, for the ends of a number:\n\n**MSB** (most significant bit) — the **leftmost** bit, highest place value.\n**LSB** (least significant bit) — the **rightmost**, lowest place value.\n\nFile MSB away carefully: two circles from now, it becomes the **sign bit** — the single most important bit in a signed number.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A nibble is…",
              options: ["1 bit", "4 bits", "8 bits", "16 bits"],
              answer: 1,
              praise:
                "Four bits — half a byte, one hex digit. Small word, well connected.",
            },
            {
              kind: "check",
              prompt: "In 10010110, the MSB is…",
              options: ["the rightmost 0", "the leftmost 1", "whichever bit is largest", "always 1"],
              answer: 1,
              praise:
                "Leftmost — the seat of the highest place value, and soon, of the sign. LSB is its opposite at the right end.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Use & compare",
          steps: [
            {
              kind: "check",
              prompt: "How many nibbles are in one byte — and therefore how many hex digits describe it?",
              options: ["1", "2", "4", "8"],
              answer: 1,
              praise:
                "Two — every byte is exactly two hex characters (like 4B). That's why memory dumps read in hex pairs.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"the MSB of 0111 is 1, because 1 is the biggest digit present.\"",
              options: [
                "Correct as stated",
                "MSB is about POSITION, not value — the leftmost bit here is 0",
                "0111 has no MSB",
                "MSB means rightmost",
              ],
              answer: 1,
              praise:
                "Exactly — 'significant' refers to the position's weight, not the digit's size. The MSB of 0111 is that leading 0, and one day it'll tell you a number is positive.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-ns",
      title: "Quick review: the four systems",
      unit: 1,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-base-idea", "ca-binary", "ca-octal", "ca-hex"], count: 5 },
      deps: ["ca-base-idea", "ca-binary", "ca-octal", "ca-hex"],
      whyItMatters:
        "Five questions across all four bases before conversions start leaning on them — after this, decimals never trouble you again.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-to-decimal",
      title: "Converting: anything → decimal",
      unit: 1,
      weight: "heavy",
      deps: ["ca-rev-ns"],
      whyItMatters:
        "The expansion method scores direct conversion marks AND is the checking tool for every other conversion you'll ever do.",
      recap: [
        "Multiply each digit by its place value (powers of the base) and add.",
        "(1101)₂ = 8+4+0+1 = 13 · (124)₈ = 64+16+4 = 84 · (1AF)₁₆ = 256+160+15 = 431.",
        "Works for fractions too: digits right of the point get negative powers (½, ¼… in binary).",
        "One method for every base — only the powers change.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Here's the good news about this circle: **you already know the method.** It's the expansion from the base-idea circle — digit × place value, then add.\n\nConverting TO decimal is just expanding in a different base and doing the arithmetic in yours.",
            },
            {
              kind: "teach",
              body: "Binary example, fully slow:\n\n`(1101)₂`\nplace values right-to-left: 1, 2, 4, 8\n`1×8 + 1×4 + 0×2 + 1×1`\n`8 + 4 + 0 + 1 = 13`",
            },
            {
              kind: "teach",
              body: "Octal, same machine, powers of 8:\n\n`(124)₈ = 1×64 + 2×8 + 4×1 = 84`\n\nHexadecimal, powers of 16 (translate letters first):\n\n`(1AF)₁₆ = 1×256 + 10×16 + 15×1 = 431`",
            },
            {
              kind: "teach",
              body: "Fractions extend the pattern past the point: positions to the RIGHT get **negative powers** — in binary ½, ¼, ⅛…\n\nSo `(0.101)₂ = ½ + ⅛ = 0.625`. One rule, both directions from the point.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "(1010)₂ in decimal is…",
              options: ["8", "10", "12", "5"],
              answer: 1,
              praise:
                "8 + 2 = 10. Binary 1010 IS ten — the little echo examiners can't resist.",
            },
            {
              kind: "check",
              prompt: "What changes in the method when you convert octal instead of binary?",
              options: [
                "Everything",
                "Only the place values — powers of 8 instead of powers of 2",
                "You must go through hex first",
                "You add the digits instead",
              ],
              answer: 1,
              praise:
                "Just the powers — the machine is identical. One method, every base: that's why this circle pays rent forever.",
            },
            {
              kind: "check",
              prompt: "(2A)₁₆ equals…",
              options: ["42", "210", "32", "26"],
              answer: 0,
              praise:
                "2×16 + 10 = 42. Letter translated, powers applied, done — hex holds no further secrets.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: a fraction crosses over",
              body: "`(1725.43)₈` — from your slides, worked in two halves:\n\nInteger: `1×512 + 7×64 + 2×8 + 5 = 981`\nFraction: `4×⅛ + 3×1/64 = 0.5 + 0.046875 = 0.546875`\n\nTotal: **981.546875**. Nothing new happened — the point just splits the work into positive powers and negative powers.",
            },
            {
              kind: "check",
              prompt: "You try one: (11.1)₂ = ?",
              options: ["3.5", "3.1", "11.1", "2.5"],
              answer: 0,
              praise:
                "2+1 on the left, ½ on the right: 3.5. You just converted a binary fraction — many students never can.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: converting (52)₈, a student computes 5×10 + 2 = 52. Diagnose it.",
              options: [
                "No mistake",
                "They used powers of 10 — the decimal reflex. Correct: 5×8 + 2 = 42",
                "They should compute 5×2",
                "52 isn't valid octal",
              ],
              answer: 1,
              praise:
                "The decimal reflex strikes again — and now you see it coming. Base first, powers second, every time.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The checking tool",
              body: "Here's this circle's superpower: expansion is how you **verify any conversion in any direction**. Convert decimal→binary later and unsure of your answer? Expand it back — if it doesn't land on the original, you caught your own error before the marker did.\n\nOn a negatively-marked paper (yours deducts 0.25 per wrong MCQ), a 10-second self-check is worth real marks.",
            },
            {
              kind: "check",
              prompt: "A classmate claims (25)₁₀ converts to (11011)₂. Expand to check them.",
              options: [
                "They're right",
                "Wrong — (11011)₂ expands to 27, not 25",
                "Wrong — it expands to 23",
                "Can't be checked",
              ],
              answer: 1,
              praise:
                "16+8+2+1 = 27 ≠ 25 — claim rejected with evidence. That's the expansion working as a lie detector.",
            },
            {
              kind: "check",
              prompt: "Which is LARGEST: (100)₂, (100)₈, or (100)₁₆?",
              options: ["(100)₂", "(100)₈", "(100)₁₆", "They're equal"],
              answer: 2,
              praise:
                "Same digits, different bases: 4 vs 64 vs 256 — the base sets the scale. A one-line question that tests the whole unit's core idea.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-from-decimal",
      title: "Converting: decimal → anything",
      unit: 1,
      weight: "heavy",
      deps: ["ca-to-decimal"],
      whyItMatters:
        "Divide-and-collect (and multiply-and-collect for fractions) is the other half of every conversion question on the paper.",
      recap: [
        "Integer part: DIVIDE repeatedly by the target base; collect remainders; read them BOTTOM-UP.",
        "(25)₁₀ = (11001)₂ · (100)₁₀ = (1100100)₂ · (973)₁₀ = (1715)₈.",
        "Fraction part: MULTIPLY repeatedly by the base; collect INTEGER parts; read TOP-DOWN.",
        "Check any result by expanding it back to decimal.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Going the other way — decimal into another base — you can't expand, because the number isn't in digits of that base yet. You need the reverse machine.\n\nThe reverse of multiplying by the base is **dividing by it**. That's the whole trick.",
            },
            {
              kind: "teach",
              body: "**Divide by the base. Keep the remainder. Divide the quotient again. Repeat until the quotient is 0.**\n\nEach remainder is one digit of the answer — the FIRST remainder is the last digit (the 1s place), so you read the answer **bottom-up**.",
            },
            {
              kind: "teach",
              body: "Slow run — (25)₁₀ to binary:\n\n`25 ÷ 2 = 12 r 1`\n`12 ÷ 2 = 6 r 0`\n`6 ÷ 2 = 3 r 0`\n`3 ÷ 2 = 1 r 1`\n`1 ÷ 2 = 0 r 1`\n\nRead the remainders upward: **(11001)₂**. Expand it back — 16+8+1 = 25 ✓.",
            },
            {
              kind: "teach",
              body: "For decimal **fractions**, run the mirror image: **multiply** the fraction by the base and collect the **integer parts, top-down**:\n\n`0.625 × 2 = 1.25 → 1`\n`0.25 × 2 = 0.5 → 0`\n`0.5 × 2 = 1.0 → 1`\n\nSo 0.625 = (0.101)₂. Divide for the left of the point, multiply for the right.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In divide-and-collect, you read the remainders…",
              options: ["top-down", "bottom-up", "in any order", "only the last one"],
              answer: 1,
              praise:
                "Bottom-up — the first remainder is the 1s digit, the last is the biggest place. Reading direction is where most marks die; yours won't.",
            },
            {
              kind: "check",
              prompt: "(100)₁₀ in binary is…",
              options: ["(1100100)₂", "(1010101)₂", "(1100010)₂", "(1001001)₂"],
              answer: 0,
              praise:
                "64+32+4 = 100 ✓ — and notice you could verify it by expansion without redoing the division. The two circles guard each other.",
            },
            {
              kind: "check",
              prompt: "For the FRACTIONAL part you repeatedly…",
              options: [
                "divide by the base, reading up",
                "multiply by the base, collecting integer parts top-down",
                "subtract the base",
                "flip the digits",
              ],
              answer: 1,
              praise:
                "Multiply and skim the integer part — the mirror machine. Divide-up for integers, multiply-down for fractions: say it once more and it's yours.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: a different base",
              body: "Same machine, octal target — (973)₁₀:\n\n`973 ÷ 8 = 121 r 5`\n`121 ÷ 8 = 15 r 1`\n`15 ÷ 8 = 1 r 7`\n`1 ÷ 8 = 0 r 1`\n\nBottom-up: **(1715)₈**. The base changed; the ritual didn't.",
            },
            {
              kind: "check",
              prompt: "You try one: (19)₁₀ in binary?",
              options: ["(10011)₂", "(10101)₂", "(11001)₂", "(10010)₂"],
              answer: 0,
              praise:
                "16+2+1 = 19 ✓. Five divisions, remainders read upward — the ritual is muscle memory now.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: converting 12 to binary, a student divides 12÷2=6 r0, 6÷2=3 r0, 3÷2=1 r1, 1÷2=0 r1 — then writes 0011. Diagnose.",
              options: [
                "The division is wrong",
                "They read the remainders TOP-DOWN — correct answer is 1100",
                "They forgot a division",
                "0011 is correct",
              ],
              answer: 1,
              praise:
                "Perfect divisions, wrong reading direction — the classic. Expand 0011 (=3) and the error screams; expand 1100 (=12) and it's confirmed.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Both machines side by side",
              body: "You now own a matched pair:\n\n**Any base → decimal:** expand (multiply by place values, add).\n**Decimal → any base:** divide-and-collect (or multiply-and-collect past the point).\n\nAnd notice what happens when NEITHER end is decimal — say octal → hex. You could go octal → decimal → hex with both machines… but for bases that are powers of 2 there's a shortcut so clean it gets its own circle, next.",
            },
            {
              kind: "check",
              prompt: "Why does dividing by the base peel off exactly the LAST digit?",
              options: [
                "Coincidence",
                "The remainder is what doesn't fit into whole groups of the base — precisely the 1s place",
                "Because the base is even",
                "It peels the first digit",
              ],
              answer: 1,
              praise:
                "That's the deep why — every whole group of the base carries left; the leftover IS the units digit. You understand the machine now, not just its ritual.",
            },
            {
              kind: "check",
              prompt: "Convert 0.5 to binary in your head.",
              options: ["(0.1)₂", "(0.5)₂", "(0.01)₂", "(1.0)₂"],
              answer: 0,
              praise:
                "One multiply: 0.5×2 = 1.0 → digit 1, done. (0.1)₂ = ½ — fractions in binary, tamed in a single step.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-group-shortcuts",
      title: "The grouping shortcuts (binary ↔ octal ↔ hex)",
      unit: 1,
      weight: "heavy",
      deps: ["ca-from-decimal"],
      whyItMatters:
        "Your sample paper asks these three times — (24)₈→binary, (651.124)₈→hex, (1E.43)₁₆→octal. Groups of 3 and 4 turn all of them into 30-second marks.",
      recap: [
        "Binary → octal: group bits in 3s from the RIGHT (pad left with 0s); each group = one octal digit.",
        "Binary → hex: same, in 4s. Reverse direction: expand each digit into its 3 or 4 bits.",
        "Fractions: group AWAY from the point — leftward for integers, RIGHTWARD for the fraction part (pad right).",
        "Octal ↔ hex: go THROUGH binary — expand in 3s, regroup in 4s (or vice versa). No decimal, no division.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Remember the kinships: one octal digit = **3 bits** (8 = 2³), one hex digit = **4 bits** (16 = 2⁴).\n\nThat means binary↔octal and binary↔hex need **no arithmetic at all** — just regrouping.",
            },
            {
              kind: "teach",
              body: "**Binary → octal:** group the bits in **threes from the right**, padding the left with zeros to complete the last group; write each group's value.\n\n`(010101)₂ → 010 | 101 → 2 | 5 → (25)₈`",
            },
            {
              kind: "teach",
              body: "**Binary → hex:** the same dance in **fours**:\n\n`0011 1010 1011 0010 → 3 A B 2 → (3AB2)₁₆`\n\nAnd both run in reverse: each octal digit explodes into its 3 bits, each hex digit into its 4. `(345)₈ → 011 100 101`.",
            },
            {
              kind: "teach",
              body: "One care point — **fractions group away from the point**, in both directions:\n\ninteger part: rightmost bit against the point, group **leftward** (pad left)\nfraction part: leftmost bit against the point, group **rightward** (pad RIGHT)\n\nGet the padding side right and mixed numbers convert as easily as whole ones.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "To convert binary to hexadecimal you group bits…",
              options: [
                "in 3s from the left",
                "in 4s from the right, padding with 0s on the left",
                "in 8s",
                "however you like",
              ],
              answer: 1,
              praise:
                "Fours from the LSB end — one nibble per hex digit. The direction and the padding are the two places this goes wrong; you've locked both.",
            },
            {
              kind: "check",
              prompt: "(24)₈ in binary — your sample paper's exact question — is…",
              options: ["(111101)₂", "(010100)₂", "(111100)₂", "(101010)₂"],
              answer: 1,
              praise:
                "2→010, 4→100 — six bits, no division anywhere. That's a real paper mark banked in ten seconds.",
            },
            {
              kind: "check",
              prompt: "The cleanest octal → hex route is…",
              options: [
                "octal → decimal → hex",
                "through binary: expand in 3s, regroup in 4s",
                "memorising a 128-entry table",
                "impossible",
              ],
              answer: 1,
              praise:
                "Binary as the interchange station — three symbols of scratch work. Decimal never needs to hear about it.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: the paper's hardest version",
              body: "`(651.124)₈ → hex` — the sample paper's own beast, tamed:\n\nExpand each octal digit to 3 bits:\n`6→110, 5→101, 1→001 . 1→001, 2→010, 4→100`\n→ `110101001.001010100`\n\nRegroup in 4s away from the point (pad right on the fraction):\n`0001 1010 1001 . 0010 1010 0000`\n→ **1A9.2A** ✓",
            },
            {
              kind: "check",
              prompt: "You try one: (1E.43)₁₆ in octal is… (expand in 4s, regroup in 3s)",
              options: ["(36.506)₈", "(36.206)₈", "(35.506)₈", "(35.206)₈"],
              answer: 1,
              praise:
                "1E → 00011110 → 011110 = 36; .43 → 01000011 → 010 000 110 = .206. That was a REAL paper question and you just solved it the fast way.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: converting (0.11)₂ to hex, a student pads LEFT to get 0011 → 3, claiming (0.3)₁₆. Diagnose.",
              options: [
                "Correct",
                "Fraction bits pad on the RIGHT: 1100 → C, so it's (0.C)₁₆",
                "Should pad to 3 bits",
                "Fractions can't convert",
              ],
              answer: 1,
              praise:
                "The padding-side trap, caught. 0.11₂ is ¾ = 0.C₁₆, not 3/16. Away from the point, always — you'll never lose that half-mark now.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Choosing your weapon",
              body: "You now hold three conversion tools. The skill is picking fast:\n\nDecimal at either end → **expand** or **divide-and-collect**.\nBinary/octal/hex among themselves → **regroup**, never arithmetic.\n\nThe paper mixes both kinds deliberately. Classify first, then compute — a five-second decision that saves five minutes.",
            },
            {
              kind: "check",
              prompt: "Which conversion should NOT use grouping?",
              options: [
                "(1101)₂ → octal",
                "(2C)₁₆ → binary",
                "(973)₁₀ → octal",
                "(345)₈ → hex",
              ],
              answer: 2,
              praise:
                "Right — decimal isn't a power of 2, so 973 needs divide-and-collect. Tool-selection is the mastery this unit was building toward.",
            },
            {
              kind: "check",
              prompt: "Why does the 3-bit/4-bit grouping trick work at all?",
              options: [
                "Luck",
                "8 and 16 are powers of 2, so each of their digits spans an exact whole number of bits",
                "Because binary is short",
                "It works for decimal too",
              ],
              answer: 1,
              praise:
                "The whole secret in one sentence — exact powers mean digit boundaries and bit boundaries line up perfectly. Decimal (not a power of 2) can never join this club.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-conv",
      title: "Quick review: conversions",
      unit: 1,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-to-decimal", "ca-from-decimal", "ca-group-shortcuts"], count: 5 },
      deps: ["ca-group-shortcuts"],
      whyItMatters:
        "All three conversion machines, five questions — kept warm before signed numbers start using them.",
      recap: [],
      steps: [],
    },
  ],
};
