// CSE46D Unit 2: Central Processing Unit. Four-quarter circles per
// KUBE_LESSON_DEPTH.md. Sources: Data_Tranfer_and_Manipulation.ppt (CPU
// portion) + Comp201TH Addressing Modes.pptx — processed one at a time.
import type { Section } from "./types";

export const sectionU2: Section = {
  id: "ca-sec-u2",
  letter: "C",
  title: "Central Processing Unit",
  tagline: "What instructions are, who computes them, and how they find their data.",
  unit: 2,
  topics: [
    {
      id: "ca-instr-categories",
      title: "The three instruction categories",
      unit: 2,
      weight: "medium",
      deps: ["ca-rev-unit1"],
      whyItMatters:
        "Every instruction on your paper belongs to one of these three families — classifying on sight is the skill CO3 questions reward.",
      recap: [
        "Most computer instructions fall into THREE categories: Data Transfer, Data Manipulation, Program Control.",
        "Data transfer moves data WITHOUT changing its content: memory ↔ registers, registers ↔ I/O, register ↔ register. MOV is the classic.",
        "Data manipulation computes on data (next circle). Program control decides what runs next (Unit 3's territory).",
        "Classify by asking: did the data change? did the flow change? or did something just move?",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A processor runs millions of instructions a second — but step back and ask: how many *kinds* of thing can an instruction actually do?\n\nSurprisingly few. Your slides say most instructions fall into just **three categories**.",
            },
            {
              kind: "teach",
              body: "**1 — Data transfer.** Move data from one place to another **without changing its content**. The most common moves: memory ↔ processor registers, registers ↔ input/output, and register ↔ register.\n\nNothing is computed. Something just travels.",
            },
            {
              kind: "teach",
              body: "**2 — Data manipulation.** Actually operate on the data — add it, AND it, shift it. This is where the computer earns the name *computer*. It gets its own circle next.\n\n**3 — Program control.** Change what runs next — jumps, calls, interrupts. That family owns Unit 3.",
            },
            {
              kind: "teach",
              body: "So the sorting question for ANY instruction is:\n\n*Did data move unchanged?* → transfer. *Did data change?* → manipulation. *Did the flow change?* → program control.\n\nThree questions, every instruction classified. That's the whole circle — now let's make it stick.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The defining property of a data TRANSFER instruction is…",
              options: [
                "it changes the data as it moves",
                "it moves data without changing its content",
                "it always involves the ALU",
                "it jumps to another instruction",
              ],
              answer: 1,
              praise:
                "'Without changing the data content' — the slides' exact phrase, and the boundary line of the whole category.",
            },
            {
              kind: "check",
              prompt: "Which is a data transfer instruction? (your sample paper's question)",
              options: ["ADD", "MOV", "CMP", "SUB"],
              answer: 1,
              praise:
                "MOV moves, untouched. ADD and SUB manipulate; CMP tests for program control. One paper mark, banked.",
            },
            {
              kind: "check",
              prompt: "A jump instruction (JMP) belongs to which category?",
              options: ["Data transfer", "Data manipulation", "Program control", "None"],
              answer: 2,
              praise:
                "Flow changed, data untouched — program control. You've now classified all three families from their fingerprints.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "The common transfers, mapped",
              body: "The slides name three transfer routes worth listing on a 10-mark answer:\n\n**memory ↔ registers** (load/store), **registers ↔ input-output**, and **register ↔ register**.\n\nNotice what's NOT on the list: memory ↔ memory directly — data almost always passes through registers. The register set is the CPU's hands.",
            },
            {
              kind: "check",
              prompt: "You classify one: an instruction copies R2 into R5. Category?",
              options: [
                "Data manipulation — R5 changed",
                "Data transfer — the DATA didn't change, only its location",
                "Program control",
                "Impossible to say",
              ],
              answer: 1,
              praise:
                "Subtle and right — the register's contents changed, but the DATA itself moved unaltered. Content, not container, decides the category.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"ADD is a transfer instruction because the result moves into a register.\" Diagnose.",
              options: [
                "Correct reasoning",
                "The result is NEW data — computation happened, so it's manipulation; movement alone doesn't make a transfer",
                "ADD is program control",
                "ADD is not an instruction",
              ],
              answer: 1,
              praise:
                "Exactly — almost every instruction moves something; the question is whether computing happened on the way. That distinction is the classifier's edge.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-data-manip",
      title: "Data manipulation: arithmetic, logic & shift",
      unit: 2,
      weight: "medium",
      deps: ["ca-instr-categories"],
      whyItMatters:
        "'Name the three types of data manipulation instruction' is a straight theory mark — and shifts return as the engine of Unit 4's multiplication.",
      recap: [
        "Data manipulation instructions provide the computer's computational capabilities.",
        "Three basic types: 1. Arithmetic (add, subtract, multiply, divide — most computers provide all four).",
        "2. Logical & bit manipulation — binary operations (AND, OR…) on strings of bits in registers.",
        "3. Shift — move all the bits of a word left or right.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Inside the manipulation category, the slides carve exactly **three basic types**. Meet them one at a time.\n\n**Arithmetic instructions** — the four operations you'd guess: **addition, subtraction, multiplication, division**. Most computers provide instructions for all four.",
            },
            {
              kind: "teach",
              body: "**Logical and bit-manipulation instructions** — binary operations performed on **strings of bits stored in registers**: AND, OR, and friends.\n\nNot arithmetic on *values* — surgery on *bits*: masking some off, forcing some on, testing patterns.",
            },
            {
              kind: "teach",
              body: "**Shift instructions** — the humble one: move **all the bits of a word left or right**.\n\nDon't underestimate it. A left shift doubles a binary number; and in Unit 4, multiplication is built almost entirely from shifts and adds. This little instruction has a big future.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The three types of data manipulation instruction are…",
              options: [
                "arithmetic, logical/bit manipulation, shift",
                "load, store, move",
                "branch, call, return",
                "input, output, halt",
              ],
              answer: 0,
              praise:
                "The trio, straight from the slides — compute on values, operate on bits, slide the word. Theory mark secured.",
            },
            {
              kind: "check",
              prompt: "AND-ing a register with a pattern to force certain bits to 0 is which type?",
              options: ["Arithmetic", "Logical & bit manipulation", "Shift", "Transfer"],
              answer: 1,
              praise:
                "Bit surgery — logical operations treat the register as a string of bits, not a number. That's the type's whole identity.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Watch a shift earn its keep",
              body: "Take `0011` (3). Shift left one place: `0110` (6). Again: `1100` (12).\n\nEach left shift **doubles** the value — because every bit moved into a position worth twice as much. Position-times-base, from Unit 1, still running everything.\n\nHold this: when Unit 4's multiplier does 'successive shift and add', THIS is the shift it means.",
            },
            {
              kind: "check",
              prompt: "You try one: shifting 0101 (5) left once gives…",
              options: ["1010 (10)", "0010 (2)", "1011 (11)", "0101 (5)"],
              answer: 0,
              praise:
                "Doubled to 10 — the shift is multiplication by 2 in disguise. You've just previewed Unit 4's engine.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"shift instructions are arithmetic instructions, since shifting doubles a number.\" Diagnose.",
              options: [
                "Correct — they're the same type",
                "The slides classify them separately: shifts move bits; the doubling is an effect, not the operation's definition",
                "Shifts are program control",
                "Shifting halves numbers",
              ],
              answer: 1,
              praise:
                "Sharp — classification follows what the instruction DOES (move bits), not what it can be used for. Three types, each with its own seat.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-cpu-alu",
      title: "CPU components: registers & the common ALU",
      unit: 2,
      weight: "medium",
      deps: ["ca-instr-categories"],
      whyItMatters:
        "The register-set-with-common-ALU picture is the CPU long-answer's skeleton — and two of your paper's MCQs (the ALU 'heart', von Neumann) live here.",
      recap: [
        "The CPU executes instructions; its key components: the register set (temporary data & operands), the ALU (computes), the control unit, connected by a common bus.",
        "In the common-ALU organisation, ALL registers share ONE ALU over a bus: two registers supply operands, the ALU computes, the result rides back to a destination register.",
        "The ALU (Arithmetic Logic Unit) performs the arithmetic and logical operations — the processor's computational 'heart'.",
        "The stored-program architecture underneath it all is von Neumann's.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Instructions need somewhere to happen. Zoom into the CPU and three kinds of machinery appear.\n\nFirst: the **register set** — small, blisteringly fast storage holding *temporary data and operands* — the values being worked on right now.",
            },
            {
              kind: "teach",
              body: "Second: the **ALU — Arithmetic Logic Unit**. It \"performs computations and logical operations using these registers.\" Every ADD, every AND from the last circle — the ALU does it.\n\nYour paper calls it the processor's **'heart'**. Fair name: nothing computes without it.",
            },
            {
              kind: "teach",
              body: "Now the design question: give every register its own ALU? Wildly expensive. Instead, the **common-ALU organisation**:\n\nall registers share **one ALU**, connected by a **common bus system**. Two registers place operands on the bus → the ALU computes → the result rides the bus back into a destination register.\n\nOne costly circuit, serving many registers. Remember this picture — the control word (next circle) is its steering wheel.",
            },
            {
              kind: "teach",
              body: "And the name behind the whole arrangement: the stored-program design — program and data sharing one memory, executed by this fetch-compute machinery — is the **von Neumann architecture**. Your paper asks who designed the computer's fundamental architecture; now you know the answer and what it means.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The processor's computational 'heart' is the…",
              options: ["control unit", "Arithmetic and Logic Unit", "register set", "bus"],
              answer: 1,
              praise:
                "The ALU — your sample paper's phrasing exactly. Registers hold, buses carry, the ALU computes.",
            },
            {
              kind: "check",
              prompt: "In the common-ALU organisation, the registers…",
              options: [
                "each contain a private ALU",
                "share one ALU, supplying operands over a common bus",
                "are part of main memory",
                "never hold operands",
              ],
              answer: 1,
              praise:
                "One shared engine, many feeders — the economy that shapes the entire CPU diagram.",
            },
            {
              kind: "check",
              prompt: "Who designed the computer's fundamental (stored-program) architecture?",
              options: ["Pascal", "Charles Babbage", "John von Neumann", "None of these"],
              answer: 2,
              praise:
                "Von Neumann — program and data in one memory. A name worth one mark and eighty years of computing.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Trace one instruction through the picture",
              body: "Follow `ADD R1 ← R2 + R3` through the hardware:\n\n1. **R2** and **R3** place their values on the **bus**.\n2. The **ALU** receives both operands and adds.\n3. The result rides the bus into **R1**.\n\nThree components, one bus trip, one instruction done. Every arithmetic instruction in every program is a rerun of this little journey.",
            },
            {
              kind: "check",
              prompt: "You trace one: for AND R4 ← R4 & R5, what does the ALU receive?",
              options: [
                "The values of R4 and R5, via the bus",
                "The addresses of R4 and R5",
                "Only R4's value",
                "The whole register set",
              ],
              answer: 0,
              praise:
                "Two operand VALUES on the bus, one logical result back — the same journey as ADD with a different ALU operation selected. Who selects it? Next circle.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"with one shared ALU, two additions can happen at the same instant.\" Diagnose.",
              options: [
                "True — the ALU is fast enough",
                "One ALU computes one operation at a time — sharing trades parallelism for cost; operations queue",
                "The bus does the second addition",
                "Registers can add by themselves",
              ],
              answer: 1,
              praise:
                "The honest cost of the shared design — one engine, one operation at a time. Naming the trade-off, not just the structure, is full-marks understanding.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-control-word",
      title: "The control word",
      unit: 2,
      weight: "heavy",
      deps: ["ca-cpu-alu", "ca-data-manip"],
      whyItMatters:
        "Decoding a control word field by field is Unit 2's favourite 'read the table' exam exercise — pure marks once the fields are reflexes.",
      recap: [
        "Executing one instruction = micro-operations (fetch, decode, execute, write back), each driven by control signals — all encoded together into a CONTROL WORD.",
        "Fields: Opcode (operation, 0010 = ADD) · Src1 · Src2 · Dest (register codes: 0000=R1, 0001=R2, 0010=R3) · ALU control (000 AND, 001 OR, 010 ADD, 011 SUB, 100 MUL) · Flags bit (1 = update Zero/Carry/Overflow).",
        "Example: ADD R1 ← R2 + R3 → opcode 0010, Src1 0001 (R2), Src2 0010 (R3), Dest 0000 (R1), ALU 010, Flags 1.",
        "Decode any control word by reading each field against its table.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Last circle left a question hanging: the shared ALU can add, subtract, AND, OR… so **who tells it which one to do**, and which registers to use?\n\nSomething must carry the orders.",
            },
            {
              kind: "teach",
              body: "First, zoom in on what 'executing an instruction' really is: a sequence of **micro-operations** — fetch it, decode it, execute it, write the result back. Each micro-step is driven by **control signals**: tiny on/off wires enabling this register, selecting that ALU function.",
            },
            {
              kind: "teach",
              body: "Bundle all those signals for one operation into a single binary word and you get the **control word** — the CPU's marching orders, one instruction's worth of decisions in one row of bits.",
            },
            {
              kind: "teach",
              body: "Its fields, from your slides' table for `ADD R1 ← R2 + R3`:\n\n**Opcode** `0010` — the operation type (ADD).\n**Src1** `0001` = R2 · **Src2** `0010` = R3 — sources.\n**Dest** `0000` = R1 — where the result lands.\n**ALU control** `010` — which ALU function (000 AND, 001 OR, **010 ADD**, 011 SUB, 100 MUL).\n**Flags** `1` — update Zero/Carry/Overflow afterwards.",
            },
            {
              kind: "teach",
              body: "Notice the register codebook doing quiet work: `0000` means R1, `0001` R2, `0010` R3 — binary names for hardware, exactly the Unit 1 skill of reading small binary numbers. Every field is just a lookup against its little table.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A control word encodes…",
              options: [
                "the program's source code",
                "the control signals steering an instruction's micro-operations — sources, destination, ALU op, flags",
                "only the data values",
                "the clock speed",
              ],
              answer: 1,
              praise:
                "Marching orders in binary — every enable line and selection for one operation, bundled. That's the definition mark.",
            },
            {
              kind: "check",
              prompt: "With ALU codes 000 AND, 001 OR, 010 ADD, 011 SUB — the code 011 makes the ALU…",
              options: ["add", "subtract", "OR", "multiply"],
              answer: 1,
              praise:
                "Read straight off the table — 011 selects subtraction. Field decoding is table lookup, nothing deeper.",
            },
            {
              kind: "check",
              prompt: "The Flags field set to 1 means…",
              options: [
                "the instruction failed",
                "Zero/Carry/Overflow will be updated by this operation",
                "the ALU is disabled",
                "the result is negative",
              ],
              answer: 1,
              praise:
                "A permission bit — 1 records the outcome in the status flags, 0 leaves them alone. Small field, favourite question.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: decode a fresh word",
              body: "Decode this control word against the tables:\n\n`opcode 1010 · Src1 0000 · Src2 0010 · Dest 0001 · ALU 011 · Flags 0`\n\nALU 011 = **SUB** · Src1 R1, Src2 R3 · Dest R2 · flags untouched.\n\nReading: **R2 ← R1 − R3, don't update flags.** Field by field, table by table — that's the entire technique.",
            },
            {
              kind: "check",
              prompt: "You decode one: Dest field 0010, ALU control 001. The result of an OR lands in…",
              options: ["R1", "R2", "R3", "memory"],
              answer: 2,
              praise:
                "0010 = R3 by the codebook, 001 = OR by the ALU table. Two lookups, full answer — exam speed achieved.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student reads Src1 = 0001 as 'register 1'. Diagnose.",
              options: [
                "Correct",
                "The codebook says 0001 = R2 — codes don't line up with register numbers, so always read the table",
                "0001 means memory",
                "Src1 is never a register",
              ],
              answer: 1,
              praise:
                "The off-by-one ambush — 0000 is R1, so 0001 is R2. Trusting the given table over intuition is precisely what this question type tests.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The word meets the hardware",
              body: "Now merge the last two circles into one moving picture:\n\nThe control word's **Src fields** open two registers onto the bus → its **ALU control** sets the shared ALU's function → its **Dest field** opens the landing register → its **Flags bit** decides whether the outcome is recorded.\n\nThe common-ALU diagram was the body; the control word is the nervous system. One structure, one signal-bundle, every instruction.",
            },
            {
              kind: "check",
              prompt: "Why does a SHARED ALU make the control word's ALU-control field necessary at all?",
              options: [
                "It isn't necessary",
                "One circuit serves many operations — something must select WHICH operation, per instruction",
                "The field stores the operands",
                "It's only for multiplication",
              ],
              answer: 1,
              praise:
                "Connected — a one-trick ALU would need no selector; a shared one needs orders. You just explained the field's existence, not just its contents. That's the deep version of this topic.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-cpu",
      title: "Quick review: inside the CPU",
      unit: 2,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-instr-categories", "ca-data-manip", "ca-cpu-alu", "ca-control-word"],
        count: 5,
      },
      deps: ["ca-control-word"],
      whyItMatters:
        "Categories, ALU, control word — five questions before the addressing modes arrive needing all of it.",
      recap: [],
      steps: [],
    },
    {
      id: "ca-addr-idea",
      title: "What an addressing mode is (+ implied mode)",
      unit: 2,
      weight: "medium",
      deps: ["ca-rev-cpu"],
      whyItMatters:
        "CO2 is literally 'explain the addressing modes and their importance' — this circle is the definition that anchors the whole family.",
      recap: [
        "An addressing mode = the way an instruction's operand is specified — a rule for interpreting/modifying the address field BEFORE the operand is used.",
        "The full family (12 names): implied, stack, immediate, direct, indirect, register direct, register indirect, relative, indexed, base register, auto-increment, auto-decrement.",
        "Implied (implicit) mode: the instruction's own definition specifies the operand — CMA (complement accumulator); zero-address stack instructions.",
        "Why modes matter: they trade speed vs flexibility in how operands are found.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Every instruction that computes needs **operands** — the values to work on. Obvious question with a non-obvious answer:\n\n**where does the instruction say its operands are?**",
            },
            {
              kind: "teach",
              body: "Turns out there isn't one answer — there are about a dozen, and each is called an **addressing mode**: \"the way in which the operand of an instruction is specified… a rule for interpreting or modifying the address field before the operand is actually used.\"\n\nSame instruction word, different rules for reading its address part.",
            },
            {
              kind: "teach",
              body: "The roll call from your slides — twelve names, no need to memorise yet, just hear them once:\n\nimplied · stack · immediate · direct · indirect · register direct · register indirect · relative · indexed · base register · auto-increment · auto-decrement.\n\nThe next circles take them in small families. This circle takes the strangest one first.",
            },
            {
              kind: "teach",
              body: "**Implied (implicit) mode:** the instruction needs NO address field at all — its own definition names the operand.\n\n`CMA` — *complement accumulator*. Which operand? The accumulator, obviously; it's in the name. The slides add: in a stack-organized computer, **zero-address instructions are implied mode** — their operands are implicitly the top of the stack.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "An addressing mode is best defined as…",
              options: [
                "the speed of an instruction",
                "the rule for interpreting the address field to locate the operand",
                "the size of the operand",
                "the register codebook",
              ],
              answer: 1,
              praise:
                "The definition, nearly word for word from the slides — the rule that turns an address field into an operand. CO2's cornerstone sentence.",
            },
            {
              kind: "check",
              prompt: "CMA (complement accumulator) uses which mode, and why?",
              options: [
                "Direct — it names an address",
                "Implied — the instruction's own definition specifies the operand",
                "Immediate — the operand is attached",
                "Indexed",
              ],
              answer: 1,
              praise:
                "Implied — no address field needed when the name already says 'the accumulator'. Definition plus example: the full-mark shape.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Why so many modes?",
              body: "If one mode sufficed, hardware designers would use one. They keep twelve because each trades differently between **speed** (how many memory trips to reach the operand) and **flexibility** (constants? variables? tables? positions relative to here?).\n\nAs the next circles unfold, keep one running score for each mode: *how many memory references does it cost?* That single number organises the entire family — and it's the exam's favourite question about them.",
            },
            {
              kind: "check",
              prompt: "Zero-address stack instructions count as implied mode because…",
              options: [
                "they have no operands at all",
                "their operands are implicitly the top of the stack — defined by the instruction, not an address field",
                "the stack is a register",
                "they're not really instructions",
              ],
              answer: 1,
              praise:
                "The operands exist — the stack top supplies them — but nothing needs addressing. Implied mode's whole trick, and a preview of Unit 3's stack machine.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-addr-immediate",
      title: "Immediate & stack addressing",
      unit: 2,
      weight: "medium",
      deps: ["ca-addr-idea"],
      whyItMatters:
        "Immediate mode is a guaranteed spot-the-mode question (#20 territory), and stack mode bridges straight into Unit 3.",
      recap: [
        "Immediate mode: the operand itself sits IN the instruction — an operand field replaces the address field. MOV R #20 loads the constant 20.",
        "Fastest possible: zero memory references to fetch the operand. Limitation: only constants known when the program was written.",
        "Stack mode: the operand is at the TOP of the stack — ADD pops the top two values, adds, pushes the result back.",
        "Both modes need no memory address in the instruction.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Suppose the operand you need is just… the number 20. A constant. Must the CPU really store 20 somewhere in memory, then fetch it back?\n\nWasteful. There's a shortcut: **pack the operand inside the instruction itself.**",
            },
            {
              kind: "teach",
              body: "That's **immediate mode**: \"instead of an address field, an **operand field** is present that contains the operand.\"\n\n`MOV R #20` — initialise register R to the constant 20. The `#` is the tell. The value travels *with* the instruction; nothing is fetched. **Zero memory references** — nothing is faster.",
            },
            {
              kind: "teach",
              body: "Second family member: **stack mode**. The operand is \"contained at the **top of the stack**.\"\n\n`ADD` — pops the top two values, adds them, **pushes the result back on top**. No address, no register name; the stack's discipline supplies everything. (Unit 3 builds a whole machine on this.)",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In MOV R #20, the 20 is found…",
              options: [
                "at memory address 20",
                "inside the instruction itself — immediate mode",
                "in register 20",
                "on the stack",
              ],
              answer: 1,
              praise:
                "The # marks a constant riding inside the instruction — fastest mode there is, at the price of being fixed at write-time.",
            },
            {
              kind: "check",
              prompt: "In stack addressing, ADD gets its two operands from…",
              options: [
                "the instruction's address fields",
                "the top two values of the stack, which it pops",
                "R1 and R2",
                "main memory",
              ],
              answer: 1,
              praise:
                "Pop, pop, add, push — the stack's top IS the address. And where does the result go? Back on top, ready for the next operation.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "The limitation that defines immediate mode",
              body: "Immediate mode's price: the operand was **frozen when the program was written**. `MOV R #20` can only ever load 20 — it can't load 'whatever the user typed', because that value didn't exist yet.\n\nConstants → immediate. Values that change at run time → every other mode. That boundary is exactly what compare-the-modes questions probe.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"immediate mode is best for loading a value the user just entered.\" Diagnose.",
              options: [
                "Correct — it's the fastest",
                "User input isn't known when the program is written — immediate only carries compile-time constants",
                "Immediate can't load registers",
                "User input uses stack mode",
              ],
              answer: 1,
              praise:
                "The freeze-at-write-time limit, applied — speed isn't the only axis. You now argue mode CHOICE, which is a level above naming modes.",
            },
            {
              kind: "check",
              prompt: "You classify one: PUSH-less, address-less ADD on a stack computer is simultaneously… ",
              options: [
                "immediate and direct",
                "stack mode and a zero-address (implied) instruction",
                "register direct",
                "indexed",
              ],
              answer: 1,
              praise:
                "Both labels stick — stack mode by operand location, zero-address/implied by instruction format. Two vocabularies, one instruction: that overlap IS Unit 3's opening door.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-addr-direct-indirect",
      title: "Direct vs indirect addressing",
      unit: 2,
      weight: "heavy",
      deps: ["ca-addr-immediate"],
      whyItMatters:
        "The 1-versus-2 memory-reference count is the single most-tested addressing fact — it's on your sample paper in both directions.",
      recap: [
        "Direct (absolute) mode: the address field IS the effective address of the operand → ONE memory reference to fetch it.",
        "Indirect mode: the address field points to a memory location that CONTAINS the effective address → TWO memory references.",
        "Effective address = the address where the operand actually lives.",
        "Indirect buys flexibility (the real address can change at run time) at the cost of an extra memory trip.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Now the mainstream case: the operand lives in **memory**, and the instruction must say where.\n\nFirst, one term: the **effective address** — the address where the operand *actually* lives. Every memory mode is a different way of producing it.",
            },
            {
              kind: "teach",
              body: "**Direct mode** (also called **absolute**): the instruction's address field **is** the effective address. No interpretation needed.\n\nGo to that address, take the operand: **one memory reference**. Simple, honest, done.",
            },
            {
              kind: "teach",
              body: "**Indirect mode** adds a layer: the address field \"specifies the address of a memory location **that contains the effective address** of the operand.\"\n\nA pointer, in other words. Trip one: fetch the effective address. Trip two: fetch the operand. **Two memory references.**",
            },
            {
              kind: "teach",
              body: "Why ever pay the second trip? **Flexibility.** The instruction itself never changes, but the address stored at its target *can* — so the same instruction can reach different operands at different times. Direct is faster; indirect is more adaptable. That trade IS this pair of modes.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which mode lets the instruction directly specify the operand's memory address? (your paper's Q5)",
              options: ["Immediate", "Register", "Direct", "Indirect"],
              answer: 2,
              praise:
                "Direct — address field = effective address, one honest trip. A paper mark, collected.",
            },
            {
              kind: "check",
              prompt: "How many memory references does INDIRECT mode need to fetch the operand?",
              options: ["0", "1", "2", "3"],
              answer: 2,
              praise:
                "Two — one for the effective address, one for the operand it names. The count every addressing question orbits.",
            },
            {
              kind: "check",
              prompt: "The 'effective address' means…",
              options: [
                "the instruction's own address",
                "the address where the operand actually lives",
                "the fastest address",
                "the stack pointer",
              ],
              answer: 1,
              praise:
                "The operand's true home — and every memory mode is just a recipe for computing it. One term, whole family organised.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: the same field, two readings",
              body: "Instruction: `LOAD 300`. Memory holds: address 300 → `450`, address 450 → `7`.\n\n**Direct reading:** effective address = 300 → operand = **450**. One trip.\n**Indirect reading:** address 300 holds the effective address (450) → operand = **7**. Two trips.\n\nIdentical instruction bits — the MODE decided everything. That's why the mode must be specified at all.",
            },
            {
              kind: "check",
              prompt: "You work one: LOAD 500 in INDIRECT mode; memory: [500]=620, [620]=13. The operand is…",
              options: ["500", "620", "13", "1120"],
              answer: 2,
              praise:
                "Follow the pointer: 500 → 620 → 13. Two hops, landed exactly — you can now trace either mode from raw memory contents.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"indirect mode is pointless — it's just direct mode with extra steps.\" Diagnose.",
              options: [
                "Fair verdict",
                "The stored address can CHANGE at run time, letting one fixed instruction reach different operands — flexibility direct mode can't offer",
                "Indirect is faster",
                "Direct mode also takes two trips",
              ],
              answer: 1,
              praise:
                "The defence indirect deserves — the extra step buys run-time adaptability. Cost AND purpose: that's the compare-question answer in full.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-addr-register",
      title: "Register direct vs register indirect",
      unit: 2,
      weight: "heavy",
      deps: ["ca-addr-direct-indirect"],
      whyItMatters:
        "'Register = value, register-indirect = address' resolves a whole cluster of exam questions — including the trickiest pair on the mode list.",
      recap: [
        "Register (direct) mode: the operand IS in a CPU register; the address field names the register → ZERO memory references.",
        "Register indirect mode: the register holds the EFFECTIVE ADDRESS of the operand in memory → ONE memory reference.",
        "Mantra: register direct = the register has the VALUE; register indirect = the register has the ADDRESS.",
        "The full reference-count ladder: register 0 · direct/register-indirect 1 · indirect 2.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Memory trips are slow. The registers from the CPU circle are *right there*. So the fastest place an operand can live — other than inside the instruction — is a **register**.",
            },
            {
              kind: "teach",
              body: "**Register (direct) mode:** \"the operand is contained in a register set; the address field of the instruction refers to a CPU register that contains the operand.\"\n\nThe field names a register; the register holds the **value**. **No reference to memory is required** — zero trips.",
            },
            {
              kind: "teach",
              body: "**Register indirect mode:** the named register holds not the value but **the effective address** of an operand in memory.\n\nRead the register (free), then make **one memory reference** to fetch the operand. The register is a signpost, not the destination.",
            },
            {
              kind: "teach",
              body: "The mantra that keeps them apart forever:\n\n**Register direct — the register has the VALUE.**\n**Register indirect — the register has the ADDRESS.**\n\nSame register hardware, opposite meanings. Every exam trap in this family is built on blurring that line.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Register direct mode needs how many memory references to fetch the operand?",
              options: ["0", "1", "2", "3"],
              answer: 0,
              praise:
                "Zero — the operand never left the CPU. Registers are the only place cheaper than one trip.",
            },
            {
              kind: "check",
              prompt: "In register INDIRECT mode, the operand is found…",
              options: [
                "in the register itself",
                "in memory, at the address held in the register",
                "inside the instruction",
                "on the stack",
              ],
              answer: 1,
              praise:
                "Follow the signpost — register gives the address, memory gives the value. One trip, one operand.",
            },
            {
              kind: "check",
              prompt: "R5 contains 900; memory address 900 contains 42. Under register DIRECT mode, an instruction naming R5 gets…",
              options: ["42", "900", "R5", "nothing"],
              answer: 1,
              praise:
                "The register's CONTENTS, taken as the value: 900. (Indirect would have followed it to 42.) Feeling the difference on numbers is what locks it.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & compare",
          steps: [
            {
              kind: "teach",
              title: "The whole ladder, assembled",
              body: "Every mode you've met, ranked by memory references to fetch the operand:\n\n**0** — immediate (in the instruction) · register direct (in a register)\n**1** — direct (address field is the address) · register indirect (register holds the address)\n**2** — indirect (memory holds the address)\n\nOne little ladder, five modes placed. Most addressing MCQs are just asking you to point at a rung.",
            },
            {
              kind: "check",
              prompt: "You place one: which pair BOTH cost exactly one memory reference?",
              options: [
                "immediate & direct",
                "direct & register indirect",
                "register direct & indirect",
                "indirect & stack",
              ],
              answer: 1,
              praise:
                "Both make a single trip — one carries the address in the instruction, the other in a register. Same cost, different courier.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"register indirect is slower than plain indirect, since registers add a step.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — reading a register is free; register indirect costs 1 memory trip, plain indirect costs 2",
                "They're equal",
                "Neither touches memory",
              ],
              answer: 1,
              praise:
                "Register reads don't count as memory references — that's their whole appeal. 1 vs 2, and the ladder stands firm.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-addr-extended",
      title: "The computed modes: relative, indexed & friends",
      unit: 2,
      weight: "light",
      deps: ["ca-addr-register"],
      whyItMatters:
        "A lean circle covering the list's tail — including PC-relative, which your sample paper asks about by name.",
      recap: [
        "The remaining modes COMPUTE the effective address by adding the instruction's field to a register:",
        "Relative (PC-relative): effective address = program counter + offset — used for branches near the current instruction.",
        "Indexed: index register + offset — walking arrays. Base register: base register + offset — relocating whole programs.",
        "Auto-increment / auto-decrement: register indirect that steps the register after/before use — marching through tables automatically.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it",
          steps: [
            {
              kind: "teach",
              body: "The mode list's tail all share one recipe: **effective address = some register + the instruction's offset**. Which register changes the flavour:\n\n**Relative** — the **program counter**: 'the operand is 8 ahead of HERE'. Perfect for branches.\n**Indexed** — an index register: base address in the instruction, moving index in the register — arrays.\n**Base register** — the mirror image: base in the register, offset in the instruction — relocating programs wholesale.",
            },
            {
              kind: "teach",
              body: "And two self-driving variants of register indirect:\n\n**Auto-increment** — use the register's address, then **+1** it automatically.\n**Auto-decrement** — **−1** first, then use it.\n\nMarch through a table with no separate 'advance the pointer' instruction. That completes all twelve names from the family roll call.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which mode computes the effective address from the PROGRAM COUNTER? (your paper's exact question)",
              options: ["Immediate", "PC-relative", "Indexed", "Base-indexed"],
              answer: 1,
              praise:
                "Relative mode — anchored to 'here', which is why branch instructions love it. Paper mark, pocketed.",
            },
            {
              kind: "check",
              prompt: "Auto-increment mode is most naturally suited to…",
              options: [
                "loading one constant",
                "stepping through consecutive table entries without extra pointer arithmetic",
                "complementing the accumulator",
                "subroutine calls",
              ],
              answer: 1,
              praise:
                "The pointer feeds itself forward — one instruction per element, no bookkeeping. Mode matched to job: the lean circle's whole point.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Use & compare",
          steps: [
            {
              kind: "check",
              prompt: "You match one: walking an array using a moving index register against a fixed base address is…",
              options: ["relative", "indexed", "implied", "immediate"],
              answer: 1,
              praise:
                "Indexed — the array walker. Relative anchors to the PC, base-register to a relocation base; three cousins, three anchors.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"relative mode gives the operand's absolute address directly in the instruction.\" Diagnose.",
              options: [
                "Correct",
                "That's DIRECT mode — relative stores only an OFFSET, added to the PC at run time",
                "Relative uses the stack",
                "Relative has no offset",
              ],
              answer: 1,
              praise:
                "Offset-plus-PC, computed on the spot — which is why the same branch works wherever the code is loaded. The last mode, correctly fenced off from the first.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-modes",
      title: "Quick review: addressing modes",
      unit: 2,
      weight: "light",
      kind: "review",
      review: {
        topicIds: [
          "ca-addr-idea",
          "ca-addr-immediate",
          "ca-addr-direct-indirect",
          "ca-addr-register",
        ],
        count: 5,
      },
      deps: ["ca-addr-extended"],
      whyItMatters:
        "The reference-count ladder and the mode definitions, five fresh questions — CO2 sealed before Unit 3 builds on it.",
      recap: [],
      steps: [],
    },
  ],
};
