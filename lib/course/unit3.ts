// Unit 3 — Functions (CSE22D). Section D: Functions.
import type { Section, ExamQuestion } from "./types";

export const sectionD: Section = {
  id: "sec-d",
  letter: "D",
  title: "Functions",
  tagline: "Breaking programs into named, reusable pieces.",
  unit: 3,
  topics: [
    {
      id: "rev-flow",
      title: "Quick review: loops",
      unit: 3,
      weight: "light",
      kind: "review",
      review: { topicIds: ["for-loops", "while-dowhile"], count: 5 },
      deps: ["for-loops"],
      whyItMatters:
        "Functions wrap loops constantly — five questions so entry-vs-exit control and for's order of events stay reflexive.",
      recap: [],
      steps: [],
    },
    {
      id: "func-why",
      title: "Why functions exist",
      unit: 3,
      weight: "medium",
      deps: ["hello-c", "for-loops", "rev-flow"],
      whyItMatters:
        "'Advantages of functions' is a straight theory question — and the reusability/modularity idea frames everything else in Unit 3.",
      recap: [
        "A function is a named block of code that performs one task and can be called from anywhere.",
        "Advantages: reusability (write once, call many times), modularity (big problem → small pieces), easier debugging & testing, shorter programs.",
        "Two kinds: library functions (printf, scanf, sqrt — already written) and user-defined functions (you write them).",
        "main() is itself a function — the one the program starts from.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Name a task once, use it forever",
          body: "A **function** is a named block of code that does one job. Instead of pasting the same ten lines everywhere you need them, you write them once, give them a name, and **call** the name.\n\nThe advantages exams ask for:\n\n**Reusability** — write once, call many times.\n**Modularity** — a big problem becomes small, separately-solvable pieces.\n**Easier debugging** — a bug lives in one function, not smeared across the file.\n**Shorter, clearer programs.**\n\nYou've been using functions all along: `printf` and `scanf` are **library functions** (pre-written, shipped with C). Ones you write are **user-defined**. And `main` itself? Also a function — just the one C promises to call first.",
        },
        {
          kind: "check",
          prompt:
            "The same 12 lines of average-calculating code appear 4 times in a program. Which function advantage most directly fixes this?",
          options: ["Faster execution", "Reusability", "More memory", "Case sensitivity"],
          answer: 1,
          praise:
            "Exactly — write it once as a function, call it four times. Fixing a bug then means fixing ONE place, which is the modularity payoff riding along free.",
        },
        {
          kind: "check",
          prompt: "printf is best described as a…",
          options: [
            "keyword",
            "user-defined function",
            "library function",
            "preprocessor directive",
          ],
          answer: 2,
          praise:
            "Right — someone at Bell Labs wrote it decades ago, stdio.h declares it, and you just call it. That's the library half of the function world.",
        },
      ],
    },
    {
      id: "func-anatomy",
      title: "Declaration, definition, call & the four shapes",
      unit: 3,
      weight: "heavy",
      deps: ["func-why"],
      whyItMatters:
        "Declaration-vs-definition-vs-call and the four function shapes are the structural questions Unit 3 is built from.",
      recap: [
        "Declaration (prototype): tells the compiler the function's name, return type and parameters — int add(int, int); — before it's used.",
        "Definition: the actual body of the function.",
        "Call: using it — sum = add(3, 4);",
        "Four shapes: no args & no return (void greet(void)), no args & return (int getNum(void)), args & no return (void show(int)), args & return (int add(int, int)).",
        "void as return type = returns nothing; return sends a value back and ends the function.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three moments in a function's life",
          body: "Every function has three separate moments, and exams test that you can tell them apart:\n\n**Declaration (prototype)** — a promise to the compiler: name, return type, parameter types. Ends in a semicolon.\n**Definition** — the actual body: what the function does.\n**Call** — the moment you use it.",
          code: "#include <stdio.h>\n\nint add(int a, int b);      /* declaration */\n\nint main() {\n    int s = add(3, 4);      /* call */\n    printf(\"%d\", s);        /* 7 */\n    return 0;\n}\n\nint add(int a, int b) {     /* definition */\n    return a + b;\n}",
        },
        {
          kind: "teach",
          title: "The four shapes",
          body: "Mix 'takes arguments?' with 'returns a value?' and you get the **four shapes** of a function:\n\n**No args, no return** — `void greet(void)` — just does something.\n**No args, returns** — `int getNumber(void)` — produces a value from nothing (e.g. reads input).\n**Args, no return** — `void show(int n)` — consumes a value, shows/uses it.\n**Args, returns** — `int add(int a, int b)` — the full pipeline: values in, value out.\n\n`void` in the return slot means \"returns nothing\". `return x;` sends a value back **and ends the function on the spot**.",
        },
        {
          kind: "check",
          prompt: "Which line is a function DECLARATION (prototype)?",
          options: [
            "int square(int n) { return n * n; }",
            "int square(int);",
            "y = square(5);",
            "#include <stdio.h>",
          ],
          answer: 1,
          praise:
            "That's the promise — type, name, parameter types, semicolon, no body. The compiler now knows how square must be called, long before it sees the definition.",
        },
        {
          kind: "check",
          prompt:
            "A function reads a number from the user and hands it back to the caller. Which shape is it?",
          options: [
            "No arguments, no return value",
            "No arguments, returns a value",
            "Arguments, no return value",
            "Arguments and return value",
          ],
          answer: 1,
          praise:
            "Right — nothing goes in from the caller, but a value comes back out. Matching real tasks to the four shapes is exactly how the exam frames this.",
        },
        {
          kind: "check",
          prompt: "What happens the moment return runs inside a function?",
          options: [
            "The function keeps running to its last line",
            "The value is sent back and the function ends immediately",
            "The program ends",
            "Nothing until the closing brace",
          ],
          answer: 1,
          praise:
            "Exactly — return is both the delivery and the exit. Any code after an unconditional return is unreachable.",
        },
      ],
    },
    {
      id: "scope",
      title: "Scope: local vs global, actual vs formal",
      unit: 3,
      weight: "medium",
      deps: ["func-anatomy"],
      whyItMatters:
        "Local-vs-global and actual-vs-formal are definition questions that also explain WHY call by value behaves the way it does next lesson.",
      recap: [
        "Local variable: declared inside a function — exists only while that function runs; invisible outside.",
        "Global variable: declared outside all functions — visible to every function; lives for the whole program.",
        "When names clash, the LOCAL one wins inside its function.",
        "Actual parameters: the values passed in the CALL — add(3, 4).",
        "Formal parameters: the variables in the DEFINITION that receive them — int add(int a, int b).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Where a variable lives",
          body: "A **local variable** is declared inside a function. It is born when the function starts, dies when it returns, and no other function can see it.\n\nA **global variable** is declared outside all functions. Everyone can see it, and it lives as long as the program does.\n\nIf a local and a global share a name, the **local wins** inside its own function — the nearer name shadows the farther one.",
          code: "int count = 100;          /* global */\n\nvoid demo() {\n    int count = 5;        /* local shadows global */\n    printf(\"%d\", count);  /* 5 */\n}",
        },
        {
          kind: "teach",
          title: "Actual vs formal",
          body: "Two words for the two ends of a call:\n\n**Actual parameters** — what the *caller* passes: the `3` and `4` in `add(3, 4)`.\n**Formal parameters** — what the *function* receives: the `a` and `b` in `int add(int a, int b)`.\n\nAt the call, each actual value is **copied into** its formal parameter. Hold onto that word — *copied* — it's the entire secret of the next lesson.",
        },
        {
          kind: "check",
          prompt: "In sum = add(x, y); with definition int add(int a, int b), which are the FORMAL parameters?",
          options: ["x and y", "a and b", "sum", "3 and 4"],
          answer: 1,
          praise:
            "Right — formal parameters live in the definition's parentheses, waiting to receive. x and y are the actuals doing the sending.",
        },
        {
          kind: "check",
          prompt: "A variable declared inside main() can be used…",
          options: [
            "by every function in the program",
            "only inside main()",
            "only after the program ends",
            "by any function that declares it extern",
          ],
          answer: 1,
          praise:
            "Exactly — local means local, even in main. If another function needs the value, you pass it as a parameter; that's what parameters are FOR.",
        },
      ],
    },
    {
      id: "call-by",
      title: "Call by value vs call by reference",
      unit: 3,
      weight: "heavy",
      deps: ["scope", "io"],
      whyItMatters:
        "The swap question — why it fails by value and works by reference — is the single most famous exam question in Unit 3.",
      recap: [
        "Call by VALUE: a COPY of the value goes to the function. Changes affect only the copy — the caller's variable is untouched. This is C's default.",
        "Call by REFERENCE: the ADDRESS goes instead (&x into int *p). The function reaches back through the pointer (*p) and changes the ORIGINAL.",
        "swap(a, b) by value fails — it swaps copies. swap(&a, &b) with pointers works.",
        "Same & you learned in scanf — scanf works by reference for exactly this reason.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Copies go in, originals stay home",
          body: "By default, C passes arguments **by value**: the actual parameter's value is **copied** into the formal parameter. The function works on the copy; the caller's variable never moves.\n\nWatch the famous failure:",
          code: "void swap(int a, int b) {\n    int t = a; a = b; b = t;   /* swaps the copies */\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(x, y);\n    printf(\"%d %d\", x, y);     /* still 5 10 ! */\n}",
        },
        {
          kind: "teach",
          title: "Pass the address instead",
          body: "**Call by reference** sends the variable's **address** (with `&`), received into a **pointer** (`int *p`). Writing through `*p` changes the *original*:\n\nSound familiar? `scanf(\"%d\", &x)` is exactly this — scanf needs to change YOUR variable, so it must be handed the address. The `&` rule you learned in Unit 1 was call by reference all along.",
          code: "void swap(int *a, int *b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf(\"%d %d\", x, y);     /* 10 5 — swapped! */\n}",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "void change(int n) {\n    n = 99;\n}\n\nint main() {\n    int x = 5;\n    change(x);\n    printf(\"%d\", x);\n}",
          options: ["99", "5", "0", "Undefined"],
          answer: 1,
          praise:
            "Right — change() got a copy, vandalised the copy, and the copy died at return. x never felt a thing. That's call by value in one sentence.",
        },
        {
          kind: "check",
          prompt: "To make change() actually modify x, the call and the parameter must become…",
          options: [
            "change(x); with int n",
            "change(&x); with int *n, assigning *n = 99;",
            "change(*x); with int &n",
            "It's impossible in C",
          ],
          answer: 1,
          praise:
            "That's the full mechanism — & sends the address, *n reaches back through it. You can now explain WHY the swap program fails or works, which is precisely what the exam wants.",
        },
        {
          kind: "check",
          prompt: "Why does scanf require &x but printf doesn't? (You've seen this before — now in Unit 3 language.)",
          options: [
            "scanf is call by reference (it must modify your variable); printf is call by value (it only needs a copy to read)",
            "printf is older than scanf",
            "& makes scanf run faster",
            "No reason — it's arbitrary",
          ],
          answer: 0,
          praise:
            "There it is — the Unit 1 rule and the Unit 3 concept are the same idea wearing two hats. When ideas connect like this, you stop memorising and start knowing.",
        },
      ],
    },
    {
      id: "recursion",
      title: "Recursion",
      unit: 3,
      weight: "heavy",
      deps: ["func-anatomy", "selection-if"],
      whyItMatters:
        "Factorial-by-recursion is a bankable exam question, and 'what happens without a base condition' tests real understanding.",
      recap: [
        "Recursion = a function calling itself, each call on a smaller piece of the problem.",
        "Every recursive function needs a BASE CONDITION — the case that stops the calls. Without it: infinite calls → stack overflow.",
        "factorial(n) = n * factorial(n-1), base: factorial(0) = 1. So factorial(5) = 120.",
        "Advantages: elegant, mirrors the maths. Disadvantages: more memory (call stack) and slower than a loop.",
      ],
      steps: [
        {
          kind: "teach",
          title: "A function that calls itself",
          body: "**Recursion** is a function solving a problem by calling *itself* on a smaller version, until the problem is small enough to answer directly.\n\nThat direct answer is the **base condition** — the escape hatch. Without one the calls never stop, the call stack fills, and the program dies (**stack overflow**). Notice which Unit 1 idea just reappeared: an algorithm must be finite.",
          code: "int factorial(int n) {\n    if (n == 0)              /* base condition */\n        return 1;\n    return n * factorial(n - 1);\n}",
        },
        {
          kind: "teach",
          title: "Unwinding factorial(5)",
          body: "Trace it down and back up:\n\n`factorial(5)` = 5 × `factorial(4)` = 5 × 4 × `factorial(3)` … down to `factorial(0)` = 1, then the results multiply on the way back up: 1 → 1 → 2 → 6 → 24 → **120**.\n\n**Trade-offs the exam asks for:** recursion is elegant and mirrors the mathematical definition — but every call sits on the **stack**, so it uses **more memory** and is **slower** than a plain loop doing the same job.",
        },
        {
          kind: "check",
          prompt: "What is factorial(4) using the function above?",
          options: ["12", "24", "120", "4"],
          answer: 1,
          praise:
            "4 × 3 × 2 × 1 = 24 — you rode the calls down to the base and multiplied back up. That trace IS the exam answer, worked marks and all.",
        },
        {
          kind: "check",
          prompt: "What happens if you delete the if (n == 0) return 1; line?",
          options: [
            "It still works, just slower",
            "It returns 0",
            "The calls never stop — stack overflow",
            "Compile error",
          ],
          answer: 2,
          praise:
            "Exactly — no base condition means no floor to land on: n goes -1, -2, … forever until the stack bursts. Finiteness, violated at runtime.",
        },
        {
          kind: "check",
          prompt: "Compared to a loop computing the same factorial, the recursive version…",
          options: [
            "uses less memory",
            "uses more memory and is generally slower, but is more elegant",
            "is always faster",
            "cannot compute factorial",
          ],
          answer: 1,
          praise:
            "That's the honest trade-off — each pending call occupies stack space a loop never needs. Elegance has a price tag, and the exam wants you to know both sides.",
        },
      ],
    },
  ],
};

export const unit3Exam: ExamQuestion[] = [
  {
    id: "u3q1",
    topicId: "func-why",
    unit: 3,
    prompt: "Which is an advantage of using functions?",
    options: [
      "Programs always run faster",
      "Code reusability and easier debugging",
      "No need for main()",
      "Variables become global automatically",
    ],
    answer: 1,
    hint: "Think 'write once, call many times' — and what that does when a bug appears.",
    explanation:
      "Functions give reusability, modularity, and easier testing/debugging. They don't inherently speed up execution.",
  },
  {
    id: "u3q2",
    topicId: "func-anatomy",
    unit: 3,
    prompt: "int area(int, int); is an example of a…",
    options: ["Function definition", "Function call", "Function declaration (prototype)", "Macro"],
    answer: 2,
    hint: "Semicolon, no body — is this a promise or the real thing?",
    explanation:
      "A prototype tells the compiler the return type and parameter types before use. The definition would carry a body in braces.",
  },
  {
    id: "u3q3",
    topicId: "func-anatomy",
    unit: 3,
    prompt: "A function declared void show(int n) …",
    options: [
      "takes nothing, returns int",
      "takes an int, returns nothing",
      "takes nothing, returns nothing",
      "takes an int, returns int",
    ],
    answer: 1,
    hint: "void sits in the RETURN slot; int n sits in the parameter slot.",
    explanation:
      "The return type is void (returns nothing); the parameter list takes one int — the 'arguments but no return value' shape.",
  },
  {
    id: "u3q4",
    topicId: "scope",
    unit: 3,
    prompt: "In the call area(len, wid) for definition int area(int l, int w), len and wid are the…",
    options: ["Formal parameters", "Actual parameters", "Global variables", "Return values"],
    answer: 1,
    hint: "Which end of the hand-off do they sit at — the call or the definition?",
    explanation:
      "Arguments at the call site are actual parameters; l and w in the definition are the formal parameters that receive their copies.",
  },
  {
    id: "u3q5",
    topicId: "scope",
    unit: 3,
    prompt: "What does this print?",
    code: "int v = 50;\nvoid f() {\n    int v = 7;\n    printf(\"%d \", v);\n}\nint main() {\n    f();\n    printf(\"%d\", v);\n}",
    options: ["7 50", "50 50", "7 7", "50 7"],
    answer: 0,
    hint: "Inside f, which v is nearer? And which v does main see?",
    explanation:
      "Inside f the local v (7) shadows the global; main has no local v so it sees the global 50.",
  },
  {
    id: "u3q6",
    topicId: "call-by",
    unit: 3,
    prompt: "What does this print?",
    code: "void twice(int n) {\n    n = n * 2;\n}\nint main() {\n    int x = 6;\n    twice(x);\n    printf(\"%d\", x);\n}",
    options: ["12", "6", "0", "36"],
    answer: 1,
    hint: "Did the function receive x itself, or a copy of x?",
    explanation:
      "Call by value: twice() doubles its private copy, which vanishes on return. x remains 6.",
  },
  {
    id: "u3q7",
    topicId: "call-by",
    unit: 3,
    prompt: "For swap to actually exchange x and y in the caller, it must be written and called as…",
    options: [
      "void swap(int a, int b) … swap(x, y)",
      "void swap(int *a, int *b) … swap(&x, &y)",
      "void swap(int a, int b) … swap(&x, &y)",
      "int swap(int, int) … x = swap(x, y)",
    ],
    answer: 1,
    hint: "The function needs the ADDRESSES, and pointer parameters to receive them.",
    explanation:
      "Call by reference: pass addresses with &, receive into pointers, swap through *a and *b so the originals change.",
  },
  {
    id: "u3q8",
    topicId: "recursion",
    unit: 3,
    prompt: "Every recursive function MUST have…",
    options: [
      "a global variable",
      "a base condition that stops the self-calls",
      "at least two parameters",
      "a for loop inside",
    ],
    answer: 1,
    hint: "What stops the function calling itself forever?",
    explanation:
      "Without a base condition the recursion never terminates and the call stack overflows — the finiteness requirement, enforced by crash.",
  },
  {
    id: "u3q9",
    topicId: "recursion",
    unit: 3,
    prompt: "Using int factorial(int n) { if (n == 0) return 1; return n * factorial(n - 1); }, factorial(5) returns…",
    options: ["25", "120", "60", "720"],
    answer: 1,
    hint: "5 × 4 × 3 × 2 × 1.",
    explanation: "The calls descend to factorial(0) = 1, then multiply back up: 5 × 4 × 3 × 2 × 1 = 120.",
  },
  {
    id: "u3q10",
    topicId: "recursion",
    unit: 3,
    prompt: "A disadvantage of recursion compared to iteration is…",
    options: [
      "it cannot solve factorial",
      "it needs more memory because each call is stacked",
      "it never terminates",
      "it can't use parameters",
    ],
    answer: 1,
    hint: "Where does each not-yet-finished call wait?",
    explanation:
      "Each pending recursive call occupies a stack frame, so recursion uses more memory and is generally slower than an equivalent loop.",
  },
];
