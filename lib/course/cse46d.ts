// CSE46D — Computer Architecture (Lovely Professional University).
// Hand-authored from the student's own unit files. Units 1, 2 and 4 are fed;
// Units 3, 5, 6 join when their material arrives. Exam questions carry the
// syllabus CO tags (CO1 number systems, CO2 addressing modes, CO4 arithmetic).
import { buildCourseBundle } from "./bundle";
import type { Section, ExamQuestion, SyllabusInfo } from "./types";

export const cse46dSyllabus: SyllabusInfo = {
  units: [
    { unit: 1, title: "Data representation" },
    { unit: 2, title: "Central processing unit" },
    { unit: 3, title: "Stack Organization" },
    { unit: 4, title: "Computer Arithmetic" },
    { unit: 5, title: "Input-Output organization" },
    { unit: 6, title: "Memory organization" },
  ],
  cos: [
    { id: "CO1", text: "Understand different number systems (decimal, binary, octal, hexadecimal) and their conversions." },
    { id: "CO2", text: "Explain the addressing modes and their importance in instruction execution." },
    { id: "CO3", text: "Describe the role of program control instructions in sequence and flow of execution." },
    { id: "CO4", text: "Describe the basics of addition and subtraction operations in binary systems." },
    { id: "CO5", text: "Explain the concepts of Input-Output interfaces and asynchronous data transfer." },
    { id: "CO6", text: "Understand the memory hierarchy and its impact on system performance." },
  ],
};

const sectionA: Section = {
  id: "ca-sec-a",
  letter: "A",
  title: "Data Representation",
  tagline: "How machines spell numbers — four bases, two complements, and the codes between.",
  unit: 1,
  topics: [
    {
      id: "ca-number-systems",
      title: "The four number systems",
      unit: 1,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "CO1 lives here — every conversion, complement and code question stands on knowing the four bases cold.",
      recap: [
        "A number system represents information using a BASE (radix) = how many symbols it has.",
        "Decimal base 10 (0–9) · Binary base 2 (0,1) · Octal base 8 (0–7) · Hexadecimal base 16 (0–9, A–F where A=10 … F=15).",
        "Bit = one binary digit. Nibble = 4 bits. Byte = 8 bits.",
        "MSB = leftmost bit (highest place value); LSB = rightmost bit (least place value).",
        "Hex wins over binary for readability: the same number in far fewer symbols — that's why microprocessors use it.",
      ],
      lessons: [
        {
          id: "ns-decimal",
          title: "Decimal & the idea of a base",
          steps: [
            {
              kind: "teach",
              title: "Base is everything",
              body: "A **number system** is a set of symbols plus one rule: each position is worth **base times** the position to its right.\n\nThe **decimal** system — yours — has base **10**, symbols 0–9, and it's a **positional value system**: in 1234, the '2' means 200 because of *where* it stands, not what it is.\n\nEvery other system in this course is this exact idea with a different base. Master 'base + position' here and the rest are costume changes.",
            },
            {
              kind: "check",
              prompt: "In the decimal number 5319, the digit 3 contributes…",
              options: ["3", "30", "300", "3000"],
              answer: 2,
              praise:
                "Right — position gives it ×100. 'The value of a digit depends on its position' is the sentence the whole unit stands on.",
            },
            {
              kind: "check",
              prompt: "The base (radix) of a number system tells you…",
              options: [
                "the largest number it can store",
                "how many symbols it uses",
                "how many digits a number must have",
                "whether it's positional",
              ],
              answer: 1,
              praise:
                "Exactly — base 10 means ten symbols, base 2 means two. Count the symbols, know the base: that's the definition, banked forever.",
            },
          ],
        },
        {
          id: "ns-binary",
          title: "Binary",
          steps: [
            {
              kind: "teach",
              title: "The machine's own system",
              body: "**Binary** is base **2**: just the symbols **0 and 1**. All modern digital devices — computers, combinational circuits, sequential circuits — run on it, because a wire is either carrying voltage or it isn't.\n\nExamples from your slides: `(1101)₂`, `(1010)₂`, even fractions like `(10110.001)₂` — same positional rule, powers of 2 instead of 10.",
            },
            {
              kind: "check",
              prompt: "Which of these is a VALID binary number?",
              options: ["(1021)₂", "(1101)₂", "(12)₂", "(A01)₂"],
              answer: 1,
              praise:
                "Right — binary owns exactly two symbols, so any 2, or A disqualifies the number instantly. That validity check is a free exam mark.",
            },
            {
              kind: "check",
              prompt: "Why do digital devices use binary rather than decimal?",
              options: [
                "Binary numbers are shorter",
                "Hardware states (on/off) map naturally onto exactly two symbols",
                "Decimal is copyrighted",
                "Binary is newer",
              ],
              answer: 1,
              praise:
                "That's the physical truth under the maths — a circuit is on or off, so two symbols fit perfectly. Binary isn't a choice; it's what hardware IS.",
            },
          ],
        },
        {
          id: "ns-octal-hex",
          title: "Octal & hexadecimal",
          steps: [
            {
              kind: "teach",
              title: "The two compressions",
              body: "**Octal** — base **8**, symbols 0–7: `(124)₈`, `(1725.43)₈`.\n\n**Hexadecimal** — base **16**: symbols 0–9 then **A=10, B=11, C=12, D=13, E=14, F=15**: `(1AF)₁₆`, `(EBF1.A2)₁₆`.\n\nWhy do they exist? **Readability.** Hex is used heavily in microprocessors because it's **much shorter than binary** for the same value — and (next circle's secret) each hex digit is exactly 4 bits, each octal digit exactly 3.",
            },
            {
              kind: "check",
              prompt: "In hexadecimal, the symbol C stands for which decimal value?",
              options: ["3", "11", "12", "16"],
              answer: 2,
              praise:
                "Right — A starts at 10, so C is 12. Counting up from A is the fastest way to never trip on the letters.",
            },
            {
              kind: "check",
              prompt: "Which symbol can appear in octal but NOT cause an error?",
              options: ["8", "9", "7", "A"],
              answer: 2,
              praise:
                "Exactly — octal stops at 7. An 8 or 9 inside a supposed octal number is the classic spot-the-invalid trick.",
            },
            {
              kind: "check",
              prompt: "Why is hexadecimal preferred over binary for humans reading machine values?",
              options: [
                "Computers run on hex internally",
                "Hex is much shorter for the same value, so it's more readable",
                "Hex has no zero",
                "Binary can't represent large numbers",
              ],
              answer: 1,
              praise:
                "The honest reason — same information, a quarter the symbols. The machine still runs on binary; hex is our compression for reading it.",
            },
          ],
        },
        {
          id: "ns-bits",
          title: "Bits, nibbles, bytes, MSB & LSB",
          steps: [
            {
              kind: "teach",
              title: "The vocabulary of bits",
              body: "Four define-and-collect terms:\n\n**Bit** — one binary digit (a 0 or a 1).\n**Nibble** — a group of **4 bits** (0101).\n**Byte** — a group of **8 bits** (01001011).\n\nAnd inside any binary number: the **MSB** (most significant bit) is the **leftmost** bit — highest place value; the **LSB** (least significant bit) is the **rightmost** — lowest place value.",
            },
            {
              kind: "check",
              prompt: "A nibble is…",
              options: ["1 bit", "4 bits", "8 bits", "16 bits"],
              answer: 1,
              praise:
                "Exactly — 4 bits, which is precisely one hex digit. That's WHY hex and binary convert so cleanly.",
            },
            {
              kind: "check",
              prompt: "In the binary number 10010110, the MSB is…",
              options: ["the rightmost 0", "the leftmost 1", "the middle bit", "always 1"],
              answer: 1,
              praise:
                "Right — leftmost bit, highest place value. And it'll matter twice more: it's where the SIGN lives in signed numbers.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-numbers",
      title: "Quick review: number systems",
      unit: 1,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-number-systems"], count: 5 },
      deps: ["ca-number-systems"],
      whyItMatters:
        "Locks the four bases in before conversions build on them — five quick questions, then decimals never trouble you again.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-base-conversions",
      title: "Converting between bases",
      unit: 1,
      weight: "heavy",
      deps: ["ca-number-systems", "ca-rev-numbers"],
      whyItMatters:
        "Conversion questions are CO1's guaranteed marks — and the group-of-3 / group-of-4 shortcuts turn them into free ones.",
      recap: [
        "ANY base → decimal: multiply each digit by its place value (powers of the base) and add. (1101)₂ = 8+4+0+1 = 13.",
        "Decimal → any base: repeatedly DIVIDE by the base, collect remainders bottom-up. (25)₁₀ = (11001)₂.",
        "Decimal FRACTION → base: repeatedly MULTIPLY the fraction by the base, collect integer parts top-down.",
        "Binary ↔ octal: group bits in 3s from the right (pad left with 0s). Binary ↔ hex: group in 4s.",
        "Octal ↔ hex: go through binary in the middle.",
      ],
      lessons: [
        {
          id: "bc-to-decimal",
          title: "Anything → decimal",
          steps: [
            {
              kind: "teach",
              title: "Place values bring it home",
              body: "To bring any number home to decimal, pay each digit its **place value** — powers of the base, counted from 0 at the right:\n\n`(1101)₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13`\n`(124)₈ = 1×64 + 2×8 + 4×1 = 84`\n`(1AF)₁₆ = 1×256 + 10×16 + 15×1 = 431`\n\nOne method, three bases — the only thing that changes is the base you're raising.",
            },
            {
              kind: "check",
              prompt: "What is (1010)₂ in decimal?",
              options: ["8", "10", "12", "5"],
              answer: 1,
              praise:
                "Right — 8 + 0 + 2 + 0. Fittingly, binary 1010 IS ten; examiners love that little echo.",
            },
            {
              kind: "check",
              prompt: "(124)₈ in decimal is…",
              options: ["84", "124", "96", "72"],
              answer: 0,
              praise:
                "1×64 + 2×8 + 4 = 84 — powers of eight this time, same machine. You now convert FROM any base the paper can throw.",
            },
          ],
        },
        {
          id: "bc-from-decimal",
          title: "Decimal → anything",
          steps: [
            {
              kind: "teach",
              title: "Divide and collect",
              body: "Going the other way, **divide repeatedly by the target base and read the remainders from bottom to top**:\n\n`25 ÷ 2 = 12 r 1` → `12 ÷ 2 = 6 r 0` → `6 ÷ 2 = 3 r 0` → `3 ÷ 2 = 1 r 1` → `1 ÷ 2 = 0 r 1`\nRead up: `(25)₁₀ = (11001)₂`.\n\nFor a decimal **fraction**, flip the machine: repeatedly **multiply** by the base and collect the integer parts **top-down** — that's how 0.188 or 25.5 get their binary tails.",
            },
            {
              kind: "check",
              prompt: "Converting (100)₁₀ to binary by repeated division gives…",
              options: ["(1100100)₂", "(1010101)₂", "(1100010)₂", "(1001001)₂"],
              answer: 0,
              praise:
                "Exactly — 64+32+4 = 100, remainders read bottom-up as 1100100. Divide-collect-read-up, every time.",
            },
            {
              kind: "check",
              prompt: "For the FRACTIONAL part of a decimal number, you repeatedly…",
              options: [
                "divide by the base, reading remainders up",
                "multiply by the base, collecting integer parts top-down",
                "subtract the base",
                "flip the bits",
              ],
              answer: 1,
              praise:
                "Right — fractions run the machine in reverse: multiply and skim the integer part. Divide for the left of the point, multiply for the right.",
            },
          ],
        },
        {
          id: "bc-shortcuts",
          title: "The shortcut pair: groups of 3 & 4",
          steps: [
            {
              kind: "teach",
              title: "No decimal needed",
              body: "Binary ↔ octal and binary ↔ hex never need decimal at all:\n\n**Octal** — group bits in **3s** from the right (pad with leading 0s): `010 101` → `(25)₈`.\n**Hex** — group bits in **4s**: `0011 1010 1011 0010` → `3AB2`.\n\nAnd octal ↔ hex? **Go through binary in the middle** — expand to bits, regroup the other way. Three symbols of scratch work, no division anywhere.",
            },
            {
              kind: "check",
              prompt: "To convert binary to hexadecimal you group the bits…",
              options: [
                "in 3s from the left",
                "in 4s from the right, padding with 0s on the left",
                "in 8s from the right",
                "any way you like",
              ],
              answer: 1,
              praise:
                "Right — 4 bits = 1 hex digit (one nibble!), grouped from the LSB end. Octal is the same dance in 3s.",
            },
            {
              kind: "check",
              prompt: "(345)₈ in binary is…",
              options: ["011 100 101", "011 100 100", "011 101 101", "111 100 101"],
              answer: 0,
              praise:
                "3→011, 4→100, 5→101 — three digits, nine bits, zero division. The shortcut earns its name.",
            },
            {
              kind: "check",
              prompt: "The cleanest route from octal to hexadecimal is…",
              options: [
                "octal → decimal → hex",
                "octal → binary (3s) → regroup in 4s → hex",
                "memorising a table",
                "there is no route",
              ],
              answer: 1,
              praise:
                "Through binary in the middle — expand, regroup, read. That exact move solves the paper's (651.124)₈ → hex question.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-complements",
      title: "Signed numbers: 1's & 2's complement",
      unit: 1,
      weight: "heavy",
      deps: ["ca-base-conversions"],
      whyItMatters:
        "2's complement is load-bearing twice: it's a CO1 favourite AND the engine Unit 4's subtraction hardware runs on.",
      recap: [
        "Signed binary = sign + magnitude. The LEFTMOST bit is the sign bit: 0 = positive, 1 = negative.",
        "Three representations: sign-magnitude, 1's complement, 2's complement.",
        "1's complement: flip every bit (0↔1).",
        "2's complement: flip every bit, then ADD 1 to the LSB.",
        "Computers subtract by ADDING the 2's complement — one adder circuit does both jobs.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Putting a sign in the bits",
          body: "Machines must handle negatives, but there's no minus key in hardware — the **sign lives in the leftmost bit**: `0` means positive, `1` means negative. The rest is magnitude information.\n\nThree schemes exist, and the syllabus names all three:\n\n**Sign-magnitude** — sign bit + the plain value.\n**1's complement** — negative = **flip every bit**.\n**2's complement** — negative = **flip every bit, then add 1**. This is the one real hardware uses.",
        },
        {
          kind: "teach",
          title: "The two-step recipe",
          body: "Worked example on `01101` (13):\n\n**1's complement:** flip → `10010`.\n**2's complement:** flip → `10010`, add 1 → `10011`.\n\nWhy care? Because **subtraction becomes addition**: A − B is computed as A + (2's complement of B). One parallel adder then handles both + and − — you'll meet exactly this trick as hardware in Unit 4.",
        },
        {
          kind: "check",
          prompt: "The 1's complement of 110100010 is…",
          options: ["001011101", "110100011", "001011110", "111111111"],
          answer: 0,
          praise:
            "Flip every bit, nothing more — that's the whole operation. This exact number is from your slides, so consider it banked.",
        },
        {
          kind: "check",
          prompt: "What is the 2's complement of 0011?",
          options: ["1100", "1101", "0100", "1011"],
          answer: 1,
          praise:
            "Right — flip to 1100, add 1 to get 1101. The +1 at the end is what separates 2's from 1's, and forgetting it is the classic dropped mark.",
        },
        {
          kind: "check",
          prompt: "In a signed binary number, a sign bit of 1 means…",
          options: ["the number is positive", "the number is negative", "overflow occurred", "the number is zero"],
          answer: 1,
          praise:
            "Exactly — 0 positive, 1 negative, always read from the leftmost bit. Three seconds of checking that bit first saves whole questions.",
        },
      ],
    },
    {
      id: "ca-fixed-floating",
      title: "Fixed vs floating point",
      unit: 1,
      weight: "medium",
      deps: ["ca-complements"],
      whyItMatters:
        "The range-vs-precision trade-off and the IEEE 754 sign/exponent/mantissa split are dependable theory marks.",
      recap: [
        "Fixed point: sign field + integer field + fraction field; the radix point NEVER moves. Range and precision are frozen the moment the format is chosen.",
        "Floating point: the point moves — good range AND good precision (mass of the earth to mass of an atom).",
        "Normalized scientific form: one non-zero digit before the point.",
        "IEEE 754 is the standard: single precision (32-bit: 1 sign + 8 exponent + 23 mantissa) and double precision.",
        "10.625 → binary 1010.101 → normalize 1.010101×2³ → sign 0, exponent 3+127=130=10000010, mantissa 010101 padded to 23 bits.",
      ],
      steps: [
        {
          kind: "teach",
          title: "A point that can't move…",
          body: "**Fixed point** stores real numbers with a **fixed number of bits** for the integer part and the fraction part — three fields: **sign, integer, fraction**.\n\nThe cost: with (say) 10 bits split 1/6/4, you can never store anything above 63.9375 or below 0.0625. Want more precision? Steal bits from the integer field — and lose range. **Once the radix point is frozen, range and precision are both frozen.** That trade-off sentence is the exam answer.",
        },
        {
          kind: "teach",
          title: "…and a point that floats",
          body: "**Floating point** lets the radix point move: shift it right for **range** (mass of the Earth), left for **precision** (mass of an atom). Numbers are kept in **normalized scientific form** — one non-zero digit before the point — written as a **mantissa** and an **exponent**.\n\nThe universal standard is **IEEE 754**. Single precision = 32 bits: **1 sign + 8 exponent + 23 mantissa**. The slides' worked example:\n\n`10.625 → (1010.101)₂ → 1.010101 × 2³`\nSign `0` · Exponent `3 + 127 = 130 = 10000010` · Mantissa `01010100000000000000000`",
        },
        {
          kind: "check",
          prompt: "In a fixed-point format, choosing more fraction bits for extra precision means…",
          options: [
            "more range too",
            "less range — integer bits were given up",
            "nothing changes",
            "the sign bit disappears",
          ],
          answer: 1,
          praise:
            "That's the trade-off in one line — the bits have to come from somewhere. Floating point exists precisely to escape this bargain.",
        },
        {
          kind: "check",
          prompt: "In IEEE 754 single precision, the 32 bits split as…",
          options: [
            "1 sign, 8 exponent, 23 mantissa",
            "8 sign, 1 exponent, 23 mantissa",
            "1 sign, 23 exponent, 8 mantissa",
            "2 sign, 10 exponent, 20 mantissa",
          ],
          answer: 0,
          praise:
            "1-8-23 — locked. With the +127 exponent bias from the worked example, you can now encode any number they throw at you.",
        },
      ],
    },
    {
      id: "ca-codes",
      title: "BCD, Excess-3 & Gray code",
      unit: 1,
      weight: "medium",
      deps: ["ca-number-systems"],
      whyItMatters:
        "The three codes and their labels (weighted / non-weighted / unit-distance) are quick CO1 marks that only cost definitions.",
      recap: [
        "BCD (8421): each DECIMAL DIGIT gets its own 4 bits, weighted 8-4-2-1. (96)₁₀ = 1001 0110.",
        "Excess-3 (XS-3): non-weighted; each BCD digit + 3 (add 0011).",
        "Gray code: non-weighted, NOT arithmetic; exactly ONE bit changes between consecutive values — a unit-distance, cyclic code.",
        "Binary→Gray: keep the MSB, then XOR neighbouring bits. Gray→Binary: keep MSB, XOR result down the line.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Coding decimal digit by digit",
          body: "A **code** is a group of binary symbols standing for a number, letter or word.\n\n**BCD (8421 code)** represents each **decimal digit separately** in 4 bits, weighted 8-4-2-1:\n\n`(96)₁₀ → 9 = 1001, 6 = 0110 → 1001 0110`\n\nIt's a **weighted** code — every bit position has a value.\n\n**Excess-3 (XS-3)** is BCD's non-weighted cousin: take each digit's BCD and **add 3** (`0011`). So 2 → 0010+0011 = `0101`, 6 → `1001`.",
        },
        {
          kind: "teach",
          title: "Gray: the one-bit-at-a-time code",
          body: "**Gray code** is non-weighted and non-arithmetic, with one magic property: **consecutive values differ in exactly ONE bit** — a **unit-distance, cyclic** code (that's why position encoders use it: no messy multi-bit flickers between adjacent readings).\n\n**Binary → Gray:** keep the MSB, then each next Gray bit = XOR of neighbouring binary bits. `11010 → 10111`.\n**Gray → Binary:** keep the MSB, then each binary bit = XOR of the previous binary bit with the next Gray bit. `10111 → 11010`.",
        },
        {
          kind: "check",
          prompt: "What is (96.73)₁₀'s integer part, 96, in BCD?",
          options: ["1100000", "1001 0110", "0110 1001", "1111 0000"],
          answer: 1,
          praise:
            "Digit by digit — 9 is 1001, 6 is 0110. BCD never converts the whole number; that per-digit rule IS the code.",
        },
        {
          kind: "check",
          prompt: "Which property makes Gray code special?",
          options: [
            "It's weighted 8421",
            "Consecutive values differ in exactly one bit",
            "It uses base 3",
            "It stores negative numbers",
          ],
          answer: 1,
          praise:
            "Unit-distance — one honest bit per step, which is why rotating encoders trust it. Say 'unit distance code' in the exam and collect the mark.",
        },
        {
          kind: "check",
          prompt: "Excess-3 code is obtained from BCD by…",
          options: [
            "subtracting 3 from each digit code",
            "adding 3 (0011) to each digit's BCD code",
            "flipping all the bits",
            "grouping bits in 3s",
          ],
          answer: 1,
          praise:
            "Right — plus three, digit by digit, hence the name. And remember its label: NON-weighted, unlike 8421.",
        },
      ],
    },
    {
      id: "ca-logic-gates",
      title: "Logic gates essentials",
      unit: 1,
      weight: "light",
      deps: [],
      whyItMatters:
        "Not in the decks — but the sample paper tests gates under CO1 (XNOR's expression, the universal gate, truth-table sizes), so it's on your paper.",
      recap: [
        "A truth table for n variables has 2ⁿ rows — 3 variables → 8 rows.",
        "NAND (and NOR) are UNIVERSAL gates: any circuit can be built from them alone.",
        "XOR = AB' + A'B (true when inputs differ). XNOR = AB + A'B' (true when inputs match).",
        "AND = both, OR = either, NOT = invert.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The five-minute gate refresher",
          body: "Your sample paper quizzes basic gates even though the slide decks skip them — so here's exactly what it asks:\n\n**Truth table size** — n input variables need **2ⁿ rows**: 3 variables → **8** rows.\n**Universal gate** — **NAND** (NOR too): every other gate can be built from it alone.\n**XOR vs XNOR** — XOR is true when inputs **differ**: `AB' + A'B`. **XNOR** is true when they **match**: `AB + A'B'`.\n\nThat's the whole exam surface: one size formula, one universal gate, two Boolean expressions.",
        },
        {
          kind: "check",
          prompt: "How many truth-table rows does a three-variable Boolean function need?",
          options: ["4", "6", "8", "16"],
          answer: 2,
          praise:
            "2³ = 8 — the formula is the answer, every time. This exact question is on your sample paper.",
        },
        {
          kind: "check",
          prompt: "The Boolean expression for an XNOR gate is…",
          options: ["AB' + A'B", "AB + A'B'", "A + B", "A ⊕ B"],
          answer: 1,
          praise:
            "Right — XNOR rewards agreement: both 1 (AB) or both 0 (A'B'). Its rival AB'+A'B is XOR, the disagreement detector — the paper loves this pair.",
        },
      ],
    },
  ],
};

const sectionB: Section = {
  id: "ca-sec-b",
  letter: "B",
  title: "Central Processing Unit",
  tagline: "What instructions are made of — and the twelve ways they find their data.",
  unit: 2,
  topics: [
    {
      id: "ca-rev-repr",
      title: "Quick review: data representation",
      unit: 2,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-base-conversions", "ca-complements"], count: 5 },
      deps: ["ca-base-conversions", "ca-complements"],
      whyItMatters:
        "Five questions to keep conversions and complements warm before the CPU starts using them.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-cpu-instructions",
      title: "Instruction categories & CPU components",
      unit: 2,
      weight: "medium",
      deps: ["ca-rev-repr"],
      whyItMatters:
        "The three instruction categories frame Unit 2, and the register-set-with-common-ALU picture is the CPU question's skeleton.",
      recap: [
        "Computer instructions fall into THREE categories: Data Transfer, Data Manipulation, Program Control.",
        "Data transfer moves data WITHOUT changing it: memory ↔ registers, registers ↔ I/O, register ↔ register.",
        "The CPU's key parts: a register set for temporary data/operands, the ALU that computes, and a common bus connecting them.",
        "In a common-ALU design, registers feed operands to one shared ALU over the bus; results return to a register.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three kinds of instruction",
          body: "Every instruction a computer runs belongs to one of **three categories**:\n\n**Data transfer** — move data from one place to another **without changing its content**: memory ↔ processor registers, registers ↔ input/output, register ↔ register.\n**Data manipulation** — actually compute on data (next topic).\n**Program control** — decide what runs next (branches, calls, interrupts — Unit 3's territory).",
        },
        {
          kind: "teach",
          title: "The register set and the shared ALU",
          body: "Inside the CPU, a **register set** holds temporary data and operands, and the **ALU** (Arithmetic Logic Unit) performs the computations and logical operations using them.\n\nIn the **common-ALU** organisation, all registers share **one** ALU over a **common bus system**: two registers put operands on the bus, the ALU computes, and the result rides back into a destination register. One expensive circuit, many registers served — that sharing is the whole design idea.",
        },
        {
          kind: "check",
          prompt: "MOV-ing a value from memory into a register belongs to which instruction category?",
          options: ["Data manipulation", "Program control", "Data transfer", "Arithmetic"],
          answer: 2,
          praise:
            "Right — the data moved but nothing about it changed. 'Without changing the data content' is the phrase that defines the category.",
        },
        {
          kind: "check",
          prompt: "In a register set with a common ALU, the registers…",
          options: [
            "each contain their own private ALU",
            "share one ALU, supplying operands over a common bus",
            "never hold operands",
            "are part of main memory",
          ],
          answer: 1,
          praise:
            "Exactly — one shared computing engine, many registers feeding it. That picture is what the control word (coming up) exists to steer.",
        },
      ],
    },
    {
      id: "ca-data-manipulation",
      title: "Data manipulation: arithmetic, logic & shift",
      unit: 2,
      weight: "medium",
      deps: ["ca-cpu-instructions"],
      whyItMatters:
        "'Name the three types of data manipulation instruction' is a straight theory question — and shifts return in Booth's algorithm.",
      recap: [
        "Data manipulation instructions provide the computer's computational power. Three basic types:",
        "1. Arithmetic — add, subtract, multiply, divide (most computers provide all four).",
        "2. Logical & bit manipulation — binary operations (AND, OR…) on bit strings in registers.",
        "3. Shift — move the bits of a word left or right.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Where computation lives",
          body: "**Data manipulation instructions** are the ones that actually operate on data — they \"provide the computational capabilities for the computer.\" Three basic types:\n\n**Arithmetic** — the four basics: **addition, subtraction, multiplication, division**.\n**Logical & bit manipulation** — binary operations performed on **strings of bits in registers**: AND, OR and friends.\n**Shift** — slide **all the bits of a word left or right**. Humble now, but multiplication algorithms (Unit 4) are built almost entirely out of shifts and adds.",
        },
        {
          kind: "check",
          prompt: "Which is NOT one of the three types of data manipulation instruction?",
          options: ["Arithmetic", "Shift", "Data transfer", "Logical & bit manipulation"],
          answer: 2,
          praise:
            "Caught it — transfer is its own CATEGORY, not a manipulation type. Manipulation = arithmetic, logical, shift; that trio is the exam list.",
        },
        {
          kind: "check",
          prompt: "A shift instruction does what?",
          options: [
            "Swaps two registers",
            "Moves the bits of a word left or right",
            "Jumps to another instruction",
            "Clears a register",
          ],
          answer: 1,
          praise:
            "Right — the whole word slides sideways. Hold that thought: Booth's multiplier in Unit 4 is shifts doing the heavy lifting.",
        },
      ],
    },
    {
      id: "ca-addressing-modes",
      title: "Addressing modes",
      unit: 2,
      weight: "heavy",
      deps: ["ca-cpu-instructions"],
      whyItMatters:
        "CO2 by name — the direct-vs-indirect memory-reference count and the mode definitions are among the most reliably asked things in this course.",
      recap: [
        "An addressing mode = the rule for interpreting the address field to find an operand.",
        "Implied/implicit: the instruction itself defines the operand (CMA; zero-address stack instructions).",
        "Stack: operand at top of stack (ADD pops two, pushes the sum). Immediate: the operand itself sits IN the instruction.",
        "Direct: address field = effective address → 1 memory reference. Indirect: address field points to the address → 2 references.",
        "Register direct: operand in a register → 0 memory references. Register indirect: register holds the effective address → 1 reference.",
        "Also on the list: relative, indexed, base register, auto-increment, auto-decrement.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The rule behind the address field",
          body: "An **addressing mode** is \"the way the operand of an instruction is specified\" — a **rule for interpreting or modifying the address field** before the operand is actually used.\n\nThe simple ones:\n\n**Implied/implicit** — the instruction defines its operand by itself: `CMA` (complement accumulator) names no operand; zero-address stack instructions are implied too.\n**Stack** — the operand is at the **top of the stack**: `ADD` pops the top two values, adds them, pushes the result.\n**Immediate** — no address at all: the **operand itself sits inside the instruction** (`MOV R #20` loads the constant 20).",
        },
        {
          kind: "teach",
          title: "The memory-reference ladder",
          body: "The remaining four are best remembered by **how many memory references** it takes to fetch the operand:\n\n**Register direct** — operand is IN a CPU register → **0** memory references.\n**Direct (absolute)** — address field IS the effective address → **1** reference.\n**Register indirect** — a register holds the effective address → **1** reference.\n**Indirect** — the address field points to a memory location that CONTAINS the effective address → **2** references.\n\nAnd the rest of the twelve, by name: **relative, indexed, base register, auto-increment, auto-decrement** — each modifies the address with a register before use.",
        },
        {
          kind: "check",
          prompt: "CMA (complement accumulator) uses which addressing mode?",
          options: ["Immediate", "Direct", "Implied/implicit", "Indirect"],
          answer: 2,
          praise:
            "Right — the instruction's own definition supplies the operand; nothing needs addressing. Zero-address stack instructions live in the same bucket.",
        },
        {
          kind: "check",
          prompt: "How many memory references does INDIRECT addressing need to fetch the operand?",
          options: ["0", "1", "2", "3"],
          answer: 2,
          praise:
            "Two — one to fetch the effective address, one to fetch the operand it points to. That count versus direct's one is the single most-tested fact in this topic.",
        },
        {
          kind: "check",
          prompt: "In MOV R #20, the 20 is found via…",
          options: [
            "direct addressing",
            "immediate addressing — the operand is in the instruction itself",
            "register indirect addressing",
            "stack addressing",
          ],
          answer: 1,
          praise:
            "Exactly — the # gives it away: no fetching, the constant travels inside the instruction. Fastest mode there is, at the price of flexibility.",
        },
        {
          kind: "check",
          prompt: "Register indirect addressing means…",
          options: [
            "the operand is in the register",
            "the register holds the ADDRESS of the operand in memory",
            "the operand is on the stack",
            "the address field holds the operand",
          ],
          answer: 1,
          praise:
            "Right — the register is a signpost, not the destination: one memory reference follows it. 'Register direct = value, register indirect = address' settles both modes forever.",
        },
      ],
    },
    {
      id: "ca-control-word",
      title: "The control word",
      unit: 2,
      weight: "medium",
      deps: ["ca-cpu-instructions", "ca-data-manipulation"],
      whyItMatters:
        "Decoding a control word's fields (opcode, sources, destination, ALU control, flags) is Unit 2's favourite 'read the table' question.",
      recap: [
        "Executing an instruction = micro-operations (fetch, decode, execute, write back), each driven by control signals.",
        "Those signals are encoded together into a CONTROL WORD.",
        "Fields: Opcode (operation, e.g. 0010 = ADD) · Src1 · Src2 · Dest (register codes, e.g. 0000=R1, 0001=R2, 0010=R3) · ALU control (000 AND, 001 OR, 010 ADD, 011 SUB, 100 MUL) · Flags bit (1 = update Zero/Carry/Overflow).",
        "Example: ADD R1 ← R2 + R3 encodes opcode 0010, Src1 0001, Src2 0010, Dest 0000, ALU 010, Flags 1.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Signals, bundled",
          body: "Running one instruction takes several **micro-operations** — fetch, decode, execute, write back — and each step is driven by control signals. Encode all those signals into one binary bundle and you have the **control word**: the CPU's marching orders for a single operation.\n\nIts fields, from the slides' ADD example (`R1 ← R2 + R3`):\n\n**Opcode** `0010` — the operation type (ADD).\n**Src1** `0001` (R2) · **Src2** `0010` (R3) — the source registers.\n**Dest** `0000` (R1) — where the result lands.\n**ALU control** `010` — tells the ALU which operation (000 AND, 001 OR, **010 ADD**, 011 SUB, 100 MUL).\n**Flags** `1` — update Zero/Carry/Overflow after the operation.",
        },
        {
          kind: "check",
          prompt: "With register codes 0000=R1, 0001=R2, 0010=R3, a control word whose Dest field is 0000 writes its result to…",
          options: ["R2", "R3", "R1", "memory"],
          answer: 2,
          praise:
            "Right — decode the field against the register table and R1 is the landing spot. Field-by-field decoding is the entire skill this question tests.",
        },
        {
          kind: "check",
          prompt: "The Flags field of a control word set to 1 means…",
          options: [
            "the instruction failed",
            "Zero/Carry/Overflow flags will be updated by this operation",
            "the ALU is disabled",
            "the operand is negative",
          ],
          answer: 1,
          praise:
            "Exactly — it's a permission bit: 1 records the outcome in the status flags, 0 leaves them untouched. Small field, favourite question.",
        },
      ],
    },
  ],
};

const sectionU3: Section = {
  id: "ca-sec-u3",
  letter: "C",
  title: "Stack Organization",
  tagline: "LIFO, postfix, and the shapes an instruction can take.",
  unit: 3,
  topics: [
    {
      id: "ca-rev-modes",
      title: "Quick review: addressing modes",
      unit: 3,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-addressing-modes", "ca-cpu-instructions"], count: 5 },
      deps: ["ca-addressing-modes"],
      whyItMatters:
        "Instruction formats are addressing modes wearing structure — this keeps the modes sharp before they return.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-stack-org",
      title: "The stack & stack pointer",
      unit: 3,
      weight: "heavy",
      deps: ["ca-cpu-instructions", "ca-rev-modes"],
      whyItMatters:
        "LIFO + push/pop + the SP is the foundation of everything in Unit 3 — and the reason zero-address instructions can exist at all.",
      recap: [
        "A stack is a LIFO (Last In, First Out) memory structure: the last item pushed is the first popped.",
        "PUSH puts an item on top; POP removes the top item.",
        "The Stack Pointer (SP) is a register holding the address of the top of the stack.",
        "Used for: return addresses in subroutine calls, expression evaluation, and memory management.",
        "The flags register (Zero, Carry, Sign, Overflow) stores condition codes used in conditional execution.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Last in, first out",
          body: "A **stack** is a region of memory with one rule: **LIFO — Last In, First Out**. You only ever touch the top:\n\n**PUSH** — place a value on top.\n**POP** — take the top value off.\n\nThe **stack pointer (SP)** is a CPU register that always holds the **address of the top of the stack** — push and pop really just write/read memory at SP and move it.\n\nWhat's it for? The lecturer's list: **storing return addresses during subroutine calls**, evaluating expressions, and memory management. When CALL jumps away, the way home is sitting on the stack.",
        },
        {
          kind: "check",
          prompt: "You PUSH 5, then PUSH 9, then POP. What comes off?",
          options: ["5", "9", "Both", "Neither"],
          answer: 1,
          praise:
            "Last in, first out — 9 went on top, so 9 comes off first. Every stack question in this unit is that one rule wearing different clothes.",
        },
        {
          kind: "check",
          prompt: "The stack pointer (SP) holds…",
          options: [
            "the top value on the stack",
            "the ADDRESS of the top of the stack",
            "the number of items pushed",
            "the program counter",
          ],
          answer: 1,
          praise:
            "Right — SP is a signpost to the top, not the top itself. Push moves it one way, pop the other; the stack lives in ordinary memory underneath.",
        },
        {
          kind: "check",
          prompt: "Which register stores condition codes like Zero, Carry, Sign, Overflow?",
          options: ["The stack pointer", "The flags register", "The accumulator", "The instruction register"],
          answer: 1,
          praise:
            "The flags register — the CPU's scratchpad of 'what just happened', which conditional jumps read in the program-control lesson ahead.",
        },
      ],
    },
    {
      id: "ca-rpn",
      title: "Reverse Polish Notation",
      unit: 3,
      weight: "medium",
      deps: ["ca-stack-org"],
      whyItMatters:
        "RPN is how stack machines compute — and the PUSH-PUSH-ADD-POP trace is the sample paper's favourite way to test it.",
      recap: [
        "RPN (postfix) writes the operator AFTER its operands: A B + instead of A + B.",
        "No parentheses needed — the order of evaluation is unambiguous.",
        "Evaluate with a stack: push operands; an operator pops two, computes, pushes the result.",
        "C = A + B as a stack program: PUSH A · PUSH B · ADD (pops both, pushes sum) · POP C.",
        "Used by stack-based processors — e.g. the Java Virtual Machine and HP calculators.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Operators go last",
          body: "**Reverse Polish Notation** (postfix) writes the operator **after** its operands: `A B +` means A + B, and `(A+B)×C` becomes `A B + C ×` — **no parentheses ever needed**.\n\nWhy do stack machines love it? Because RPN **is** stack choreography:",
          code: "PUSH A   ; Push A onto stack\nPUSH B   ; Push B onto stack\nADD      ; Pop top two values, add them, push result back\nPOP C    ; Store result in C",
        },
        {
          kind: "check",
          prompt: "In RPN, the expression A + B is written…",
          options: ["+ A B", "A + B", "A B +", "B + A"],
          answer: 2,
          praise:
            "Operands first, operator last — that's the whole notation. Prefix (+AB) is its mirror-twin Polish notation; postfix is what stacks eat.",
        },
        {
          kind: "check",
          prompt: "When ADD executes on a stack machine, it…",
          options: [
            "reads two named registers",
            "pops the top two stack values, adds them, and pushes the result",
            "adds the SP to the PC",
            "needs an address field",
          ],
          answer: 1,
          praise:
            "Exactly — two pops, one compute, one push. No operands in the instruction at all, which is precisely what makes it a ZERO-address instruction (next lesson).",
        },
      ],
    },
    {
      id: "ca-instr-formats",
      title: "Instruction formats: 0/1/2/3-address",
      unit: 3,
      weight: "heavy",
      deps: ["ca-stack-org", "ca-addressing-modes"],
      whyItMatters:
        "This is on your paper TWICE — an MCQ ('which is NOT a valid format?') and a 10-mark Part B question explaining all four with examples.",
      recap: [
        "Zero-address: no explicit operands, everything implicit on the stack (ADD) — stack-based CPUs (JVM, HP calculators).",
        "One-address: one operand, the other implied in the ACCUMULATOR (ADD A) — simple CPUs.",
        "Two-address: two operands, result overwrites one (ADD A, B) — general-purpose register machines.",
        "Three-address: two sources + separate destination (ADD A, B, C) — high-performance CPUs.",
        "Single-address format works through the accumulator; general-register format (ADD R1, R2) uses registers to cut memory access.",
        "Four-address is NOT a standard format — that's the paper's trick option.",
      ],
      steps: [
        {
          kind: "teach",
          title: "How many operands fit in an instruction?",
          body: "An **instruction format** is defined by how many addresses (operands) the instruction names. The lecturer's comparison table:\n\n**Zero-address** — `ADD` — operands implicit on the **stack** (LIFO). Used in stack-based CPUs: the **Java Virtual Machine**, HP calculators.\n**One-address** — `ADD A` — one named operand; the other lives in the **accumulator**. Simple CPUs.\n**Two-address** — `ADD A, B` — two operands, the result overwrites one. **General-purpose register** machines.\n**Three-address** — `ADD A, B, C` — two sources and a separate destination. High-performance CPUs.\n\nAnd the trick your sample paper plays: **four-address is not a valid standard format.**",
        },
        {
          kind: "teach",
          title: "Two named styles",
          body: "Two format families get their own names in the material:\n\n**Single-address (accumulator) format** — everything routes through the accumulator: load it, operate on it, store it.\n**General register format** — `ADD R1, R2` adds R1 and R2 into R1, \"using multiple registers to **reduce memory access**.\"\n\nWorth connecting: zero-address instructions are the **implied addressing mode** from Unit 2, formalised — the format and the mode are two views of the same design choice.",
        },
        {
          kind: "check",
          prompt: "Which of the following is NOT a valid instruction format? (straight off your sample paper)",
          options: ["Zero-address", "One-address", "Two-address", "Four-address"],
          answer: 3,
          praise:
            "That's the paper's Q1, banked — zero through three are real; four-address is the imposter. One mark secured before you even sit down.",
        },
        {
          kind: "check",
          prompt: "ADD A (one operand named) implies the second operand is in…",
          options: ["the stack", "the accumulator", "main memory", "the program counter"],
          answer: 1,
          praise:
            "Right — one-address machines lean on the accumulator as the silent partner in every operation. Format ↔ hardware, one-to-one.",
        },
        {
          kind: "check",
          prompt: "ADD A, B, C — two sources and a separate destination — is which format?",
          options: ["Zero-address", "One-address", "Two-address", "Three-address"],
          answer: 3,
          praise:
            "Three named addresses, three-address format — count the operands and the question answers itself. That's the Part B answer's skeleton too.",
        },
      ],
    },
    {
      id: "ca-program-control",
      title: "Program control & interrupt types",
      unit: 3,
      weight: "medium",
      deps: ["ca-instr-formats"],
      whyItMatters:
        "CO3's home topic: branches, CALL/RET and the interrupt taxonomy — definitions the paper asks for directly.",
      recap: [
        "Program control instructions change the SEQUENCE of execution instead of running top-to-bottom.",
        "Conditional branches (e.g. JNZ) test the flags register (Zero, Carry, Sign, Overflow).",
        "CALL saves the current address (on the stack) and jumps to a subroutine; RET returns to the saved address.",
        "Loop control: MOV CX,10 · LOOP: DEC CX · JNZ LOOP — repeat until the counter hits zero.",
        "Interrupt types: software (triggered by instructions, e.g. INT) vs hardware (external events); maskable (can be ignored) vs non-maskable (critical, e.g. power failure).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Changing the flow",
          body: "**Program control instructions** are the third instruction category from Unit 2 — the ones that change *what runs next*:\n\n**Jumps & branches** — unconditional, or conditional on the **flags register** (Zero, Carry, Sign, Overflow) set by earlier operations.\n**Subroutine calls** — **CALL** saves the current address and jumps to the subroutine; **RET** returns to the saved address. Where is the address saved? On the **stack** — this is why Unit 3 taught you LIFO first.\n**Loop control** — the classic countdown:",
          code: "MOV CX, 10    ; Load loop counter\nLOOP_LABEL:\n  DEC CX      ; Decrement counter\n  JNZ LOOP_LABEL ; Jump back if CX != 0",
        },
        {
          kind: "teach",
          title: "Interrupts, sorted into types",
          body: "**Interrupts** are program control arriving from outside the running program:\n\n**Software interrupts** — triggered by **instructions** (e.g. `INT` in x86).\n**Hardware interrupts** — triggered by **external events**: keyboard input, hardware failure.\n\nAnd by urgency:\n\n**Maskable** — the CPU may temporarily ignore them.\n**Non-maskable** — critical events (e.g. **power failure**) that cannot be ignored.\n\nWhen one fires, the CPU saves where it was (stack again), services the interrupt, and returns — CALL/RET's involuntary cousin.",
        },
        {
          kind: "check",
          prompt: "CALL differs from a plain jump because it…",
          options: [
            "runs faster",
            "saves the current address first, so RET can come back",
            "only jumps backwards",
            "clears the flags",
          ],
          answer: 1,
          praise:
            "That saved return address — parked on the stack — is the entire difference. Jump forgets home; CALL remembers it.",
        },
        {
          kind: "check",
          prompt: "A power-failure interrupt is best classified as…",
          options: [
            "software and maskable",
            "hardware and non-maskable",
            "software and non-maskable",
            "not an interrupt",
          ],
          answer: 1,
          praise:
            "Both axes right — an external event (hardware) too critical to ignore (non-maskable). Classifying interrupts on those two axes is exactly how the marks are given.",
        },
        {
          kind: "check",
          prompt: "In the loop MOV CX,10 … DEC CX; JNZ LOOP — what makes the loop finally stop?",
          options: [
            "JNZ always stops after 10 jumps",
            "DEC CX eventually makes CX zero, so JNZ stops jumping (Zero flag set)",
            "MOV re-runs each pass",
            "It never stops",
          ],
          answer: 1,
          praise:
            "Right — DEC drives CX to zero, the Zero flag rises, and JNZ ('jump if not zero') lets execution fall through. Flags steering branches: program control in one line.",
        },
      ],
    },
  ],
};

const sectionC: Section = {
  id: "ca-sec-c",
  letter: "D",
  title: "Computer Arithmetic",
  tagline: "Add, subtract and multiply — the way the circuit actually does it.",
  unit: 4,
  topics: [
    {
      id: "ca-add-sub",
      title: "Addition & subtraction with 2's complement",
      unit: 4,
      weight: "heavy",
      deps: ["ca-complements"],
      whyItMatters:
        "CO4 in person: the worked add/subtract cases (all eight sign combinations) are near-certain exam material.",
      recap: [
        "Same-sign addition: add magnitudes, keep the sign. (+10)+(+3): 01010 + 00011 = 01101 = +13.",
        "Subtraction: DON'T subtract — add the 2's complement of the subtrahend.",
        "(−10)−(−3) = (−A)−(−B): 2's complement of 3 = 01101; 11010 + 01101 → 10111 = −7. ✓",
        "The eight cases (±10 ± ±3) all reduce to the same machine: complement when needed, then add.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Addition is easy…",
          body: "With signed binary, **same-sign addition** is exactly what you'd hope: add the magnitudes, keep the sign.\n\n`(+10) + (+3)`\n`0 1010`\n`+ 0 0011`\n`= 0 1101 = +13` ✓\n\nThe leading bit is the sign (0 = positive), riding along untouched.",
        },
        {
          kind: "teach",
          title: "…because subtraction cheats",
          body: "The machine never truly subtracts. **A − B is computed as A + (2's complement of B)** — Unit 1's complement trick, now earning its keep. The slides' example:\n\n`(−10) − (−3)`  →  add the 2's complement of −3's magnitude:\n1's complement of `0 0011` → `0 1100`; +1 → `0 1101`\n`1 1010 + 0 1101 = 10111 = −7` ✓ (−10 + 3 = −7)\n\nAll **eight** sign combinations of ±10 and ±3 run through this same machine: complement where a minus appears, then just add.",
        },
        {
          kind: "check",
          prompt: "How does a computer perform A − B?",
          options: [
            "With a separate subtractor circuit",
            "It adds A to the 2's complement of B",
            "It swaps A and B",
            "It converts both to decimal first",
          ],
          answer: 1,
          praise:
            "That's the core of CO4 — subtraction is addition wearing a complement. One adder does both jobs, which is exactly why hardware loves 2's complement.",
        },
        {
          kind: "check",
          prompt: "(+10) + (+3) in 5-bit signed binary gives…",
          options: ["0 1101 (+13)", "1 1101 (−13)", "0 0111 (+7)", "1 0111 (−7)"],
          answer: 0,
          praise:
            "Clean — 01010 + 00011 = 01101, sign bit 0, value 13. Straight from your slides, straight into the exam.",
        },
      ],
    },
    {
      id: "ca-addsub-hw",
      title: "The add/subtract hardware",
      unit: 4,
      weight: "medium",
      deps: ["ca-add-sub"],
      whyItMatters:
        "'Explain the hardware for addition and subtraction' — registers, flip-flops, complementer, mode control — is a classic long-answer.",
      recap: [
        "Parts: registers A and B, sign flip-flops As and Bs, flip-flop E (holds the output carry), AVF (holds the overflow bit).",
        "A parallel adder adds A and B; the adder's output feeds back into register A.",
        "The COMPLEMENTER outputs B or B's complement, chosen by mode control M.",
        "M = 0: adder gets B, carry-in 0 → output = A + B (addition).",
        "M = 1: adder gets B's 1's complement, carry-in 1 → output = A + B' + 1 = A − B (subtraction).",
      ],
      steps: [
        {
          kind: "teach",
          title: "One adder, one switch",
          body: "The add/subtract circuit is a short cast list:\n\n**Registers A and B** hold the operands, with **sign flip-flops As and Bs**.\n**E** catches the output carry; **AVF** holds the overflow bit when A and B are added.\nA **parallel adder** does the arithmetic, and its output feeds back into **register A**.\n\nThe clever part is the **complementer** on B's path, steered by **mode control M**:\n\n**M = 0** → B passes through unchanged, carry-in 0 → result `A + B`.\n**M = 1** → B's **1's complement** goes in, carry-in **1** → result `A + B' + 1` = **A − B**.\n\nThe carry-in 1 supplies the \"+1\" that turns 1's complement into 2's complement — the whole subtraction trick, welded into one wire.",
        },
        {
          kind: "check",
          prompt: "With mode control M = 1, the adder computes…",
          options: ["A + B", "A + B' + 1, which equals A − B", "B − A", "2A"],
          answer: 1,
          praise:
            "Exactly — complemented B plus the carry-in 1 makes a full 2's complement, so the sum IS the difference. M is the only thing separating add from subtract.",
        },
        {
          kind: "check",
          prompt: "In this hardware, what does AVF hold?",
          options: [
            "The sign of register B",
            "The overflow bit from adding A and B",
            "The multiplier",
            "The mode control",
          ],
          answer: 1,
          praise:
            "Right — AVF is the overflow flag's home, while E holds the carry. Naming each block's one job is exactly how the long-answer gets its marks.",
        },
      ],
    },
    {
      id: "ca-rev-arith",
      title: "Quick review: complements & addition",
      unit: 4,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-complements", "ca-add-sub"], count: 5 },
      deps: ["ca-add-sub"],
      whyItMatters:
        "Booth's algorithm subtracts in 2's complement mid-flight — five questions make sure that reflex is ready.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-multiplication",
      title: "Multiplication & Booth's algorithm",
      unit: 4,
      weight: "heavy",
      deps: ["ca-add-sub", "ca-rev-arith"],
      whyItMatters:
        "Booth's bit-pair table (00/11 shift, 01 add, 10 subtract) is the highest-value algorithm question Unit 4 can ask.",
      recap: [
        "Basic signed-magnitude multiplication = successive SHIFT and ADD operations.",
        "Booth's algorithm multiplies SIGNED numbers in 2's complement (Andrew Donald Booth, 1951) using fewer additions.",
        "Setup: multiplicand M, multiplier Q, register A = 0, Qₙ₊₁ = 0 (extra bit), count = number of bits.",
        "Each step, look at (Q's LSB, previous bit): 00 or 11 → just arithmetic-shift right; 01 → A = A + M then shift; 10 → A = A − M then shift.",
        "Decrement count each cycle; stop at 0. Handles cases like −9 × −13 = +117 directly.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Multiplication is shifting plus adding",
          body: "Fixed-point multiplication in signed-magnitude form is \"a process of **successive shift and add** operations\" — exactly the long multiplication you know, in base 2: for each 1-bit of the multiplier, add a shifted copy of the multiplicand.\n\nThe hardware needs just a register pair to accumulate, a shifter, and the adder from the last lesson — the shift instructions of Unit 2, promoted to stardom.",
        },
        {
          kind: "teach",
          title: "Booth's shortcut for signed numbers",
          body: "**Booth's algorithm** (Andrew Donald **Booth, 1951**) multiplies **signed 2's-complement** numbers directly, using a **small number of additions and shifts**.\n\nSetup: multiplicand **M**, multiplier **Q**, register **A = 0**, an extra bit **Qₙ₊₁ = 0**, count = bit length.\n\nEach cycle, inspect the pair (**LSB of Q, previous LSB**):\n\n`00` or `11` → **arithmetic shift right** only.\n`01` → **A = A + M**, then shift.\n`10` → **A = A − M**, then shift.\n\nDecrement the count; at **0**, stop — A·Q holds the product. It swallows negatives whole: `−9 × −13 = +117` with no sign fix-ups at the end.",
        },
        {
          kind: "check",
          prompt: "In Booth's algorithm, seeing the bit pair 10 means…",
          options: [
            "just shift right",
            "add the multiplicand to A, then shift",
            "subtract the multiplicand from A, then shift",
            "stop the algorithm",
          ],
          answer: 2,
          praise:
            "Right — 10 subtracts, 01 adds, and the lazy pairs 00/11 only shift. That three-row table IS Booth's algorithm; everything else is bookkeeping.",
        },
        {
          kind: "check",
          prompt: "What advantage does Booth's algorithm offer over plain shift-and-add?",
          options: [
            "It works directly on signed 2's-complement numbers with fewer additions",
            "It needs no shifting",
            "It only works for positive numbers",
            "It converts to decimal first",
          ],
          answer: 0,
          praise:
            "Both halves of the selling point — signed numbers natively, and runs of identical bits cost only shifts. That's the 'why Booth?' answer, exam-ready.",
        },
        {
          kind: "check",
          prompt: "Booth's algorithm ends when…",
          options: [
            "A becomes zero",
            "the count register reaches 0",
            "Q becomes negative",
            "an overflow occurs",
          ],
          answer: 1,
          praise:
            "Right — one cycle per bit, counted down to zero. Finiteness by construction: the count register is the algorithm's guarantee it stops.",
        },
      ],
    },
  ],
};

const sectionU5: Section = {
  id: "ca-sec-u5",
  letter: "E",
  title: "Input-Output Organization",
  tagline: "How the fast CPU talks to a slow, unruly outside world.",
  unit: 5,
  topics: [
    {
      id: "ca-rev-control",
      title: "Quick review: program control",
      unit: 5,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-program-control"], count: 5 },
      deps: ["ca-program-control"],
      whyItMatters:
        "Interrupt-driven I/O is program control applied to devices — a warm-up before Unit 5 leans on it.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-peripherals",
      title: "Peripheral devices",
      unit: 5,
      weight: "light",
      deps: ["ca-rev-control"],
      whyItMatters:
        "Quick CO5 definitions — and 'Note on peripheral devices' opens a 10-mark Part B question on your sample paper.",
      recap: [
        "A peripheral is any device connected to the computer but not part of the core architecture — it puts information in or gets it out.",
        "Three types: input devices (keyboard, mouse), output devices (monitor, printer), storage devices (hard drive, flash drive).",
        "Devices under the computer's direct control are said to be connected ONLINE.",
        "Printers: impact vs non-impact. Monitors: CRT (old) vs LCD (modern). Hard disk: non-volatile secondary storage, magnetic platters.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Everything around the core",
          body: "A **peripheral** is \"any auxiliary device that connects to and works with the computer to either put information into it or get information out of it\" — connected, but **not part of the core architecture**.\n\nThree families:\n\n**Input** — keyboard, mouse, optical readers (bar code, OMR), touch screens.\n**Output** — monitor (CRT then, LCD now), printers (**impact vs non-impact**), plotters.\n**Storage** — hard drives (non-volatile, magnetic platters, SATA/SCSI), flash drives.\n\nOne definition worth quoting: devices under the computer's direct control are **connected online**.",
        },
        {
          kind: "check",
          prompt: "Which trio correctly lists the three peripheral types?",
          options: [
            "input, output, storage",
            "RAM, ROM, cache",
            "CPU, ALU, registers",
            "serial, parallel, wireless",
          ],
          answer: 0,
          praise:
            "Right — in, out, and keep. That's the frame for the Part B 'note on peripheral devices' answer too.",
        },
        {
          kind: "check",
          prompt: "A hard disk drive is best described as…",
          options: [
            "volatile main memory",
            "a non-volatile secondary storage device using magnetic platters",
            "a cache",
            "an input-only device",
          ],
          answer: 1,
          praise:
            "Exactly — permanent, magnetic, secondary. 'Non-volatile' is the keyword the marker looks for.",
        },
      ],
    },
    {
      id: "ca-io-interface",
      title: "The I/O interface & I/O bus",
      unit: 5,
      weight: "heavy",
      deps: ["ca-peripherals"],
      whyItMatters:
        "CO5's centrepiece: WHY an interface is needed, its functions, and the four I/O commands — asked as MCQ and 10-mark forms alike.",
      recap: [
        "The I/O interface transfers information between internal storage and external devices, resolving the DIFFERENCES between them.",
        "Four differences: peripherals are electromechanical (CPU is electronic — signal conversion needed); slower (synchronisation needed); byte-oriented (CPU uses words); asynchronous (CPU is synchronous).",
        "Main functions: data conversion, synchronization, device selection.",
        "The I/O bus = data lines + address lines + control lines; the processor puts a device address on the bus to pick a peripheral.",
        "Four I/O commands: control (activate/tell device what to do), status (test conditions), data output, data input.",
        "Bus configurations: separate memory & I/O buses · one common bus with separate control lines · one common bus with common control lines.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Why an interface must exist",
          body: "The CPU can't wire straight into a printer — they're **different species**. The interface exists to resolve four mismatches:\n\n**Nature of signals** — peripherals are electromechanical/electromagnetic; the CPU is electronic → signal **conversion** required.\n**Speed** — peripherals are much **slower** → synchronisation needed.\n**Unit of information** — peripherals speak **bytes**; CPU/memory speak **words**.\n**Operating mode** — peripherals are autonomous and **asynchronous**; the CPU is synchronous.\n\nSo interface units sit between the processor bus and each peripheral, doing **data conversion, synchronization, and device selection**.",
        },
        {
          kind: "teach",
          title: "The bus and its four commands",
          body: "The **I/O bus** linking processor to peripherals carries **data lines, address lines and control lines**. To talk to one device, the processor places its **device address** on the address lines; each interface decodes the address, decodes the command, and supervises the transfer.\n\nThe control lines carry four **I/O commands**:\n\n**Control** — activate the peripheral, tell it what to do.\n**Status** — test conditions in the interface and device.\n**Data output** — interface takes data from the bus into its register.\n**Data input** — the reverse: device data onto the bus.\n\nAnd memory vs I/O can share wiring three ways: **two separate buses** · **one common bus, separate control lines** · **one common bus, common control lines**.",
        },
        {
          kind: "check",
          prompt: "Which is NOT a role of the I/O interface? (from your sample paper)",
          options: [
            "Data conversion between formats",
            "Managing communication between devices",
            "Connecting the CPU to RAM",
            "Generating control signals for peripherals",
          ],
          answer: 2,
          praise:
            "Banked — CPU↔RAM is the MEMORY bus's job; the I/O interface faces peripherals. The other three are its actual functions, verbatim from the slides.",
        },
        {
          kind: "check",
          prompt: "Why does peripheral speed force an interface to exist?",
          options: [
            "Peripherals are faster than the CPU",
            "Peripherals are much slower, so transfers need a synchronisation mechanism",
            "Speed is irrelevant",
            "The CPU has no clock",
          ],
          answer: 1,
          praise:
            "Right — a mismatch in pace needs a mediator. Being able to name all four mismatches (signals, speed, unit, mode) is the full-marks version.",
        },
        {
          kind: "check",
          prompt: "Which I/O command asks the interface about flag conditions in the device?",
          options: ["Control", "Status", "Data output", "Data input"],
          answer: 1,
          praise:
            "Status — the 'how are you doing?' command. You'll see it star in programmed I/O's polling loop, next lesson.",
        },
      ],
    },
    {
      id: "ca-async-transfer",
      title: "Asynchronous transfer: strobe & handshaking",
      unit: 5,
      weight: "heavy",
      deps: ["ca-io-interface"],
      whyItMatters:
        "Strobe-vs-handshaking (and why handshaking wins) is CO5's classic compare-and-explain — the sample paper tests async transfer twice.",
      recap: [
        "Asynchronous transfer is used when device and processor speeds don't match and timing isn't predictable.",
        "Key feature (per the paper): each data unit is sent with a start and stop signal — no shared clock.",
        "STROBE: a single control line times each transfer; either source or destination can activate it.",
        "Strobe's flaw: the initiator never knows whether the other side actually received/supplied the data.",
        "HANDSHAKING fixes it with a second control line: data valid (source→dest) + data accepted / ready for data (dest→source).",
        "Synchronous transfer, by contrast, requires a shared clock between sender and receiver.",
      ],
      steps: [
        {
          kind: "teach",
          title: "One wire: the strobe",
          body: "When CPU and device can't share a clock, transfers go **asynchronous** — each transfer is timed explicitly.\n\nThe simplest scheme is the **strobe**: a **single control line**. The source places data on the bus, waits for it to settle, then pulses the strobe; the destination grabs the data while the pulse is active. (Destination-initiated works too: it strobes to *request* data.)\n\nThe flaw the exam wants you to name: **the initiator has no way of knowing the other unit actually responded**. The source can't tell the destination received it; a requesting destination can't tell the source delivered.",
        },
        {
          kind: "teach",
          title: "Two wires: handshaking",
          body: "**Handshaking** adds a **second control line that replies**:\n\n**Data valid** (source → destination): \"there is real data on the bus.\"\n**Data accepted / ready for data** (destination → source): \"I took it\" / \"I'm ready.\"\n\nSequence: source places data, raises *data valid*; destination accepts, raises *data accepted*; source drops its signal; system returns to start. Every transfer is **confirmed** — the strobe's blindness cured.\n\nContrast for the paper: **synchronous** transfer needs a **shared clock between sender and receiver**; asynchronous sends each unit with **start and stop signalling** instead.",
        },
        {
          kind: "check",
          prompt: "The key feature of asynchronous transfer (per your sample paper) is…",
          options: [
            "it requires a clock signal",
            "each data unit is sent with a start and stop bit",
            "data speed is fixed",
            "it only works for memory",
          ],
          answer: 1,
          praise:
            "Straight off the paper — no shared clock, so each unit carries its own timing. Its twin question ('synchronous requires a shared clock') is now also yours.",
        },
        {
          kind: "check",
          prompt: "What problem does handshaking solve that the strobe has?",
          options: [
            "The strobe is too slow",
            "The initiator never knows whether the other unit actually responded — handshaking adds a confirming reply line",
            "The strobe needs three wires",
            "Nothing — they're identical",
          ],
          answer: 1,
          praise:
            "That's the whole compare-and-contrast in one sentence — one line commands, the second line confirms. Ten-mark answer, compressed.",
        },
      ],
    },
    {
      id: "ca-transfer-modes",
      title: "Modes of transfer: programmed I/O, interrupts, DMA",
      unit: 5,
      weight: "heavy",
      deps: ["ca-io-interface", "ca-program-control"],
      whyItMatters:
        "The three modes + DMA's bus-borrowing + daisy-chain priority are CO5's biggest block — and 'which is NOT a transfer mode' is literally on the paper.",
      recap: [
        "Three modes: Programmed I/O, Interrupt-initiated I/O, Direct Memory Access (DMA). ('Bus communication' is the paper's fake option.)",
        "Programmed I/O: CPU polls — read status, check flag (loop if not set), read data. Drawback: CPU wastes time busy-waiting.",
        "Interrupt-initiated: CPU works on; the device raises an interrupt when ready; CPU saves its place (stack), runs the service routine, returns.",
        "Priority interrupts decide who's served first (fast devices higher); daisy chaining passes INTACK through PI/PO — the device with PI=1, PO=0 wins and puts its vector address (VAD) on the bus.",
        "DMA: the controller temporarily borrows the address/data/control buses and moves data directly between device and memory, bypassing the CPU. An IOP is a processor dedicated to I/O.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Polling: programmed I/O",
          body: "**Programmed I/O** puts the CPU in charge of everything. The transfer takes three instructions, on a loop:\n\n1. **Read the status register.**\n2. **Check the flag** — not set? branch back to step 1. Set? continue.\n3. **Read the data register.**\n\nThe drawback writes itself: the CPU **stays in that loop**, monitoring constantly — \"CPU time is wasted a lot keeping an eye on the interface.\" Fixing that waste is why interrupts exist.",
        },
        {
          kind: "teach",
          title: "Interrupts and priority",
          body: "**Interrupt-initiated I/O** frees the CPU: it works on its task, **doesn't check any flag**, and when a device wants attention it raises an **interrupt**. The CPU stores the return address from the PC (on the stack), branches to the service routine, then returns.\n\nMany devices can interrupt — so a **priority interrupt** system (software or hardware) decides who's first; **fast devices get high priority**.\n\nHardware's elegant version is **daisy chaining**: highest-priority device sits first in line; the CPU's INTACK signal enters each device's **PI** (priority in). A device that requested attention keeps the signal (sets **PO = 0**) and puts its **vector address (VAD)** on the bus; otherwise it passes PI along. **The winner is the device with PI = 1 and PO = 0.**",
        },
        {
          kind: "teach",
          title: "DMA: get the CPU out of the way",
          body: "For bulk data, even interrupts are too slow — **Direct Memory Access** hands the job to hardware. The **DMA controller** \"temporarily **borrows the address bus, data bus and control bus** from the microprocessor and transfers data bytes **directly** between an I/O port and memory.\"\n\nCPU and controller share the system bus; the CPU sets up the transfer, then steps aside.\n\nOne rung higher sits the **I/O Processor (IOP)** — a processor dedicated entirely to input-output, managing transfers so the CPU never has to.",
        },
        {
          kind: "check",
          prompt: "Which is NOT a mode of data transfer? (your sample paper's Q3)",
          options: [
            "Programmed I/O",
            "Direct Memory Access (DMA)",
            "Memory-mapped I/O",
            "Bus communication",
          ],
          answer: 3,
          praise:
            "Banked — 'bus communication' is the invented option. Programmed, interrupt-initiated, and DMA are the canonical three.",
        },
        {
          kind: "check",
          prompt: "The main drawback of programmed I/O is that…",
          options: [
            "it needs a DMA controller",
            "the CPU busy-waits in a polling loop, wasting time",
            "data is lost",
            "it can't read status",
          ],
          answer: 1,
          praise:
            "Right — the CPU becomes a full-time flag-watcher. Say 'busy-waiting' and then name interrupts as the cure: that's the full answer.",
        },
        {
          kind: "check",
          prompt: "In daisy chaining, the interrupting device that gets served is the one with…",
          options: ["PI = 0, PO = 1", "PI = 1, PO = 0", "PI = PO = 1", "the largest VAD"],
          answer: 1,
          praise:
            "Exactly — acknowledged (PI=1) and blocking those behind it (PO=0), with its vector address on the bus. That one condition is the whole circuit in four symbols.",
        },
        {
          kind: "check",
          prompt: "During a DMA transfer, data moves…",
          options: [
            "through the CPU's registers",
            "directly between the I/O device and memory, over buses borrowed from the CPU",
            "only into cache",
            "one bit per interrupt",
          ],
          answer: 1,
          praise:
            "Right — the controller borrows the buses and the CPU steps aside. 'Independently of the CPU' is the phrase that defines DMA.",
        },
      ],
    },
  ],
};

const sectionU6: Section = {
  id: "ca-sec-u6",
  letter: "F",
  title: "Memory Organization",
  tagline: "From registers to disks — and the cache tricks that make it feel fast.",
  unit: 6,
  topics: [
    {
      id: "ca-rev-io",
      title: "Quick review: I/O transfer",
      unit: 6,
      weight: "light",
      kind: "review",
      review: { topicIds: ["ca-async-transfer", "ca-transfer-modes"], count: 5 },
      deps: ["ca-transfer-modes"],
      whyItMatters:
        "Strobe, handshake, DMA — five questions so Unit 5 stays green while you climb Unit 6.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-mem-hierarchy",
      title: "The memory hierarchy",
      unit: 6,
      weight: "heavy",
      deps: ["ca-rev-io"],
      whyItMatters:
        "CO6's anchor: the hierarchy's order, why it exists, and the access methods — the paper asks both 'purpose' and 'fastest level'.",
      recap: [
        "Volatile memory loses data at power-off; non-volatile keeps it.",
        "Hierarchy (fast/small/costly → slow/big/cheap): CPU registers → cache → main memory → auxiliary memory.",
        "Purpose: increase effective memory access speed at reasonable cost.",
        "Auxiliary access time is ~1000× main memory's; main memory talks directly to CPU; cache holds what the CPU is using right now.",
        "Access methods: random (any location, equal time — main memory), sequential (in order — tape), direct (tracks with read/write heads — disk).",
        "Terms: access time (reach + get contents), seek time (position the head), transfer time (move the data).",
      ],
      steps: [
        {
          kind: "teach",
          title: "A pyramid of trade-offs",
          body: "Memory is a **hierarchy** because no single technology is fast, big AND cheap. From top to bottom:\n\n**CPU registers** — fastest, tiniest.\n**Cache** — small, very fast, holds what's executing right now.\n**Main memory (RAM)** — the central unit, talking **directly** to the CPU.\n**Auxiliary memory** — disks and tapes: huge, non-volatile, and about **1000× slower** than main memory.\n\nThe **purpose** (paper question): **increase effective memory access speed** — keep the hot data high in the pyramid. Programs not in use get pushed down to auxiliary; needed ones come up.",
        },
        {
          kind: "teach",
          title: "Three ways to reach data",
          body: "**Access methods**, one per technology:\n\n**Random access** — every location has a unique address, reachable in the **same time, any order** (main memory).\n**Sequential access** — walk through in order until you arrive (magnetic tape).\n**Direct access** — jump to a track, then search within it; tracks have read/write heads (disks).\n\nAnd the timing vocabulary: **access time** (reach a location and get its contents), **seek time** (position the read/write head), **transfer time** (move the data).",
        },
        {
          kind: "check",
          prompt: "Fastest level of the memory hierarchy? (paper question)",
          options: ["Main memory", "CPU registers", "Cache", "Auxiliary memory"],
          answer: 1,
          praise:
            "Registers — inside the CPU itself, above even cache. The paper asks exactly this; the pyramid's order is the answer to half of CO6.",
        },
        {
          kind: "check",
          prompt: "The purpose of the memory hierarchy is to…",
          options: [
            "increase effective memory access speed",
            "minimise data storage",
            "reduce CPU processing",
            "replace the CPU",
          ],
          answer: 0,
          praise:
            "Right — speed, delivered economically by layering fast-small over slow-big. Another verbatim paper question in the bank.",
        },
        {
          kind: "check",
          prompt: "Magnetic tape uses which access method?",
          options: ["Random", "Sequential", "Direct", "Associative"],
          answer: 1,
          praise:
            "Sequential — you fast-forward through everything before it. Match each method to its device and this whole question family falls.",
        },
      ],
    },
    {
      id: "ca-main-memory",
      title: "Main memory: RAM & ROM",
      unit: 6,
      weight: "medium",
      deps: ["ca-mem-hierarchy"],
      whyItMatters:
        "The RAM-vs-ROM table and the chip diagrams (128×8 RAM, 512-byte ROM) are Unit 6's most concrete marks — and the paper asks where the boot program lives.",
      recap: [
        "Main memory = RAM: the central storage the CPU accesses directly; volatile; read AND write; holds OS, apps, working data.",
        "RAM comes as Static RAM and Dynamic RAM.",
        "ROM: non-volatile, read-only; holds the BOOTSTRAP LOADER — the program that boots the computer.",
        "RAM chip 128×8: 128 words of 8 bits, 7-bit address bus (2⁷=128), bidirectional data bus, chip-select (CS) enables it, RD/WR lines.",
        "ROM chip: output-only data bus, no write control; denser cells — 512 bytes needs 9 address lines (2⁹=512).",
      ],
      steps: [
        {
          kind: "teach",
          title: "The working memory and the boot memory",
          body: "**RAM** (random access memory) is main memory: the CPU reaches any location directly, **reads and writes**, and everything vanishes at power-off (**volatile**). Two builds: **Static RAM** and **Dynamic RAM**.\n\n**ROM** (read-only memory) is the opposite deal: **non-volatile**, read-only, and it holds the **bootstrap loader** — the program that brings the computer to life when switched on. That's the paper's trick: the boot program lives in **ROM**, not RAM.",
        },
        {
          kind: "teach",
          title: "Reading the chip diagrams",
          body: "The slides' two chips, decoded:\n\n**RAM chip, 128 × 8** — 128 words of 8 bits each. Address bus: **7 bits** (2⁷ = 128). Data bus: **bidirectional** (read and write), with **RD/WR** control lines and **chip select (CS)** inputs that enable the chip only when the processor picks it.\n\n**ROM chip, 512 × 8** — data bus is **output-only** (no write line needed), and because ROM cells are **smaller than RAM cells**, the same-size chip holds more: 512 bytes, needing **9 address lines** (2⁹ = 512).",
        },
        {
          kind: "check",
          prompt: "Where are the boot files / bootstrap program held? (paper question)",
          options: ["RAM", "ROM", "Cache", "A register"],
          answer: 1,
          praise:
            "ROM — it must survive power-off to boot the machine, so volatile RAM can't hold it. 'Bootstrap loader in ROM' is the phrase to write.",
        },
        {
          kind: "check",
          prompt: "A 128×8 RAM chip needs how many address lines?",
          options: ["8", "7", "128", "16"],
          answer: 1,
          praise:
            "2⁷ = 128 — seven lines pick the word, eight data lines carry it. The same math gives ROM's 9 lines for 512 bytes; one formula, both chips.",
        },
        {
          kind: "check",
          prompt: "Why can a ROM chip store more than a RAM chip of the same size?",
          options: [
            "ROM is newer technology",
            "ROM's internal binary cells occupy less space than RAM's",
            "ROM uses 16-bit words",
            "It can't — RAM is denser",
          ],
          answer: 1,
          praise:
            "Right — simpler cells, tighter packing: 512 bytes of ROM beside 128 of RAM. A one-line 'why' the slides state outright.",
        },
      ],
    },
    {
      id: "ca-cache",
      title: "Cache memory & mapping",
      unit: 6,
      weight: "heavy",
      deps: ["ca-mem-hierarchy"],
      whyItMatters:
        "Cache + hit ratio + the three mappings is a 10-mark Part B question on your sample paper, word for word.",
      recap: [
        "Cache stores the main-memory contents the CPU uses again and again; CPU checks cache FIRST, then main memory on a miss (recent blocks get pulled in, old ones evicted).",
        "Hit = word found in cache; miss = not found. Hit ratio = hits / (hits + misses).",
        "Direct mapping: each memory block maps to exactly ONE cache line; address splits into tag (upper bits, stored) + index (lower bits, selects the line); compare tags to detect hit.",
        "Fully associative: a block can sit in ANY line (cache stores address+data) — flexible but needs costly compare-all circuitry, plus replacement policies.",
        "Set-associative: the compromise — cache divided into sets, K lines per set (K-way); direct-map to the set, search only within it.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The fast copy in front",
          body: "**Cache** keeps \"the data or contents of main memory that are used **again and again** by the CPU.\" Every memory access checks the **cache first**; only a miss goes on to main memory — and recent blocks get copied in, old ones deleted to make room.\n\nPerformance has one number: the **hit ratio**.\n\n`Hit Ratio = Hits / (Hits + Misses)`\n\nFind the word in cache → **hit**. Don't → **miss**, and the slow trip to main memory happens.",
        },
        {
          kind: "teach",
          title: "Three ways to map memory onto cache",
          body: "Where may a memory block sit in the cache? Three answers:\n\n**Direct mapping** — each block maps to exactly **one** line. The address splits into a **tag** (upper bits, stored with the data) and an **index** (lower bits, selects the line). Access: index picks the line, stored tag is compared with the address tag — equal = hit, else miss.\n\n**Fully associative** — a block can load into **any** line; the cache stores address + data together. Maximum flexibility, but it needs circuitry to compare **all tags simultaneously** — lots of hardware, high cost — plus a replacement policy.\n\n**Set-associative** — the compromise: cache divided into **sets** with **K lines each** (K-way). Direct-map to the set, then search just that set's K tags. Two lines per set = 2-way.",
        },
        {
          kind: "check",
          prompt: "With 80 hits out of 100 memory references, the hit ratio is…",
          options: ["80/20", "0.8", "1.25", "20%"],
          answer: 1,
          praise:
            "Hits over total references: 80/100 = 0.8. Plug-and-compute — the formula is the entire question.",
        },
        {
          kind: "check",
          prompt: "In DIRECT mapping, a given memory block can live in…",
          options: [
            "any cache line",
            "exactly one specific cache line",
            "any line of one set",
            "the tag register",
          ],
          answer: 1,
          praise:
            "One block, one home — simplest and cheapest, at the price of collisions. Fully associative is 'anywhere', set-associative is 'anywhere within its set': that ladder is the Part B answer.",
        },
        {
          kind: "check",
          prompt: "Why is fully associative mapping expensive?",
          options: [
            "It wastes half the cache",
            "It needs circuitry to compare all tags simultaneously",
            "It can't store data",
            "It requires two caches",
          ],
          answer: 1,
          praise:
            "Exactly — total freedom means searching everywhere at once, and that's silicon. Set-associative exists precisely to shrink that search to one set.",
        },
      ],
    },
    {
      id: "ca-assoc-virtual",
      title: "Associative & virtual memory",
      unit: 6,
      weight: "medium",
      deps: ["ca-cache"],
      whyItMatters:
        "CAM's search-by-content and virtual memory's pages/page-fault story close out CO6 — definitions the exam asks straight.",
      recap: [
        "Associative memory = Content Addressable Memory (CAM): retrieved by matching CONTENT, not by address; slower than RAM, rarely mainstream.",
        "CAM parts: argument register (word to search), key register (mask choosing which field to compare), match register (one bit per word, set to 1 on match), the m×n memory array compared in parallel.",
        "Virtual memory gives the illusion of a very large memory using a small main memory — easing programming, enabling multiprogramming and protection.",
        "OS divides memory into fixed-size PAGES (e.g. 4KB); some in RAM, others on disk (swap space); accessing a page not in RAM causes a PAGE FAULT and the OS loads it from disk.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Memory you search by content",
          body: "**Associative memory** — also called **Content Addressable Memory (CAM)** — flips the usual deal: you retrieve items \"by matching some part of their **content**, rather than by specifying their address.\"\n\nIts machinery: the **argument register** holds the word to search for; the **key register** masks which field of it to compare; the array compares **all m words in parallel**; and the **match register** (one bit per word) sets a 1 for every match.\n\nHonesty note from the slides: CAM is much **slower than RAM** and rare in mainstream designs — but its parallel-compare idea is exactly what cache tag-matching borrows.",
        },
        {
          kind: "teach",
          title: "The illusion of infinite memory",
          body: "**Virtual memory** \"gives programmers the illusion that they have a very large memory even though the computer has a small main memory.\" Why: run programs **bigger than RAM**, allow **multiprogramming**, provide **protection and isolation**, and free the programmer from worrying about physical memory.\n\nHow it works, in four beats:\n\n1. The OS divides memory into **pages** — fixed-size blocks, e.g. **4 KB**.\n2. Some pages live in RAM; the rest wait on disk (**swap space / page file**).\n3. A program touches a page not in RAM → **page fault**.\n4. The OS **loads that page from disk** into RAM and the program carries on, unaware.",
        },
        {
          kind: "check",
          prompt: "Content Addressable Memory is retrieved by…",
          options: [
            "its physical address",
            "matching part of the stored content",
            "sequential scanning",
            "the program counter",
          ],
          answer: 1,
          praise:
            "That's the defining sentence — content in, matches out, address never mentioned. 'Also called associative memory/CAM' earns the alias mark.",
        },
        {
          kind: "check",
          prompt: "A page fault occurs when…",
          options: [
            "RAM is switched off",
            "a program accesses a page that isn't currently in RAM",
            "the cache misses",
            "a page is printed",
          ],
          answer: 1,
          praise:
            "Right — the illusion briefly slips, the OS fetches the page from swap, and execution resumes. Fault → load → continue: the whole mechanism in three words.",
        },
      ],
    },
  ],
};

const examBank: ExamQuestion[] = [
  // ---- Unit 1 (CO1) ----
  {
    id: "ca-u1q1", topicId: "ca-number-systems", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "The base (radix) of the hexadecimal number system is…",
    options: ["8", "10", "16", "2"], answer: 2,
    hint: "Count its symbols: 0–9 and A–F.",
    explanation: "Hexadecimal uses sixteen symbols (0–9, A–F), so its base is 16.",
  },
  {
    id: "ca-u1q2", topicId: "ca-number-systems", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "Which group of bits is called a byte?",
    options: ["2 bits", "4 bits", "8 bits", "16 bits"], answer: 2,
    hint: "A nibble is half of it.",
    explanation: "A byte is 8 bits; a nibble is 4. MSB/LSB name its end bits.",
  },
  {
    id: "ca-u1q3", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(1101)₂ equals which decimal number?",
    options: ["11", "13", "14", "9"], answer: 1,
    hint: "Place values from the right: 1, 2, 4, 8.",
    explanation: "8 + 4 + 0 + 1 = 13 — multiply each bit by its power of 2 and add.",
  },
  {
    id: "ca-u1q4", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(124)₈ in decimal is…",
    options: ["84", "124", "96", "72"], answer: 0,
    hint: "Powers of 8: 64, 8, 1.",
    explanation: "1×64 + 2×8 + 4×1 = 84. Same place-value method, base 8.",
  },
  {
    id: "ca-u1q5", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "Converting binary to octal uses groups of…",
    options: ["4 bits from the left", "3 bits from the right", "8 bits", "2 bits"], answer: 1,
    hint: "8 = 2³.",
    explanation: "Each octal digit covers exactly 3 bits (2³ = 8), grouped from the LSB end with left padding.",
  },
  {
    id: "ca-u1q6", topicId: "ca-complements", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "The 2's complement of 01100 is…",
    options: ["10011", "10100", "01101", "11100"], answer: 1,
    hint: "Flip everything, then add 1.",
    explanation: "1's complement 10011, plus 1 gives 10100. Flip-then-add-one, always.",
  },
  {
    id: "ca-u1q7", topicId: "ca-complements", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "In signed binary the sign bit is…",
    options: [
      "the rightmost bit; 1 means positive",
      "the leftmost bit; 0 means positive and 1 means negative",
      "always the second bit",
      "not stored",
    ], answer: 1,
    hint: "MSB territory.",
    explanation: "The leftmost (most significant) bit carries the sign: 0 positive, 1 negative.",
  },
  {
    id: "ca-u1q8", topicId: "ca-fixed-floating", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "Floating point beats fixed point because it offers…",
    options: [
      "only more range",
      "only more precision",
      "both good range and good precision, by moving the radix point",
      "simpler hardware",
    ], answer: 2,
    hint: "Mass of the Earth AND mass of an atom.",
    explanation: "Shifting the point trades range and precision dynamically — fixed point freezes both at design time.",
  },
  {
    id: "ca-u1q9", topicId: "ca-fixed-floating", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "For 10.625 in IEEE 754 single precision, the stored exponent bits are 10000010 because…",
    options: [
      "the exponent 3 is biased by +127, giving 130",
      "10.625 rounds to 130",
      "the mantissa is 130 bits",
      "the sign bit is 130",
    ], answer: 0,
    hint: "Normalized as 1.010101 × 2³ — then what does the standard add to the 3?",
    explanation: "IEEE 754 stores exponent + 127: 3 + 127 = 130 = 10000010₂.",
  },
  {
    id: "ca-u1q10", topicId: "ca-codes", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "Which code changes only one bit between consecutive values?",
    options: ["BCD", "Excess-3", "Gray code", "ASCII"], answer: 2,
    hint: "It's called a unit-distance code.",
    explanation: "Gray code is the unit-distance, cyclic code — one bit per step, which encoders rely on.",
  },
  {
    id: "ca-u1q11", topicId: "ca-codes", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(45)₁₀ in BCD is…",
    options: ["101101", "0100 0101", "0101 0100", "1000 0100"], answer: 1,
    hint: "Each decimal digit gets its own 4 bits.",
    explanation: "4 → 0100 and 5 → 0101, digit by digit: 0100 0101. BCD never converts the number as a whole.",
  },
  // ---- Unit 2 (CO2 / CO3) ----
  {
    id: "ca-u2q1", topicId: "ca-cpu-instructions", unit: 2, co: "CO3", level: "L1", source: "generated",
    prompt: "The three categories of computer instructions are…",
    options: [
      "input, output, storage",
      "data transfer, data manipulation, program control",
      "fetch, decode, execute",
      "add, shift, jump",
    ], answer: 1,
    hint: "Move it, compute on it, or decide what runs next.",
    explanation: "Transfer moves data unchanged, manipulation computes, program control steers execution.",
  },
  {
    id: "ca-u2q2", topicId: "ca-data-manipulation", unit: 2, co: "CO3", level: "L1", source: "generated",
    prompt: "The three basic types of data manipulation instruction are…",
    options: [
      "arithmetic, logical/bit manipulation, shift",
      "load, store, move",
      "branch, call, return",
      "and, or, not",
    ], answer: 0,
    hint: "One computes, one does bitwise logic, one slides bits sideways.",
    explanation: "Arithmetic (+−×÷), logical/bit operations on registers, and shifts — the computational trio.",
  },
  {
    id: "ca-u2q3", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "Direct addressing needs how many memory references to fetch the operand?",
    options: ["0", "1", "2", "3"], answer: 1,
    hint: "The address field already IS the effective address.",
    explanation: "One reference: go straight to the address given. Indirect needs two; register direct none.",
  },
  {
    id: "ca-u2q4", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "Which mode keeps the operand INSIDE the instruction itself?",
    options: ["Immediate", "Direct", "Register indirect", "Implied"], answer: 0,
    hint: "MOV R #20.",
    explanation: "Immediate mode replaces the address field with an operand field — the constant travels with the instruction.",
  },
  {
    id: "ca-u2q5", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "In a stack-organized computer, zero-address instructions like ADD use which addressing mode?",
    options: ["Direct", "Immediate", "Implied (stack) addressing", "Indexed"], answer: 2,
    hint: "Where do the two operands silently come from?",
    explanation: "The operands are implied to be the top two stack items — popped, added, and the result pushed back.",
  },
  {
    id: "ca-u2q6", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "Register indirect addressing fetches the operand from…",
    options: [
      "the register itself",
      "memory, at the address held in the register",
      "the instruction",
      "the stack",
    ], answer: 1,
    hint: "The register is a signpost.",
    explanation: "The register supplies the effective address; one memory reference follows it to the operand.",
  },
  {
    id: "ca-u2q7", topicId: "ca-control-word", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "A control word encodes…",
    options: [
      "the program's source code",
      "the control signals for an instruction's micro-operations (opcode, sources, dest, ALU op, flags)",
      "only the operand values",
      "the clock speed",
    ], answer: 1,
    hint: "Fetch, decode, execute, write back — something must drive each step.",
    explanation: "The control word bundles the signals steering each micro-operation: which registers, which ALU operation, whether flags update.",
  },
  {
    id: "ca-u2q8", topicId: "ca-control-word", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "With ALU control codes 000 AND, 001 OR, 010 ADD, 011 SUB — the code 011 makes the ALU…",
    options: ["add", "subtract", "OR", "multiply"], answer: 1,
    hint: "Read it straight off the table.",
    explanation: "011 selects subtraction. Decoding these small fields against the table is the standard control-word exercise.",
  },
  // ---- Unit 4 (CO4) ----
  {
    id: "ca-u4q1", topicId: "ca-add-sub", unit: 4, co: "CO4", level: "L2", source: "generated",
    prompt: "Computers subtract B from A by…",
    options: [
      "a dedicated subtraction circuit",
      "adding the 2's complement of B to A",
      "swapping the operands",
      "repeated decrement",
    ], answer: 1,
    hint: "One adder, two jobs.",
    explanation: "A − B = A + (2's complement of B) — the complement trick lets one parallel adder do both operations.",
  },
  {
    id: "ca-u4q2", topicId: "ca-add-sub", unit: 4, co: "CO4", level: "L2", source: "generated",
    prompt: "(+10) + (+3) in 5-bit signed binary (0 1010 + 0 0011) equals…",
    options: ["0 1101", "1 1101", "0 1011", "1 0111"], answer: 0,
    hint: "Add the magnitudes; the sign bit stays 0.",
    explanation: "01010 + 00011 = 01101 = +13, sign bit 0 throughout.",
  },
  {
    id: "ca-u4q3", topicId: "ca-addsub-hw", unit: 4, co: "CO4", level: "L2", source: "generated",
    prompt: "In the add/subtract hardware, mode control M = 0 makes the circuit output…",
    options: ["A − B", "A + B", "B − A", "A + B' + 1"], answer: 1,
    hint: "M = 0 passes B through unchanged with carry-in 0.",
    explanation: "M=0: plain B and carry 0 → A + B. M=1 complements B with carry 1 → A − B.",
  },
  {
    id: "ca-u4q4", topicId: "ca-addsub-hw", unit: 4, co: "CO4", level: "L1", source: "generated",
    prompt: "Which flip-flop receives the adder's output carry?",
    options: ["AVF", "E", "As", "M"], answer: 1,
    hint: "AVF is busy holding the overflow.",
    explanation: "E stores the output carry; AVF holds the overflow bit; As/Bs are the sign flip-flops.",
  },
  {
    id: "ca-u4q5", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L2", source: "generated",
    prompt: "In Booth's algorithm, the bit pair 01 triggers…",
    options: [
      "shift only",
      "add the multiplicand to A, then shift",
      "subtract the multiplicand, then shift",
      "end of algorithm",
    ], answer: 1,
    hint: "10 is the subtractor; what's its mirror?",
    explanation: "01 adds M to A before the arithmetic right shift; 10 subtracts; 00/11 only shift.",
  },
  {
    id: "ca-u4q6", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L1", source: "generated",
    prompt: "Booth's algorithm is designed to multiply…",
    options: [
      "unsigned numbers only",
      "signed numbers in 2's complement representation",
      "BCD numbers",
      "floating point numbers",
    ], answer: 1,
    hint: "Invented in 1951 precisely for signed arithmetic.",
    explanation: "Booth (1951) multiplies signed 2's-complement operands directly, with fewer additions via shift runs.",
  },
  {
    id: "ca-u4q7", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L1", source: "generated",
    prompt: "Basic signed-magnitude binary multiplication is performed by successive…",
    options: [
      "divide and conquer",
      "shift and add operations",
      "complement and swap",
      "compare and branch",
    ], answer: 1,
    hint: "Long multiplication, base 2.",
    explanation: "Each multiplier bit contributes a shifted copy of the multiplicand — shift-and-add is the whole method.",
  },
  // ---- Unit 3 (CO3) ----
  {
    id: "ca-u3q1", topicId: "ca-stack-org", unit: 3, co: "CO3", level: "L1", source: "generated",
    prompt: "A stack follows which order?",
    options: ["FIFO", "LIFO", "Random", "Priority"], answer: 1,
    hint: "Think of a stack of plates.",
    explanation: "Last In, First Out — only the top is accessible, via PUSH and POP.",
  },
  {
    id: "ca-u3q2", topicId: "ca-stack-org", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "During a subroutine CALL, the return address is stored…",
    options: ["in the ALU", "on the stack", "in ROM", "in the cache"], answer: 1,
    hint: "It must come back off in LIFO order when RET runs.",
    explanation: "CALL pushes the return address onto the stack; RET pops it — nested calls unwind correctly because of LIFO.",
  },
  {
    id: "ca-u3q3", topicId: "ca-rpn", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "The RPN (postfix) form of (A + B) is…",
    options: ["+ A B", "A B +", "A + B", "B A -"], answer: 1,
    hint: "Operator after the operands.",
    explanation: "Postfix places the operator last: A B +. No parentheses are ever needed.",
  },
  {
    id: "ca-u3q4", topicId: "ca-instr-formats", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "ADD A, B (result overwrites A) is which instruction format?",
    options: ["Zero-address", "One-address", "Two-address", "Three-address"], answer: 2,
    hint: "Count the named operands.",
    explanation: "Two named operands with the result replacing one — the two-address format of general-register machines.",
  },
  {
    id: "ca-u3q5", topicId: "ca-instr-formats", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "Zero-address instructions are natural on…",
    options: [
      "accumulator machines",
      "stack-based CPUs like the JVM",
      "three-address RISC machines",
      "DMA controllers",
    ], answer: 1,
    hint: "Where do their operands implicitly come from?",
    explanation: "With operands implicit on the stack, no addresses are needed — the JVM and HP calculators work this way.",
  },
  {
    id: "ca-u3q6", topicId: "ca-program-control", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "A conditional branch like JNZ decides using…",
    options: ["the stack pointer", "the flags register", "the DMA controller", "ROM"], answer: 1,
    hint: "Zero, Carry, Sign, Overflow.",
    explanation: "Condition codes in the flags register, set by earlier operations, steer conditional jumps.",
  },
  {
    id: "ca-u3q7", topicId: "ca-program-control", unit: 3, co: "CO3", level: "L1", source: "generated",
    prompt: "An interrupt triggered by the INT instruction is…",
    options: ["a hardware interrupt", "a software interrupt", "non-maskable", "a page fault"], answer: 1,
    hint: "It came from code, not from a device.",
    explanation: "Instruction-triggered interrupts are software interrupts; external events (keyboard, failures) raise hardware interrupts.",
  },
  // ---- Unit 5 (CO5) ----
  {
    id: "ca-u5q1", topicId: "ca-io-interface", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "The main functions of the I/O interface are…",
    options: [
      "data conversion, synchronization, device selection",
      "fetch, decode, execute",
      "push, pop, call",
      "paging, mapping, caching",
    ], answer: 0,
    hint: "It exists to resolve the CPU-peripheral mismatches.",
    explanation: "The interface converts signals, synchronises speeds, and selects the addressed device — the slides' exact trio.",
  },
  {
    id: "ca-u5q2", topicId: "ca-io-interface", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "Which I/O command activates a peripheral and tells it what to do?",
    options: ["Status", "Control", "Data input", "Data output"], answer: 1,
    hint: "It commands; another one merely asks how things are going.",
    explanation: "The control command activates and instructs; status tests conditions; data input/output move the data itself.",
  },
  {
    id: "ca-u5q3", topicId: "ca-async-transfer", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "The strobe method's weakness is that…",
    options: [
      "it needs too many wires",
      "the initiating unit can't know whether the other unit actually responded",
      "it only works for printers",
      "it requires a shared clock",
    ], answer: 1,
    hint: "One control line commands — but who confirms?",
    explanation: "With a single control line there is no acknowledgment; handshaking adds the reply line that confirms each transfer.",
  },
  {
    id: "ca-u5q4", topicId: "ca-async-transfer", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "In source-initiated handshaking, the destination replies with…",
    options: ["a strobe pulse", "the data-accepted signal", "an interrupt", "a page fault"], answer: 1,
    hint: "The second wire's whole purpose.",
    explanation: "Source raises data-valid; destination confirms with data-accepted; then both reset — every transfer acknowledged.",
  },
  {
    id: "ca-u5q5", topicId: "ca-transfer-modes", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "Interrupt-initiated I/O improves on programmed I/O because…",
    options: [
      "the CPU polls faster",
      "the CPU works on its task and is only interrupted when the device is ready",
      "it removes the interface",
      "data goes through the cache",
    ], answer: 1,
    hint: "Who watches the flag in each scheme?",
    explanation: "No busy-wait loop: the device signals readiness itself, so CPU time isn't wasted monitoring flags.",
  },
  {
    id: "ca-u5q6", topicId: "ca-transfer-modes", unit: 5, co: "CO5", level: "L2", source: "generated",
    prompt: "In DMA, data moves between device and memory…",
    options: [
      "through CPU registers",
      "directly, with the DMA controller borrowing the system buses",
      "one word per interrupt",
      "only at boot",
    ], answer: 1,
    hint: "The CPU steps aside entirely.",
    explanation: "The controller takes the address/data/control buses and streams data directly — independent of the CPU.",
  },
  // ---- Unit 6 (CO6) ----
  {
    id: "ca-u6q1", topicId: "ca-mem-hierarchy", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Ordered fastest to slowest, the hierarchy is…",
    options: [
      "registers → cache → main memory → auxiliary",
      "auxiliary → main → cache → registers",
      "cache → registers → auxiliary → main",
      "main → cache → registers → auxiliary",
    ], answer: 0,
    hint: "Smallest and closest to the CPU is fastest.",
    explanation: "Registers, then cache, then RAM, then disks/tapes — speed falls and size grows down the pyramid.",
  },
  {
    id: "ca-u6q2", topicId: "ca-mem-hierarchy", unit: 6, co: "CO6", level: "L1", source: "generated",
    prompt: "Auxiliary memory access time compared to main memory is roughly…",
    options: ["the same", "10× slower", "1000× slower", "1000× faster"], answer: 2,
    hint: "It sits at the bottom of the hierarchy for a reason.",
    explanation: "The slides put auxiliary access at about 1000 times main memory's — which is why it's the bottom layer.",
  },
  {
    id: "ca-u6q3", topicId: "ca-main-memory", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Which is TRUE of ROM?",
    options: [
      "Volatile and writable",
      "Non-volatile, read-only, holds the bootstrap loader",
      "Faster than registers",
      "Cleared on every reboot",
    ], answer: 1,
    hint: "It must survive power-off to do its one job.",
    explanation: "ROM keeps its contents without power and only reads — which is why the boot program lives there.",
  },
  {
    id: "ca-u6q4", topicId: "ca-cache", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Set-associative mapping is a compromise between…",
    options: [
      "RAM and ROM",
      "direct mapping and fully associative mapping",
      "cache and virtual memory",
      "SRAM and DRAM",
    ], answer: 1,
    hint: "Direct-map to a set, then search only its K lines.",
    explanation: "It keeps direct mapping's cheap indexing but allows K choices per set, avoiding full-search hardware costs.",
  },
  {
    id: "ca-u6q5", topicId: "ca-assoc-virtual", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Virtual memory's core promise is…",
    options: [
      "faster registers",
      "the illusion of a large memory despite a small physical RAM, via pages swapped from disk",
      "eliminating the cache",
      "read-only main memory",
    ], answer: 1,
    hint: "Pages, swap space, page faults.",
    explanation: "The OS pages memory between RAM and disk on demand, so programs can exceed physical RAM safely.",
  },
  // ---- Sample end-term paper (CO/L tags as printed; source: pastpaper) ----
  {
    id: "ca-ppq1", topicId: "ca-instr-formats", unit: 3, co: "CO3", level: "L2", source: "pastpaper",
    prompt: "Which of the following is NOT a valid instruction format?",
    options: ["Zero-address", "One-address", "Two-address", "Four-address"], answer: 3,
    hint: "Count how many formats the comparison table actually has.",
    explanation: "The standard formats are zero through three address; four-address is the invented option.",
  },
  {
    id: "ca-ppq2", topicId: "ca-logic-gates", unit: 1, co: "CO1", level: "L1", source: "pastpaper",
    prompt: "The Boolean expression for an XNOR gate is:",
    options: ["AB + A'B'", "AB' + A'B", "A + B", "A ⊕ B"], answer: 0,
    hint: "XNOR is true when the inputs AGREE.",
    explanation: "Both-1 (AB) or both-0 (A'B') — agreement. AB' + A'B is XOR, its opposite.",
  },
  {
    id: "ca-ppq3", topicId: "ca-transfer-modes", unit: 5, co: "CO5", level: "L2", source: "pastpaper",
    prompt: "Which of the following is not a mode of data transfer in computer systems?",
    options: ["Programmed I/O", "Direct Memory Access (DMA)", "Memory-mapped I/O", "Bus communication"], answer: 3,
    hint: "Three real modes plus one made-up phrase.",
    explanation: "Programmed, interrupt-initiated/memory-mapped I/O and DMA are genuine; 'bus communication' is not a transfer mode.",
  },
  {
    id: "ca-ppq4", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "What addressing mode allows you to directly specify the memory address of an operand in the instruction?",
    options: ["Immediate", "Register", "Direct", "Indirect"], answer: 2,
    hint: "The address field IS the effective address.",
    explanation: "Direct (absolute) addressing carries the operand's memory address in the instruction — one memory reference.",
  },
  {
    id: "ca-ppq5", topicId: "ca-cpu-instructions", unit: 2, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "Who designed the computer's fundamental architecture?",
    options: ["Pascal", "C. Babbage", "John von Neumann", "None of these"], answer: 2,
    hint: "The stored-program architecture bears his name.",
    explanation: "The von Neumann architecture — program and data in one memory — is the fundamental design.",
  },
  {
    id: "ca-ppq6", topicId: "ca-logic-gates", unit: 1, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "How many truth table entries are required for a three-variable Boolean function?",
    options: ["4", "6", "8", "16"], answer: 2,
    hint: "2ⁿ.",
    explanation: "2³ = 8 rows cover every combination of three inputs.",
  },
  {
    id: "ca-ppq7", topicId: "ca-logic-gates", unit: 1, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "Which logic gate is known as a universal gate?",
    options: ["AND", "OR", "XOR", "NAND"], answer: 3,
    hint: "Every other gate can be built from it alone.",
    explanation: "NAND (like NOR) is universal — combinations of NANDs implement any Boolean function.",
  },
  {
    id: "ca-ppq8", topicId: "ca-io-interface", unit: 5, co: "CO5", level: "L2", source: "pastpaper",
    prompt: "Which of the following is NOT a role of the I/O interface?",
    options: [
      "Data conversion between different formats",
      "Managing communication between devices",
      "Connecting the CPU to RAM",
      "Generating control signals for peripherals",
    ], answer: 2,
    hint: "One option belongs to the memory bus, not I/O.",
    explanation: "CPU↔RAM is the memory bus's job; the I/O interface faces peripherals.",
  },
  {
    id: "ca-ppq9", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "Octal to binary conversion: (24)₈ = ?",
    options: ["(111101)₂", "(010100)₂", "(111100)₂", "(101010)₂"], answer: 1,
    hint: "Each octal digit becomes exactly 3 bits.",
    explanation: "2 → 010, 4 → 100, so (24)₈ = 010100₂.",
  },
  {
    id: "ca-ppq10", topicId: "ca-mem-hierarchy", unit: 6, co: "CO6", level: "L2", source: "pastpaper",
    prompt: "The purpose of the memory hierarchy in a computer system is to:",
    options: [
      "Increase memory access speed",
      "Minimize data storage",
      "Reduce CPU processing",
      "None of these",
    ], answer: 0,
    hint: "Why layer fast-small over slow-big at all?",
    explanation: "The hierarchy exists to raise effective access speed at reasonable cost by keeping hot data in fast layers.",
  },
  {
    id: "ca-ppq11", topicId: "ca-complements", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "The 1's complement of 1011001 is:",
    options: ["0100110", "1100110", "1010110", "0100111"], answer: 0,
    hint: "Flip every bit.",
    explanation: "Inverting each bit of 1011001 gives 0100110 — no +1 for 1's complement.",
  },
  {
    id: "ca-ppq12", topicId: "ca-main-memory", unit: 6, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "Which memory holds the boot sector files for the system?",
    options: ["RAM", "ROM", "Cache", "Register"], answer: 1,
    hint: "It must survive the power being off.",
    explanation: "The bootstrap loader lives in non-volatile ROM — RAM is empty at power-on.",
  },
  {
    id: "ca-ppq13", topicId: "ca-async-transfer", unit: 5, co: "CO5", level: "L2", source: "pastpaper",
    prompt: "Which of the following is a key feature of asynchronous transfer?",
    options: [
      "Requires a clock signal",
      "Data is transferred in bursts",
      "Each data unit is sent with a start and stop bit",
      "Data transfer speed is fixed",
    ], answer: 2,
    hint: "No shared clock — so each unit carries its own timing.",
    explanation: "Asynchronous transfer frames each unit with start/stop signalling instead of a common clock.",
  },
  {
    id: "ca-ppq14", topicId: "ca-async-transfer", unit: 5, co: "CO5", level: "L2", source: "pastpaper",
    prompt: "Which of the following is true about synchronous data transfer?",
    options: [
      "Data is transferred without any timing coordination",
      "It requires a shared clock signal between sender and receiver",
      "It is slower than asynchronous transfer",
      "It does not require synchronization signals",
    ], answer: 1,
    hint: "The word 'synchronous' is the clue.",
    explanation: "Synchronous transfer runs sender and receiver off one shared clock — the opposite of start/stop framing.",
  },
  {
    id: "ca-ppq15", topicId: "ca-cpu-instructions", unit: 2, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "The processor's \"heart,\" which carries out numerous functions, is the…",
    options: ["Arithmetic and Logic Unit", "Circuit boards", "Control Unit", "Memory"], answer: 0,
    hint: "It does the computing itself.",
    explanation: "The ALU performs the arithmetic and logical operations — the computational heart of the CPU.",
  },
  {
    id: "ca-ppq16", topicId: "ca-mem-hierarchy", unit: 6, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "In the memory hierarchy, which of the following has the fastest speed?",
    options: ["Memory", "CPU register", "Primary memory", "Memory cache"], answer: 1,
    hint: "Inside the CPU itself.",
    explanation: "Registers top the hierarchy — faster even than cache.",
  },
  {
    id: "ca-ppq17", topicId: "ca-cpu-instructions", unit: 2, co: "CO3", level: "L2", source: "pastpaper",
    prompt: "Which of the following is a data transfer instruction?",
    options: ["ADD", "MOV", "CMP", "SUB"], answer: 1,
    hint: "Which one moves data without changing it?",
    explanation: "MOV transfers data unchanged; ADD/SUB manipulate, CMP tests.",
  },
  {
    id: "ca-ppq18", topicId: "ca-base-conversions", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "Which of the following is the correct binary representation of decimal 25?",
    options: ["11001", "10101", "10011", "11111"], answer: 0,
    hint: "16 + 8 + 1.",
    explanation: "25 = 16+8+1 = 11001₂ — the repeated-division example from the lesson.",
  },
  {
    id: "ca-ppq19", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L2", source: "pastpaper",
    prompt: "The shift-and-add multiplication method is based on:",
    options: [
      "Bitwise shifting and addition",
      "Repeated subtraction",
      "Dividing and multiplying with powers of two",
      "None of the above",
    ], answer: 0,
    hint: "Its name is the method.",
    explanation: "Each multiplier bit adds a shifted copy of the multiplicand — shifting plus addition.",
  },
  {
    id: "ca-ppq20", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L2", source: "pastpaper",
    prompt: "Booth's multiplication algorithm is used for:",
    options: [
      "Efficient division",
      "Efficient multiplication of binary numbers",
      "Decimal addition",
      "Floating-point multiplication",
    ], answer: 1,
    hint: "Signed 2's-complement operands, fewer additions.",
    explanation: "Booth multiplies signed binary numbers efficiently using shift runs to skip additions.",
  },
  {
    id: "ca-ppq21", topicId: "ca-main-memory", unit: 6, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "Which of the following memories is used in a digital camera?",
    options: ["Virtual memory", "Flash memory", "Main memory", "Cache memory"], answer: 1,
    hint: "Non-volatile, removable, solid-state.",
    explanation: "Cameras store photos on flash memory cards — non-volatile solid-state storage.",
  },
  {
    id: "ca-ppq22", topicId: "ca-addressing-modes", unit: 2, co: "CO2", level: "L6", source: "pastpaper",
    prompt: "Which addressing mode calculates the effective address of the operand using the value in the program counter (PC)?",
    options: ["Immediate", "PC-relative", "Indexed", "Base-indexed"], answer: 1,
    hint: "Its name says which register anchors the address.",
    explanation: "Relative (PC-relative) addressing adds an offset to the program counter — used for branches.",
  },
  {
    id: "ca-ppq23", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "The octal number (651.124)₈ is equivalent to ______",
    options: ["(1A9.2A)₁₆", "(1B0.10)₁₆", "(1A8.A3)₁₆", "(1B0.B0)₁₆"], answer: 0,
    hint: "Octal → binary in 3s, regroup in 4s → hex.",
    explanation: "651.124₈ = 110101001.001010100₂ = 0001 1010 1001 . 0010 1010₂ = 1A9.2A₁₆.",
  },
  {
    id: "ca-ppq24", topicId: "ca-base-conversions", unit: 1, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "The hexadecimal number (1E.43)₁₆ is equivalent to…",
    options: ["(36.506)₈", "(36.206)₈", "(35.506)₈", "(35.206)₈"], answer: 1,
    hint: "Hex → binary in 4s, regroup in 3s → octal.",
    explanation: "1E.43₁₆ = 00011110.01000011₂ → 011110.010000110₂ = 36.206₈.",
  },
  {
    id: "ca-ppq25", topicId: "ca-multiplication", unit: 4, co: "CO4", level: "L6", source: "pastpaper",
    prompt: "What is the main advantage of Booth's algorithm in binary multiplication?",
    options: [
      "Reduced number of additions",
      "Reduced number of shifts",
      "Reduced memory usage",
      "Better precision",
    ], answer: 0,
    hint: "Runs of identical bits cost only shifts.",
    explanation: "Booth's recoding turns runs of 1s into a subtract-and-add pair, cutting the number of additions.",
  },
  {
    id: "ca-ppq26", topicId: "ca-codes", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "The BCD representation of the decimal number 13 is:",
    options: ["0001 0011", "1101", "1100 0011", "1010 0011"], answer: 0,
    hint: "Digit by digit — 1, then 3.",
    explanation: "1 → 0001, 3 → 0011 → 0001 0011. Plain binary 1101 is the trap: BCD codes each digit separately.",
  },
];

export const cse46d = buildCourseBundle(
  {
    id: "cse46d",
    code: "CSE46D",
    title: "Computer Architecture",
    sections: [sectionA, sectionB, sectionU3, sectionC, sectionU5, sectionU6],
  },
  examBank
);
