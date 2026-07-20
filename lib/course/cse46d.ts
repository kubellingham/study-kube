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
      steps: [
        {
          kind: "teach",
          title: "Base is everything",
          body: "A **number system** is just a set of symbols plus a rule: each position is worth **base times** the position to its right. Digital electronics represents ALL information as numbers, so these four systems are the course's alphabet:\n\n**Decimal** — base 10, symbols 0–9. Yours.\n**Binary** — base 2, symbols 0 and 1. The machine's: every digital device runs on it.\n**Octal** — base 8, symbols 0–7.\n**Hexadecimal** — base 16, symbols 0–9 then **A=10, B=11, C=12, D=13, E=14, F=15**. Used heavily in microprocessors because it's **much shorter to write than binary** while converting to it trivially.",
        },
        {
          kind: "teach",
          title: "The vocabulary of bits",
          body: "Four terms exams love to define-check:\n\n**Bit** — one binary digit (a 0 or a 1).\n**Nibble** — a group of **4 bits** (0101).\n**Byte** — a group of **8 bits** (01001011).\n\nAnd inside any binary number: the **MSB** (most significant bit) is the **leftmost** bit — highest place value; the **LSB** (least significant bit) is the **rightmost** — lowest place value.",
        },
        {
          kind: "check",
          prompt: "In hexadecimal, the symbol C stands for which decimal value?",
          options: ["3", "11", "12", "16"],
          answer: 2,
          praise:
            "Right — A starts at 10, so C is 12. Counting the letters from A is the fastest way to never trip on this.",
        },
        {
          kind: "check",
          prompt: "A nibble is…",
          options: ["1 bit", "4 bits", "8 bits", "16 bits"],
          answer: 1,
          praise:
            "Exactly — 4 bits. And that's not trivia: one nibble is precisely one hex digit, which is WHY hex and binary convert so cleanly.",
        },
        {
          kind: "check",
          prompt: "Why is hexadecimal preferred over binary for humans reading machine values?",
          options: [
            "Computers run on hex internally",
            "Hex numbers are much shorter for the same value, so they're more readable",
            "Hex has no zero",
            "Binary can't represent large numbers",
          ],
          answer: 1,
          praise:
            "That's the honest reason — same information, a quarter the symbols. The machine still runs on binary; hex is our compression for reading it.",
        },
      ],
    },
    {
      id: "ca-base-conversions",
      title: "Converting between bases",
      unit: 1,
      weight: "heavy",
      deps: ["ca-number-systems"],
      whyItMatters:
        "Conversion questions are CO1's guaranteed marks — and the group-of-3 / group-of-4 shortcuts turn them into free ones.",
      recap: [
        "ANY base → decimal: multiply each digit by its place value (powers of the base) and add. (1101)₂ = 8+4+0+1 = 13.",
        "Decimal → any base: repeatedly DIVIDE by the base, collect remainders bottom-up. (25)₁₀ = (11001)₂.",
        "Decimal FRACTION → base: repeatedly MULTIPLY the fraction by the base, collect integer parts top-down.",
        "Binary ↔ octal: group bits in 3s from the right (pad left with 0s). Binary ↔ hex: group in 4s.",
        "Octal ↔ hex: go through binary in the middle.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Everything → decimal: place values",
          body: "To bring any number home to decimal, pay each digit its **place value** — powers of the base, counted from 0 at the right:\n\n`(1101)₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13`\n`(124)₈ = 1×64 + 2×8 + 4×1 = 84`\n`(1AF)₁₆ = 1×256 + 10×16 + 15×1 = 431`\n\nOne method, three bases — the only thing that changes is the base you're raising.",
        },
        {
          kind: "teach",
          title: "Decimal → anything: divide and collect",
          body: "Going the other way, **divide repeatedly by the target base and read the remainders from bottom to top**:\n\n`25 ÷ 2 = 12 r 1` → `12 ÷ 2 = 6 r 0` → `6 ÷ 2 = 3 r 0` → `3 ÷ 2 = 1 r 1` → `1 ÷ 2 = 0 r 1`\nRead up: `(25)₁₀ = (11001)₂`.\n\nFor a decimal **fraction**, flip the machine: repeatedly **multiply** by the base and collect the integer parts **top-down** — that's how 0.188 or 25.5 get their binary tails.",
        },
        {
          kind: "teach",
          title: "The shortcut pair",
          body: "Binary ↔ octal and binary ↔ hex never need decimal at all:\n\n**Octal** — group bits in **3s** from the right (pad with leading 0s): `010 101` → `(25)₈.\n**Hex** — group bits in **4s**: `0011 1010 1011 0010` → `3AB2`.\n\nAnd octal ↔ hex? **Go through binary in the middle** — expand to bits, regroup the other way. Three symbols of scratch work, no division anywhere.",
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
          prompt: "Converting (100)₁₀ to binary by repeated division, the answer is…",
          options: ["(1100100)₂", "(1010101)₂", "(1100010)₂", "(1001001)₂"],
          answer: 0,
          praise:
            "Exactly — 64+32+4 = 100, and the remainders read bottom-up as 1100100. Divide-collect-read-up, every time.",
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
            "Right — 4 bits = 1 hex digit (one nibble!), grouped from the LSB end. Octal is the same dance with groups of 3.",
        },
      ],
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
      id: "ca-cpu-instructions",
      title: "Instruction categories & CPU components",
      unit: 2,
      weight: "medium",
      deps: [],
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

const sectionC: Section = {
  id: "ca-sec-c",
  letter: "C",
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
      id: "ca-multiplication",
      title: "Multiplication & Booth's algorithm",
      unit: 4,
      weight: "heavy",
      deps: ["ca-add-sub"],
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
];

export const cse46d = buildCourseBundle(
  {
    id: "cse46d",
    code: "CSE46D",
    title: "Computer Architecture",
    sections: [sectionA, sectionB, sectionC],
  },
  examBank
);
