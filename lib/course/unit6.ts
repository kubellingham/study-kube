// Unit 6 — Files in C (CSE22D). Section G.
import type { Section, ExamQuestion } from "./types";

export const sectionG: Section = {
  id: "sec-g",
  letter: "G",
  title: "Files",
  tagline: "Making data outlive the program.",
  unit: 6,
  topics: [
    {
      id: "rev-ptr-str",
      title: "Quick review: pointers & strings",
      unit: 6,
      weight: "light",
      kind: "review",
      review: { topicIds: ["pointers-idea", "strings"], count: 5 },
      deps: ["pointers-idea", "strings"],
      whyItMatters:
        "FILE *fp is a pointer and every filename is a string — five questions before files ask you to use both at once.",
      recap: [],
      steps: [],
    },
    {
      id: "files-idea",
      title: "Why files, and FILE *",
      unit: 6,
      weight: "medium",
      deps: ["pointers-idea", "strings", "rev-ptr-str"],
      whyItMatters:
        "'Why file handling?' and text-vs-binary are quick theory marks, and FILE *fp is the doorway to every file question.",
      recap: [
        "Variables live in RAM and die when the program ends; files live on DISK — permanent storage.",
        "Declare a file with a structure pointer: FILE *fp; (FILE comes from <stdio.h>).",
        "Text files: human-readable plain text, easy to edit, less secure, bigger.",
        "Binary files: 0s and 1s, not human-readable, hold more numerical data, better security.",
        "Text files end with a special EOF character (ASCII 26); binary files have no such marker.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Data that survives",
          body: "Every variable you've used lives in **RAM** — and RAM is wiped when the program ends. To keep data **permanently**, C writes it to **files on disk**.\n\nA file is a sequence of bytes on disk, and you talk to it through a **file pointer** — a pointer to a ready-made structure called `FILE` (from `<stdio.h>`) that tracks the file's name, position and mode:\n\n`FILE *fp;`\n\nNotice: your very first use of Unit 5's pointers in the wild.",
        },
        {
          kind: "teach",
          title: "Text vs binary",
          body: "Two kinds of file, one comparison table:\n\n**Text files** (.txt) — plain readable characters. Easy to create and edit in Notepad, minimal effort — but least security and **bigger storage**. A special end-of-file character (ASCII 26) marks where they stop.\n\n**Binary files** (.bin) — raw 0s and 1s. **Not human-readable**, hold more numerical data in less space, better security — and **no** special end-of-file character.",
        },
        {
          kind: "check",
          prompt: "Why do programs need files at all?",
          options: [
            "Files are faster than variables",
            "Data in variables is lost when the program ends; files store it permanently on disk",
            "scanf only works with files",
            "RAM cannot hold numbers",
          ],
          answer: 1,
          praise:
            "That's the whole motivation in one sentence — RAM is temporary, disk is permanent. Every file function exists to cross that line.",
        },
        {
          kind: "check",
          prompt: "Which is TRUE of binary files compared to text files?",
          options: [
            "They are easier to read in Notepad",
            "They store data as 0s and 1s, hold more data, and offer better security",
            "They use a special ASCII-26 end-of-file character",
            "They can only store text",
          ],
          answer: 1,
          praise:
            "Right — and you dodged the trap: the ASCII-26 end marker belongs to TEXT files. Binary files have no such character.",
        },
      ],
    },
    {
      id: "files-ops",
      title: "fopen, modes, read, write, close",
      unit: 6,
      weight: "heavy",
      deps: ["files-idea", "io"],
      whyItMatters:
        "The file-modes table and the open→check NULL→work→close pattern are the backbone of every file program the exam can ask for.",
      recap: [
        "Pattern: fp = fopen(\"name.txt\", \"mode\") → check if (fp == NULL) → read/write → fclose(fp).",
        "Modes: \"r\" read (file must exist) · \"w\" write (creates/OVERWRITES) · \"a\" append (adds at end, creates if missing) · r+/w+/a+ add the other direction.",
        "Write: fprintf(fp, ...), fputs; Read: fscanf(fp, ...), fgets, fgetc (char by char until EOF).",
        "fprintf/fscanf are just printf/scanf that take a FILE * first.",
        "fclose flushes unwritten data and frees the buffer — always close.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The four-step ritual",
          body: "Every file program follows the same shape — **open, check, work, close**:\n\n`fclose` matters: it **flushes unwritten data** from memory to disk and frees the buffer. Skip it and your last writes may never land.",
          code: "FILE *fp;\nfp = fopen(\"student.txt\", \"w\");   /* open   */\nif (fp == NULL) {                  /* check! */\n    printf(\"Error opening file!\\n\");\n    return 1;\n}\nfprintf(fp, \"Name: Aman\\n\");       /* work   */\nfclose(fp);                        /* close  */",
        },
        {
          kind: "teach",
          title: "Modes and the function families",
          body: "**The mode decides everything:**\n\n`\"r\"` — read; the file **must already exist**.\n`\"w\"` — write; **creates** the file or **OVERWRITES** it if it exists.\n`\"a\"` — append; adds at the **end**, creates if missing.\n`\"r+\"` / `\"w+\"` / `\"a+\"` — the same, plus the other direction.\n\n**Writing:** `fprintf(fp, ...)` (formatted), `fputs` (string), `fwrite` (binary).\n**Reading:** `fscanf(fp, ...)`, `fgets` (line), `fread` (binary), and `fgetc` for one character at a time — the classic display loop:",
          code: "char ch;\nwhile ((ch = fgetc(fp)) != EOF) {\n    putchar(ch);\n}",
        },
        {
          kind: "check",
          prompt: "You open an existing file with mode \"w\" by mistake. What happens to its contents?",
          options: [
            "They are preserved and new data goes at the end",
            "They are OVERWRITTEN — \"w\" truncates the file",
            "Nothing — \"w\" is read-only",
            "The program crashes",
          ],
          answer: 1,
          praise:
            "That's the dangerous one — \"w\" wipes the file the moment it opens. Wanting to ADD is what \"a\" is for; knowing which is which is a guaranteed exam mark.",
        },
        {
          kind: "check",
          prompt: "Why check if (fp == NULL) right after fopen?",
          options: [
            "It makes the file open faster",
            "fopen returns NULL when it fails (e.g. \"r\" on a missing file) — using that pointer would crash",
            "NULL means the file is empty",
            "It's optional decoration",
          ],
          answer: 1,
          praise:
            "Exactly — fopen's failure signal is a NULL pointer, and Unit 5 taught you what dereferencing NULL-ish garbage does. Check first, always.",
        },
        {
          kind: "check",
          prompt: "Which function reads ONE character at a time until the end of file?",
          options: ["fscanf", "fgets", "fgetc", "fprintf"],
          answer: 2,
          praise:
            "Right — fgetc feeds the classic while-not-EOF display loop. fgets does lines, fscanf does formats, fprintf is the writer.",
        },
      ],
    },
    {
      id: "files-random",
      title: "Random access: fseek, ftell, rewind",
      unit: 6,
      weight: "medium",
      deps: ["files-ops"],
      whyItMatters:
        "fseek's three origins (SEEK_SET/CUR/END) and the overwrite-in-place example are the standard 'random access' exam block.",
      recap: [
        "Sequential access reads start-to-end; RANDOM access jumps straight to any byte.",
        "fseek(fp, offset, origin) moves the file pointer; origins: SEEK_SET (start), SEEK_CUR (current), SEEK_END (end).",
        "ftell(fp) returns the current position; rewind(fp) jumps back to the beginning.",
        "Write \"ABCDEFGHIJ\", fseek(fp, 4, SEEK_SET), write \"XYZ\" → \"ABCDXYZHIJ\" (overwrites in place).",
      ],
      steps: [
        {
          kind: "teach",
          title: "Jumping instead of walking",
          body: "So far you've read files **sequentially** — start to end. But to edit one record in the middle of a big file you want **random access**: move the file pointer straight to a position.\n\nThree tools:\n\n`fseek(fp, offset, origin)` — jump `offset` bytes from `origin`, which is one of **SEEK_SET** (beginning), **SEEK_CUR** (current position), **SEEK_END** (end).\n`ftell(fp)` — where am I? (returns the current byte position)\n`rewind(fp)` — back to the very beginning.",
        },
        {
          kind: "teach",
          title: "The overwrite demo",
          body: "The slides' example, worth tracing byte by byte:\n\nWriting at a seek position **overwrites in place** — E, F, G became X, Y, Z; nothing shifted over.",
          code: "fp = fopen(\"random.txt\", \"w+\");\nfputs(\"ABCDEFGHIJ\", fp);   /* 10 chars      */\nfseek(fp, 4, SEEK_SET);    /* to index 4    */\nfputs(\"XYZ\", fp);          /* overwrite EFG */\nrewind(fp);\nfgets(data, 100, fp);\nprintf(\"%s\", data);        /* ABCDXYZHIJ    */",
        },
        {
          kind: "check",
          prompt: "fseek(fp, 10, SEEK_SET) moves the file pointer to…",
          options: [
            "10 bytes before the end",
            "the 10th byte from the BEGINNING of the file",
            "10 bytes past the current position",
            "the start of line 10",
          ],
          answer: 1,
          praise:
            "Right — SEEK_SET anchors at the start. SEEK_CUR would be relative to here, SEEK_END to the end; the origin is the whole question.",
        },
        {
          kind: "check",
          prompt: "The file holds ABCDEFGHIJ. After fseek(fp, 6, SEEK_SET), reading to the end gives…",
          options: ["GHIJ", "ABCDEF", "FGHIJ", "HIJ"],
          answer: 0,
          praise:
            "Perfect byte-counting — positions 0–5 are A through F, so the pointer sits on index 6: G. Off-by-one discipline from arrays, reused on disk.",
        },
        {
          kind: "check",
          prompt: "Which function moves the file pointer back to the beginning?",
          options: ["ftell(fp)", "rewind(fp)", "fseek(fp, 1, SEEK_END)", "fclose(fp)"],
          answer: 1,
          praise:
            "Right — rewind is the shortcut for fseek(fp, 0, SEEK_SET). ftell only REPORTS the position; it never moves anything.",
        },
      ],
    },
    {
      id: "cmdline",
      title: "Command line arguments",
      unit: 6,
      weight: "medium",
      deps: ["func-anatomy", "strings", "arrays-funcs"],
      whyItMatters:
        "argc/argv definitions and the 'what is argv[0]?' trick are dependable final-unit marks.",
      recap: [
        "Command line arguments are passed to main at execution time: int main(int argc, char *argv[]).",
        "argc = argument COUNT, including the program name itself.",
        "argv = array of strings; argv[0] is the PROGRAM NAME, argv[1] onwards are the user's arguments.",
        "./a.out Hello World 123 → argc is 4.",
        "Arguments arrive as STRINGS — convert with atoi (to int) / atof (to float) from <stdlib.h>.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Input before the program even starts",
          body: "`scanf` asks for input *while* the program runs. **Command line arguments** hand input to the program *at launch*, straight into a special form of `main`:\n\n`int main(int argc, char *argv[])`\n\n**argc** — argument **count**, *including the program's own name*.\n**argv** — argument **vector**: an array of strings. `argv[0]` is the **program name**; `argv[1]`, `argv[2]`… are what the user typed.\n\nRun `./a.out Hello World 123` and argc is **4**: the name plus three arguments.",
        },
        {
          kind: "teach",
          title: "They're strings — convert them",
          body: "Everything in argv is a **string**, even \"123\". To do maths you convert: `atoi` (string → int), `atof` (string → float), both from `<stdlib.h>`:",
          code: "int main(int argc, char *argv[]) {\n    if (argc != 3) {\n        printf(\"Usage: %s num1 num2\\n\", argv[0]);\n        return 1;\n    }\n    int a = atoi(argv[1]);\n    int b = atoi(argv[2]);\n    printf(\"Sum = %d\\n\", a + b);\n    return 0;\n}\n/* ./a.out 10 20  →  Sum = 30 */",
        },
        {
          kind: "check",
          prompt: "The user runs: ./a.out data.txt backup.txt — what is argc, and what is argv[0]?",
          options: [
            "argc = 2, argv[0] = \"data.txt\"",
            "argc = 3, argv[0] = \"./a.out\"",
            "argc = 3, argv[0] = \"data.txt\"",
            "argc = 2, argv[0] = \"./a.out\"",
          ],
          answer: 1,
          praise:
            "Both halves right — the program name counts (so 3, not 2) AND occupies slot 0. That double trick is exactly how this gets asked.",
        },
        {
          kind: "check",
          prompt: "Why is atoi(argv[1]) needed before adding command line numbers?",
          options: [
            "argv values arrive as strings, and \"10\" + \"20\" isn't arithmetic",
            "atoi makes the program faster",
            "argv can't be indexed directly",
            "It isn't — argv[1] is already an int",
          ],
          answer: 0,
          praise:
            "Exactly — argv is an array of STRINGS, full stop. atoi bridges text to number; forgetting it is the classic bug in this program.",
        },
      ],
    },
  ],
};

export const unit6Exam: ExamQuestion[] = [
  {
    id: "u6q1",
    topicId: "files-idea",
    unit: 6,
    prompt: "The main reason C programs use files is that…",
    options: [
      "files are faster than RAM",
      "variables lose their data when the program ends; files store data permanently",
      "printf only works with files",
      "RAM cannot store text",
    ],
    answer: 1,
    hint: "What happens to every variable's value the moment the program terminates?",
    explanation:
      "Variables live in RAM, which is temporary. Files on disk survive after the program ends — that permanence is the point of file handling.",
  },
  {
    id: "u6q2",
    topicId: "files-idea",
    unit: 6,
    prompt: "In C, a file is declared using…",
    options: ["file f;", "FILE *fp;", "int fp;", "struct file fp;"],
    answer: 1,
    hint: "It's a pointer to a ready-made structure from <stdio.h>.",
    explanation:
      "FILE *fp; declares a pointer to the FILE structure, which tracks the file's name, position and mode.",
  },
  {
    id: "u6q3",
    topicId: "files-ops",
    unit: 6,
    prompt: "Which mode opens a file for reading, and requires that the file already exists?",
    options: ["\"w\"", "\"a\"", "\"r\"", "\"w+\""],
    answer: 2,
    hint: "You can't read what isn't there.",
    explanation:
      "\"r\" opens for reading and fails (fopen returns NULL) if the file doesn't exist. \"w\" and \"a\" create the file if missing.",
  },
  {
    id: "u6q4",
    topicId: "files-ops",
    unit: 6,
    prompt: "To add new data at the END of an existing file without destroying its contents, use mode…",
    options: ["\"r\"", "\"w\"", "\"a\"", "\"r+\""],
    answer: 2,
    hint: "One mode overwrites; another appends.",
    explanation:
      "\"a\" (append) positions writes at the end and creates the file if missing. \"w\" would truncate everything already there.",
  },
  {
    id: "u6q5",
    topicId: "files-ops",
    unit: 6,
    prompt: "fopen fails to open a file. What does it return?",
    options: ["0 as an int", "NULL", "-1", "EOF"],
    answer: 1,
    hint: "That's why every program checks if (fp == ___) right after opening.",
    explanation:
      "fopen returns a NULL pointer on failure — hence the standard if (fp == NULL) guard before any file work.",
  },
  {
    id: "u6q6",
    topicId: "files-ops",
    unit: 6,
    prompt: "What does fclose(fp) do besides closing the file?",
    options: [
      "Deletes the file",
      "Flushes unwritten data to disk and frees the buffer",
      "Rewinds the file pointer",
      "Nothing else",
    ],
    answer: 1,
    hint: "Data you 'wrote' may still be sitting in a memory buffer…",
    explanation:
      "fclose flushes buffered writes to disk, discards unread buffered input, and frees the buffer — skipping it can lose your last writes.",
  },
  {
    id: "u6q7",
    topicId: "files-random",
    unit: 6,
    prompt: "Which origin makes fseek measure its offset from the CURRENT position?",
    options: ["SEEK_SET", "SEEK_CUR", "SEEK_END", "SEEK_NOW"],
    answer: 1,
    hint: "SET is the start, END is the end — what's left?",
    explanation:
      "SEEK_CUR is relative to the current position; SEEK_SET anchors at the beginning and SEEK_END at the end of the file.",
  },
  {
    id: "u6q8",
    topicId: "files-random",
    unit: 6,
    prompt: "A file contains ABCDEFGHIJ. After fseek(fp, 4, SEEK_SET); fputs(\"XYZ\", fp); the file holds…",
    options: ["ABCDXYZHIJ", "ABCDXYZEFGHIJ", "XYZDEFGHIJ", "ABCDEFGXYZ"],
    answer: 0,
    hint: "Writing at a seek position overwrites in place — count to index 4.",
    explanation:
      "Index 4 is 'E', so XYZ overwrites E, F, G in place (nothing is inserted or shifted): ABCDXYZHIJ.",
  },
  {
    id: "u6q9",
    topicId: "cmdline",
    unit: 6,
    prompt: "In int main(int argc, char *argv[]), argc holds…",
    options: [
      "the number of user arguments, excluding the program name",
      "the total number of arguments including the program name",
      "the length of argv[1]",
      "always 2",
    ],
    answer: 1,
    hint: "./a.out Hello World 123 gives argc = 4 — count what's included.",
    explanation:
      "argc counts every argument INCLUDING argv[0], the program name. ./a.out Hello World 123 → argc is 4.",
  },
  {
    id: "u6q10",
    topicId: "cmdline",
    unit: 6,
    prompt: "Which function converts a command line argument like \"25\" into the integer 25?",
    options: ["atof()", "itoa()", "atoi()", "strlen()"],
    answer: 2,
    hint: "a-to-i: ASCII to …?",
    explanation:
      "atoi (from <stdlib.h>) converts a string to an int; atof converts to float. argv entries are always strings until converted.",
  },
];
