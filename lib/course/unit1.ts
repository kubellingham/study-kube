// Unit 1 — Basics of C (CSE22D). Two sections: A Foundations, B Meet C.
import type { Section, ExamQuestion } from "./types";

export const sectionA: Section = {
  id: "sec-a",
  letter: "A",
  title: "Foundations",
  tagline: "How programmers think before they ever touch C.",
  unit: 1,
  topics: [
    {
      id: "pdlc",
      title: "The program development life cycle",
      unit: 1,
      weight: "medium",
      deps: [],
      whyItMatters:
        "Every exam answer about 'how software gets made' hangs off these six phases.",
      recap: [
        "PDLC has 6 phases, in order: Problem definition → Problem analysis → Algorithm development → Coding & documentation → Testing & debugging → Maintenance.",
        "You design the solution (algorithm/flowchart) BEFORE writing code.",
        "Testing finds errors; maintenance keeps the program useful after release.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Programs are grown in phases",
          body: "A program is not written in one sitting — it moves through the **Program Development Life Cycle (PDLC)**, six phases in a fixed order:\n\n**1. Problem definition** — say precisely what problem you are solving.\n**2. Problem analysis** — work out the inputs you have and the outputs you need.\n**3. Algorithm development** — design the step-by-step solution (algorithm or flowchart) before any code.\n**4. Coding & documentation** — translate the design into a language like C.\n**5. Testing & debugging** — run it, find errors, fix them.\n**6. Maintenance** — keep improving and fixing it after release.",
        },
        {
          kind: "check",
          prompt:
            "You've been told what the problem is and what inputs and outputs are involved. According to the PDLC, what comes next?",
          options: [
            "Start coding in C immediately",
            "Design the algorithm",
            "Test the program",
            "Write the documentation",
          ],
          answer: 1,
          praise:
            "Exactly — design before code. The algorithm phase is where the real solving happens; C is just how you write it down.",
        },
        {
          kind: "check",
          prompt: "Which phase continues AFTER the program is delivered and in use?",
          options: ["Problem analysis", "Coding", "Maintenance", "Algorithm development"],
          answer: 2,
          praise:
            "Right — maintenance never really ends. Real programs keep being fixed and improved for as long as people use them.",
        },
      ],
    },
    {
      id: "algorithms",
      title: "Algorithms & their five characteristics",
      unit: 1,
      weight: "heavy",
      deps: ["pdlc"],
      whyItMatters:
        "The five characteristics are the most examinable list in Unit 1 — and the idea of 'finite, definite steps' underlies every program you'll write.",
      recap: [
        "An algorithm is a finite sequence of well-defined steps to solve a problem.",
        "Five characteristics: Input (zero or more), Output (at least one), Definiteness (each step clear & unambiguous), Finiteness (must terminate), Effectiveness (each step basic enough to actually carry out).",
        "Definiteness = no vague steps. Finiteness = no running forever.",
      ],
      steps: [
        {
          kind: "teach",
          title: "What an algorithm is",
          body: "An **algorithm** is a finite sequence of well-defined steps that solves a problem. Think of a recipe: precise steps, in order, that anyone can follow and finish.\n\nIt has **five characteristics**, and exams love them:\n\n**Input** — it takes zero or more inputs.\n**Output** — it produces at least one output.\n**Definiteness** — every step is clear and unambiguous.\n**Finiteness** — it must stop after a finite number of steps.\n**Effectiveness** — every step is basic enough to actually be carried out.",
        },
        {
          kind: "teach",
          title: "Why finiteness matters",
          body: "Ask *why* each trait exists and you'll never need to memorise the list.\n\nWhy must an algorithm be **finite**? Because an answer that never arrives is no answer. A procedure that loops forever never delivers its output — so it fails at the one job an algorithm has.\n\nWhy **definiteness**? Because a step like \"stir until it feels right\" means two people get two different results. A computer can't guess; every step must mean exactly one thing.",
        },
        {
          kind: "check",
          prompt:
            "A procedure has perfectly clear steps but never terminates for some inputs. Which characteristic does it violate?",
          options: ["Definiteness", "Effectiveness", "Finiteness", "Input"],
          answer: 2,
          praise:
            "Yes — finiteness. Clear steps aren't enough; if it never stops, it never answers. You'll meet this exact idea again as the infinite loop in Unit 2.",
        },
        {
          kind: "check",
          prompt:
            "Step 3 of a recipe-style algorithm says: \"add some numbers until it looks big enough.\" Which characteristic is broken?",
          options: ["Finiteness", "Definiteness", "Output", "Input"],
          answer: 1,
          praise:
            "That's it — 'some' and 'looks big enough' are ambiguous, so it fails definiteness. Computers need every step to mean exactly one thing.",
        },
        {
          kind: "check",
          prompt: "How many inputs must an algorithm take, at minimum?",
          options: ["At least one", "Exactly one", "Zero — inputs are optional", "Two"],
          answer: 2,
          praise:
            "Sharp catch — zero or more inputs, but at least ONE output. The asymmetry between Input and Output is a favourite trick question.",
        },
      ],
    },
    {
      id: "flowcharts",
      title: "Flowcharts",
      unit: 1,
      weight: "medium",
      deps: ["algorithms"],
      whyItMatters:
        "Flowchart symbols are guaranteed easy marks — if you match shape to job without hesitation.",
      recap: [
        "A flowchart is an algorithm drawn as a diagram.",
        "Oval/rounded = Start & End (terminal). Parallelogram = Input/Output. Rectangle = Process (calculation/assignment). Diamond = Decision (yes/no branch). Arrows = flow of control.",
        "One Start; flow generally top-to-bottom; every decision branch must be labelled.",
      ],
      steps: [
        {
          kind: "teach",
          title: "An algorithm you can see",
          body: "A **flowchart** is the same algorithm drawn as a picture. Each shape has one fixed job:\n\n**Oval** — Start and End (the terminals).\n**Parallelogram** — Input or Output (data going in or coming out).\n**Rectangle** — Process: a calculation or assignment.\n**Diamond** — Decision: a question with yes/no branches.\n**Arrows** — the flow of control from step to step.\n\nRules to remember: exactly one Start, flow runs top-to-bottom, and every branch leaving a diamond gets a label (yes/no).",
        },
        {
          kind: "check",
          prompt: "Which symbol represents reading a value from the user?",
          options: ["Rectangle", "Diamond", "Parallelogram", "Oval"],
          answer: 2,
          praise:
            "Right — input AND output share the parallelogram. One shape for everything crossing the program's boundary.",
        },
        {
          kind: "check",
          prompt:
            "In a flowchart that finds the larger of two numbers, where does the comparison a > b go?",
          options: [
            "In a rectangle, since it's a calculation",
            "In a diamond, since the flow branches on the answer",
            "In a parallelogram",
            "In the Start oval",
          ],
          answer: 1,
          praise:
            "Exactly — anything that splits the flow into yes/no lives in a diamond. Rectangles compute; diamonds decide.",
        },
      ],
    },
    {
      id: "errors",
      title: "Bugs, debugging & the three error types",
      unit: 1,
      weight: "medium",
      deps: ["pdlc"],
      whyItMatters:
        "\"Which error type is this?\" is a classic exam question — and knowing why logical errors are hardest shows real understanding.",
      recap: [
        "Debugging = finding and removing errors (bugs) from a program.",
        "Syntax error: breaks the language's grammar — caught by the compiler, program won't compile.",
        "Runtime error: happens while running (e.g. dividing by zero) — program crashes or stops.",
        "Logical error: program runs fine but produces the WRONG answer — hardest to find because nothing complains.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three ways a program goes wrong",
          body: "Errors in programs are called **bugs**; hunting them down is **debugging**. There are three kinds, and they differ by *when* and *how* they show themselves:\n\n**Syntax errors** break the grammar of C — a missing semicolon, a mistyped keyword. The **compiler catches them**; the program won't even compile.\n\n**Runtime errors** appear while the program runs — dividing by zero, using memory you don't own. The program compiles fine, then crashes.\n\n**Logical errors** are the sneaky ones: the program compiles, runs, finishes — and gives the **wrong answer**. Using `+` where you meant `*`. Nothing complains, so nothing points you at the bug.",
        },
        {
          kind: "check",
          prompt:
            "A program compiles and runs without any crash, but a program meant to average three numbers prints the wrong average. What kind of error is this?",
          options: ["Syntax error", "Runtime error", "Logical error", "Compiler error"],
          answer: 2,
          praise:
            "Yes — a logical error. And you can now explain WHY it's the hardest kind: no tool flags it, only a human comparing expected vs actual output can see it.",
        },
        {
          kind: "check",
          prompt: "You forget a semicolon at the end of a statement. Who catches it, and when?",
          options: [
            "The compiler, before the program ever runs",
            "The operating system, at runtime",
            "Nobody — the program gives wrong output",
            "The user, after release",
          ],
          answer: 0,
          praise:
            "Right — the compiler is your first proofreader. Syntax errors are annoying but the SAFEST kind: they can never sneak into a running program.",
        },
      ],
    },
    {
      id: "translators",
      title: "Languages & translators: compiler vs interpreter",
      unit: 1,
      weight: "medium",
      deps: ["pdlc"],
      whyItMatters:
        "The compiler-vs-interpreter comparison table is a standing exam favourite, and 'C is compiled' explains how your programs actually run.",
      recap: [
        "Machine language: 0s and 1s — the only language the CPU runs directly.",
        "Assembly language: mnemonics (ADD, MOV) — needs an assembler.",
        "High-level language (C): human-readable — needs a translator.",
        "Compiler: translates the WHOLE program at once, lists all errors together, runs fast afterwards. C uses a compiler.",
        "Interpreter: translates line by line, stops at the first error, slower execution.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three levels of language",
          body: "A CPU only understands **machine language** — raw 0s and 1s. Humans can barely write it.\n\n**Assembly language** replaces bit patterns with mnemonics like `ADD` and `MOV`; an **assembler** translates it down. Still tied to one machine.\n\n**High-level languages** like C read almost like English and work across machines — but the CPU can't run them directly. Something must translate. That translator is a **compiler** or an **interpreter**.",
        },
        {
          kind: "teach",
          title: "Compiler vs interpreter",
          body: "A **compiler** reads your **whole program at once** and translates it into machine code. You get all your errors reported together, and once compiled, the program runs **fast** — the translation is already done. **C uses a compiler.**\n\nAn **interpreter** translates **one line at a time**, executing as it goes. It stops at the first error it meets, and it re-translates every run — so execution is **slower**.\n\nMemory trick: a compiler is a book translator (translate the whole book, then anyone reads it fast); an interpreter is a live interpreter at a meeting (sentence by sentence, every single time).",
        },
        {
          kind: "check",
          prompt: "Which is TRUE of a compiler, compared to an interpreter?",
          options: [
            "It translates one line at a time",
            "It stops at the first error",
            "It translates the whole program at once and execution is faster",
            "It never reports errors",
          ],
          answer: 2,
          praise:
            "That's the heart of the comparison table — whole-program translation, all errors at once, fast execution. C sits on this side.",
        },
        {
          kind: "check",
          prompt: "Why can't the CPU run your C code directly?",
          options: [
            "C is too slow for the CPU",
            "The CPU only executes machine language, so C must be compiled first",
            "C programs are too long",
            "The CPU only runs assembly",
          ],
          answer: 1,
          praise:
            "Exactly — everything, no matter the language, ends as machine code. The compiler is the bridge from your ideas to the CPU's 0s and 1s.",
        },
      ],
    },
  ],
};

export const sectionB: Section = {
  id: "sec-b",
  letter: "B",
  title: "Meet C",
  tagline: "Your first program, and the pieces every C program is made of.",
  unit: 1,
  topics: [
    {
      id: "hello-c",
      title: "Your first C program",
      unit: 1,
      weight: "heavy",
      deps: ["translators"],
      whyItMatters:
        "Every program you write tonight — and every code question on the exam — is built on this skeleton.",
      recap: [
        "C was created by Dennis Ritchie at Bell Labs in 1972.",
        "Skeleton: #include <stdio.h> → int main() → statements ending in ; → return 0;",
        "#include <stdio.h> pulls in printf/scanf declarations. main() is where execution starts. return 0 means 'ended successfully'.",
        "C is case-sensitive: main, Main and MAIN are all different.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Where C came from",
          body: "**C** was created by **Dennis Ritchie** at **Bell Labs** in **1972** — originally to build the UNIX operating system. It's small, fast, close to the machine, and still everywhere: operating systems, embedded devices, and the languages that came after it (C++, Java, Python's own interpreter) all trace back here.",
        },
        {
          kind: "teach",
          title: "The skeleton",
          body: "Every C program you write starts from this shape:",
          code: "#include <stdio.h>\n\nint main()\n{\n    printf(\"Hello, world!\");\n    return 0;\n}",
        },
        {
          kind: "teach",
          title: "What each line does",
          body: "`#include <stdio.h>` — a **preprocessor directive**: it pulls in the **st**an**d**ard **i**nput/**o**utput header, which declares `printf` and `scanf`.\n\n`int main()` — the entry point. Execution **always starts at main**, whatever else the file contains.\n\n`printf(...)` — a statement. Every statement ends with a **semicolon**.\n\n`return 0;` — hands `0` back to the operating system, meaning \"finished successfully\".\n\nAnd remember: C is **case-sensitive** — `main`, `Main` and `MAIN` are three different names.",
        },
        {
          kind: "check",
          prompt: "Where does execution of a C program always begin?",
          options: [
            "At the first line of the file",
            "At the main() function",
            "At the first printf",
            "At #include <stdio.h>",
          ],
          answer: 1,
          praise:
            "Right — main() is the front door. The compiler may read the whole file, but the program's life starts at main.",
        },
        {
          kind: "check",
          prompt: "Why do we write #include <stdio.h> at the top?",
          options: [
            "It makes the program run faster",
            "It starts the program",
            "It brings in the declarations of printf and scanf",
            "It is where variables are stored",
          ],
          answer: 2,
          praise:
            "Exactly — printf and scanf aren't part of the language itself; they live in the standard I/O library, and stdio.h is how you tell the compiler about them.",
        },
        {
          kind: "check",
          prompt: "Who created C, where, and when?",
          options: [
            "Bjarne Stroustrup, Microsoft, 1985",
            "Dennis Ritchie, Bell Labs, 1972",
            "James Gosling, Sun, 1995",
            "Ken Thompson, IBM, 1969",
          ],
          answer: 1,
          praise:
            "Dennis Ritchie, Bell Labs, 1972 — three facts, three easy exam marks. Locked in.",
        },
      ],
    },
    {
      id: "variables",
      title: "Variables & constants",
      unit: 1,
      weight: "medium",
      deps: ["hello-c"],
      whyItMatters:
        "Naming rules and const-vs-#define are quick exam marks; = vs == mistakes cause real bugs all semester.",
      recap: [
        "A variable is a named memory location whose value can change; declare as: type name; (e.g. int age = 20;).",
        "Naming rules: letters, digits, underscore; must NOT start with a digit; no keywords; case-sensitive.",
        "= is assignment (store a value); == is comparison (are they equal?).",
        "Constants never change: const int MAX = 100; (typed variable) or #define PI 3.14 (preprocessor text substitution, no semicolon).",
        "Constant kinds: integer (10), floating (3.14), character ('A' — single quotes), string (\"hi\" — double quotes).",
      ],
      steps: [
        {
          kind: "teach",
          title: "A name for a box in memory",
          body: "A **variable** is a named box in memory whose contents can change while the program runs.\n\n`int age = 20;` declares a box named `age` holding an integer, starting at 20.\n\n**Naming rules** (exams test these): names use letters, digits and underscore `_`; they must **not start with a digit**; keywords like `int` or `for` are off-limits; and names are **case-sensitive** (`total` and `Total` are different boxes).",
        },
        {
          kind: "teach",
          title: "= is not ==",
          body: "One symbol, two meanings — and mixing them up is a classic bug:\n\n`=` **assigns**: `x = 5;` stores 5 into x.\n`==` **compares**: `x == 5` asks \"is x equal to 5?\" and yields true or false.\n\nWrite `if (x = 5)` by accident and C happily assigns 5 to x, treats 5 as true, and the if-branch always runs — a logical error the compiler never flags. Remember those from the errors lesson?",
        },
        {
          kind: "teach",
          title: "Constants",
          body: "A **constant** is a value that never changes. Two ways to make one:\n\n`const int MAX = 100;` — a real typed variable the compiler protects from change.\n`#define PI 3.14` — a **preprocessor** rule: before compiling, every `PI` in the file is text-replaced by `3.14`. Note: **no semicolon**, no type.\n\nConstant values themselves come in four kinds: integer (`10`), floating (`3.14`), character (`'A'` — **single** quotes, one character), and string (`\"hello\"` — **double** quotes).",
        },
        {
          kind: "check",
          prompt: "Which of these is a VALID variable name in C?",
          options: ["2ndValue", "my-score", "_total", "int"],
          answer: 2,
          praise:
            "Right — starting with an underscore is fine. The others break a rule each: starts with a digit, contains a hyphen, and is a keyword.",
        },
        {
          kind: "check",
          prompt: "What does the condition in if (marks = 40) actually do?",
          options: [
            "Checks whether marks equals 40",
            "Assigns 40 to marks, and the condition is always true",
            "Causes a syntax error",
            "Compares marks with 40 and assigns if equal",
          ],
          answer: 1,
          praise:
            "You caught the classic trap — single = assigns, and 40 is nonzero so the if always fires. That's a logical error: it compiles, runs, and quietly lies.",
        },
        {
          kind: "check",
          prompt: "Which line correctly defines a preprocessor constant for pi?",
          options: [
            "#define PI = 3.14;",
            "#define PI 3.14",
            "const PI 3.14",
            "define PI 3.14;",
          ],
          answer: 1,
          praise:
            "Exactly — #define is pure text substitution: no =, no semicolon, no type. That's what separates it from const.",
        },
      ],
    },
    {
      id: "data-types",
      title: "Data types & modifiers",
      unit: 1,
      weight: "medium",
      deps: ["variables"],
      whyItMatters:
        "Choosing int vs float vs char — and knowing the modifier list — comes up both directly and inside every code-reading question.",
      recap: [
        "Primary data types: int (whole numbers), float (decimals), double (bigger/more precise decimals), char (one character), void (nothing).",
        "Derived types: arrays, pointers, structures. User-defined: enum, etc.",
        "Modifiers tune size/range: short, long, signed, unsigned. unsigned = no negatives, doubles the positive range.",
        "char stores ONE character in single quotes: char grade = 'A';",
      ],
      steps: [
        {
          kind: "teach",
          title: "Telling C what kind of value",
          body: "Every variable has a **data type** — it tells C how much memory to use and how to interpret the bits.\n\n**Primary types:**\n`int` — whole numbers: `-3, 0, 42`\n`float` — decimal numbers: `3.14`\n`double` — decimals with more precision and range\n`char` — a single character: `'A'`\n`void` — \"no value\" (you'll meet it with functions)\n\nBeyond these sit **derived types** (arrays, pointers, structures) and **user-defined types** (like `enum`) — built out of the primary ones.",
        },
        {
          kind: "teach",
          title: "Modifiers",
          body: "Four **modifiers** adjust a type's size or range: `short`, `long`, `signed`, `unsigned`.\n\n`long int` — a bigger range of whole numbers.\n`unsigned int` — **no negative values**, which frees those bit patterns to roughly **double the positive range**. Perfect for counts that can never go below zero.\n\n`signed` is the default — plain `int` already allows negatives.",
        },
        {
          kind: "check",
          prompt: "You need to store a student's grade letter, like 'B'. Which declaration is right?",
          options: [
            "char grade = \"B\";",
            "char grade = 'B';",
            "int grade = B;",
            "string grade = 'B';",
          ],
          answer: 1,
          praise:
            "Right — one character, single quotes, char type. Double quotes would make it a string, which is a different animal you'll meet in Unit 4.",
        },
        {
          kind: "check",
          prompt:
            "A variable counts visitors and can never be negative. Which type uses the available range best?",
          options: ["signed int", "float", "unsigned int", "char"],
          answer: 2,
          praise:
            "Exactly — unsigned trades away negatives you'd never use and doubles the positive headroom. That's reasoning WITH the type system, not just memorising it.",
        },
      ],
    },
    {
      id: "io",
      title: "printf & scanf",
      unit: 1,
      weight: "heavy",
      deps: ["variables", "data-types"],
      whyItMatters:
        "Format specifiers and the & rule appear in nearly every code question on the paper — this topic pays rent everywhere.",
      recap: [
        "printf prints; scanf reads. Both use format specifiers.",
        "%d int · %f float · %lf double (in scanf) · %c char · %s string.",
        "scanf NEEDS & before variable names (the address-of operator): scanf(\"%d\", &age); — it must know WHERE to store the value.",
        "printf does NOT use & — it only needs the value itself.",
        "\\n = newline in output.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Talking to the user",
          body: "`printf` writes output; `scanf` reads input. Both use **format specifiers** — placeholders that say what type is coming:\n\n`%d` — int\n`%f` — float\n`%lf` — double (in `scanf`)\n`%c` — char\n`%s` — string\n\n`\\n` inside a printf string starts a new line.",
          code: "int age = 20;\nprintf(\"I am %d years old\\n\", age);",
        },
        {
          kind: "teach",
          title: "The & rule",
          body: "Here's the part everyone trips on. `scanf` must know **where in memory** to put the value it reads — so you pass the variable's **address**, using the address-of operator `&`:\n\n`scanf(\"%d\", &age);` ✓\n\n`printf` only needs the **value**, so no `&`:\n\n`printf(\"%d\", age);` ✓\n\nWhy the difference? printf is *reading from* the box — the value is enough. scanf is *writing into* the box — it needs the box's location. Keep that why; it's also the seed of call-by-reference in Unit 3.",
        },
        {
          kind: "check",
          prompt: "Which line correctly reads a float into the variable price?",
          options: [
            "scanf(\"%f\", price);",
            "scanf(\"%d\", &price);",
            "scanf(\"%f\", &price);",
            "printf(\"%f\", &price);",
          ],
          answer: 2,
          praise:
            "Both halves right — %f for float AND & for the address. scanf without & is the single most common beginner bug in C.",
        },
        {
          kind: "check",
          prompt: "Why does scanf need & when printf doesn't?",
          options: [
            "It's just C tradition",
            "scanf must know WHERE to store the value; printf only needs the value itself",
            "& makes scanf faster",
            "printf secretly uses & too",
          ],
          answer: 1,
          praise:
            "That's the understanding, not the memorised rule — writing needs an address, reading a value doesn't. You'll feel this idea again with call by reference.",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "int a = 7;\nprintf(\"Value: %d\\n\", a);",
          options: ["Value: %d", "Value: 7", "Value: a", "7: Value"],
          answer: 1,
          praise:
            "Right — %d is a placeholder that gets replaced by a's value, and \\n just ends the line. Reading printf output cold is a skill the exam rewards.",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators & precedence",
      unit: 1,
      weight: "medium",
      deps: ["variables"],
      whyItMatters:
        "Operator questions are 'predict the output' gold — especially integer division, modulus, and ++.",
      recap: [
        "Arithmetic: + - * / % — with ints, / drops the decimal (7/2 = 3) and % gives the remainder (7%2 = 1).",
        "Relational: < > <= >= == != produce 1 (true) or 0 (false).",
        "Logical: && (and), || (or), ! (not).",
        "x++ uses then adds; ++x adds then uses.",
        "Precedence: * / % before + -; use parentheses when unsure. Eight categories in total (arithmetic, relational, logical, assignment, increment/decrement, conditional, bitwise, special).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Arithmetic — and two int surprises",
          body: "C groups its operators into **eight categories** — arithmetic, relational, logical, assignment, increment/decrement, conditional, bitwise, special. The first three do most of the exam work.\n\n**Arithmetic:** `+ - * / %`. Two behaviours to burn in:\n\n**Integer division drops the decimal:** `7 / 2` is `3`, not 3.5 — both sides are ints, so the answer stays an int.\n**Modulus `%` gives the remainder:** `7 % 2` is `1`. (Even/odd test: `n % 2 == 0`.)",
        },
        {
          kind: "teach",
          title: "Comparing, combining, counting",
          body: "**Relational** operators (`< > <= >= == !=`) yield `1` for true, `0` for false — in C, true IS the number 1 and false IS 0.\n\n**Logical** operators combine conditions: `&&` (both must hold), `||` (either), `!` (flip).\n\n**Increment/decrement:** `x++` uses x's current value, *then* adds 1; `++x` adds 1 *first*. After either, x has grown by one — the difference only shows inside a bigger expression.\n\n**Precedence:** `* / %` bind before `+ -`, so `2 + 3 * 4` is `14`. When in doubt, parentheses — they cost nothing and remove all doubt.",
        },
        {
          kind: "check",
          prompt: "What is the value of 9 / 2 + 9 % 2 in C?",
          options: ["5.5", "5", "4", "6"],
          answer: 1,
          praise:
            "Beautiful — 9/2 is 4 (decimal dropped) and 9%2 is 1, so 5. You just used the two int rules that catch most students.",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "int x = 5;\nprintf(\"%d\", x++);\nprintf(\" %d\", x);",
          options: ["5 6", "6 6", "5 5", "6 5"],
          answer: 0,
          praise:
            "Exactly — x++ hands over the OLD value (5) and then bumps x, so the second print sees 6. Post- vs pre-increment, tamed.",
        },
        {
          kind: "check",
          prompt: "In C, the expression (3 > 5) evaluates to…",
          options: ["false", "0", "-1", "an error"],
          answer: 1,
          praise:
            "Right — C has no separate 'false'; comparisons produce the number 0 or 1. That's why numbers can sit directly inside an if.",
        },
      ],
    },
    {
      id: "casting",
      title: "Headers, libraries & type casting",
      unit: 1,
      weight: "medium",
      deps: ["data-types", "operators"],
      whyItMatters:
        "The (float) cast trick fixes integer division — a favourite 'why is the answer 3 not 3.33?' exam question — and header-vs-library is a neat theory mark.",
      recap: [
        "Header files declare functions: stdio.h (I/O), math.h (sqrt, pow), string.h (strlen…), stdlib.h (utilities), conio.h (console).",
        "Library files hold the compiled code: .lib/.a static (copied into your program) vs .dll/.so dynamic (shared at runtime).",
        "Implicit casting: C promotes smaller types automatically (int + float → float).",
        "Explicit casting: (float)x / y — cast BEFORE dividing to keep the decimal: 10/3 = 3 but (float)10/3 = 3.33.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Headers vs libraries",
          body: "A **header file** (`.h`) holds *declarations* — the names and shapes of functions: `stdio.h` for I/O, `math.h` for `sqrt`/`pow`, `string.h` for string functions, `stdlib.h` for utilities, `conio.h` for console extras.\n\nA **library file** holds the *compiled code* of those functions: **static** libraries (`.lib`/`.a`) are copied into your program at link time; **dynamic** libraries (`.dll`/`.so`) stay separate and are shared at runtime.\n\nHeader = the menu; library = the kitchen.",
        },
        {
          kind: "teach",
          title: "Type casting",
          body: "**Implicit casting** happens automatically: mix an int with a float and C *promotes* the int — `5 + 2.0` is `7.0`.\n\n**Explicit casting** is you forcing it, with the type in parentheses. This is THE fix for integer division:\n\n`10 / 3` → `3` (int ÷ int stays int)\n`(float)10 / 3` → `3.33` (one side becomes float **before** dividing, so the division keeps its decimals)\n\nCareful: `(float)(10 / 3)` is `3.0` — the damage is already done inside the parentheses before the cast arrives.",
        },
        {
          kind: "check",
          prompt: "avg comes out as 3 instead of 3.33. Which change fixes it?",
          code: "int sum = 10, n = 3;\nfloat avg = sum / n;",
          options: [
            "float avg = (float)(sum / n);",
            "float avg = (float)sum / n;",
            "int avg = sum / n;",
            "float avg = sum % n;",
          ],
          answer: 1,
          praise:
            "Precisely — cast BEFORE the division so it happens in float. The (float)(sum/n) version casts the already-truncated 3. That's the exact trap examiners set.",
        },
        {
          kind: "check",
          prompt: "What's the difference between a header file and a library file?",
          options: [
            "They are two names for the same thing",
            "Headers hold declarations; libraries hold the compiled function code",
            "Libraries hold declarations; headers hold compiled code",
            "Headers are only for maths functions",
          ],
          answer: 1,
          praise:
            "Menu vs kitchen — declarations in the header, actual code in the library. A tidy one-line answer that scores full theory marks.",
        },
      ],
    },
  ],
};

export const unit1Exam: ExamQuestion[] = [
  {
    id: "u1q1",
    topicId: "algorithms",
    unit: 1,
    prompt: "Which of the following is NOT one of the five characteristics of an algorithm?",
    options: ["Finiteness", "Definiteness", "Complexity", "Effectiveness"],
    answer: 2,
    hint: "The five traits describe what makes steps followable and finishable — one of these options is about difficulty instead.",
    explanation:
      "The five characteristics are Input, Output, Definiteness, Finiteness and Effectiveness. Complexity is a property you analyse, not a defining characteristic.",
  },
  {
    id: "u1q2",
    topicId: "algorithms",
    unit: 1,
    prompt: "An algorithm must produce at least how many outputs?",
    options: ["Zero", "One", "Two", "As many as its inputs"],
    answer: 1,
    hint: "Inputs are optional; results are not.",
    explanation:
      "An algorithm may take zero or more inputs but must produce at least one output — otherwise it solves nothing.",
  },
  {
    id: "u1q3",
    topicId: "flowcharts",
    unit: 1,
    prompt: "In a flowchart, a decision is represented by which symbol?",
    options: ["Rectangle", "Oval", "Parallelogram", "Diamond"],
    answer: 3,
    hint: "Which shape naturally has branches leaving it in different directions?",
    explanation:
      "The diamond holds a yes/no question and the flow branches on the answer. Rectangle = process, parallelogram = input/output, oval = start/end.",
  },
  {
    id: "u1q4",
    topicId: "errors",
    unit: 1,
    prompt:
      "A program compiles successfully but crashes when the user enters 0 as a divisor. This is a…",
    options: ["Syntax error", "Runtime error", "Logical error", "Linker error"],
    answer: 1,
    hint: "The grammar was fine; the problem only appeared while the program was executing.",
    explanation:
      "Division by zero happens during execution — a runtime error. Syntax errors stop compilation; logical errors give wrong output without crashing.",
  },
  {
    id: "u1q5",
    topicId: "translators",
    unit: 1,
    prompt: "Which statement about an interpreter is TRUE?",
    options: [
      "It translates the entire program before running it",
      "It translates and executes line by line, stopping at the first error",
      "It produces a fast standalone executable",
      "It is what C uses",
    ],
    answer: 1,
    hint: "Think of a live interpreter at a meeting, not a book translator.",
    explanation:
      "An interpreter works line by line and halts at the first error; execution is slower because translation happens every run. C uses a compiler.",
  },
  {
    id: "u1q6",
    topicId: "hello-c",
    unit: 1,
    prompt: "C was developed by ___ at ___ in ___.",
    options: [
      "Dennis Ritchie, Bell Labs, 1972",
      "Ken Thompson, Bell Labs, 1969",
      "Dennis Ritchie, IBM, 1980",
      "Bjarne Stroustrup, Bell Labs, 1983",
    ],
    answer: 0,
    hint: "The same lab that built UNIX, in the early seventies.",
    explanation: "Dennis Ritchie created C at Bell Labs in 1972, originally to write UNIX.",
  },
  {
    id: "u1q7",
    topicId: "io",
    unit: 1,
    prompt: "Which statement correctly reads an integer into the variable n?",
    options: [
      "scanf(\"%d\", n);",
      "scanf(\"%f\", &n);",
      "scanf(\"%d\", &n);",
      "printf(\"%d\", &n);",
    ],
    answer: 2,
    hint: "Two things must both be right: the specifier for an int, and telling scanf WHERE to store it.",
    explanation:
      "%d matches an int and & passes the variable's address so scanf knows where to write. Missing & is the classic scanf bug.",
  },
  {
    id: "u1q8",
    topicId: "operators",
    unit: 1,
    prompt: "What is the output?",
    code: "int a = 7, b = 2;\nprintf(\"%d\", a / b * b + a % b);",
    answer: 3,
    options: ["7.5", "9", "6", "7"],
    hint: "Work left to right with * / % first, remembering 7/2 stays an int.",
    explanation:
      "a/b = 3 (int division), 3*b = 6, a%b = 1, so 6+1 = 7. Integer division plus modulus reconstructs the original — a favourite exam pattern.",
  },
  {
    id: "u1q9",
    topicId: "variables",
    unit: 1,
    prompt: "Which of these is an INVALID variable name?",
    options: ["_count", "total2", "2total", "my_total"],
    answer: 2,
    hint: "Check the FIRST character of each.",
    explanation:
      "Variable names may not begin with a digit. Letters or underscore first; digits allowed after.",
  },
  {
    id: "u1q10",
    topicId: "casting",
    unit: 1,
    prompt: "What does this print?",
    code: "int x = 10, y = 4;\nprintf(\"%.1f\", (float)x / y);",
    options: ["2.0", "2.5", "2", "3.0"],
    answer: 1,
    hint: "The cast happens BEFORE the division — so does the division keep its decimals?",
    explanation:
      "(float)x makes the division 10.0/4 = 2.5. Without the cast, 10/4 would be 2. Casting before dividing preserves the fraction.",
  },
];
