// CSE46D Unit 5: Input-Output Organization. Four-quarter circles per
// KUBE_LESSON_DEPTH.md. Source: Unit5_ppt.pptx — peripherals, the I/O
// interface, buses and commands, asynchronous transfer (strobe &
// handshaking), modes of transfer, priority interrupts & daisy chaining,
// DMA, and the I/O processor.
import type { Section } from "./types";

export const sectionU5: Section = {
  id: "ca-sec-u5",
  letter: "F",
  title: "Input-Output Organization",
  tagline: "How the CPU talks to a world of slow, unpredictable devices — politely, and sometimes not at all.",
  unit: 5,
  topics: [
    // ── The cast of devices and their translator ─────────────────────
    {
      id: "ca-peripherals",
      title: "Peripheral devices",
      unit: 5,
      weight: "medium",
      deps: ["ca-rev-unit4"],
      whyItMatters:
        "CO5 opens with peripherals — definitions and classifications are quick marks, and the CPU-vs-device mismatch story starts here.",
      recap: [
        "A peripheral is a device connected to the computer but not part of the core architecture — any auxiliary device that puts information in or gets it out.",
        "Three types: input devices (keyboard, mouse), output devices (monitor, printer), storage devices (hard drive, flash drive).",
        "Devices under the computer's direct control are said to be connected ONLINE.",
        "Printers split into impact and non-impact; old monitors used CRTs, modern ones LCD; hard disks are non-volatile secondary storage with magnetic platters.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Units 1–4 lived entirely INSIDE the processor. Unit 5 opens the case.\n\nA **peripheral** is a device connected to a computer but **not part of the core computer architecture** — any auxiliary device that either puts information into the computer or gets information out of it.",
            },
            {
              kind: "teach",
              body: "The deck sorts them into **three types**:\n\n**Input devices** — send data or instructions IN: keyboard, mouse.\n**Output devices** — bring results OUT: monitor, printer.\n**Storage devices** — hold data: hard drive, flash drive.",
            },
            {
              kind: "teach",
              body: "A few residents worth knowing by name:\n\nThe **mouse** (a pointer) turns hand movement into cursor instructions. The **keyboard** inputs text and commands — external on a desktop, 'virtual' on a tablet, essential either way.\n\nThe **printer** accepts text/graphic output onto paper — **impact or non-impact**. The **monitor** displays in pictorial form — old ones **CRT**, modern ones **LCD**.",
            },
            {
              kind: "teach",
              body: "The **hard drive**: a **non-volatile** secondary-storage device — platters written by a magnetic head, connected by ATA, SCSI or SATA.\n\nAnd one vocabulary flag the deck raises: devices under the computer's **direct control** are said to be connected **online**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A peripheral device is…",
              options: [
                "part of the core computer architecture",
                "an auxiliary device connected to the computer to put information in or get it out",
                "only storage",
                "the CPU's internal register set",
              ],
              answer: 1,
              praise: "Connected but not core — the auxiliary crowd around the processor.",
            },
            {
              kind: "check",
              prompt: "The three types of peripheral devices are…",
              options: [
                "input, output, storage",
                "fast, slow, medium",
                "digital, analog, hybrid",
                "wired, wireless, virtual",
              ],
              answer: 0,
              praise: "In, out, and keep — the deck's own trio.",
            },
            {
              kind: "check",
              prompt: "A device under the direct control of the computer is said to be connected…",
              options: ["offline", "online", "wirelessly", "asynchronously"],
              answer: 1,
              praise: "Online — a definition question that costs one second when you know it.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again & stretch",
          steps: [
            {
              kind: "teach",
              title: "Classify on sight",
              body: "The deck's wider zoo, sorted:\n\n**Input:** card reader, bar-code reader, digitizer, optical mark reader, magnetic stripe reader, touch screen, light pen.\n**Output:** CRT, printers (impact, ink-jet, laser, dot-matrix), plotter, voice.\n\nThe sorting question is always the same: *which way does the information flow?*",
            },
            {
              kind: "check",
              prompt: "A bar-code reader is which type of peripheral?",
              options: ["Output", "Input — it sends data INTO the computer", "Storage", "Not a peripheral"],
              answer: 1,
              praise: "Information flows in — input device. One question, one direction, done.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"A hard drive is an input device, because you can read data from it into the CPU.\" Diagnose.",
              options: [
                "Correct",
                "It's a STORAGE device — data flows BOTH ways; the deck gives storage its own third category precisely for these",
                "It's an output device",
                "Hard drives aren't peripherals",
              ],
              answer: 1,
              praise: "Two-way flow earns its own category — storage. The three-type split exists because in/out alone can't hold everything.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-io-interface",
      title: "The I/O interface: why & what",
      unit: 5,
      weight: "heavy",
      deps: ["ca-peripherals"],
      whyItMatters:
        "The four CPU-vs-peripheral mismatches and the interface's three functions are Part B material — and your sample paper asks this directly.",
      recap: [
        "The I/O interface transfers information between internal storage and external I/O devices — it exists to RESOLVE THE DIFFERENCES between computer and peripherals.",
        "Difference 1: peripherals are electromechanical/electromagnetic, CPU is electronic → signal conversion required.",
        "Difference 2: peripherals are slower → synchronization needed. Difference 3: peripherals speak in BYTES, CPU/memory in WORDS.",
        "Difference 4: peripherals run autonomous & asynchronous, CPU is synchronous.",
        "Main functions of the interface: DATA CONVERSION, SYNCHRONIZATION, DEVICE SELECTION.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A CPU and a printer need to exchange data. Problem: they barely speak the same language.\n\nThe **Input-Output Interface** provides the method for transferring information between internal storage and external devices. The deck's one-line reason for its existence: **to resolve the differences** between the computer and its peripherals.",
            },
            {
              kind: "teach",
              body: "**Difference 1 — nature of the hardware.**\n\nPeripherals are **electromechanical and electromagnetic** devices; the CPU and memory are **electronic**. Different physics → a **conversion of signal values** is required.",
            },
            {
              kind: "teach",
              body: "**Difference 2 — speed.**\n\nPeripherals are usually **slower**; CPU and memory are **faster**. Someone must bridge the tempo gap → a **synchronization mechanism** is needed.",
            },
            {
              kind: "teach",
              body: "**Difference 3 — unit of information.** Peripherals deal in **bytes**; CPU and memory deal in **words**.\n\n**Difference 4 — operating mode.** Peripherals are **autonomous and asynchronous**; the CPU is **synchronous**, marching to its clock.\n\nFour mismatches: physics, speed, word size, timing.",
            },
            {
              kind: "teach",
              body: "So computers put special hardware between CPU and peripherals — **interface units**, supervising and synchronizing all I/O transfers.\n\nTheir **three main functions**, exactly as the deck lists them:\n\n**Data conversion · Synchronization · Device selection.**\n\nOne function per mismatch family. Memorize the trio — it IS the exam answer.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The main functions of the I/O interface are…",
              options: [
                "data conversion, synchronization, device selection",
                "fetch, decode, execute",
                "push, pop, call",
                "paging, mapping, caching",
              ],
              answer: 0,
              praise: "The slides' exact trio — convert, synchronize, select.",
            },
            {
              kind: "check",
              prompt: "Peripherals and CPU differ in their unit of information:",
              options: [
                "both use words",
                "peripherals use BYTES, CPU/memory use WORDS",
                "peripherals use words, CPU uses bytes",
                "both use bits only",
              ],
              answer: 1,
              praise: "Byte outside, word inside — mismatch number three on the list.",
            },
            {
              kind: "check",
              prompt: "Which of the following is NOT a role of the I/O interface? (your sample paper's question)",
              options: [
                "Data conversion between different formats",
                "Managing communication between devices",
                "Connecting the CPU to RAM",
                "Generating control signals for peripherals",
              ],
              answer: 2,
              praise: "CPU↔RAM belongs to the MEMORY bus — the I/O interface faces peripherals. One paper mark, banked.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked example: one keypress's journey",
              body: "You press K on the keyboard.\n\nAn electromechanical switch closes → the interface **converts** that signal into clean electronic bits (mismatch 1). The keyboard dribbles data slowly → the interface holds it and **synchronizes** with the fast CPU (mismatch 2). It arrives as a byte → the interface fits it into the word-sized world (mismatch 3), on the CPU's clock (mismatch 4).\n\nFour mismatches, resolved in one hop across the interface.",
            },
            {
              kind: "check",
              prompt: "Match the mismatch: 'peripherals are electromechanical, the CPU is electronic' is resolved by which interface function?",
              options: ["Device selection", "Data/signal conversion", "Paging", "Interrupts"],
              answer: 1,
              praise: "Physics mismatch → conversion. Each function exists to cancel a specific difference.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Peripherals are synchronous, and the CPU is asynchronous — that's why interfaces exist.\" Diagnose.",
              options: [
                "Correct",
                "Reversed — peripherals are autonomous/ASYNCHRONOUS, the CPU is SYNCHRONOUS (clock-driven)",
                "Both are synchronous",
                "Neither has timing",
              ],
              answer: 1,
              praise: "Flipped roles — the CPU marches to a clock; peripherals wander in whenever. Keep the directions straight; MCQ options love this reversal.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Why 'resolve differences' predicts the whole unit",
              body: "Look ahead with this one lens:\n\nSpeed + timing mismatch → **asynchronous transfer** techniques (strobe, handshake). CPU too precious to babysit slow devices → **modes of transfer** (programmed → interrupt → DMA). Many devices shouting at once → **priority interrupts**.\n\nEvery circle left in Unit 5 is just one mismatch being managed. The interface is the thesis; the rest is elaboration.",
            },
            {
              kind: "check",
              prompt: "Prediction check: since peripherals are SLOWER than the CPU, a good I/O design should above all avoid…",
              options: [
                "using buses",
                "making the fast CPU wait on the slow device",
                "using interrupts",
                "byte-sized data",
              ],
              answer: 1,
              praise: "Never park a fast processor behind a slow printer. Hold that principle — it explains programmed I/O's failure and DMA's triumph, both coming up.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-io-bus",
      title: "The I/O bus & its commands",
      unit: 5,
      weight: "heavy",
      deps: ["ca-io-interface"],
      whyItMatters:
        "Bus structure, the four I/O commands, and the three memory-vs-I/O bus arrangements are classic short-answer material.",
      recap: [
        "The I/O bus links the processor to all peripheral interfaces: DATA lines, ADDRESS lines, CONTROL lines.",
        "To reach a device, the processor places its device address on the address lines; each interface decodes the address, decodes the command, supervises the transfer.",
        "Four I/O commands: CONTROL (activate & instruct), STATUS (test conditions), DATA OUTPUT (bus → interface register), DATA INPUT (interface → bus).",
        "Three bus arrangements: two separate buses; one common bus with separate control lines; one common bus with common control lines.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The interface units need a road to the processor. That road is the **I/O bus** — the typical link between the processor and its several peripherals.\n\nIt consists of three line groups: **data lines, address lines, control lines**. (The same three-part anatomy every bus in this course will have.)",
            },
            {
              kind: "teach",
              body: "One bus, many devices — so how does the processor talk to just ONE?\n\nIt places that device's **address** on the address lines. Every interface listens, but only the one that **decodes its own device code** responds. The interface also decodes the **command**, provides signals for the peripheral controller, and supervises the transfer rate.",
            },
            {
              kind: "teach",
              body: "The control lines carry the **I/O commands** — four of them:\n\n**Control command** — activates the peripheral and informs it what to do.\n**Status command** — tests status conditions in the interface and peripheral.",
            },
            {
              kind: "teach",
              body: "**Data output command** — the interface responds by transferring data **from the bus into one of its registers** (CPU → device direction).\n\n**Data input command** — the opposite: the interface puts data onto the bus for the CPU to read.\n\nCommand, question, give, take — four verbs cover every conversation.",
            },
            {
              kind: "teach",
              body: "Last structural choice — how do the MEMORY bus and I/O bus coexist? The deck's three ways:\n\n**1.** Two **separate buses**, one for memory, one for I/O.\n**2.** One **common bus** for both, but **separate control lines** for each.\n**3.** One **common bus with common control lines**.\n\nThree wiring philosophies, from most hardware to least.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The I/O bus consists of…",
              options: [
                "data lines only",
                "data, address, and control lines",
                "power lines",
                "one shared wire",
              ],
              answer: 1,
              praise: "The three-line-group anatomy — data, address, control. Same skeleton as the memory bus.",
            },
            {
              kind: "check",
              prompt: "Which I/O command activates a peripheral and tells it what to do?",
              options: ["Status", "Control", "Data input", "Data output"],
              answer: 1,
              praise: "Control commands; status merely asks how things are going.",
            },
            {
              kind: "check",
              prompt: "A DATA OUTPUT command causes the interface to…",
              options: [
                "put data onto the bus",
                "transfer data from the bus into one of its registers",
                "test a status flag",
                "reset the device",
              ],
              answer: 1,
              praise: "Output means OUT of the CPU: bus → interface register, headed for the device. Input is the mirror.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "One transfer, narrated",
              body: "The CPU wants a character from the keyboard interface:\n\n1 — Address lines: keyboard's device code. All interfaces listen; one wakes.\n2 — Control lines: a **status command** — 'got anything?' Interface answers via the data lines.\n3 — Control lines: a **data input command** — the interface places the character on the bus.\n\nAddress to choose, command to ask, data to move — the bus dance in three steps.",
            },
            {
              kind: "check",
              prompt: "Your turn: the CPU wants to check whether the printer is busy BEFORE sending data. Which command goes first?",
              options: ["Data output", "Control", "Status — test the condition, then transfer", "Data input"],
              answer: 2,
              praise: "Ask before you send — status first, data output after. You've just previewed programmed I/O's whole rhythm.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"With one common bus for memory and I/O, the CPU can no longer tell them apart.\" What does the deck's arrangement #2 add to fix this?",
              options: [
                "Nothing can fix it",
                "Separate CONTROL lines for memory vs I/O — same data/address highway, different 'who I mean' signals",
                "A second CPU",
                "Slower clocks",
              ],
              answer: 1,
              praise: "Shared road, separate doorbells — the control lines disambiguate. (And arrangement #3 shares even those, distinguishing by address instead.)",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The interface's job description, complete",
              body: "Collect what the interface now does: decodes the **device address** · decodes the **command** · provides **signals** for the peripheral controller · **synchronizes** data flow · supervises the **transfer rate**.\n\nNotice it's a full-time employee, not a passive plug. That competence is what lets the CPU eventually delegate everything — the story of the transfer-modes circles ahead.",
            },
            {
              kind: "check",
              prompt: "Why does EVERY interface on the bus need an address decoder?",
              options: [
                "Decoration",
                "All interfaces see every bus transaction — each must recognize which transactions are addressed to IT",
                "To speed up memory",
                "Only one interface has one",
              ],
              answer: 1,
              praise: "A shared bus broadcasts to all; the decoder is each interface's name-recognition. One wire set, many listeners, no confusion — the bus model in one insight.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-io",
      title: "Quick review: devices, interface, bus",
      unit: 5,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-peripherals", "ca-io-interface", "ca-io-bus"],
        count: 5,
      },
      deps: ["ca-io-bus"],
      whyItMatters:
        "Peripheral types, the four mismatches, three functions, four commands — five questions before the timing games begin.",
      recap: [],
      steps: [],
    },
    // ── Asynchronous transfer ────────────────────────────────────────
    {
      id: "ca-async-strobe",
      title: "Asynchronous transfer & the strobe",
      unit: 5,
      weight: "heavy",
      deps: ["ca-rev-io"],
      whyItMatters:
        "Asynchronous data transfer is a named Part B exam topic; the strobe's mechanism and its one fatal weakness set up handshaking.",
      recap: [
        "Asynchronous transfer is used when I/O speed doesn't match the processor and device timing is unpredictable; the CPU checks status and waits until the device is ready.",
        "Strobe method: a SINGLE control line times each transfer; the data bus carries the word; the strobe may be activated by source OR destination.",
        "Source-initiated: place data on bus → brief delay to settle → activate strobe → hold long enough for destination to receive → remove data after disabling strobe.",
        "Strobe disabled = the bus does not contain valid data.",
        "Weakness: the initiating unit never knows whether the other side actually responded — solved by handshaking.",
        "Context from your paper: asynchronous serial transfer frames each data unit with start and stop bits; synchronous transfer instead shares a common clock.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The CPU is synchronous; devices are not. When speeds don't match and device timing is **unpredictable**, transfers must be **asynchronous** — no shared clock, coordination by explicit signals.\n\nThe deck gives two techniques. First, the simple one: the **strobe**.",
            },
            {
              kind: "teach",
              body: "**Strobe control**: a **single control line** times each transfer, alongside the data bus (multiple lines, carrying a whole byte or word).\n\nThe strobe's message: *'a valid data word is on the bus — now.'* Either the **source or the destination** may be the one to activate it.",
            },
            {
              kind: "teach",
              body: "**Source-initiated**, step by step:\n\n1 — Source places data on the data bus.\n2 — A **brief delay**, letting the data settle to steady values.\n3 — Source activates the strobe.\n4 — Data + strobe stay active long enough for the destination to receive.\n5 — Strobe disabled, then data removed shortly after.\n\nStrobe off = **the bus does not contain valid data**.",
            },
            {
              kind: "teach",
              body: "**Destination-initiated**: the destination raises the strobe to say *'send it'* — and the source responds by placing the requested data on the bus.\n\nSame single wire, opposite requester. Either way, one signal times the whole exchange.",
            },
            {
              kind: "teach",
              body: "Now the flaw the deck highlights:\n\nA source that initiates has **no way of knowing whether the destination actually received** the data. A destination that initiates can't know whether the source **actually placed** it.\n\nOne wire can command — but it can't hear a reply. The fix is the next circle's whole subject.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The strobe method uses how many control lines to time a transfer?",
              options: ["None", "One", "Two", "Eight"],
              answer: 1,
              praise: "A single strobe line — its simplicity is both its charm and its downfall.",
            },
            {
              kind: "check",
              prompt: "Why does the source wait briefly BEFORE activating the strobe?",
              options: [
                "Politeness",
                "To let the data settle to a steady value on the bus first",
                "To save power",
                "The clock requires it",
              ],
              answer: 1,
              praise: "Signal first, announcement second — strobing before the data settles would bless garbage.",
            },
            {
              kind: "check",
              prompt: "The strobe method's weakness is that…",
              options: [
                "it needs too many wires",
                "the initiating unit can't know whether the other unit actually responded",
                "it only works for printers",
                "it requires a shared clock",
              ],
              answer: 1,
              praise: "Command without confirmation — the one-wire blind spot that handshaking exists to fix.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The same idea in serial clothing (paper context)",
              body: "Your sample paper adds one asynchronous fact the deck leaves implicit: in asynchronous SERIAL transmission, **each data unit is framed by a start bit and stop bit** — its own private timing envelope, since no clock is shared.\n\nContrast: **synchronous** transfer runs sender and receiver off **one shared clock** — no per-unit framing needed, timing is global.\n\nAsynchronous = timing per transfer (strobe, start/stop). Synchronous = timing by clock.",
            },
            {
              kind: "check",
              prompt: "Which is a key feature of asynchronous transfer? (your paper's question)",
              options: [
                "Requires a clock signal",
                "Data transferred in bursts",
                "Each data unit is sent with a start and stop bit",
                "Fixed transfer speed",
              ],
              answer: 2,
              praise: "Start/stop framing — each unit carries its own timing because no clock is shared. Paper mark, banked.",
            },
            {
              kind: "check",
              prompt: "And synchronous data transfer? (also on your paper)",
              options: [
                "No timing coordination at all",
                "Requires a shared clock signal between sender and receiver",
                "Always slower than asynchronous",
                "Needs no synchronization signals",
              ],
              answer: 1,
              praise: "One clock, both ends — the literal meaning of 'synchronous'. Two paper questions from one contrast.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "Where the strobe still shines",
              body: "Don't dismiss the strobe: between units with KNOWN, reliable timing (CPU ↔ its own interface registers), one wire is cheap and fast — the missing acknowledgment costs nothing when failure isn't a realistic option.\n\nThe blind spot only bites across genuinely unpredictable boundaries — exactly where peripherals live. Engineering lesson: the cheaper protocol survives wherever its weakness doesn't matter.",
            },
            {
              kind: "check",
              prompt: "A destination-initiated strobe transfer: the destination raises the strobe, then reads the bus. What is it silently ASSUMING?",
              options: [
                "Nothing",
                "That the source actually placed valid data in time — which one wire can never confirm",
                "That the clock is shared",
                "That the data is a byte",
              ],
              answer: 1,
              praise: "It reads on faith. Naming the hidden assumption is exactly the skill the 'disadvantage of strobe' essay question wants.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-handshake",
      title: "Handshaking",
      unit: 5,
      weight: "heavy",
      deps: ["ca-async-strobe"],
      whyItMatters:
        "Handshaking's two-wire dialogue (data valid / data accepted / ready for data) is the deck's centerpiece for asynchronous transfer — and a favorite diagram question.",
      recap: [
        "Handshaking adds a SECOND control signal: a reply to the unit that initiates the transfer.",
        "One control line runs WITH the data (source → destination): 'there is valid data on the bus'. The other runs BACK (destination → source): 'I can accept / have accepted it'.",
        "Source-initiated: source places data + enables DATA VALID → destination accepts and raises DATA ACCEPTED → source disables data valid → system returns to initial state.",
        "Destination-initiated: the destination's signal is renamed READY FOR DATA; the source does not place data until it receives it.",
        "Every transfer is acknowledged — the strobe's blindness is cured.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The strobe's problem: commands without replies. The cure is almost embarrassingly simple —\n\n**add a second control signal that provides a reply** to the unit that initiates the transfer.\n\nThat's **handshaking**.",
            },
            {
              kind: "teach",
              body: "The principle, as the deck draws it — two control lines, opposite directions:\n\n**Line 1** runs in the SAME direction as the data (source → destination): *'there is valid data on the bus.'*\n\n**Line 2** runs the OTHER way (destination → source): *'I can accept it / I have accepted it.'*\n\nStatement and reply. A conversation instead of a shout.",
            },
            {
              kind: "teach",
              body: "**Source-initiated handshake**, in sequence:\n\n1 — Source places data on the bus and enables **data valid**.\n2 — Destination takes the data and activates **data accepted**.\n3 — Source, seeing the reply, disables data valid.\n4 — The system returns to its initial state, ready for the next word.\n\nEvery step waits for evidence of the previous one.",
            },
            {
              kind: "teach",
              body: "**Destination-initiated handshake**: same two wires, but the destination speaks first — and its signal is renamed **ready for data**, to reflect its new meaning.\n\nThe crucial discipline: the source **does not place data on the bus until it receives ready-for-data**. Invitation before delivery.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Handshaking differs from the strobe by adding…",
              options: [
                "a faster clock",
                "a second control signal that carries a REPLY to the initiator",
                "more data lines",
                "a priority encoder",
              ],
              answer: 1,
              praise: "One more wire, pointed backwards — the reply the strobe never had.",
            },
            {
              kind: "check",
              prompt: "In source-initiated handshaking, the destination replies with…",
              options: ["a strobe pulse", "the data-accepted signal", "an interrupt", "a page fault"],
              answer: 1,
              praise: "Data accepted — the acknowledgment that closes the loop.",
            },
            {
              kind: "check",
              prompt: "In DESTINATION-initiated handshaking, the destination's signal is called…",
              options: ["data valid", "ready for data", "strobe", "INTACK"],
              answer: 1,
              praise: "Renamed 'ready for data' — same wire, new meaning: an invitation rather than a receipt.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The dialogue, played as theatre",
              body: "Source-initiated, as a script:\n\n**Source:** 'Data's on the bus — VALID.' *(raises data valid)*\n**Destination:** 'Got it — ACCEPTED.' *(raises data accepted)*\n**Source:** 'Then I'll clear.' *(drops data valid, removes data)*\n**Destination:** *(drops data accepted; both at rest)*\n\nFour lines, then silence — and BOTH parties know the transfer happened. Compare the strobe: one line, shouted into the dark.",
            },
            {
              kind: "check",
              prompt: "Your turn — destination-initiated: put the events in order. (A) source places data + data valid (B) destination raises ready-for-data (C) destination accepts data",
              options: ["A → B → C", "B → A → C", "C → B → A", "A → C → B"],
              answer: 1,
              praise: "Invitation (B), delivery (A), receipt (C). The 'ready' signal always leads when the destination drives.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"In handshaking, both control lines run from source to destination, alongside the data.\" Diagnose.",
              options: [
                "Correct",
                "Wrong — the lines run in OPPOSITE directions; a reply that travels with the data would be no reply at all",
                "There are three lines",
                "There are no control lines",
              ],
              answer: 1,
              praise: "Opposite directions are the whole point — one to state, one to answer. Both-one-way is just a two-wire strobe, blindness intact.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "What the handshake really buys",
              body: "Strobe: timing imposed by one side, correctness assumed. Handshake: timing NEGOTIATED, correctness confirmed — each unit proceeds only on evidence.\n\nThe price: an extra wire and a slower worst case (you wait for replies). The purchase: transfers that self-pace to the SLOWER unit — which is precisely what 'unpredictable peripheral timing' demanded at this unit's start.\n\nMismatch met; conversation closed.",
            },
            {
              kind: "check",
              prompt: "Deep check: with handshaking, what happens if the destination is simply too busy to accept?",
              options: [
                "Data is lost",
                "The source, seeing no data-accepted reply, keeps the data valid and WAITS — the protocol self-paces to the slower side",
                "The strobe fires anyway",
                "The CPU crashes",
              ],
              answer: 1,
              praise: "No reply, no advance — slowness becomes waiting instead of data loss. That graceful degradation is why handshaking rules the unpredictable world.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-transfer-modes",
      title: "Modes of transfer: programmed & interrupt I/O",
      unit: 5,
      weight: "heavy",
      deps: ["ca-handshake"],
      whyItMatters:
        "The three modes and programmed I/O's busy-wait drawback are the conceptual spine of Unit 5 — and directly on your sample paper.",
      recap: [
        "Three modes of transfer: Programmed I/O, Interrupt-initiated I/O, Direct Memory Access (DMA).",
        "Programmed I/O: device has no direct memory access; transfers run CPU-register ↔ peripheral, with the program monitoring the interface constantly.",
        "The polling loop: (1) read status register (2) check flag — branch back if not set (3) read data register.",
        "Drawback: the CPU stays in the loop watching the flag — CPU time is wasted. The interrupt facility removes this.",
        "Interrupt-initiated I/O: the computer does NOT check the flag; it works on its task until the device sends an interrupt, then the CPU stores the return address (from PC), services the transfer, and returns.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Data needs to move between device and memory. WHO carries it, and who watches?\n\nThe deck's three answers — the **modes of transfer**:\n\n**Programmed I/O · Interrupt-initiated I/O · Direct Memory Access (DMA).**\n\nSome use the CPU as the middleman; one bypasses it entirely. This circle covers the first two.",
            },
            {
              kind: "teach",
              body: "**Programmed I/O.** The device has **no direct access to memory** — every transfer goes through a CPU register: CPU register ↔ peripheral.\n\nAnd the program keeps **close tabs on everything** — the CPU monitors the interface continuously to see when the next transfer can be made.",
            },
            {
              kind: "teach",
              body: "The monitoring, as the deck's flowchart spells it — **three instructions**:\n\n**1** — Read the status register.\n**2** — Check the flag bit: not set → branch back to step 1; set → go on.\n**3** — Read the data register.\n\nSteps 1–2 spin in a loop — *polling* — until the device finally raises its flag.",
            },
            {
              kind: "teach",
              body: "The deck's verdict — the **drawback**: the CPU stays in that loop the whole time, keeping an eye on the device. **CPU time is wasted a lot.**\n\nA processor that could run millions of instructions… reading one status flag, again and again. The interrupt facility exists to remove this.",
            },
            {
              kind: "teach",
              body: "**Interrupt-initiated I/O.** The computer **does not check the flag**. It continues performing its own task.\n\nWhen the device wants attention, IT sends an **interrupt signal**. The CPU then stores the return address **from the PC**, branches to the service routine, completes the transfer — and **returns to what it was originally doing**.\n\nUnit 3's interrupt machinery, now earning its keep in I/O.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which of the following is NOT a mode of data transfer? (your paper's question)",
              options: [
                "Programmed I/O",
                "Direct Memory Access (DMA)",
                "Memory-mapped I/O",
                "Bus communication",
              ],
              answer: 3,
              praise: "'Bus communication' is the invented phrase — the real three are programmed, interrupt-initiated, and DMA.",
            },
            {
              kind: "check",
              prompt: "In programmed I/O, the three-instruction loop is…",
              options: [
                "fetch, decode, execute",
                "read status → check flag (branch back if unset) → read data register",
                "push, pop, ret",
                "load, add, store",
              ],
              answer: 1,
              praise: "Status, flag, data — with the branch-back spin that gives polling its name.",
            },
            {
              kind: "check",
              prompt: "Interrupt-initiated I/O improves on programmed I/O because…",
              options: [
                "the CPU polls faster",
                "the CPU works on its own task and is only interrupted when the device is ready",
                "it removes the interface",
                "data goes through the cache",
              ],
              answer: 1,
              praise: "The device does the watching; the CPU does real work. The waste is gone.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "The same wait, two ways",
              body: "A keyboard produces one character per second. The CPU could execute ~a billion instructions in that gap.\n\n**Programmed I/O:** all billion are spent asking 'ready yet?'\n**Interrupt I/O:** all billion go to the user's actual program; at the keystroke, ONE interrupt fires, a short service routine grabs the character, and control returns.\n\nSame keystroke, same data — a billion instructions reclaimed.",
            },
            {
              kind: "check",
              prompt: "Your turn: in interrupt-initiated I/O, when the interrupt arrives, the CPU stores the return address from the PC and branches WHERE?",
              options: [
                "To address 0",
                "To the service routine that processes the I/O transfer",
                "Back into the polling loop",
                "To the DMA controller",
              ],
              answer: 1,
              praise: "Service routine in, transfer handled, return out — the CALL/RET pattern with hardware pulling the trigger.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"Programmed I/O is obsolete and never appropriate.\" When is polling actually fine?",
              options: [
                "Never",
                "When the device is essentially always ready or the wait is tiny — the loop exits almost immediately and costs less than interrupt bookkeeping",
                "Only on Sundays",
                "When there's no interface",
              ],
              answer: 1,
              praise: "For always-ready devices, a poll that succeeds first try beats an interrupt's overhead. Knowing WHEN each mode wins is the L4 version of this topic.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The delegation ladder",
              body: "See the progression as management styles:\n\n**Programmed I/O** — the CPU micromanages: watches, waits, carries every byte.\n**Interrupt I/O** — the CPU delegates the WATCHING, but still carries the data itself when called.\n\nWhat's left to delegate? The carrying. A transfer where data moves to memory **without the CPU touching it at all** — that's DMA, the next circle's revolution.",
            },
            {
              kind: "check",
              prompt: "Even interrupt-initiated I/O still costs the CPU per transfer, because…",
              options: [
                "the flag check remains",
                "the CPU itself executes the service routine that moves each piece of data",
                "interrupts are slower than polling",
                "the bus is disabled",
              ],
              answer: 1,
              praise: "The messenger changed; the courier didn't — the CPU still hauls every byte through its registers. Feel that remaining cost: DMA exists to erase it.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-async",
      title: "Quick review: timing & transfer modes",
      unit: 5,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-async-strobe", "ca-handshake", "ca-transfer-modes"],
        count: 5,
      },
      deps: ["ca-transfer-modes"],
      whyItMatters:
        "Strobe, handshake, polling, interrupts — five questions before priority systems and DMA finish the story.",
      recap: [],
      steps: [],
    },
    // ── Priority, DMA, IOP ───────────────────────────────────────────
    {
      id: "ca-priority-daisy",
      title: "Priority interrupts & daisy chaining",
      unit: 5,
      weight: "heavy",
      deps: ["ca-rev-async"],
      whyItMatters:
        "Daisy chaining's PI/PO/VAD mechanics are the deck's one fully-specified hardware protocol — prime material for a 'explain with diagram' question.",
      recap: [
        "Many devices can interrupt; a PRIORITY INTERRUPT system decides who is serviced first when several fire together.",
        "High-speed devices get HIGH priority; slow devices get LOW priority. Priority can be established in software or hardware.",
        "Daisy chaining (hardware): devices in a chain, highest priority placed FIRST; the CPU's INTACK signal enters the first device's PI (priority in).",
        "A device that requested: places its VAD (vector address) on the bus and blocks the chain by putting 0 on PO (priority out). A device that didn't: passes the signal on with PO = 1.",
        "The interrupting device is the one with PI = 1 and PO = 0.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Interrupt-driven I/O has a crowd problem: **many devices**, all capable of interrupting.\n\nWhen more than one fires at once, a **priority interrupt system** determines **which device is serviced first**.",
            },
            {
              kind: "teach",
              body: "The ranking rule is practical, not ceremonial:\n\n**high-speed devices get higher priority** — their data vanishes fastest if ignored. Slow devices can afford to wait, so they rank lower.\n\nAnd priority can be established two ways: **by software or by hardware**.",
            },
            {
              kind: "teach",
              body: "The hardware way the deck details: **daisy chaining**.\n\nDevices form a chain, **highest priority placed first**. A device wanting attention sends its interrupt request to the CPU. The CPU replies with the **INTACK** (interrupt acknowledge) signal — which enters the FIRST device's **PI** (priority in) input.",
            },
            {
              kind: "teach",
              body: "Now the elegant part — each device makes one decision:\n\n**Did I request?** → place my **VAD (vector address)** on the bus, and **block** the chain: put **0 on PO** (priority out).\n\n**Didn't request?** → pass the acknowledgment along: **PO = 1**, and the signal flows to the next device's PI.\n\nThe acknowledge ripples down until it finds the first requester.",
            },
            {
              kind: "teach",
              body: "The fingerprint of the winner, as the deck states it:\n\nthe interrupting device is the one with **PI = 1 and PO = 0** — acknowledgment arrived, and stopped there.\n\nPosition in the chain IS priority: closer to the CPU means asked first. No comparator circuits, no arbitration logic — just a signal and a line of devices.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In a priority interrupt system, which devices get HIGH priority?",
              options: [
                "Slow devices",
                "High-speed transfer devices",
                "The cheapest devices",
                "Devices added most recently",
              ],
              answer: 1,
              praise: "Fast devices can't wait — their data evaporates. Speed earns rank.",
            },
            {
              kind: "check",
              prompt: "In daisy chaining, the highest-priority device is…",
              options: [
                "placed FIRST in the chain",
                "placed last",
                "chosen randomly each time",
                "the one with the largest VAD",
              ],
              answer: 0,
              praise: "First in line = first asked = highest priority. Geometry does the arbitration.",
            },
            {
              kind: "check",
              prompt: "The device that sent the interrupt request is identified by…",
              options: [
                "PI = 0 and PO = 1",
                "PI = 1 and PO = 0",
                "PI = PO = 1",
                "PI = PO = 0",
              ],
              answer: 1,
              praise: "Acknowledge in (PI=1), chain blocked (PO=0) — the deck's exact fingerprint.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "Worked chain: three devices",
              body: "Chain: **Disk → Printer → Keyboard** (fastest first). The PRINTER interrupts.\n\nINTACK leaves the CPU → Disk's PI = 1. Disk didn't ask → PO = 1, signal flows on.\nPrinter's PI = 1. Printer DID ask → places its **VAD** on the bus, sets **PO = 0**.\nKeyboard's PI = 0 — it never even hears the question.\n\nThe CPU reads the printer's vector address and services it. One signal, one ripple, one winner.",
            },
            {
              kind: "check",
              prompt: "Your turn: same chain, but BOTH disk and keyboard interrupt simultaneously. Who wins, and why?",
              options: [
                "Keyboard — it asked last",
                "Disk — INTACK reaches it first, it blocks the chain (PO=0), and the keyboard's acknowledgment never arrives",
                "Both serviced at once",
                "The CPU picks randomly",
              ],
              answer: 1,
              praise: "First in chain grabs the acknowledge and slams the gate — the keyboard waits its turn. Priority by position, enforced by a single 0.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"A non-requesting device sets PO = 0 to stay out of the way.\" Diagnose.",
              options: [
                "Correct",
                "Backwards — a non-requester passes the signal ON with PO = 1; PO = 0 is the BLOCK a requester uses to claim the acknowledgment",
                "PO is never 0",
                "Non-requesters remove themselves from the chain",
              ],
              answer: 1,
              praise: "0 blocks, 1 passes — flip them and the chain deadlocks at the first idle device. The polarity is the protocol.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "What the VAD is FOR",
              body: "The vector address isn't decoration — it's the answer to 'who called?'. By placing its VAD on the bus, the winning device hands the CPU the address of ITS service routine — no searching, no polling every device to find the requester.\n\nCompare software priority: the CPU polls devices in priority order — flexible, but slow. Daisy chain: the hardware answers in one ripple. Speed for wiring — the eternal trade.",
            },
            {
              kind: "check",
              prompt: "Deepest check: what implicit cost does daisy chaining pay for its simplicity?",
              options: [
                "None",
                "Priority is FROZEN in the wiring — reranking devices means physically reordering the chain, unlike software priority which just reorders a list",
                "It needs a faster CPU",
                "VADs must be equal",
              ],
              answer: 1,
              praise: "Hardware speed, hardware rigidity — the ranking is soldered, not configured. Naming the trade-off both ways is full marks on any compare question.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-dma",
      title: "Direct Memory Access",
      unit: 5,
      weight: "heavy",
      deps: ["ca-priority-daisy"],
      whyItMatters:
        "DMA is the unit's headline act and a guaranteed exam presence — definition, controller, and the bus-borrowing mechanism.",
      recap: [
        "DMA lets certain peripherals access main memory INDEPENDENTLY of the CPU.",
        "I/O devices connect to the system bus via a special circuit: the DMA CONTROLLER.",
        "Both CPU and DMA controller access main memory via a shared system bus (data, address, control lines).",
        "The DMA controller temporarily BORROWS the address, data and control buses from the microprocessor and transfers bytes directly between an I/O port and a series of memory locations.",
        "The CPU is freed: it neither watches the device nor carries the data.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The delegation ladder's final rung. Programmed I/O: CPU watches AND carries. Interrupt I/O: device watches, CPU still carries.\n\n**Direct Memory Access (DMA)**: certain peripherals access main memory **independently of the CPU**.\n\nNobody watches. Nobody carries. The data simply flows.",
            },
            {
              kind: "teach",
              body: "The enabler is a special interface circuit: the **DMA controller**.\n\nI/O devices connect to the system bus through it — and it's a bus CITIZEN, not just a socket: both the **CPU and the DMA controller have access to main memory** via the shared system bus, with its data, address and control lines.",
            },
            {
              kind: "teach",
              body: "The mechanism, in the deck's own image: the DMA controller **temporarily borrows** the address bus, data bus and control bus from the microprocessor.\n\nWith the buses in hand, it transfers data bytes **directly between an I/O port and a series of memory locations** — device to memory, no CPU register in the path.",
            },
            {
              kind: "teach",
              body: "Notice what the word 'borrows' implies: the buses come BACK. CPU and controller share the same roads, taking turns.\n\nAnd notice what the CPU does during a DMA transfer of, say, a whole disk block: **its own work**. The transfer happens beside it, not through it.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "DMA allows certain peripherals to…",
              options: [
                "run programs",
                "access main memory independently of the CPU",
                "replace the ALU",
                "generate clock signals",
              ],
              answer: 1,
              praise: "Memory access WITHOUT the CPU in the loop — the definition, verbatim.",
            },
            {
              kind: "check",
              prompt: "In DMA, data moves between device and memory…",
              options: [
                "through CPU registers",
                "directly, with the DMA controller borrowing the system buses",
                "one word per interrupt",
                "only at boot",
              ],
              answer: 1,
              praise: "Borrowed buses, direct path — the CPU's registers never see the data.",
            },
            {
              kind: "check",
              prompt: "What exactly does the DMA controller borrow from the microprocessor?",
              options: [
                "The ALU",
                "The address bus, data bus, and control bus",
                "The program counter",
                "The cache",
              ],
              answer: 1,
              praise: "All three bus groups, temporarily — full command of the roads while the transfer runs.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              title: "One disk block, three regimes",
              body: "Transfer a 512-byte disk block:\n\n**Programmed I/O:** CPU polls, then moves all 512 bytes itself — watching + carrying.\n**Interrupt I/O:** 512 interruptions (or one + a copy loop) — the CPU still carries every byte.\n**DMA:** CPU tells the controller *'move 512 bytes from disk to memory starting at address X'* — then goes back to work. The controller borrows the buses and streams the block directly.\n\nSame block; the CPU's share of the labor falls from everything to one instruction.",
            },
            {
              kind: "check",
              prompt: "Your turn: during an active DMA transfer, what is the CPU doing?",
              options: [
                "Spinning on a status flag",
                "Executing its own program — the transfer proceeds independently on borrowed buses",
                "Copying bytes",
                "Halted permanently",
              ],
              answer: 1,
              praise: "Working, not waiting — independence is DMA's entire dividend.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: \"DMA needs no controller — the disk just writes to memory whenever it wants.\" Diagnose.",
              options: [
                "Correct",
                "Memory sits on a SHARED bus — without the DMA controller to request, borrow and drive the buses in turns, device and CPU would collide",
                "Disks can't store data",
                "Memory refuses devices",
              ],
              answer: 1,
              praise: "'Direct' never meant 'lawless' — the controller is the licensed driver that makes bus-sharing safe. That distinction is the essay-question core.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              title: "The full delegation ladder, complete",
              body: "**Programmed I/O** — CPU watches + carries. Cost: busy-wait.\n**Interrupt I/O** — device watches, CPU carries. Cost: per-byte service.\n**DMA** — controller watches AND carries. Cost: brief bus-sharing.\n\nEach rung delegates one more job. This ladder — with each mode's cost — is the single most compact Unit 5 answer you can bring to Part B. Draw it, name the costs, collect the marks.",
            },
            {
              kind: "check",
              prompt: "Synthesis: which mismatch from the I/O-interface circle does DMA most directly attack?",
              options: [
                "Byte vs word",
                "The speed mismatch — slow transfers no longer consume fast CPU time at all",
                "Electromechanical vs electronic",
                "Device addressing",
              ],
              answer: 1,
              praise: "The speed gap stops costing CPU cycles entirely — the slow transfer runs beside the fast processor. Unit 5's opening problem, closed by its final mechanism.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-iop",
      title: "The Input-Output Processor",
      unit: 5,
      weight: "light",
      deps: ["ca-dma"],
      whyItMatters:
        "The IOP rounds off the syllabus topic list for Unit 5 — one idea: delegation taken to its logical conclusion.",
      recap: [
        "An Input-Output Processor (IOP) is a processor dedicated to handling I/O — delegation taken one step beyond DMA.",
        "Where a DMA controller moves data, an IOP can execute its own I/O program: sequencing transfers, formatting data, checking status across many devices.",
        "The CPU hands the IOP a task and is only involved at start and completion.",
      ],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The deck's topic list ends with one more delegate: the **Input-Output Processor (IOP)**.\n\nThe ladder's logical conclusion: if a controller can carry data… why not give I/O its own **processor**?",
            },
            {
              kind: "teach",
              body: "An IOP is a processor **dedicated to input-output**. Where a DMA controller executes one transfer it was configured for, an IOP runs its own **I/O program** — sequencing multiple transfers, formatting data, checking device status across many peripherals.\n\nThe CPU's involvement shrinks to two moments: **hand over the task**, and **hear that it's done**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "An Input-Output Processor is…",
              options: [
                "another name for the ALU",
                "a processor dedicated to handling I/O, running its own I/O program",
                "a type of memory",
                "a bus line",
              ],
              answer: 1,
              praise: "A whole processor for the I/O side — delegation, completed.",
            },
            {
              kind: "check",
              prompt: "The IOP goes beyond a DMA controller because it can…",
              options: [
                "only move one byte",
                "execute sequences of I/O operations itself — a program, not just a single configured transfer",
                "replace main memory",
                "interrupt faster",
              ],
              answer: 1,
              praise: "Programmable autonomy vs one-shot transfers — that's the step up. And with it, Unit 5's story is complete: from the CPU doing everything to the CPU doing almost nothing.",
            },
          ],
        },
      ],
      steps: [],
    },
    {
      id: "ca-rev-unit5",
      title: "Unit 5 review: the whole story",
      unit: 5,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["ca-io-interface", "ca-async-strobe", "ca-handshake", "ca-transfer-modes", "ca-priority-daisy", "ca-dma"],
        count: 6,
      },
      deps: ["ca-iop"],
      whyItMatters:
        "Interface, strobe, handshake, transfer modes, daisy chain, DMA — six questions across the unit before memory organization closes the course.",
      recap: [],
      steps: [],
    },
  ],
};
