// Unit 4 — Arrays & strings (CSE22D). Section E: Arrays & Strings.
import type { Section, ExamQuestion } from "./types";

export const sectionE: Section = {
  id: "sec-e",
  letter: "E",
  title: "Arrays & Strings",
  tagline: "Many values under one name — and how C spells text.",
  unit: 4,
  topics: [
    {
      id: "arrays-idea",
      title: "Arrays: what & why",
      unit: 4,
      weight: "medium",
      deps: ["data-types", "for-loops"],
      whyItMatters:
        "Indexing from 0 — and the off-by-one trap at the other end — quietly decides whether every array answer you give is right or wrong.",
      recap: [
        "An array stores MANY values of the SAME type in CONTIGUOUS memory, under one name.",
        "Declare: int marks[5]; — indexes run 0 to 4 (0 to N-1, never N).",
        "marks[0] is the first element; marks[5] is OUT OF BOUNDS for a 5-element array.",
        "Why arrays: replaces 60 separate variables with one name + a loop.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Sixty marks, one name",
          body: "Storing marks for 60 students as `m1, m2, … m60` is misery — and no loop can touch them. An **array** fixes this: **many values, same type, side by side in memory, one name**.\n\n`int marks[5];` reserves five int boxes. You pick a box with an **index in square brackets** — and indexes start at **0**:\n\n`marks[0]` — first element\n`marks[4]` — last element of a 5-box array\n`marks[5]` — **does not exist.** Indexes run 0 to N−1.\n\nThat 0-to-N−1 rule is the single most-tested fact about arrays.",
        },
        {
          kind: "check",
          prompt: "For int a[10];, which is the LAST valid element?",
          options: ["a[10]", "a[9]", "a[11]", "a[1]"],
          answer: 1,
          praise:
            "Right — ten boxes, numbered 0 through 9. a[10] is the off-by-one cliff that C won't even warn you about walking off.",
        },
        {
          kind: "check",
          prompt: "Which is TRUE of every element in a single array?",
          options: [
            "They can be different types",
            "They share the same type and sit in contiguous memory",
            "They are scattered randomly in memory",
            "They must all be zero",
          ],
          answer: 1,
          praise:
            "Both halves matter — same type is what makes indexing meaningful, and contiguous memory is why C can find element i instantly from the start address.",
        },
      ],
    },
    {
      id: "arrays-use",
      title: "Declaring, initialising & traversing",
      unit: 4,
      weight: "heavy",
      deps: ["arrays-idea"],
      whyItMatters:
        "Partial initialisation (rest become 0) and the sizeof length formula are two specific facts the paper loves.",
      recap: [
        "Full init: int a[5] = {1,2,3,4,5}; Auto-size: int a[] = {1,2,3}; (size inferred = 3).",
        "PARTIAL init: int a[5] = {1,2}; → {1,2,0,0,0} — the rest become 0.",
        "Length formula: sizeof(a) / sizeof(a[0]).",
        "The natural partner of an array is a for loop: for (i = 0; i < N; i++) … a[i].",
      ],
      steps: [
        {
          kind: "teach",
          title: "Filling the boxes",
          body: "Three ways to initialise:\n\n**Full:** `int a[5] = {10, 20, 30, 40, 50};`\n**Auto-sized:** `int a[] = {10, 20, 30};` — C counts for you (size 3).\n**Partial:** `int a[5] = {10, 20};` — and here's the exam fact: **the unfilled boxes become 0**, giving `{10, 20, 0, 0, 0}`.\n\nAnd the length trick worth its weight in marks:\n\n`sizeof(a)` = total bytes; `sizeof(a[0])` = bytes per element; divide and you get the **count**: `sizeof(a) / sizeof(a[0])`.",
        },
        {
          kind: "teach",
          title: "The array-loop partnership",
          body: "Arrays and for loops were made for each other — the loop counter walks the indexes:",
          code: "int a[5] = {4, 8, 15, 16, 23};\nint sum = 0;\nfor (int i = 0; i < 5; i++) {\n    sum = sum + a[i];\n}\nprintf(\"%d\", sum);   /* 66 */",
        },
        {
          kind: "check",
          prompt: "After int a[4] = {7, 9}; what is a[2]?",
          options: ["9", "Garbage — uninitialised", "0", "7"],
          answer: 2,
          praise:
            "That's the partial-init rule — once you initialise ANY of the array, C zero-fills the rest. (A fully uninitialised local array WOULD be garbage; that contrast is the trick.)",
        },
        {
          kind: "check",
          prompt: "Why is the loop condition i < 5 and not i <= 5?",
          code: "int a[5];\nfor (int i = 0; i < 5; i++)\n    scanf(\"%d\", &a[i]);",
          options: [
            "Style preference only",
            "Because valid indexes are 0–4; i = 5 would write past the end",
            "Because loops can't use <=",
            "Because scanf needs <",
          ],
          answer: 1,
          praise:
            "Exactly — start at 0, stop BEFORE N. The pattern for(i = 0; i < N; i++) is safe by construction; <= is the classic off-by-one bug.",
        },
        {
          kind: "check",
          prompt: "If ints are 4 bytes, what does sizeof(a)/sizeof(a[0]) give for int a[6];?",
          options: ["24", "6", "4", "10"],
          answer: 1,
          praise:
            "Right — 24 total bytes ÷ 4 per element = 6 elements. The byte sizes cancel out, which is why this formula works on any machine.",
        },
      ],
    },
    {
      id: "arrays-2d",
      title: "Two-dimensional arrays",
      unit: 4,
      weight: "medium",
      deps: ["arrays-use"],
      whyItMatters:
        "Matrix questions (declare, initialise, walk with nested loops) are a standard exam block built directly on this.",
      recap: [
        "2D array = a table: int m[3][4]; is 3 rows × 4 columns (12 elements).",
        "Access: m[row][col] — both indexes start at 0.",
        "Initialise row by row: int m[2][3] = {{1,2,3},{4,5,6}};",
        "Walk it with NESTED loops: outer loop rows, inner loop columns.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Rows and columns",
          body: "A **2D array** is an array of arrays — a table. `int m[3][4];` declares **3 rows × 4 columns**, and `m[1][2]` is the row-1, column-2 cell (both counted from 0).\n\nInitialise it row by row, and walk it with the nested loops you already own — outer for rows, inner for columns:",
          code: "int m[2][3] = {{1, 2, 3},\n               {4, 5, 6}};\n\nfor (int i = 0; i < 2; i++) {\n    for (int j = 0; j < 3; j++)\n        printf(\"%d \", m[i][j]);\n    printf(\"\\n\");\n}\n// 1 2 3\n// 4 5 6",
        },
        {
          kind: "check",
          prompt: "How many total elements does int t[4][5]; hold?",
          options: ["9", "20", "45", "5"],
          answer: 1,
          praise:
            "4 rows × 5 columns = 20 — the same multiplication you learned for nested loops, because nested loops are exactly how you visit them all.",
        },
        {
          kind: "check",
          prompt: "In the m above, what is m[1][0]?",
          options: ["1", "2", "4", "6"],
          answer: 2,
          praise:
            "Right — row 1 is the SECOND row {4,5,6}, and column 0 is its first cell. Row-then-column, both from 0: say it in that order every time and 2D questions become free marks.",
        },
      ],
    },
    {
      id: "strings",
      title: "Strings & the null terminator",
      unit: 4,
      weight: "heavy",
      deps: ["arrays-use"],
      whyItMatters:
        "'\\0' is THE string fact — size questions, %s behaviour, and half the string-function questions all reduce to it.",
      recap: [
        "A string in C is a char array ending in the null character '\\0'.",
        "\"hello\" needs SIX boxes: 5 letters + '\\0'. Double quotes add '\\0' automatically; building a char array by hand does not.",
        "char name[10] = \"Kube\"; — fine. 'A' is a char; \"A\" is a 2-byte string {'A','\\0'}.",
        "scanf(\"%s\", name) stops at the first SPACE (no & needed — the array name already acts as an address); fgets reads a whole line.",
        "printf %s prints characters until it meets '\\0'.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Text is a char array with a secret ending",
          body: "C has no string type. A **string is a char array that ends with the null character `'\\0'`** — an invisible byte that means \"the text stops here\".\n\n`char name[] = \"Kube\";` stores **five** chars: `'K' 'u' 'b' 'e' '\\0'`. Double quotes append the `'\\0'` for you.\n\nThat terminator is how everything else works: `printf(\"%s\", name)` prints characters **until it hits `'\\0'`**. Lose the terminator and printf charges into neighbouring memory printing garbage.\n\nMind the quotes: `'A'` is a single char (1 byte); `\"A\"` is a string — `{'A', '\\0'}`, 2 bytes.",
        },
        {
          kind: "teach",
          title: "Reading strings",
          body: "`scanf(\"%s\", name);` reads characters into the array — two things to notice:\n\n**No `&`** — an array's name already behaves as the address of its first element (more on this in the last lesson).\n**It stops at the first space** — read \"Ada Lovelace\" and you get only \"Ada\".\n\nTo capture a whole line, spaces included, use `fgets(name, size, stdin);`.",
        },
        {
          kind: "check",
          prompt: "Minimum array size to store the string \"exam\"?",
          options: ["4", "5", "3", "6"],
          answer: 1,
          praise:
            "Right — four letters plus the '\\0'. Length + 1 is the sizing rule, and 'forgot the terminator' is the #1 string trap on papers.",
        },
        {
          kind: "check",
          prompt: "The user types: good morning — what does name contain after scanf(\"%s\", name);?",
          options: ["good morning", "good", "morning", "g"],
          answer: 1,
          praise:
            "Exactly — %s treats the space as a stop sign. When the whole line matters, fgets is the tool. Knowing WHICH reader to use is a favourite viva question.",
        },
        {
          kind: "check",
          prompt: "What marks the end of a C string in memory?",
          options: [
            "A newline '\\n'",
            "The array's declared size",
            "The null character '\\0'",
            "A full stop",
          ],
          answer: 2,
          praise:
            "The one fact this whole topic orbits — '\\0' is the period at the end of the sentence. Every string function you meet next trusts it completely.",
        },
      ],
    },
    {
      id: "string-funcs",
      title: "The string.h toolbox",
      unit: 4,
      weight: "medium",
      deps: ["strings"],
      whyItMatters:
        "strlen/strcpy/strcat/strcmp appear directly in questions AND inside code-reading problems — know each one's job and quirk.",
      recap: [
        "All need #include <string.h>.",
        "strlen(s): length WITHOUT the '\\0' — strlen(\"Kube\") = 4.",
        "strcpy(dest, src): copies src into dest (you can't assign strings with =).",
        "strcat(dest, src): appends src onto the end of dest.",
        "strcmp(a, b): 0 if EQUAL; negative if a comes first alphabetically; positive if b does. (a == b compares addresses, not text!)",
        "Also: strrev reverses, strlwr/strupr change case (compiler-dependent helpers).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Four workhorses",
          body: "`#include <string.h>` unlocks the toolbox:\n\n`strlen(s)` — count of characters **before** the `'\\0'` (the terminator is NOT counted): `strlen(\"Kube\")` is `4`.\n\n`strcpy(dest, src)` — copies the text across. Needed because `dest = src;` does NOT copy a string in C.\n\n`strcat(dest, src)` — glues src onto the **end** of dest.\n\n`strcmp(a, b)` — compares alphabetically: **`0` means equal**, negative means a sorts first, positive means b does. And the trap: `if (a == b)` compares *addresses*, not letters — string equality ALWAYS goes through strcmp.\n\nRounding out the family: `strrev` (reverse), `strlwr`/`strupr` (lower/upper case).",
        },
        {
          kind: "check",
          prompt: "What does this print?",
          code: "char s[20] = \"Hi \";\nstrcat(s, \"Kube\");\nprintf(\"%s %d\", s, strlen(s));",
          options: ["Hi Kube 7", "Hi Kube 8", "Kube 4", "Hi 3"],
          answer: 0,
          praise:
            "Both tools at once — strcat builds \"Hi Kube\" and strlen counts its 7 visible characters, terminator excluded. That's exactly how compound string questions are marked.",
        },
        {
          kind: "check",
          prompt: "strcmp(\"apple\", \"apple\") returns…",
          options: ["1", "true", "0", "-1"],
          answer: 2,
          praise:
            "Right — and it reads backwards from intuition: ZERO means equal. if (strcmp(a,b) == 0) is the equality idiom; misreading this is a classic dropped mark.",
        },
        {
          kind: "check",
          prompt: "Why must you write strcpy(dest, src) instead of dest = src?",
          options: [
            "= is slower",
            "Arrays can't be assigned with =; the text must be copied element by element, which strcpy does",
            "dest = src copies it twice",
            "You can use either",
          ],
          answer: 1,
          praise:
            "Exactly — an array name isn't an assignable box, it's a location. Copying text means moving the characters themselves, and that's strcpy's whole job.",
        },
      ],
    },
    {
      id: "arrays-funcs",
      title: "Arrays meet functions",
      unit: 4,
      weight: "medium",
      deps: ["arrays-use", "call-by"],
      whyItMatters:
        "'Does the caller's array change?' fuses Unit 3 and Unit 4 into one question — exactly the kind that separates grades.",
      recap: [
        "Passing an array passes the ADDRESS of its first element — arrays go by reference, automatically.",
        "So changes made inside the function PERSIST in the caller's array (unlike a plain int).",
        "Parameter forms int arr[] and int *arr mean the same thing.",
        "The function can't know the length from the parameter — pass the size as a second argument: void show(int arr[], int n).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Arrays travel by address",
          body: "Pass a plain int to a function and it's **copied** (call by value — Unit 3). Pass an **array** and something different happens: C hands over **the address of the first element**. No copy of the elements is made.\n\nTwo consequences, both examinable:\n\n**1. Changes stick.** The function is working on the caller's actual array.\n**2. The size doesn't travel.** The function only got an address, so you pass the length yourself as an extra parameter.\n\nAnd `int arr[]` in a parameter list is just another spelling of `int *arr`.",
          code: "void doubleAll(int arr[], int n) {\n    for (int i = 0; i < n; i++)\n        arr[i] = arr[i] * 2;\n}\n\nint main() {\n    int a[3] = {1, 2, 3};\n    doubleAll(a, 3);\n    printf(\"%d\", a[0]);   /* 2 — the original changed! */\n}",
        },
        {
          kind: "check",
          prompt: "After doubleAll(a, 3) above, the caller's array a is {2, 4, 6}. Why did it change when a plain int wouldn't have?",
          options: [
            "Arrays are global by default",
            "The function received the array's ADDRESS, so it modified the original elements",
            "doubleAll returned a new array",
            "It's a compiler bug",
          ],
          answer: 1,
          praise:
            "That's the fusion of two units — call by reference from Unit 3, applied automatically to arrays in Unit 4. Being able to SAY that sentence is worth real marks.",
        },
        {
          kind: "check",
          prompt: "Why does doubleAll need n as a second parameter?",
          options: [
            "Style convention",
            "Because only the first element's address arrives — the length doesn't travel with it",
            "Because sizeof works better inside functions",
            "n makes it run faster",
          ],
          answer: 1,
          praise:
            "Right — inside the function, the sizeof trick would measure a pointer, not the array. Address in, length alongside: the standard C contract.",
        },
      ],
    },
  ],
};

export const unit4Exam: ExamQuestion[] = [
  {
    id: "u4q1",
    topicId: "arrays-idea",
    unit: 4,
    prompt: "For the declaration int a[8];, the valid index range is…",
    options: ["1 to 8", "0 to 8", "0 to 7", "1 to 7"],
    answer: 2,
    hint: "N boxes, first index 0 — where must the last one land?",
    explanation: "Indexes always run 0 to N−1: eight elements means a[0] through a[7].",
  },
  {
    id: "u4q2",
    topicId: "arrays-use",
    unit: 4,
    prompt: "After int a[5] = {3, 6}; what are the five elements?",
    options: [
      "{3, 6, garbage, garbage, garbage}",
      "{3, 6, 0, 0, 0}",
      "{3, 6, 3, 6, 3}",
      "{0, 0, 3, 6, 0}",
    ],
    answer: 1,
    hint: "What does partial initialisation do to the boxes you didn't mention?",
    explanation:
      "With partial initialisation, C zero-fills the remaining elements. Only a completely uninitialised local array holds garbage.",
  },
  {
    id: "u4q3",
    topicId: "arrays-use",
    unit: 4,
    prompt: "What is the output?",
    code: "int a[] = {2, 4, 6, 8};\nint s = 0;\nfor (int i = 0; i < 4; i++)\n    s += a[i];\nprintf(\"%d\", s);",
    options: ["20", "12", "8", "24"],
    answer: 0,
    hint: "Just add the four elements the loop visits.",
    explanation: "2 + 4 + 6 + 8 = 20 — the classic array-traversal sum.",
  },
  {
    id: "u4q4",
    topicId: "arrays-2d",
    unit: 4,
    prompt: "int m[3][4]; declares…",
    options: [
      "3 columns and 4 rows",
      "3 rows and 4 columns — 12 elements",
      "7 elements",
      "34 elements",
    ],
    answer: 1,
    hint: "Rows come first in the declaration; multiply for the total.",
    explanation: "The first size is rows, the second is columns: 3 × 4 = 12 int elements.",
  },
  {
    id: "u4q5",
    topicId: "strings",
    unit: 4,
    prompt: "How many bytes does char s[] = \"hello\"; occupy?",
    options: ["5", "6", "4", "10"],
    answer: 1,
    hint: "Count the letters — then remember what double quotes silently append.",
    explanation: "Five letters plus the automatic '\\0' terminator = 6 bytes.",
  },
  {
    id: "u4q6",
    topicId: "strings",
    unit: 4,
    prompt: "printf(\"%s\", s) keeps printing characters until…",
    options: [
      "it reaches the array's declared size",
      "it meets the null character '\\0'",
      "it meets a space",
      "it prints exactly 10 characters",
    ],
    answer: 1,
    hint: "What single byte defines where every C string ends?",
    explanation:
      "%s walks memory until the null terminator. That's also why a missing '\\0' makes printf spill into garbage.",
  },
  {
    id: "u4q7",
    topicId: "string-funcs",
    unit: 4,
    prompt: "strlen(\"program\") returns…",
    options: ["8", "7", "6", "9"],
    answer: 1,
    hint: "Count the visible letters only — does the terminator count?",
    explanation: "strlen counts characters before the '\\0': p-r-o-g-r-a-m = 7.",
  },
  {
    id: "u4q8",
    topicId: "string-funcs",
    unit: 4,
    prompt: "Which correctly tests whether strings a and b hold the same text?",
    options: [
      "if (a == b)",
      "if (strcmp(a, b) == 0)",
      "if (strcmp(a, b) == 1)",
      "if (strcpy(a, b))",
    ],
    answer: 1,
    hint: "== compares addresses — and remember what strcmp returns for equal strings.",
    explanation:
      "strcmp returns 0 for equal strings. a == b compares the arrays' addresses, which are never equal for two different arrays.",
  },
  {
    id: "u4q9",
    topicId: "arrays-funcs",
    unit: 4,
    prompt: "When an array is passed to a function in C, the function receives…",
    options: [
      "a full copy of all elements",
      "the address of the first element",
      "only the first element's value",
      "nothing",
    ],
    answer: 1,
    hint: "Is anything copied — or does the original location travel?",
    explanation:
      "Arrays are passed by reference automatically: the address of element 0 goes in, so modifications inside the function persist.",
  },
  {
    id: "u4q10",
    topicId: "arrays-funcs",
    unit: 4,
    prompt: "What does this print?",
    code: "void reset(int arr[], int n) {\n    for (int i = 0; i < n; i++)\n        arr[i] = 0;\n}\nint main() {\n    int a[3] = {5, 5, 5};\n    reset(a, 3);\n    printf(\"%d\", a[1]);\n}",
    options: ["5", "0", "Garbage", "3"],
    answer: 1,
    hint: "Did reset() work on a copy, or on the caller's actual array?",
    explanation:
      "The array went by address, so reset() zeroed the caller's real elements — a[1] is 0. A plain int passed the same way would have been unchanged.",
  },
];
