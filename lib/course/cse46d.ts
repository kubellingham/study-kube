// CSE46D — Computer Architecture (Lovely Professional University).
// REBUILT per KUBE_LESSON_DEPTH.md: one concept per circle, four-quarter
// depth, one document at a time. Units 1–2 are fully built (Unit 1 from
// Unit_1_1.pptx + Unit_12.pptx; Unit 2 from Data_Tranfer_and_Manipulation.ppt
// + the Addressing Modes deck); Units 3–6 show as skeleton placeholders until
// their documents are re-fed for deep processing. The previous shallow
// sections live in git history (commit 105ba44) if ever needed.
import { buildCourseBundle } from "./bundle";
import type { ExamQuestion, SyllabusInfo } from "./types";
import { sectionU1A } from "./cse46d-unit1a";
import { sectionU1B } from "./cse46d-unit1b";
import { sectionU2 } from "./cse46d-unit2";
import { sectionU3 } from "./cse46d-unit3";

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

const examBank: ExamQuestion[] = [
  // ---- Authored for Unit 1's circles (CO1/CO2 per syllabus mapping) ----
  {
    id: "ca-u1q1", topicId: "ca-hex", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "The base (radix) of the hexadecimal number system is…",
    options: ["8", "10", "16", "2"], answer: 2,
    hint: "Count its symbols: 0–9 and A–F.",
    explanation: "Hexadecimal uses sixteen symbols (0–9, A–F), so its base is 16.",
  },
  {
    id: "ca-u1q2", topicId: "ca-bits", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "Which group of bits is called a byte?",
    options: ["2 bits", "4 bits", "8 bits", "16 bits"], answer: 2,
    hint: "A nibble is half of it.",
    explanation: "A byte is 8 bits; a nibble is 4. MSB/LSB name its end bits.",
  },
  {
    id: "ca-u1q3", topicId: "ca-to-decimal", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(1101)₂ equals which decimal number?",
    options: ["11", "13", "14", "9"], answer: 1,
    hint: "Place values from the right: 1, 2, 4, 8.",
    explanation: "8 + 4 + 0 + 1 = 13 — multiply each bit by its power of 2 and add.",
  },
  {
    id: "ca-u1q4", topicId: "ca-to-decimal", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(124)₈ in decimal is…",
    options: ["84", "124", "96", "72"], answer: 0,
    hint: "Powers of 8: 64, 8, 1.",
    explanation: "1×64 + 2×8 + 4×1 = 84. Same place-value method, base 8.",
  },
  {
    id: "ca-u1q5", topicId: "ca-group-shortcuts", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "Converting binary to octal uses groups of…",
    options: ["4 bits from the left", "3 bits from the right", "8 bits", "2 bits"], answer: 1,
    hint: "8 = 2³.",
    explanation: "Each octal digit covers exactly 3 bits (2³ = 8), grouped from the LSB end with left padding.",
  },
  {
    id: "ca-u1q6", topicId: "ca-twos-comp", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "The 2's complement of 01100 is…",
    options: ["10011", "10100", "01101", "11100"], answer: 1,
    hint: "Flip everything, then add 1.",
    explanation: "1's complement 10011, plus 1 gives 10100. Flip-then-add-one, always.",
  },
  {
    id: "ca-u1q7", topicId: "ca-sign-magnitude", unit: 1, co: "CO1", level: "L1", source: "generated",
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
    id: "ca-u1q8", topicId: "ca-floating-point", unit: 1, co: "CO1", level: "L2", source: "generated",
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
    id: "ca-u1q9", topicId: "ca-ieee754", unit: 1, co: "CO1", level: "L2", source: "generated",
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
    id: "ca-u1q10", topicId: "ca-gray", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "Which code changes only one bit between consecutive values?",
    options: ["BCD", "Excess-3", "Gray code", "ASCII"], answer: 2,
    hint: "It's called a unit-distance code.",
    explanation: "Gray code is the unit-distance, cyclic code — one bit per step, which encoders rely on.",
  },
  {
    id: "ca-u1q11", topicId: "ca-code-bcd", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "(45)₁₀ in BCD is…",
    options: ["101101", "0100 0101", "0101 0100", "1000 0100"], answer: 1,
    hint: "Each decimal digit gets its own 4 bits.",
    explanation: "4 → 0100 and 5 → 0101, digit by digit: 0100 0101. BCD never converts the whole number.",
  },
  {
    id: "ca-u1q12", topicId: "ca-excess3", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "The Excess-3 code of the decimal digit 6 is…",
    options: ["0110", "1001", "0011", "1100"], answer: 1,
    hint: "BCD of 6, plus 0011.",
    explanation: "0110 + 0011 = 1001 — each digit's XS-3 code is its BCD shifted up by three.",
  },
  {
    id: "ca-u1q13", topicId: "ca-from-decimal", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "In divide-and-collect conversion, the remainders are read…",
    options: ["top-down", "bottom-up", "in any order", "only the last one"], answer: 1,
    hint: "The first remainder is the units digit.",
    explanation: "The first division peels off the 1s place, so the answer assembles from the last remainder back to the first: bottom-up.",
  },
  {
    id: "ca-u1q14", topicId: "ca-ones-comp", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "The 1's complement operation is…",
    options: [
      "flip every bit, then add 1",
      "flip every bit — nothing more",
      "add 1 only",
      "flip only the sign bit",
    ], answer: 1,
    hint: "The +1 belongs to the OTHER complement.",
    explanation: "1's complement is the pure inversion; adding 1 afterwards produces the 2's complement.",
  },
  // ---- Sample end-term paper, Unit 1 questions (CO/L tags as printed) ----
  {
    id: "ca-ppq2", topicId: "ca-logic-gates", unit: 1, co: "CO1", level: "L1", source: "pastpaper",
    prompt: "The Boolean expression for an XNOR gate is:",
    options: ["AB + A'B'", "AB' + A'B", "A + B", "A ⊕ B"], answer: 0,
    hint: "XNOR is true when the inputs AGREE.",
    explanation: "Both-1 (AB) or both-0 (A'B') — agreement. AB' + A'B is XOR, its opposite.",
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
    id: "ca-ppq9", topicId: "ca-group-shortcuts", unit: 1, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "Octal to binary conversion: (24)₈ = ?",
    options: ["(111101)₂", "(010100)₂", "(111100)₂", "(101010)₂"], answer: 1,
    hint: "Each octal digit becomes exactly 3 bits.",
    explanation: "2 → 010, 4 → 100, so (24)₈ = 010100₂.",
  },
  {
    id: "ca-ppq11", topicId: "ca-ones-comp", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "The 1's complement of 1011001 is:",
    options: ["0100110", "1100110", "1010110", "0100111"], answer: 0,
    hint: "Flip every bit.",
    explanation: "Inverting each bit of 1011001 gives 0100110 — no +1 for 1's complement.",
  },
  {
    id: "ca-ppq18", topicId: "ca-from-decimal", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "Which of the following is the correct binary representation of decimal 25?",
    options: ["11001", "10101", "10011", "11111"], answer: 0,
    hint: "16 + 8 + 1.",
    explanation: "25 = 16+8+1 = 11001₂ — the repeated-division example from the lesson.",
  },
  {
    id: "ca-ppq23", topicId: "ca-group-shortcuts", unit: 1, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "The octal number (651.124)₈ is equivalent to ______",
    options: ["(1A9.2A)₁₆", "(1B0.10)₁₆", "(1A8.A3)₁₆", "(1B0.B0)₁₆"], answer: 0,
    hint: "Octal → binary in 3s, regroup in 4s → hex.",
    explanation: "651.124₈ = 110101001.001010100₂ = 0001 1010 1001 . 0010 1010₂ = 1A9.2A₁₆.",
  },
  {
    id: "ca-ppq24", topicId: "ca-group-shortcuts", unit: 1, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "The hexadecimal number (1E.43)₁₆ is equivalent to…",
    options: ["(36.506)₈", "(36.206)₈", "(35.506)₈", "(35.206)₈"], answer: 1,
    hint: "Hex → binary in 4s, regroup in 3s → octal.",
    explanation: "1E.43₁₆ = 00011110.01000011₂ → 011110.010000110₂ = 36.206₈.",
  },
  {
    id: "ca-ppq26", topicId: "ca-code-bcd", unit: 1, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "The BCD representation of the decimal number 13 is:",
    options: ["0001 0011", "1101", "1100 0011", "1010 0011"], answer: 0,
    hint: "Digit by digit — 1, then 3.",
    explanation: "1 → 0001, 3 → 0011 → 0001 0011. Plain binary 1101 is the trap: BCD codes each digit separately.",
  },
  // ---- Authored for Unit 2's circles (CO2/CO3 per syllabus mapping) ----
  {
    id: "ca-u2q1", topicId: "ca-instr-categories", unit: 2, co: "CO3", level: "L1", source: "generated",
    prompt: "Which category of instruction moves data without changing its value?",
    options: ["Data manipulation", "Data transfer", "Program control", "Arithmetic"], answer: 1,
    hint: "Move, don't compute.",
    explanation: "Data transfer instructions (MOV, LOAD, STORE, PUSH, POP…) relocate data unchanged; manipulation computes, program control redirects.",
  },
  {
    id: "ca-u2q2", topicId: "ca-data-manip", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "Shift, complement and AND belong to which family of data manipulation instructions?",
    options: [
      "Arithmetic only",
      "Shift is its own class; complement and AND are logical/bit-manipulation",
      "All three are arithmetic",
      "All three are program control",
    ], answer: 1,
    hint: "Three families: arithmetic, logical, shift.",
    explanation: "Data manipulation splits into arithmetic (ADD, SUB…), logical/bit (AND, OR, complement…) and shift (SHL, SHR, rotate) instructions.",
  },
  {
    id: "ca-u2q3", topicId: "ca-control-word", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "In a control word, the SELA and SELB fields choose…",
    options: [
      "the destination register",
      "the two source registers feeding the ALU buses",
      "the ALU operation",
      "the next instruction",
    ], answer: 1,
    hint: "A and B are the ALU's two input buses.",
    explanation: "SELA and SELB pick which registers drive bus A and bus B into the ALU; SELD picks the destination and OPR picks the operation.",
  },
  {
    id: "ca-u2q4", topicId: "ca-addr-immediate", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "In immediate addressing, the operand is…",
    options: [
      "in a register named by the instruction",
      "at the memory address given in the instruction",
      "inside the instruction itself, as part of the address field",
      "on top of the stack",
    ], answer: 2,
    hint: "No fetch needed — it's already here.",
    explanation: "Immediate mode carries the operand value in the instruction, so no extra memory reference is needed — fast, but the value is fixed.",
  },
  {
    id: "ca-u2q5", topicId: "ca-addr-direct-indirect", unit: 2, co: "CO2", level: "L4", source: "generated",
    prompt: "How many memory references does INDIRECT addressing need to reach the operand?",
    options: ["None", "One", "Two", "Three"], answer: 2,
    hint: "One to get the address, then…",
    explanation: "Indirect reads memory once to fetch the effective address, then again to fetch the operand — two references, versus direct's one.",
  },
  {
    id: "ca-u2q6", topicId: "ca-addr-register", unit: 2, co: "CO2", level: "L2", source: "generated",
    prompt: "Register INDIRECT addressing means the named register holds…",
    options: [
      "the operand itself",
      "the memory address of the operand",
      "the next instruction",
      "the ALU operation code",
    ], answer: 1,
    hint: "Value vs address — which one lives in the register here?",
    explanation: "In register-indirect mode the register holds the operand's ADDRESS (a pointer); plain register mode holds the value itself.",
  },
  // ---- Authored for Unit 3's circles (CO3 per syllabus mapping) ----
  {
    id: "ca-u3q1", topicId: "ca-stack-lifo", unit: 3, co: "CO3", level: "L1", source: "generated",
    prompt: "A stack follows which order?",
    options: ["FIFO", "LIFO", "Random", "Priority"], answer: 1,
    hint: "Think of a stack of plates.",
    explanation: "Last In, First Out — only the top is accessible, via PUSH and POP.",
  },
  {
    id: "ca-u3q2", topicId: "ca-stack-sp", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "In a descending stack, a PUSH operation…",
    options: [
      "increments SP, then stores",
      "decrements SP (SP = SP − 1), then stores at the new top",
      "stores, then decrements SP",
      "never moves SP",
    ], answer: 1,
    hint: "Make room first, in the direction the stack grows.",
    explanation: "A descending stack grows toward lower addresses: PUSH decrements SP to open a new top, then stores; POP reads then increments.",
  },
  {
    id: "ca-u3q3", topicId: "ca-rpn-notation", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "The RPN (postfix) form of (A + B) is…",
    options: ["+ A B", "A B +", "A + B", "B A -"], answer: 1,
    hint: "Operator after the operands.",
    explanation: "Postfix places the operator last: A B +. No parentheses are ever needed.",
  },
  {
    id: "ca-u3q4", topicId: "ca-rpn-stack", unit: 3, co: "CO3", level: "L4", source: "generated",
    prompt: "Evaluating 3 5 + 2 * with a stack gives…",
    options: ["13", "16", "30", "10"], answer: 1,
    hint: "Numbers push; operators pop two, compute, push back.",
    explanation: "3 5 + leaves 8 on the stack; 2 pushes; * pops 8,2 and pushes 16 — the lesson's worked trace.",
  },
  {
    id: "ca-u3q5", topicId: "ca-fmt-01", unit: 3, co: "CO3", level: "L2", source: "generated",
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
    id: "ca-u3q6", topicId: "ca-fmt-23", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "ADD A, B (result overwrites A) is which instruction format?",
    options: ["Zero-address", "One-address", "Two-address", "Three-address"], answer: 2,
    hint: "Count the named operands.",
    explanation: "Two named operands with the result replacing one — the two-address format of general-register machines.",
  },
  {
    id: "ca-u3q7", topicId: "ca-jumps-loops", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "A conditional branch like JNZ decides using…",
    options: ["the stack pointer", "the flags register", "the DMA controller", "ROM"], answer: 1,
    hint: "Zero, Carry, Sign, Overflow.",
    explanation: "Condition codes in the flags register, set by earlier operations, steer conditional jumps.",
  },
  {
    id: "ca-u3q8", topicId: "ca-call-ret", unit: 3, co: "CO3", level: "L2", source: "generated",
    prompt: "During a subroutine CALL, the return address is stored…",
    options: ["in the ALU", "on the stack", "in ROM", "in the cache"], answer: 1,
    hint: "It must come back off in LIFO order when RET runs.",
    explanation: "CALL pushes the return address onto the stack; RET pops it — nested calls unwind correctly because of LIFO.",
  },
  {
    id: "ca-u3q9", topicId: "ca-interrupts", unit: 3, co: "CO3", level: "L1", source: "generated",
    prompt: "An interrupt triggered by the INT instruction is…",
    options: ["a hardware interrupt", "a software interrupt", "non-maskable", "a page fault"], answer: 1,
    hint: "It came from code, not from a device.",
    explanation: "Instruction-triggered interrupts are software interrupts; external events (keyboard, failures) raise hardware interrupts.",
  },
  {
    id: "ca-u3q10", topicId: "ca-flow-anatomy", unit: 3, co: "CO3", level: "L1", source: "generated",
    prompt: "The Program Counter (PC) holds…",
    options: [
      "the current instruction",
      "the address of the next instruction to be executed",
      "the top of the stack",
      "the ALU result",
    ], answer: 1,
    hint: "It auto-increments after each instruction.",
    explanation: "The PC always points at the NEXT instruction's address; the current instruction sits in the IR.",
  },
  // ---- Sample end-term paper, Unit 2 questions (CO/L tags as printed) ----
  {
    id: "ca-ppq4", topicId: "ca-addr-direct-indirect", unit: 2, co: "CO2", level: "L2", source: "pastpaper",
    prompt: "What addressing mode allows you to directly specify the memory address of an operand in the instruction?",
    options: ["Immediate", "Register", "Direct", "Indirect"], answer: 2,
    hint: "The address field IS the effective address.",
    explanation: "Direct (absolute) addressing carries the operand's memory address in the instruction — one memory reference.",
  },
  {
    id: "ca-ppq5", topicId: "ca-cpu-alu", unit: 2, co: "CO1", level: "L2", source: "pastpaper",
    prompt: "Who designed the computer's fundamental architecture?",
    options: ["Pascal", "C. Babbage", "John von Neumann", "None of these"], answer: 2,
    hint: "The stored-program architecture bears his name.",
    explanation: "The von Neumann architecture — program and data in one memory — is the fundamental design.",
  },
  {
    id: "ca-ppq15", topicId: "ca-cpu-alu", unit: 2, co: "CO1", level: "L4", source: "pastpaper",
    prompt: "The processor's \"heart,\" which carries out numerous functions, is the…",
    options: ["Arithmetic and Logic Unit", "Circuit boards", "Control Unit", "Memory"], answer: 0,
    hint: "It does the computing itself.",
    explanation: "The ALU performs the arithmetic and logical operations — the computational heart of the CPU.",
  },
  {
    id: "ca-ppq17", topicId: "ca-instr-categories", unit: 2, co: "CO3", level: "L2", source: "pastpaper",
    prompt: "Which of the following is a data transfer instruction?",
    options: ["ADD", "MOV", "CMP", "SUB"], answer: 1,
    hint: "Which one moves data without changing it?",
    explanation: "MOV transfers data unchanged; ADD/SUB manipulate, CMP tests.",
  },
  {
    id: "ca-ppq22", topicId: "ca-addr-extended", unit: 2, co: "CO2", level: "L6", source: "pastpaper",
    prompt: "Which addressing mode calculates the effective address of the operand using the value in the program counter (PC)?",
    options: ["Immediate", "PC-relative", "Indexed", "Base-indexed"], answer: 1,
    hint: "Its name says which register anchors the address.",
    explanation: "Relative (PC-relative) addressing adds an offset to the program counter — used for branches.",
  },
  // ---- Sample end-term paper, Unit 3 questions (CO/L tags as printed) ----
  {
    id: "ca-ppq1", topicId: "ca-fmt-23", unit: 3, co: "CO3", level: "L2", source: "pastpaper",
    prompt: "Which of the following is NOT a valid instruction format?",
    options: ["Zero-address", "One-address", "Two-address", "Four-address"], answer: 3,
    hint: "Count how many formats the comparison table actually has.",
    explanation: "The standard formats are zero through three address; four-address is the invented option.",
  },
];

export const cse46d = buildCourseBundle(
  {
    id: "cse46d",
    code: "CSE46D",
    title: "Computer Architecture",
    sections: [sectionU1A, sectionU1B, sectionU2, sectionU3],
  },
  examBank
);
