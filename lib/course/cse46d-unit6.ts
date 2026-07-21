// CSE46D Unit 6: Memory Organization. Four-quarter circles per
// KUBE_LESSON_DEPTH.md. Source: UNIT_6_ppt.pptx — memory hierarchy, access
// methods, auxiliary memory, RAM/ROM and their chips, cache & hit ratio,
// the three cache mappings, associative memory (CAM), and virtual memory.
import type { Section } from "./types";

export const sectionU6: Section = {
  id: "ca-sec-u6",
  letter: "G",
  title: "Memory Organization",
  tagline: "From registers to tape drives: why memory is a pyramid, and how the CPU finds anything in it.",
  unit: 6,
  topics: [
    // ── The hierarchy and its floors ─────────────────────────────────
    {
      id: "ca-mem-hierarchy",
      title: "The memory hierarchy",
      unit: 6,
      weight: "heavy",
      deps: ["ca-rev-unit5"],
      whyItMatters:
        "CO6 IS the memory hierarchy — its structure, the 1000× access gap, and each layer's role appear all over your sample paper.",
      recap: [
        "A memory unit is a collection of storage devices holding binary information as bits. Two categories: VOLATILE (loses data at power-off) and NON-VOLATILE (keeps it).",
        "The hierarchy runs from slow Auxiliary Memory → fast Main Memory → smaller Cache. Speed and cost rise going up; size grows going down.",
        "Auxiliary access time is roughly 1000× main memory's — hence the bottom of the hierarchy.",
        "Main memory holds the center: it communicates directly with the CPU, and with auxiliary devices through the I/O processor.",
        "Programs not in main memory are brought in from auxiliary when needed (and swapped out to make space); the cache stores the data currently being executed by the CPU.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The final unit opens with a definition and a fork.\n\nA **memory unit** is the collection of storage devices that hold binary information as **bits**. And every storage device answers one brutal question: what happens at power-off?\n\n**Volatile** — data lost. **Non-volatile** — data kept, permanently.",
            },
            {
              kind: "teach",
              body: "Now the big picture: a computer's total memory is organized as a **hierarchy** —\n\nfrom the slow **Auxiliary Memory** (disks, tapes) at the bottom → the fast **Main Memory** in the middle → the smaller **Cache** near the top.\n\nGoing up: faster and costlier per bit. Going down: bigger and cheaper. That diagonal trade IS the pyramid.",
            },
            {
              kind: "teach",
              body: "How steep is the speed cliff? The deck gives a number worth memorizing:\n\nauxiliary memory access time is generally **1000 times** that of main memory. A thousand-fold gap — which is why auxiliary sits at the very bottom.",
            },
            {
              kind: "teach",
              body: "**Main memory occupies the central position** for a structural reason: it's the one layer equipped to communicate **directly with the CPU** — and with auxiliary devices **through the I/O processor** (your Unit 5 acquaintance).\n\nEverything flows through the middle floor.",
            },
            {
              kind: "teach",
              body: "And the traffic rules between floors:\n\nA program the CPU needs but which isn't in main memory is **brought up from auxiliary**. Programs not currently needed are **moved down** to auxiliary, freeing space.\n\nThe **cache** stores the program data **currently being executed** — the hottest few kilobytes, closest to the fire.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The purpose of the memory hierarchy is to… (your paper's question)",
              options: [
                "increase memory access speed",
                "minimize data storage",
                "reduce CPU processing",
                "none of these",
              ],
              answer: 0,
              praise: "Effective speed at sane cost — hot data lives in fast layers. The pyramid exists for speed.",
            },
            {
              kind: "check",
              prompt: "Auxiliary memory access time compared to main memory is roughly…",
              options: ["the same", "10× slower", "1000× slower", "1000× faster"],
              answer: 2,
              praise: "A thousand times — the deck's number, and the reason for the bottom bunk.",
            },
            {
              kind: "check",
              prompt: "Which memory loses its data when power is switched off?",
              options: ["Non-volatile", "Volatile", "ROM", "Magnetic tape"],
              answer: 1,
              praise: "Volatile — alive only while powered. Non-volatile survives the darkness.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The full ladder, ranked",
              body: "Add the CPU's own registers at the very top and read the whole ladder fastest-first:\n\n**registers → cache → main memory → auxiliary memory**\n\nEach step down: bigger, slower, cheaper. Your paper asks this ordering directly ('which has the fastest speed?' — CPU register). Own the ladder and four different MCQs collapse into one fact.",
            },
            {
              kind: "check",
              prompt: "In the memory hierarchy, which has the fastest speed? (your paper's question)",
              options: ["Memory", "CPU register", "Primary memory", "Memory cache"],
              answer: 1,
              praise: "Registers — inside the CPU itself, above even the cache.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"The cache is bigger than main memory, since it's more important.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — going UP the hierarchy means SMALLER and faster; the cache holds only the currently-executing hot data",
                "Cache and RAM are the same size",
                "Importance sets size",
              ],
              answer: 1,
              praise: "Fast is expensive, so fast is small — the pyramid's shape is a budget, not a ranking of importance.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why a pyramid beats one perfect memory",
              body: "Imagine buying ONLY fast memory: unaffordable. Only cheap memory: unusably slow.\n\nThe hierarchy's bet: programs reuse a small working set — keep THAT near the CPU and the machine FEELS fast while most bytes sit in cheap storage. The 1000× cliff never disappears; it just stops being on the frequently-travelled path.\n\nEvery circle left in this unit is one floor of this pyramid, examined up close.",
            },
            {
              kind: "check",
              prompt: "Main memory earns the CENTRAL position because…",
              options: [
                "it's the cheapest",
                "it alone communicates directly with the CPU and with auxiliary memory (via the I/O processor)",
                "it's non-volatile",
                "it's the newest technology",
              ],
              answer: 1,
              praise: "The hub with roads both up and down — the deck's exact justification. Structure explained, not memorized.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-mem-access",
      title: "Memory access methods",
      unit: 6,
      weight: "medium",
      deps: ["ca-mem-hierarchy"],
      whyItMatters:
        "Random, sequential, direct — a three-way definition question that maps devices to their access style.",
      recap: [
        "To access data: locate it first, then read from the location.",
        "RANDOM access: each location has a unique address, reachable in the SAME time, in any order — main memories work this way.",
        "SEQUENTIAL access: locations reached in sequence/order — like winding a tape.",
        "DIRECT access: information stored in tracks, each track with a separate read/write head — jump to a track, then search within it.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Before data is read, it must be **located**. How a memory locates things defines its **access method** — and the deck names three.",
            },
            {
              kind: "teach",
              body: "**Random access.** Every location has a **unique address**, and any location can be reached **in the same amount of time, in any order**.\n\nMain memories are random access — hence the name RAM. Address in, data out, no journey.",
            },
            {
              kind: "teach",
              body: "**Sequential access.** Locations are reached **in sequence** — to get to item 500, you pass items 1 through 499.\n\nThink of a cassette tape winding forward. Access time depends entirely on where the data sits.",
            },
            {
              kind: "teach",
              body: "**Direct access.** The middle way: information is stored in **tracks**, and **each track has a separate read/write head**.\n\nJump straight to the right track (direct), then search within it (sequential-ish). Disks live here — faster than tape, not as instant as RAM.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In RANDOM access, reaching any location takes…",
              options: [
                "time proportional to its address",
                "the same amount of time, in any order",
                "longer for higher addresses",
                "two disk rotations",
              ],
              answer: 1,
              praise: "Uniform time, any order — the defining property, and RAM's namesake.",
            },
            {
              kind: "check",
              prompt: "Sequential access means…",
              options: [
                "any location instantly",
                "locations reached in order, one after another",
                "tracks with separate heads",
                "content-based lookup",
              ],
              answer: 1,
              praise: "In order or not at all — the tape's way of life.",
            },
            {
              kind: "check",
              prompt: "Direct access is characterized by…",
              options: [
                "unique same-time addresses",
                "information in tracks, each track with its own read/write head",
                "no addresses at all",
                "read-only data",
              ],
              answer: 1,
              praise: "Track-level jumping — the deck's exact definition, and the disk's home category.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Match method to machine",
              body: "The classification quiz writes itself:\n\n**Main memory (RAM)** → random. **Magnetic tape** → sequential. **Magnetic disk** → direct.\n\nAnd the intuition: the physical SHAPE dictates the method. A grid of addressable cells → random. A ribbon → sequential. Spinning platters with movable heads → direct.",
            },
            {
              kind: "check",
              prompt: "Your turn: fetching a song from the MIDDLE of a cassette tape versus from RAM — why is the tape slower?",
              options: [
                "Tapes are volatile",
                "Sequential access must wind past everything before it; random access jumps straight to the address",
                "RAM has more songs",
                "It isn't slower",
              ],
              answer: 1,
              praise: "The journey vs the teleport — access method IS the difference. You can now classify any device by asking how it travels.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Disks are random access — you can ask for any block.\" What's the precise correction?",
              options: [
                "Nothing to correct",
                "Disks are DIRECT access: you jump to a track, but timing still depends on position — not the uniform-time promise of true random access",
                "Disks are sequential only",
                "Disks have no access method",
              ],
              answer: 1,
              praise: "'Can reach anything' ≠ 'same time for everything' — that distinction is exactly what separates direct from random. Precision worth a mark.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-aux-memory",
      title: "Auxiliary memory & its three times",
      unit: 6,
      weight: "medium",
      deps: ["ca-mem-access"],
      whyItMatters:
        "Secondary storage definitions plus access/seek/transfer time — quick-mark vocabulary the paper has already sampled.",
      recap: [
        "Auxiliary (secondary) memory = any addressable storage NOT within system RAM — non-volatile backup storage for long-term or not-in-immediate-use data.",
        "Examples: magnetic disks and tapes. Not directly accessible to the CPU — reached through I/O channels.",
        "Files move: auxiliary → primary storage for the CPU to process; results can return to auxiliary for later retrieval.",
        "Access time: average time to reach a location and obtain contents. Seek time: time to position the read/write head. Transfer time: time to move the data.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The pyramid's ground floor deserves its own visit.\n\n**Auxiliary memory** (also called secondary or external storage): any addressable storage **not within the system memory (RAM)** — **non-volatile** backup storage where programs and data live **long-term**, or when not in immediate use.",
            },
            {
              kind: "teach",
              body: "The classic residents: **magnetic disks and tapes**.\n\nAnd a rule you already know from Unit 5: auxiliary storage is **not directly accessible to the CPU** — it's reached through the **I/O channels**. The bottom floor has no elevator to the penthouse.",
            },
            {
              kind: "teach",
              body: "So data commutes: files are **invoked from auxiliary storage when needed**, transferred to **primary storage** so the CPU can process them — and results can be **sent back down** for later retrieval.\n\nDocuments, multimedia, programs — the noncritical data that waits until called.",
            },
            {
              kind: "teach",
              body: "Three timing terms the deck flags as **important**:\n\n**Access time** — average time to reach a storage location AND obtain its contents.\n**Seek time** — time to **position the read/write head**.\n**Transfer time** — time to actually move the data to or from the device.\n\nSeek, then read, then move — three stopwatch clicks per disk visit.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Auxiliary memory is…",
              options: [
                "volatile and inside the CPU",
                "non-volatile addressable storage outside system RAM, for long-term keeping",
                "another name for cache",
                "read-only",
              ],
              answer: 1,
              praise: "Outside RAM, survives power-off, holds the long-term load — the definition in full.",
            },
            {
              kind: "check",
              prompt: "SEEK time is the time required to…",
              options: [
                "transfer the data",
                "position the read/write head",
                "boot the computer",
                "refresh DRAM",
              ],
              answer: 1,
              praise: "Head into position — the mechanical prologue before any byte moves.",
            },
            {
              kind: "check",
              prompt: "The CPU reaches auxiliary storage…",
              options: [
                "directly, like registers",
                "through the I/O channels — never directly",
                "through the cache only",
                "it cannot at all",
              ],
              answer: 1,
              praise: "Via I/O — Unit 5's machinery is exactly how the bottom floor gets serviced.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "One flash-memory aside from your paper",
              body: "Your sample paper asks: which memory does a digital camera use? Answer: **flash memory** — non-volatile, solid-state, removable.\n\nIt's auxiliary storage in spirit: permanent keeping, accessed as a device. The deck's magnetic disk/tape examples now have a modern cousin — same floor of the pyramid, no moving parts.",
            },
            {
              kind: "check",
              prompt: "Which memory is used in a digital camera? (your paper's question)",
              options: ["Virtual memory", "Flash memory", "Main memory", "Cache memory"],
              answer: 1,
              praise: "Flash — non-volatile solid-state storage for the photos. Paper mark, banked.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Access time and transfer time are the same thing.\" Diagnose.",
              options: [
                "They are the same",
                "Access time is reaching a location AND getting contents; transfer time is specifically moving the data — a fast-seeking disk can still transfer slowly",
                "Transfer time includes booting",
                "Neither is measurable",
              ],
              answer: 1,
              praise: "Finding vs moving — separable costs, separately named. The three-term vocabulary is now yours.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-mem1",
      title: "Quick review: the pyramid's floors",
      unit: 6,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-mem-hierarchy", "ca-mem-access", "ca-aux-memory"],
        count: 5,
      },
      deps: ["ca-aux-memory"],
      whyItMatters:
        "Hierarchy, access methods, auxiliary vocabulary — five questions before main memory and its chips take the stage.",
      recap: [],
      steps: [],
    },
    // ── Main memory ──────────────────────────────────────────────────
    {
      id: "ca-main-ram-rom",
      title: "Main memory: RAM vs ROM",
      unit: 6,
      weight: "heavy",
      deps: ["ca-rev-mem1"],
      whyItMatters:
        "The RAM/ROM comparison table is a ready-made exam answer, and the bootstrap loader question has already appeared on your paper.",
      recap: [
        "Main memory: the unit communicating directly with the CPU, auxiliary memory and cache — the central storage unit, large and fast, holding OS software and applications for fast direct CPU access.",
        "Main memory is RAM: randomly accessible at any time, any order, any location. Read AND write. Volatile. Temporary storage. Comes as Static RAM and Dynamic RAM.",
        "ROM: read-only, not easily altered. Non-volatile. Permanent storage. Holds the program to initially boot the computer — the BOOTSTRAP LOADER.",
        "RAM = read/write + volatile + temporary; ROM = read-only + non-volatile + boot duty.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The middle floor up close. **Main memory** is the unit that communicates **directly** with the CPU (and with auxiliary memory and cache) — the **central storage unit**: large, fast, holding data during computer operations.\n\nIt stores the OS, applications, and whatever the CPU needs **fast, direct access** to.",
            },
            {
              kind: "teach",
              body: "Main memory in a computer is called **Random Access Memory** — the access method IS the name.\n\nTwo flavors the deck lists: **Static RAM** and **Dynamic RAM**. And one defining weakness: RAM is **volatile** — contents vanish at power-off.",
            },
            {
              kind: "teach",
              body: "Beside it sits **ROM — Read Only Memory**: storage that **cannot be easily altered or reprogrammed**, and **non-volatile** — contents survive power-off.\n\nIts one sacred job: holding the program required to **initially boot** the computer — the **bootstrap loader**. When power returns and RAM is empty, ROM is the only one who remembers what to do.",
            },
            {
              kind: "teach",
              body: "The deck's comparison table, condensed to its spine:\n\n**RAM** — random read AND write · volatile · temporary storage · runs your applications.\n**ROM** — read only · non-volatile · permanent storage · boots the machine.\n\nWrite-ability, volatility, duty: three rows, whole story.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which is TRUE of ROM?",
              options: [
                "Volatile and writable",
                "Non-volatile, read-only, holds the bootstrap loader",
                "Faster than registers",
                "Cleared on every reboot",
              ],
              answer: 1,
              praise: "Survives power-off, only reads, and boots the machine — ROM's whole identity.",
            },
            {
              kind: "check",
              prompt: "Which memory holds the boot sector files? (your paper's question)",
              options: ["RAM", "ROM", "Cache", "Register"],
              answer: 1,
              praise: "ROM — the bootstrap loader must survive the power being off; RAM wakes up empty.",
            },
            {
              kind: "check",
              prompt: "The two types of RAM are…",
              options: [
                "Static RAM and Dynamic RAM",
                "Fast RAM and Slow RAM",
                "Boot RAM and App RAM",
                "Internal and External RAM",
              ],
              answer: 0,
              praise: "SRAM and DRAM — the deck's split, both volatile.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Power-off, narrated",
              body: "You switch the machine off, then on.\n\nRAM: whatever was there — gone. Applications, open documents: vanished (that's why you save to DISK — auxiliary!).\nROM: perfectly intact. The CPU's first fetch goes to ROM, finds the bootstrap loader, which then loads the OS from auxiliary storage INTO fresh RAM.\n\nThree memory types, one boot sequence — the whole unit cooperating in the first second of power.",
            },
            {
              kind: "check",
              prompt: "Your turn: why CAN'T the bootstrap loader live in RAM?",
              options: [
                "RAM is too fast",
                "RAM is volatile — at power-on it holds nothing; the loader must come from memory that survived the off state",
                "RAM is read-only",
                "It could",
              ],
              answer: 1,
              praise: "An empty memory can't boot anyone — non-volatility isn't a nice-to-have for the loader, it's the entire qualification.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"ROM is where the computer stores documents permanently.\" Diagnose.",
              options: [
                "Correct",
                "Documents go to AUXILIARY storage; ROM is read-only — you can't write documents into it, it holds the fixed boot program",
                "Documents go to cache",
                "ROM stores everything",
              ],
              answer: 1,
              praise: "Permanent ≠ writable — ROM keeps what it was made with. User data's permanent home is the disk. Three memories, three duties, never confused again.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Reading the table like an engineer",
              body: "Notice the trade hiding in the RAM/ROM table: **write-ability costs volatility** (in these classic technologies). RAM buys read+write and pays with amnesia; ROM buys permanence and pays with silence.\n\nEvery row of the comparison — use, accessibility, volatility — follows from that one exchange. Reconstruct the table from the trade, and you can't forget it.",
            },
            {
              kind: "check",
              prompt: "RAM 'allows the computer to read data quickly to run applications' (deck's words). Which TWO properties make it the applications' home?",
              options: [
                "Non-volatile and read-only",
                "Random-access speed AND read/write capability — apps need both fast fetching and constant updating",
                "Size and price only",
                "Its bootstrap loader",
              ],
              answer: 1,
              praise: "Fast to reach, free to change — running software demands both, and only RAM offers both. The table's 'Use' row, derived.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-mem-chips",
      title: "RAM & ROM chips",
      unit: 6,
      weight: "heavy",
      deps: ["ca-main-ram-rom"],
      whyItMatters:
        "The 128×8 RAM chip and 512-byte ROM chip — address lines, CS, RD/WR — are concrete numbers the exam loves to probe.",
      recap: [
        "RAM chip: RD and WR lines for reading/writing; a BIDIRECTIONAL 8-bit data bus (memory→CPU or CPU→memory).",
        "128 × 8 means 128 words of 8 bits each; accessing 128 words needs a 7-bit unidirectional address bus (2⁷ = 128).",
        "Chip select (CS) control inputs enable the chip only when the processor selects it.",
        "ROM chip: output-only data bus (read only) — no need for read/write control.",
        "ROM cells are smaller, so the same-size chip holds MORE: 512 bytes of ROM vs 128 of RAM — needing 9 address lines (2⁹ = 512).",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "From concept to silicon: the deck draws an actual **RAM chip**. Its pins tell its whole biography.\n\n**RD and WR lines** — read and write controls. **A bidirectional 8-bit data bus** — data flows memory→CPU or CPU→memory. (Bidirectional BECAUSE ram both reads and writes — the table's row, now a wire.)",
            },
            {
              kind: "teach",
              body: "Its capacity: **128 × 8** — **128 words, each 8 bits**.\n\nTo pick one word out of 128, how many address bits? 2⁷ = 128 → a **7-bit unidirectional address bus**. Unit 1's powers of two, now sizing hardware.",
            },
            {
              kind: "teach",
              body: "One more pin family: **chip select (CS)** — control inputs that **enable the chip only when the processor selects it**.\n\nMany chips share the buses (Unit 5's lesson); CS is each chip's name-tag, the address decoder's handshake at the silicon level.",
            },
            {
              kind: "teach",
              body: "Now the **ROM chip** — and every difference follows from 'read only':\n\nThe data bus is **output-only**. And there's **no read/write control at all** — nothing to choose between when only reading exists.\n\nFewer pins, simpler chip: the personality of ROM, visible in the pinout.",
            },
            {
              kind: "teach",
              body: "The punchline comparison: ROM's internal binary cell **occupies less space** than RAM's.\n\nSo the same-size chip holds **512 bytes of ROM** where RAM fit only **128** — four times denser. And 512 locations need **9 address lines** (2⁹ = 512).\n\n7 bits → 128; 9 bits → 512. The address-bus arithmetic is the exam's favorite probe here.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A 128 × 8 RAM chip stores…",
              options: [
                "128 words of 8 bits each",
                "8 words of 128 bits",
                "1024 words",
                "128 bytes of ROM",
              ],
              answer: 0,
              praise: "Words × width — 128 words, 8 bits apiece.",
            },
            {
              kind: "check",
              prompt: "Addressing those 128 words requires…",
              options: ["8 address bits", "a 7-bit unidirectional address bus", "128 address lines", "no address bus"],
              answer: 1,
              praise: "2⁷ = 128 — seven bits, one direction (the CPU asks; memory never addresses back).",
            },
            {
              kind: "check",
              prompt: "The ROM chip needs no RD/WR control because…",
              options: [
                "it's faster",
                "it can only read — the data bus is output-only, so there's no operation to choose",
                "CS replaces them",
                "ROM has no data bus",
              ],
              answer: 1,
              praise: "One possible operation = zero control bits to select it. The pinout mirrors the philosophy.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: sizing a chip from its lines",
              body: "Read a chip like a detective:\n\n9 address lines → 2⁹ = **512 locations**. Output-only data bus, no RD/WR → **ROM**. That's the deck's exact ROM chip, deduced from two clues.\n\nReverse direction: need a 256-word RAM? 2⁸ = 256 → **8 address lines**, plus RD, WR, bidirectional data bus, and CS. The arithmetic designs the chip.",
            },
            {
              kind: "check",
              prompt: "Your turn: a chip has 10 address lines. How many locations can it address?",
              options: ["10", "100", "1024", "512"],
              answer: 2,
              praise: "2¹⁰ = 1024 — the powers-of-two ladder from Unit 1, climbing through every chip you'll ever meet.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"The RAM chip's ADDRESS bus is bidirectional, since data goes both ways.\" Diagnose.",
              options: [
                "Correct",
                "The DATA bus is bidirectional; the ADDRESS bus is unidirectional — only the CPU ever names locations",
                "Both are bidirectional",
                "Neither carries signals",
              ],
              answer: 1,
              praise: "Addresses flow one way (CPU → memory); data flows both. Mixing those up is the trap this question always sets.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why ROM's density matters",
              body: "Same silicon area, 4× the storage — because a ROM cell doesn't need the machinery for CHANGE. Every write-capability a memory carries costs transistors.\n\nIt's the RAM/ROM table's trade-off measured in atoms: flexibility is expensive; permanence is compact. From table row to pinout to cell size — one idea, three altitudes.",
            },
            {
              kind: "check",
              prompt: "Synthesis: why does the ROM chip in the deck hold 512 bytes while the same-size RAM chip holds 128?",
              options: [
                "ROM is newer",
                "ROM's internal cell occupies less space than RAM's — no write machinery — so more cells fit the same chip",
                "The address bus is longer",
                "Marketing",
              ],
              answer: 1,
              praise: "Smaller cells, denser chip — the deck's stated reason, now connected to WHY the cells are smaller. Chips read, unit's midpoint reached.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-cache-hit",
      title: "Cache memory & the hit ratio",
      unit: 6,
      weight: "heavy",
      deps: ["ca-mem-chips"],
      whyItMatters:
        "Cache behavior plus the hit-ratio formula — the quantitative heart of CO6 and a guaranteed calculation question.",
      recap: [
        "Data used AGAIN AND AGAIN by the CPU is kept in cache for shorter access time.",
        "On every memory access the CPU checks the CACHE FIRST; not found → go to main memory, transfer a block of recent data into cache, deleting old data to make room.",
        "HIT: the word is found in cache. MISS: not in cache, fetched from main memory.",
        "Hit Ratio = Hit / (Hit + Miss) — hits over total CPU references to memory.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Top floor (almost): the **cache**.\n\nThe deck's premise: some main-memory contents are used by the CPU **again and again**. Store THOSE in cache, and repeat visits become cheap — access in a **shorter time**.",
            },
            {
              kind: "teach",
              body: "The protocol on EVERY memory access:\n\nthe CPU **checks the cache first**. Found → done, fast. Not found → the CPU **moves on to main memory** — and while it's there, it **transfers a block of recent data into the cache**, deleting old data to make room.\n\nThe cache learns from every miss.",
            },
            {
              kind: "teach",
              body: "The two outcomes get names:\n\n**Hit** — the CPU refers to memory and **finds the word in cache**.\n**Miss** — not in cache; it's fetched from main memory.\n\nEvery memory reference lands in exactly one bucket.",
            },
            {
              kind: "teach",
              body: "And the metric — cache performance is measured by the **hit ratio**:\n\n**Hit Ratio = Hit / (Hit + Miss)**\n\nhits over TOTAL references. A ratio near 1 means the cache almost always has the answer — the pyramid working as designed.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "On a memory access, the CPU checks…",
              options: [
                "main memory first",
                "the cache first — main memory only on a miss",
                "auxiliary storage first",
                "ROM first",
              ],
              answer: 1,
              praise: "Cache first, always — that ordering is the whole point of having one.",
            },
            {
              kind: "check",
              prompt: "The hit ratio formula is…",
              options: [
                "Miss / Hit",
                "Hit / (Hit + Miss)",
                "Hit × Miss",
                "(Hit + Miss) / Hit",
              ],
              answer: 1,
              praise: "Hits over total references — the deck's formula, verbatim.",
            },
            {
              kind: "check",
              prompt: "After a MISS, the cache…",
              options: [
                "shuts down",
                "receives a block of recent data (old data deleted to make room)",
                "shrinks",
                "is unchanged forever",
              ],
              answer: 1,
              praise: "Every miss is a lesson — the block moves in, something old moves out. The cache stays current by churning.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: a hit ratio, computed",
              body: "The CPU makes 1000 memory references; 950 are found in cache.\n\nHits = 950, Misses = 50.\nHit Ratio = 950 / (950 + 50) = 950/1000 = **0.95**.\n\nRead it as: 95% of the time, memory answers at cache speed. This little division is the most likely calculation on your paper — practice until it's automatic.",
            },
            {
              kind: "check",
              prompt: "Your turn: 80 hits and 20 misses. Hit ratio?",
              options: ["0.25", "0.80", "0.20", "4.0"],
              answer: 1,
              praise: "80/(80+20) = 0.8 — computed, not guessed. The formula is yours.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Hit ratio = Hit / Miss, so 80 hits and 20 misses gives 4.\" Diagnose.",
              options: [
                "Correct",
                "The denominator is hits PLUS misses (total references) — a RATIO over the whole, between 0 and 1, never 4",
                "The answer should be 0.2",
                "Hits can't exceed misses",
              ],
              answer: 1,
              praise: "A ratio above 1 is the instant smell-test failure — hit ratio lives in [0,1] because it's a share of ALL references. Trap disarmed.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why 0.95 changes everything",
              body: "With a 0.95 hit ratio, only 1 reference in 20 pays main-memory prices — the machine EFFECTIVELY runs near cache speed while owning mostly cheap memory.\n\nThat's the hierarchy's central bet (hot data, reused) paying off, measured. And it hangs on one open question: WHERE in the small cache does each main-memory block go? Three answers exist — and they're the next three circles.",
            },
            {
              kind: "check",
              prompt: "The cache works because programs tend to…",
              options: [
                "use random addresses uniformly",
                "reuse the same data again and again — so keeping recent data close pays off",
                "avoid memory",
                "run only from ROM",
              ],
              answer: 1,
              praise: "Reuse is the physics the cache is built on — the deck's opening sentence, now recognized as the load-bearing assumption.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-mem2",
      title: "Quick review: main memory & cache",
      unit: 6,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-main-ram-rom", "ca-mem-chips", "ca-cache-hit"],
        count: 5,
      },
      deps: ["ca-cache-hit"],
      whyItMatters:
        "RAM/ROM, chip arithmetic, hit ratio — five questions before the three mapping schemes demand full attention.",
      recap: [],
      steps: [],
    },
    // ── The three mappings ───────────────────────────────────────────
    {
      id: "ca-map-direct",
      title: "Direct mapping",
      unit: 6,
      weight: "heavy",
      deps: ["ca-rev-mem2"],
      whyItMatters:
        "Cache mapping is a named Part B exam topic — direct mapping's tag/index mechanics are the foundation the other two schemes modify.",
      recap: [
        "Direct mapping is the SIMPLEST technique: each main-memory block maps to exactly ONE cache line — if it's in cache, it's in one specific place.",
        "The address splits: TAG = higher significant bits (stored WITH the data in cache); INDEX = lower significant bits (selects the cache line).",
        "On a reference: index selects the cache word → stored tag is read → compared with the address's tag.",
        "Tags equal → HIT, data read from cache. Tags differ → MISS, reference goes to main memory.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The cache is tiny; main memory is huge. So the placement question: **where in the cache does a given memory block go?**\n\nAnswer one — **direct mapping**, the **simplest technique**: each block of main memory maps to **only one cache line**. If a block is in cache at all, it is in **one specific place**. No searching, ever.",
            },
            {
              kind: "teach",
              body: "The trick is a split of the memory address into two fields:\n\n**INDEX** — the **lower** significant bits → which cache line to use.\n**TAG** — the **higher** significant bits → stored in the cache **together with the data**, recording WHICH memory block currently lives there.",
            },
            {
              kind: "teach",
              body: "Many memory blocks share each cache line (the index repeats every so often) — the tag is how the line remembers **which one** of its possible tenants is home right now.\n\nIndex = the apartment number. Tag = the name on the door.",
            },
            {
              kind: "teach",
              body: "The reference sequence, exactly as the deck lists it:\n\n1 — The **index** accesses a word in the cache.\n2 — The **stored tag** in that word is read.\n3 — It's **compared** with the tag from the address.\n4 — **Same** → cache **hit**; data read from the cache word.\n5 — **Different** → cache **miss**; the reference goes to main memory.\n\nOne lookup, one comparison, verdict.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In direct mapping, each main-memory block can live in…",
              options: [
                "any cache line",
                "exactly one specific cache line",
                "two lines",
                "the tag register",
              ],
              answer: 1,
              praise: "One block, one possible home — the 'direct' in direct mapping.",
            },
            {
              kind: "check",
              prompt: "The INDEX field consists of…",
              options: [
                "the higher significant bits",
                "the lower significant bits of the address",
                "the data itself",
                "random bits",
              ],
              answer: 1,
              praise: "Low bits pick the line; high bits become the tag. The split is the scheme.",
            },
            {
              kind: "check",
              prompt: "A hit is declared when…",
              options: [
                "the index is even",
                "the tag stored in the indexed cache word equals the tag in the address",
                "main memory responds",
                "the cache is full",
              ],
              answer: 1,
              praise: "Tag match at the indexed line — the one comparison that decides everything.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: one address walks the sequence",
              body: "Toy setup: 4-line cache, address split as [tag | 2-bit index].\n\nAddress **1101**: index = 01 → line 1. Line 1's stored tag: **11**, address's tag: **11** → equal → **HIT** — data served from cache.\n\nAddress **0101**: index = 01 → same line 1. Stored tag 11 vs address tag **01** → differ → **MISS** — off to main memory (and 01's block will move in, evicting 11's).\n\nSame line, different tenants — the tag arbitrates.",
            },
            {
              kind: "check",
              prompt: "Your turn: two memory blocks whose addresses share the SAME index but have DIFFERENT tags. What happens if a program alternates between them rapidly?",
              options: [
                "Both stay cached",
                "They evict each other every access — perpetual misses on one line while the rest of the cache sits idle",
                "The cache doubles",
                "Nothing — tags prevent conflicts",
              ],
              answer: 1,
              praise: "The conflict problem — two tenants, one apartment, endless swapping. You've found direct mapping's weakness yourself; the next circle is the cure.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"The tag selects the cache line, and the index is stored with the data.\" Diagnose.",
              options: [
                "Correct",
                "Swapped — the INDEX (low bits) selects the line; the TAG (high bits) is what's stored and compared",
                "Neither is used",
                "Both select lines",
              ],
              answer: 1,
              praise: "Index finds, tag verifies — swap them and the scheme is nonsense. The exam's favorite reversal, pre-refuted.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The price of simplicity",
              body: "Direct mapping's gifts: ONE lookup, ONE comparator, minimal circuitry — the cheapest cache possible.\n\nIts tax: zero flexibility. A block has no second choice, so two hot blocks with the same index thrash each other forever (as you discovered).\n\nHold both sides — every mapping question is ultimately 'what do you pay, what do you get', and direct mapping anchors one end of that scale.",
            },
            {
              kind: "check",
              prompt: "Why does direct mapping need only ONE tag comparator in hardware?",
              options: [
                "Tags are small",
                "A block can only be in one place — so only that ONE line's tag ever needs checking",
                "Comparators are free",
                "It actually needs many",
              ],
              answer: 1,
              praise: "One possible home → one check. The scheme's restriction IS its hardware savings — the trade-off, seen from the circuit side.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-map-full",
      title: "Fully associative mapping",
      unit: 6,
      weight: "heavy",
      deps: ["ca-map-direct"],
      whyItMatters:
        "The opposite pole from direct mapping — its freedoms and costs set up the compromise your exam actually asks about.",
      recap: [
        "Fully associative mapping overcomes direct mapping's problems: a main-memory block can load into ANY line of the cache.",
        "Each cache location stores BOTH the memory address AND the data.",
        "Cost: cache searching gets expensive — ideally circuitry that examines ALL tags simultaneously → lots of circuitry, high cost.",
        "New requirement: replacement policies — since anything can be thrown out, something must decide WHAT.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Direct mapping's conflict problem — two hot blocks fighting over one line — has an obvious cure: **remove the restriction**.\n\n**Fully associative mapping**: a main-memory block can load into **ANY line of the cache**. No assigned seat; sit anywhere free.",
            },
            {
              kind: "teach",
              body: "With no index to imply the location, each cache location must store **both the memory address AND the data** — the full identity travels with every entry.\n\nAny block, any line, self-labeled.",
            },
            {
              kind: "teach",
              body: "The bill arrives at search time. Where is block X? **It could be anywhere** — so the cache must compare the incoming address against **ALL stored tags**.\n\nIdeally: circuitry that examines every tag **simultaneously**. The deck's verdict: **lots of circuitry needed, high cost**. Searching got expensive.",
            },
            {
              kind: "teach",
              body: "And one brand-new headache: since a block can go anywhere, when the cache is full, **anything could be thrown out** — so something must decide WHAT.\n\nEnter **replacement policies** — a decision direct mapping never needed (its victim was always predetermined). Freedom creates choices; choices need policy.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In fully associative mapping, a main-memory block can load into…",
              options: [
                "one specific line",
                "any line of the cache",
                "only even lines",
                "main memory only",
              ],
              answer: 1,
              praise: "Anywhere — the total freedom that dissolves the conflict problem.",
            },
            {
              kind: "check",
              prompt: "Each fully-associative cache location stores…",
              options: [
                "data only",
                "both the memory address and the data",
                "the index only",
                "a pointer to ROM",
              ],
              answer: 1,
              praise: "Full address + data — with no index to locate it, every entry must carry its own name.",
            },
            {
              kind: "check",
              prompt: "The cost of fully associative caching is…",
              options: [
                "slower main memory",
                "expensive search — circuitry to examine all tags simultaneously",
                "smaller capacity",
                "volatility",
              ],
              answer: 1,
              praise: "Compare-with-everything hardware — lots of circuitry, high cost, the deck's exact complaint.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The two schemes, side by side on one access",
              body: "Looking up block X:\n\n**Direct:** index → ONE line → one tag compare. Cheap. But X's rival with the same index may have just evicted it.\n**Fully associative:** no index → compare X's address against EVERY line's stored tag at once. X stays cached as long as it's useful — but you paid for N comparators.\n\nSame goal, opposite bets: hardware cost versus conflict cost.",
            },
            {
              kind: "check",
              prompt: "Your turn: the two thrashing blocks from the direct-mapping circle (same index, different tags) — what happens to them in a fully associative cache?",
              options: [
                "Still thrash",
                "Both simply occupy two different lines — no shared 'assigned seat' exists to fight over",
                "Neither can be cached",
                "The cache overflows",
              ],
              answer: 1,
              praise: "The conflict evaporates — no fixed seats, no fights. Exactly the problem this scheme was built to overcome.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Fully associative caches don't need replacement policies, since blocks can go anywhere.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — BECAUSE anything can be evicted, a policy must choose the victim; direct mapping is the one with no choice to make",
                "Replacement never happens",
                "Policies are only for RAM",
              ],
              answer: 1,
              praise: "Freedom is exactly what creates the decision — the deck introduces replacement policies HERE for that reason. Inverted logic, caught.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Neither pole wins",
              body: "Score the match: direct mapping — cheap hardware, conflict-prone. Fully associative — conflict-free, hardware-hungry.\n\nEngineering's oldest instinct says: the best answer is probably BETWEEN them. Some freedom (a few possible homes) for some cost (a few comparators).\n\nThat middle path exists, it's called set-associative — and it's precisely the scheme your exam names. Next circle.",
            },
            {
              kind: "check",
              prompt: "Why is 'examine all tags simultaneously' the ideal, rather than checking them one by one?",
              options: [
                "It isn't",
                "Sequential checking would make every cache access as slow as the search is long — defeating the cache's entire purpose of speed",
                "Tags can't be read twice",
                "One-by-one uses more power only",
              ],
              answer: 1,
              praise: "A slow cache is a contradiction — parallel search is forced by the mission. Hence the circuitry, hence the cost, hence the compromise coming next.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-map-set",
      title: "Set-associative mapping",
      unit: 6,
      weight: "heavy",
      deps: ["ca-map-full"],
      whyItMatters:
        "The compromise scheme is the one your sample paper asks about by name — K-way sets, and the four-step access sequence.",
      recap: [
        "Set-associative mapping is the COMPROMISE between fully-associative and direct-mapped caches.",
        "The cache is divided into SETS, each containing a number of LINES; a given block maps to any line in one SPECIFIC set.",
        "Direct mapping determines WHICH set; the block can then sit in any of that set's lines. 2 lines/set = 2-way; K lines/set = K-way associative mapping.",
        "Access: index selects the set → comparators check ALL tags of that set against the incoming tag → match: access the location; no match: go to main memory.",
        "Much easier to search one set than all lines.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Two poles, both flawed. The industry's answer — **set-associative mapping**, the deck's own word: a **compromise** between fully-associative and direct-mapped caches.",
            },
            {
              kind: "teach",
              body: "The structure: the cache is divided into a number of **sets**, each containing a number of **lines**.\n\nA given memory block maps to **any line within one specific set** — assigned NEIGHBORHOOD, free choice of house within it.",
            },
            {
              kind: "teach",
              body: "Both parents are visible in the mechanism:\n\n**Direct mapping** picks WHICH set (index bits, exactly as before).\n**Associativity** lives inside the set — the block may occupy ANY of its lines.\n\nRigid between sets, free within one.",
            },
            {
              kind: "teach",
              body: "The naming convention:\n\n**2 lines per set** → **2-way associative** — a block can be in either of 2 lines of its set.\n**K lines per set** → **K-way associative** — one of K lines.\n\nAnd the payoff, in the deck's words: it is **much easier to simultaneously search one set than all lines** — K comparators instead of N.",
            },
            {
              kind: "teach",
              body: "The access sequence, all four steps:\n\n1 — The address's **index** accesses the **set**.\n2 — **Comparators** compare ALL tags of that set with the incoming tag.\n3 — **Match** → the corresponding location is accessed. Hit.\n4 — **No match** → access goes to main memory. Miss.\n\nDirect mapping's lookup, fully-associative's parallel compare — each doing the half it's good at.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Set-associative mapping is a compromise between… (your paper's question)",
              options: [
                "RAM and ROM",
                "direct mapping and fully associative mapping",
                "cache and virtual memory",
                "SRAM and DRAM",
              ],
              answer: 1,
              praise: "The two poles you just studied, blended — a paper mark, banked.",
            },
            {
              kind: "check",
              prompt: "In K-way set-associative mapping, a given block can be in…",
              options: [
                "any line of the whole cache",
                "one of K lines within its one specific set",
                "K different sets",
                "main memory only",
              ],
              answer: 1,
              praise: "One set (fixed by index), K choices inside it — the whole scheme in one sentence.",
            },
            {
              kind: "check",
              prompt: "The comparators in a set-associative cache compare the incoming tag against…",
              options: [
                "every tag in the cache",
                "all tags of the SELECTED SET only",
                "one predetermined tag",
                "the data bits",
              ],
              answer: 1,
              praise: "Just the set's tags — 'much easier to search one set than all lines', as the deck puts it.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The thrashing rivals, third scenario",
              body: "Those two hot blocks with identical index bits, one last time — now in a **2-way** set-associative cache:\n\nSame index → same SET. But the set has **two lines** — one block takes each. Both stay cached. Thrashing: gone, using just 2 comparators instead of N.\n\nA third rival with the same index would reintroduce competition — and K-way associativity is exactly the dial that decides how many rivals coexist.",
            },
            {
              kind: "check",
              prompt: "Your turn: a cache has 8 lines total, organized 2-way set-associative. How many sets?",
              options: ["2", "4", "8", "16"],
              answer: 1,
              praise: "8 lines ÷ 2 per set = 4 sets. Lines, ways, sets — the arithmetic every mapping question begins with.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"In 2-way set-associative mapping, a block can be in either of 2 different SETS.\" Diagnose.",
              options: [
                "Correct",
                "The 2 counts LINES within ONE set — the set itself is fixed by the index; 'way' never means 'set choice'",
                "It can be in 4 sets",
                "Sets don't exist in this scheme",
              ],
              answer: 1,
              praise: "Ways are within-set choices; the set is destiny. That word-swap is the most-set MCQ trap on this topic — now permanently disarmed.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The full spectrum, one table",
              body: "See all three schemes as ONE dial — 'how many places can a block live?':\n\n**Direct** = 1-way (one place, 1 comparator, conflicts galore).\n**K-way set-associative** = K places, K comparators, conflicts among K+1 rivals only.\n**Fully associative** = N-way (anywhere, N comparators, no conflicts).\n\nDirect and fully-associative aren't rivals of set-associative — they're its two extreme settings. THAT insight, written out, is the Part B answer.",
            },
            {
              kind: "check",
              prompt: "Deepest check: a fully associative cache of N lines is equivalent to set-associative mapping with…",
              options: [
                "N sets of 1 line",
                "1 set of N lines — K = N, the dial turned all the way up",
                "2 sets of 2",
                "no sets",
              ],
              answer: 1,
              praise: "One giant set = total freedom; and N sets of 1 line = direct mapping. Both poles are corner cases of the compromise — the entire mapping topic unified in one move.",
            },
          ],
        },
      ],
      steps: [],
    },
    // ── CAM & virtual memory ─────────────────────────────────────────
    {
      id: "ca-cam",
      title: "Associative memory (CAM)",
      unit: 6,
      weight: "medium",
      deps: ["ca-map-set"],
      whyItMatters:
        "Content-addressable memory and its four registers — a self-contained definition topic that the associative mappings just made intuitive.",
      recap: [
        "Associative memory = Content Addressable Memory (CAM): items retrieved by matching part of their CONTENT, not by address.",
        "Much slower than RAM; rarely found in mainstream designs.",
        "Argument register: n bits — the word to be searched for. Key register: a MASK choosing which field of the argument to compare.",
        "Match register: m bits, one per word — bits of matching words are set to 1 after the search.",
        "Associative memory array: m words × n bits, compared with the argument IN PARALLEL.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Every memory so far answers 'what's AT address X?'. One exotic memory answers the reverse question:\n\n**'WHERE is the item that looks like this?'**\n\n**Associative memory**, also called **Content Addressable Memory (CAM)**: items are retrieved by **matching part of their content** rather than by specifying an address.",
            },
            {
              kind: "teach",
              body: "The honest caveat first, straight from the deck: CAM is **much slower than RAM** and **rarely encountered in mainstream designs**.\n\nIt's a specialist — but its search-by-content idea is exactly what your cache tags were doing, so you already half-know it.",
            },
            {
              kind: "teach",
              body: "Its four components:\n\n**Argument register** (n bits) — holds the word being searched FOR.\n**Key register** — a **mask**: chooses which field/part of the argument actually gets compared. Search by full word or by any slice of it.",
            },
            {
              kind: "teach",
              body: "**Associative memory array** — m words of n bits, ALL compared with the argument **in parallel**.\n\n**Match register** (m bits, one per word) — after the search, the bits corresponding to **matching words are set to 1**.\n\nAsk once, all m words answer simultaneously, the match register is the show of hands.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "CAM retrieves items by…",
              options: [
                "their address",
                "matching part of their content",
                "sequential scan",
                "random selection",
              ],
              answer: 1,
              praise: "Content in, locations out — the address-free lookup that names the device.",
            },
            {
              kind: "check",
              prompt: "The KEY register's job is to…",
              options: [
                "store the search word",
                "mask which field of the argument word is compared",
                "count matches",
                "hold the data array",
              ],
              answer: 1,
              praise: "The mask — compare all of the argument, or just the slice you care about.",
            },
            {
              kind: "check",
              prompt: "After a search, the match register holds…",
              options: [
                "the matched data",
                "a 1 in each bit position corresponding to a matching word",
                "the argument",
                "an address",
              ],
              answer: 1,
              praise: "One bit per word, raised hands marked with 1s — the parallel search's scoreboard.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Worked: one search, played out",
              body: "Array of 4 words: 1011, 0110, 1010, 1011. Argument: **1011**. Key: **1111** (compare all bits).\n\nParallel compare → match register: **1 0 0 1** (words 1 and 4 match).\n\nChange the key to **1100** (compare only the top two bits, '10…'): now 1011, 1010 and 1011 all match → **1 0 1 1**. Same array, same argument — the mask redefined the question.",
            },
            {
              kind: "check",
              prompt: "Your turn: where have you ALREADY seen search-by-content hardware in this unit?",
              options: [
                "The ROM chip",
                "The associative cache mappings — comparing an incoming tag against stored tags in parallel IS a content search",
                "Virtual memory",
                "The strobe",
              ],
              answer: 1,
              praise: "The fully-associative cache's simultaneous tag compare is CAM thinking in cache clothing — the deck's topics, holding hands.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"CAM is faster than RAM, which is why it's everywhere.\" Diagnose.",
              options: [
                "Correct",
                "Both wrong — the deck says CAM is much SLOWER than RAM and RARELY used in mainstream designs; its value is the by-content lookup, not speed",
                "CAM is only in phones",
                "RAM is content-addressable too",
              ],
              answer: 1,
              praise: "Slower and rare — but irreplaceable for the one question RAM can't ask. Knowing a tool's true niche beats inflating it.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-virtual-mem",
      title: "Virtual memory",
      unit: 6,
      weight: "heavy",
      deps: ["ca-cam"],
      whyItMatters:
        "The course's final mechanism — the illusion of huge memory, pages, and page faults. A definition AND process question in one.",
      recap: [
        "Virtual memory gives programmers the ILLUSION of a very large memory even though the machine has a small main memory — no more worrying about physical RAM size.",
        "Why: run applications larger than RAM; allow multiprogramming; provide memory protection/isolation between processes; simplify programming.",
        "How: the OS divides memory into PAGES (fixed-size blocks, e.g. 4KB); some pages live in RAM, others on disk (swap space / page file).",
        "Accessing a page not in RAM triggers a PAGE FAULT; the OS loads the needed page from disk into RAM.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The course's final trick is a beautiful lie.\n\n**Virtual memory** gives programmers **the illusion of a very large memory** — even though the computer's actual main memory is small. The programmer **no longer worries about how much physical memory exists**.",
            },
            {
              kind: "teach",
              body: "Why maintain such an illusion? The deck's four reasons:\n\n**1** — run large applications that **exceed physical RAM**.\n**2** — allow **multiprogramming** (multiple programs at once).\n**3** — provide **memory protection and isolation** between processes.\n**4** — **simplify memory management** for programmers.",
            },
            {
              kind: "teach",
              body: "The mechanism, step one: the OS divides memory into **pages** — **fixed-size blocks, e.g. 4KB**.\n\nSome pages live in **RAM**; the rest wait on the **hard disk**, in an area called **swap space** (or page file). The illusion's warehouse is the pyramid's bottom floor.",
            },
            {
              kind: "teach",
              body: "Step two — the moment of truth: a program accesses a page that's **not in RAM**.\n\nA **page fault** occurs (Unit 3's internal interrupt — remember it on that exceptions list?). The OS responds by **loading the required page from disk into RAM**, and the program continues, never knowing it was interrupted.\n\nThe illusion holds because the repair is invisible.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Virtual memory's core promise is…",
              options: [
                "faster registers",
                "the illusion of a large memory despite small physical RAM, via pages swapped from disk",
                "eliminating the cache",
                "read-only main memory",
              ],
              answer: 1,
              praise: "A big memory that isn't there — sustained by paging behind the scenes.",
            },
            {
              kind: "check",
              prompt: "Pages are…",
              options: [
                "variable-sized programs",
                "fixed-size blocks of memory, e.g. 4KB",
                "cache lines",
                "ROM sectors",
              ],
              answer: 1,
              praise: "Fixed-size blocks — 4KB in the deck's example — the unit the whole scheme trades in.",
            },
            {
              kind: "check",
              prompt: "A page fault occurs when…",
              options: [
                "a page is corrupted",
                "a program accesses a page that is not currently in RAM",
                "RAM is turned off",
                "two pages collide",
              ],
              answer: 1,
              praise: "Wanted page, not in RAM → fault → OS fetches it from disk. The illusion's one visible seam.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked: a 6-page program in 4 pages of RAM",
              body: "Program pages: P1…P6. RAM holds four: [P1 P2 P3 P4]; P5, P6 wait in swap.\n\nThe program touches P5 → **page fault** → OS loads P5 from disk, evicting (say) P1 → RAM: [P5 P2 P3 P4].\nNext touch is P2 → in RAM → no fault, full speed.\n\nThe program believes it owns six pages of memory. It's renting four — with a very fast landlord shuffling the rest.",
            },
            {
              kind: "check",
              prompt: "Your turn: in that story, when does the DISK get involved?",
              options: [
                "On every memory access",
                "Only on page faults — pages already in RAM are used at RAM speed with no disk visit",
                "Never",
                "Only at boot",
              ],
              answer: 1,
              praise: "Disk only on faults — most accesses never leave RAM, which is why the illusion is affordable. (Hear the echo of the cache's hit/miss economics?)",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Virtual memory makes all memory accesses faster.\" Diagnose.",
              options: [
                "Correct",
                "Virtual memory buys SIZE and isolation, not speed — a page fault is a slow trip to disk; speed is the CACHE's department",
                "It makes everything slower",
                "Speed and size are the same",
              ],
              answer: 1,
              praise: "Cache = speed illusion; virtual memory = size illusion. Two illusions, two mechanisms, opposite ends of the pyramid — keeping them straight is a favorite exam discriminator.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The course, closed in one picture",
              body: "Stand back and look at what you now own:\n\nBits and codes (U1) → the CPU and its modes (U2) → the stack and control flow (U3) → arithmetic and Booth (U4) → the I/O world and DMA (U5) → and the memory pyramid with its two great illusions (U6).\n\nVirtual memory even reuses the course's own parts: pages ride Unit 5's I/O channels, faults are Unit 3's interrupts, addresses are Unit 1's binary. One machine, fully assembled. Go collect your marks.",
            },
            {
              kind: "check",
              prompt: "Final synthesis: a page fault is handled using which TWO earlier mechanisms of this course?",
              options: [
                "Booth's algorithm and BCD",
                "An interrupt (the fault suspends the program) and I/O transfer (the page is loaded from disk)",
                "Strobe and Gray code",
                "The stack alone",
              ],
              answer: 1,
              praise: "Interrupt to pause, I/O to fetch, resume as if nothing happened — Units 3 and 5 conspiring inside Unit 6. That cross-unit answer is exactly what a top paper looks like. Course complete — the exam is yours to take.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-unit6",
      title: "Unit 6 review: the whole pyramid",
      unit: 6,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-mem-hierarchy", "ca-main-ram-rom", "ca-cache-hit", "ca-map-direct", "ca-map-set", "ca-virtual-mem"],
        count: 6,
      },
      deps: ["ca-virtual-mem"],
      whyItMatters:
        "Hierarchy, RAM/ROM, hit ratio, both key mappings, virtual memory — the final six questions of the whole course.",
      recap: [],
      steps: [],
    },
  ],
};
