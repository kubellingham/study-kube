// Unit 5 — Pointers, Structures & Unions (CSE22D). Section F.
import type { Section, ExamQuestion } from "./types";

export const sectionF: Section = {
  id: "sec-f",
  letter: "F",
  title: "Pointers, Structures & Unions",
  tagline: "Addresses made visible, and records that bundle mixed data.",
  unit: 5,
  topics: [
    {
      id: "rev-callby",
      title: "Quick review: call by value & reference",
      unit: 5,
      weight: "light",
      kind: "review",
      review: { topicIds: ["call-by", "arrays-funcs"], count: 5 },
      deps: ["call-by", "arrays-funcs"],
      whyItMatters:
        "Pointers are the machinery UNDER call by reference — five questions so & and * feel familiar before they get names.",
      recap: [],
      steps: [],
    },
    {
      id: "pointers-idea",
      title: "Pointers: variables that hold addresses",
      unit: 5,
      weight: "heavy",
      deps: ["call-by", "data-types", "rev-callby"],
      whyItMatters:
        "Pointers are the most feared C topic and one of the most examined — and you've secretly been using them since scanf's &.",
      recap: [
        "A pointer is a variable that stores the ADDRESS of another variable.",
        "Declare with *: int *p; — initialise with &: p = &a;",
        "& = address-of (gives where a lives). * = dereference (gives the value at an address).",
        "The pointer's type must match the variable it points to (int * for int).",
        "Never dereference an uninitialised pointer — segmentation fault. Use int *p = NULL; when it points nowhere yet.",
      ],
      steps: [
        {
          kind: "teach",
          title: "A box that holds a location",
          body: "A normal variable stores a **value**. A **pointer** stores the **address** of another variable — *where* it lives in memory, not *what* it holds.\n\nYou already know both operators. `&` (**address-of**) you met in `scanf(\"%d\", &a)`. `*` (**dereference**) you met inside `swap(int *a, int *b)`. Unit 5 just names what you've been doing.",
          code: "int a = 10;\nint *ptr;    /* ptr is a pointer to an int */\nptr = &a;    /* ptr now holds a's address  */",
        },
        {
          kind: "teach",
          title: "The safety rules",
          body: "Three rules the exam checks:\n\n**Types must match** — an `int *` points to ints, a `float *` to floats. `char *cptr;` for chars.\n\n**Initialise before you dereference.** An uninitialised pointer holds a garbage address; using it causes a **segmentation fault** — a runtime error, not a compile error.\n\n**NULL is the safe 'points nowhere' value:** `int *p = NULL;` — a deliberate, checkable nothing.",
        },
        {
          kind: "check",
          prompt: "Which line correctly makes p point to the variable n?",
          code: "int n = 7;\nint *p;",
          options: ["p = n;", "p = &n;", "*p = n;", "&p = n;"],
          answer: 1,
          praise:
            "Right — a pointer wants an ADDRESS, and & is how you ask for one. p = n would try to stuff a value where a location belongs.",
        },
        {
          kind: "check",
          prompt: "What does dereferencing an uninitialised pointer typically cause?",
          options: [
            "A syntax error at compile time",
            "A segmentation fault at runtime",
            "It safely returns 0",
            "Nothing — it's fine",
          ],
          answer: 1,
          praise:
            "Exactly — the compiler can't see the bad address, so it compiles fine and crashes at runtime. That's why NULL initialisation is a habit, not a nicety.",
        },
        {
          kind: "check",
          prompt: "In the declaration int *ptr; the * means…",
          options: [
            "multiply",
            "ptr is a pointer to an int",
            "ptr is an int",
            "dereference ptr immediately",
          ],
          answer: 1,
          praise:
            "Right — in a DECLARATION the * marks the variable as a pointer. The same symbol in an expression means dereference; context decides, and exams love testing that you know which is which.",
        },
      ],
    },
    {
      id: "pointers-use",
      title: "Dereferencing: reading & writing through *",
      unit: 5,
      weight: "heavy",
      deps: ["pointers-idea", "io"],
      whyItMatters:
        "The predict-the-output pointer trace (x, &x, y, *y) is a near-certain exam question — and *p = 20 is call-by-reference stripped bare.",
      recap: [
        "*ptr reads the value at the address ptr holds: printf(\"%d\", *ptr) prints what a holds.",
        "*p = 20; WRITES through the pointer — the original variable changes.",
        "Trace with int x=10; int *y=&x; → x is 10, &x is x's address, y is that same address, *y is 10, &y is the pointer's OWN address.",
        "%p (or %u in the slides) prints addresses.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Following the arrow",
          body: "`*ptr` means \"go to the address ptr holds and use **the value there**\" — that's **dereferencing**:",
          code: "int a = 20;\nint *ptr = &a;\nprintf(\"Address of a = %p\\n\", ptr);   /* the address  */\nprintf(\"Value of a   = %d\\n\", *ptr);  /* 20           */",
        },
        {
          kind: "teach",
          title: "Writing through the pointer",
          body: "Dereferencing works on the LEFT of `=` too — and that's the move that changes the original:\n\nThis is exactly how `swap(&x, &y)` worked in Unit 3, and why `scanf` can fill your variable. One mechanism, three units of use.\n\nFull trace for `int x = 10; int *y = &x;`:\n`x` → 10 · `&x` → x's address · `y` → that same address · `*y` → 10 · `&y` → the pointer's **own** address (a pointer is a variable too!).",
          code: "int a = 5;\nint *p = &a;\n*p = 20;              /* changes a itself */\nprintf(\"%d\", a);      /* 20 */",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "int a = 5;\nint *p = &a;\n*p = 20;\nprintf(\"%d\", a);",
          options: ["5", "20", "The address of a", "Garbage"],
          answer: 1,
          praise:
            "That's the whole power of pointers in one line — *p = 20 wrote straight into a's memory. No copy, no middleman.",
        },
        {
          kind: "check",
          prompt: "Given int x = 10; int *y = &x; which TWO expressions print the same number?",
          options: ["x and *y", "x and y", "&x and &y", "y and *y"],
          answer: 0,
          praise:
            "Right — *y follows the address back to x's value, so both are 10. y and &x would ALSO match (both are x's address) — but x and y never do: one's a value, one's a location.",
        },
        {
          kind: "check",
          prompt: "&y (the address OF the pointer itself) is…",
          options: [
            "the same as &x",
            "the same as *y",
            "a different address — the pointer variable's own location in memory",
            "always NULL",
          ],
          answer: 2,
          praise:
            "Sharp — a pointer is itself a variable living somewhere, so it has its own address. That's the distinction the trickiest trace questions hinge on.",
        },
      ],
    },
    {
      id: "structures",
      title: "Structures: records of mixed types",
      unit: 5,
      weight: "heavy",
      deps: ["data-types", "strings"],
      whyItMatters:
        "Declaring a struct, making variables, and dot-access is a guaranteed 'write a program' question — a whole Student record in five lines.",
      recap: [
        "A structure is a USER-DEFINED type grouping different data types under one name — a record (student, employee, product).",
        "Declare: struct Student { int rollno; char name[20]; float marks; };",
        "Variables: struct Student s1, s2; (separately, or right after the closing brace).",
        "Access members with the dot: s1.rollno = 101; strcpy(s1.name, \"Aman\"); s1.marks = 89.5;",
        "Initialise in order: struct Student s1 = {101, \"Riya\", 95.0};",
      ],
      steps: [
        {
          kind: "teach",
          title: "One name for a whole record",
          body: "An array holds many values of ONE type. But a student has a roll number (int), a name (char array) AND marks (float). A **structure** groups **different types under one name** — a user-defined record type:",
          code: "struct Student {\n    int rollno;\n    char name[20];\n    float marks;\n};\n\nstruct Student s1, s2;   /* two structure variables */",
        },
        {
          kind: "teach",
          title: "The dot operator",
          body: "Reach inside a structure variable with the **dot**: `variable.member`.\n\nNote the string member needs `strcpy` (arrays can't be assigned with `=` — Unit 4 knowledge paying rent). And you can initialise a whole record in one line, values in member order:\n\n`struct Student s1 = {101, \"Riya\", 95.0};`",
          code: "s1.rollno = 101;\nstrcpy(s1.name, \"Aman\");\ns1.marks = 89.5;\n\nprintf(\"Roll No: %d\\n\", s1.rollno);\nprintf(\"Name: %s\\n\", s1.name);\nprintf(\"Marks: %.2f\\n\", s1.marks);",
        },
        {
          kind: "check",
          prompt: "Why can't we just use an array to store one student's rollno, name and marks?",
          options: [
            "Arrays are too slow",
            "Arrays hold values of a SINGLE type; these are int, char[] and float",
            "Arrays can't be passed to functions",
            "We could — structures are only decoration",
          ],
          answer: 1,
          praise:
            "Exactly the motivation — same-type is the array's rule, mixed-type records are the structure's job. That one sentence is the 'why structures?' theory answer.",
        },
        {
          kind: "check",
          prompt: "Which line correctly stores a name in the structure variable s1?",
          options: [
            "s1.name = \"Aman\";",
            "strcpy(s1.name, \"Aman\");",
            "s1->name = \"Aman\";",
            "name.s1 = \"Aman\";",
          ],
          answer: 1,
          praise:
            "Right — name is a char array, and arrays still can't be assigned with =, even inside a struct. strcpy through the dot: two units of knowledge in one line.",
        },
        {
          kind: "check",
          prompt: "After struct Student s1 = {101, \"Riya\", 95.0}; what is s1.marks?",
          options: ["101", "\"Riya\"", "95.0", "Garbage"],
          answer: 2,
          praise:
            "Right — the initialiser fills members IN DECLARATION ORDER: rollno gets 101, name gets \"Riya\", marks gets 95.0. Order is the whole trick.",
        },
      ],
    },
    {
      id: "unions",
      title: "Unions: one memory, many faces",
      unit: 5,
      weight: "medium",
      deps: ["structures"],
      whyItMatters:
        "The structure-vs-union comparison table is a classic theory question, and 'why does d.i print garbage?' tests real understanding of shared memory.",
      recap: [
        "A union looks like a structure but ALL members SHARE the same memory location.",
        "Size of union = size of its LARGEST member (structure = sum of all members).",
        "Only ONE member holds a valid value at a time — the last one assigned; assigning another OVERWRITES it.",
        "d.i = 10; d.f = 2.5; → d.i is now garbage (f overwrote the shared bytes).",
        "Use a structure when you need all fields at once; a union when only one at a time.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Same syntax, shared memory",
          body: "A **union** is declared like a structure — but with one deep difference: **every member occupies the SAME memory location**.\n\nConsequences:\n\n**Size** = the size of the **largest** member (a structure's size is the *sum* of members).\n**Only one member is valid at a time** — the most recently assigned. Assign a second member and the first's bytes are **overwritten**.",
          code: "union Data {\n    int i;\n    float f;\n    char str[20];\n};",
        },
        {
          kind: "teach",
          title: "Watching the overwrite",
          body: "The exam's favourite union demonstration:\n\nWhen `d.f` was assigned, it reused the very bytes `d.i` lived in — so reading `d.i` afterwards decodes float bits as an int: garbage.\n\n**Structure vs union in one line:** structure = every member has its own room (all valid at once); union = everyone shares one room (last in wins).",
          code: "union Data d;\nd.i = 10;\nprintf(\"%d\\n\", d.i);    /* 10 */\nd.f = 220.5;\nprintf(\"%.2f\\n\", d.f);  /* 220.50 */\nprintf(\"%d\\n\", d.i);    /* garbage! f overwrote it */",
        },
        {
          kind: "check",
          prompt: "A union has members int i (4 bytes), float f (4 bytes), char str[20] (20 bytes). Its size is…",
          options: ["28 bytes", "20 bytes — the largest member", "4 bytes", "48 bytes"],
          answer: 1,
          praise:
            "Right — one shared room only needs to fit the biggest occupant. Sum-of-all would be the STRUCTURE's size; that contrast is the exam question.",
        },
        {
          kind: "check",
          prompt: "After d.i = 100; d.f = 10.5; what does printf(\"%d\", d.i) show, and why?",
          options: [
            "100 — members are independent",
            "Garbage — assigning d.f overwrote the shared memory",
            "10 — the float is truncated",
            "0 — unions reset on each assignment",
          ],
          answer: 1,
          praise:
            "Exactly, and you said the WHY: shared memory means last-write-wins. Being able to explain that overwrite is what separates a memorised table from understanding.",
        },
      ],
    },
  ],
};

export const unit5Exam: ExamQuestion[] = [
  {
    id: "u5q1",
    topicId: "pointers-idea",
    unit: 5,
    prompt: "A pointer is a variable that stores…",
    options: [
      "a value of any type",
      "the memory address of another variable",
      "only integers",
      "the name of another variable",
    ],
    answer: 1,
    hint: "Normal variables hold values; pointers hold something that tells you WHERE a value lives.",
    explanation:
      "A pointer stores an address. int *p = &a; makes p hold the location of a, not a's value.",
  },
  {
    id: "u5q2",
    topicId: "pointers-idea",
    unit: 5,
    prompt: "Which is the safe way to declare a pointer that doesn't point anywhere yet?",
    options: ["int *p;", "int *p = 0.5;", "int *p = NULL;", "int p = NULL;"],
    answer: 2,
    hint: "Leaving it uninitialised invites a segmentation fault — what's the deliberate 'nowhere' value?",
    explanation:
      "NULL marks a pointer as deliberately pointing nowhere, and can be checked before use. A bare int *p; holds a garbage address.",
  },
  {
    id: "u5q3",
    topicId: "pointers-use",
    unit: 5,
    prompt: "What is the output?",
    code: "int x = 10;\nint *y = &x;\nprintf(\"%d %d\", x, *y);",
    options: ["10 10", "10 followed by an address", "An address twice", "10 0"],
    answer: 0,
    hint: "*y follows the stored address back to x.",
    explanation:
      "y holds x's address, so *y dereferences straight back to x's value: both print 10.",
  },
  {
    id: "u5q4",
    topicId: "pointers-use",
    unit: 5,
    prompt: "What does this print?",
    code: "int a = 5;\nint *p = &a;\n*p = *p + 10;\nprintf(\"%d\", a);",
    options: ["5", "15", "10", "The address of a"],
    answer: 1,
    hint: "*p on both sides: read the value at the address, add 10, write it back through the pointer.",
    explanation:
      "*p reads a (5), adds 10, and *p = ... writes 15 back into a's own memory. a is now 15.",
  },
  {
    id: "u5q5",
    topicId: "structures",
    unit: 5,
    prompt: "Structure members are accessed using which operator?",
    options: ["-> always", "the dot (.)", "&", "::"],
    answer: 1,
    hint: "s1.rollno = 101;",
    explanation:
      "A structure VARIABLE uses the dot: s1.rollno. (The arrow -> is for access through a structure pointer.)",
  },
  {
    id: "u5q6",
    topicId: "structures",
    unit: 5,
    prompt: "What does this print?",
    code: "struct Point { int x; int y; };\nstruct Point p = {3, 7};\nprintf(\"%d\", p.x + p.y);",
    options: ["37", "10", "3", "Error — structs can't be initialised like that"],
    answer: 1,
    hint: "The initialiser fills members in order: x first, then y.",
    explanation:
      "p.x = 3 and p.y = 7 (declaration order), so the sum is 10. Brace initialisation in member order is standard.",
  },
  {
    id: "u5q7",
    topicId: "structures",
    unit: 5,
    prompt: "A structure differs from an array because a structure…",
    options: [
      "can only hold two members",
      "can group members of DIFFERENT data types",
      "is always faster",
      "cannot be passed to functions",
    ],
    answer: 1,
    hint: "What was the one rule every array element had to obey?",
    explanation:
      "Arrays require one shared type; structures bundle mixed types (int + char[] + float) into one record.",
  },
  {
    id: "u5q8",
    topicId: "unions",
    unit: 5,
    prompt: "The size of a union equals…",
    options: [
      "the sum of all members' sizes",
      "the size of its largest member",
      "always 4 bytes",
      "the size of its first member",
    ],
    answer: 1,
    hint: "All members share ONE memory location — how big must that location be?",
    explanation:
      "Shared memory only needs to fit the biggest member. The sum-of-members rule belongs to structures.",
  },
  {
    id: "u5q9",
    topicId: "unions",
    unit: 5,
    prompt: "In a union, how many members can hold a valid value at the same time?",
    options: ["All of them", "Two", "Only one — the last assigned", "None"],
    answer: 2,
    hint: "They all live in the same bytes — what happens when a new member is assigned?",
    explanation:
      "Each assignment overwrites the shared bytes, so only the most recently assigned member reads back correctly.",
  },
  {
    id: "u5q10",
    topicId: "unions",
    unit: 5,
    prompt: "When should you choose a structure over a union?",
    options: [
      "When you need all the members' values at the same time",
      "When memory is extremely tight and only one member is used at a time",
      "Never — unions are always better",
      "Only when members are all int",
    ],
    answer: 0,
    hint: "Separate rooms vs one shared room — which do you need if everyone must be home at once?",
    explanation:
      "Structures give each member its own memory, so all values coexist — a union's shared memory only suits one-at-a-time use.",
  },
];
