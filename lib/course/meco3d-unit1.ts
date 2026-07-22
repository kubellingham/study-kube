// MECO3D Unit 1: Switches, Fuses & Wiring. Four-quarter circles per
// KUBE_LESSON_DEPTH.md, one concept per circle. Source: Workshop Practice lab
// manual — Experiment 6 (switch/fuse/relay theory + safety), Experiment 1
// (godown wiring), Experiment 2 (distribution board). Grounded strictly in the
// manual's own wording, examples and connection sequences.
import type { Section } from "./types";

export const sectionU1: Section = {
  id: "mec-sec-u1",
  letter: "A",
  title: "Switches, Fuses & Wiring",
  tagline: "The building blocks of every circuit you'll wire in the lab — named, understood, and put to work.",
  unit: 1,
  topics: [
    // ── Poles & throws: the naming logic ─────────────────────────────
    {
      id: "mec-poles-throws",
      title: "Poles & throws",
      unit: 1,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "SPST, SPDT, DPDT, DPST all decode from just two numbers. Get poles and throws and every switch name becomes readable instead of memorised.",
      recap: [
        "A pole = one separate circuit the switch can control. One pole → one circuit; four poles → four independent circuits.",
        "A throw = how many positions each pole can connect to. Two throws → each pole can reach one of two terminals.",
        "Read the name: 'pole' count first, 'throw' count second — Single/Double Pole, Single/Double Throw.",
        "Poles = how many circuits; throws = how many choices per circuit.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The simplest switch is just **two conductors brought into contact** by an actuating mechanism. Push, they touch, current flows. That's the whole idea of a switch.",
            },
            {
              kind: "teach",
              body: "But most switches have more than two pins. To name them, the manual uses exactly two numbers. The first is the number of **poles**.",
            },
            {
              kind: "teach",
              body: "A **pole** is one separate circuit the switch can control.\n\nA switch with **one pole** can influence a single circuit. A **four-pole** switch can separately control four different circuits at once.",
            },
            {
              kind: "teach",
              body: "The second number is the number of **throws**. A throw is how many **positions** each pole can be connected to.\n\nIf a switch has **two throws**, each pole (circuit) can be connected to one of **two** terminals.",
            },
            {
              kind: "teach",
              body: "That's the entire code. **Poles = how many circuits. Throws = how many choices each circuit gets.**\n\nName them together — Single or Double Pole, then Single or Double Throw — and you get SPST, SPDT, DPDT, DPST.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What does the number of POLES on a switch tell you?",
              options: [
                "How many separate circuits the switch can control",
                "How many times the switch can be pressed",
                "How many terminals each circuit can reach",
                "How much current the switch carries",
              ],
              answer: 0,
              praise: "Right — poles count the independent circuits, one pole per circuit.",
            },
            {
              kind: "check",
              prompt: "A switch has two throws. That means each pole can connect to…",
              options: [
                "two switches at once",
                "one of two possible terminals",
                "twice the current",
                "two poles",
              ],
              answer: 1,
              praise: "Exactly — throws are positions, and two throws means a choice between two terminals.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Try decoding one. **Double Pole, Single Throw** — before you look it up, read the words: two circuits, each with one position (on or off).",
            },
            {
              kind: "check",
              prompt: "You-try-one: a 'Double Pole' switch controls how many separate circuits?",
              options: ["One", "Two", "Four", "It depends on the throws"],
              answer: 1,
              praise: "Two — 'double pole' is literally two circuits controlled together.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: a student says 'more throws means it controls more separate circuits.' What's wrong?",
              options: [
                "Nothing — throws and circuits are the same",
                "Throws are positions per circuit; it's POLES that add separate circuits",
                "Throws reduce the number of circuits",
                "Switches can only ever have one throw",
              ],
              answer: 1,
              praise: "That's the trap dodged — throws are choices per pole; poles are the circuits.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Now the four names line up as a grid:\n\n**SPST** — 1 pole, 1 throw (plain on/off)\n**SPDT** — 1 pole, 2 throws (pick one of two)\n**DPDT** — 2 poles, 2 throws (two circuits, each picking one of two)\n**DPST** — 2 poles, 1 throw (two circuits, on/off together)\n\nEvery switch you'll wire is one of these — and you can now read each name instead of memorising it.",
            },
            {
              kind: "check",
              prompt: "Which name means 'two separate circuits, each choosing between two terminals'?",
              options: ["SPST", "SPDT", "DPDT", "DPST"],
              answer: 2,
              praise: "DPDT — double pole (two circuits), double throw (two choices each). You read it, not recalled it.",
            },
          ],
        },
      ],
    },

    // ── SPST ─────────────────────────────────────────────────────────
    {
      id: "mec-spst",
      title: "SPST — the one-way switch",
      unit: 1,
      weight: "medium",
      deps: ["mec-poles-throws"],
      whyItMatters:
        "The plain on/off switch — the one you use to start the godown-wiring sequence in Experiment 1. Simplest of the family, and the baseline the others build on.",
      recap: [
        "SPST = Single Pole Single Throw: a simple ON/OFF switch, also called a One Way Switch.",
        "Press the button → the plates connect → current flows; release → they part → current stops.",
        "One circuit, one position — nothing to choose, just open or closed.",
        "In godown wiring it's the SPST that a person switches ON first to light the first lamp.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Start with the simplest member: **SPST — Single Pole, Single Throw**. One circuit, one position.",
            },
            {
              kind: "teach",
              body: "It is a simple **ON/OFF switch**. The manual also calls it a **One Way Switch** — the light switch on your wall is one.",
            },
            {
              kind: "teach",
              body: "How it works: when you press the button, the **plates of the switch connect** with each other and the current starts to flow — and vice versa when you release. Contact made, current on; contact broken, current off.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "SPST stands for…",
              options: [
                "Single Pole Single Throw",
                "Single Pole Split Terminal",
                "Simple Push Switch Type",
                "Standard Power Supply Toggle",
              ],
              answer: 0,
              praise: "Single Pole Single Throw — one circuit, one position.",
            },
            {
              kind: "check",
              prompt: "By what other name does the manual call the SPST?",
              options: ["Two Way Switch", "One Way Switch", "Selector Switch", "Change-over Switch"],
              answer: 1,
              praise: "The One Way Switch — plain on/off.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You press an SPST button. What happens inside?",
              options: [
                "The plates separate and current stops",
                "The plates connect and current starts to flow",
                "The current reverses direction",
                "One of two terminals is selected",
              ],
              answer: 1,
              praise: "Plates connect, current flows — release and it's the reverse.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'An SPST lets you choose which of two lamps to power.' Why is that wrong?",
              options: [
                "SPST is only for high voltage",
                "SPST has a single throw — one position — so it only switches one path on or off, it can't select between two",
                "SPST reverses current instead of switching it",
                "SPST always powers both lamps",
              ],
              answer: 1,
              praise: "Right — one throw means no choosing; selecting between two is the SPDT's job next.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Here's the forward hook. An SPST can only do two things: open or closed. But godown wiring needs to *hand the light from one lamp to the next* as you walk down a store.\n\nOne position isn't enough for that. What if a switch had **two** positions to throw between? That's the SPDT — next circle.",
            },
          ],
        },
      ],
    },

    // ── SPDT ─────────────────────────────────────────────────────────
    {
      id: "mec-spdt",
      title: "SPDT — the two-way selector",
      unit: 1,
      weight: "heavy",
      deps: ["mec-poles-throws", "mec-spst"],
      whyItMatters:
        "Three terminals, a common that swings between two — this is the switch that makes godown (linear-sequence) wiring possible. Heavily examinable and central to Experiment 1.",
      recap: [
        "SPDT = Single Pole Double Throw: one pole, but two throws.",
        "It has THREE terminals: one common pin and two pins that vie for connection to the common.",
        "Great for selecting between two sources, swapping inputs, or routing one circuit to one of two places.",
        "Most simple slide switches are SPDT; it should usually have three terminals.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The SPST could only open or close. Give a single pole **two throws** and you get the **SPDT — Single Pole, Double Throw**.",
            },
            {
              kind: "teach",
              body: "Count its terminals: **three**. One of them is the **common** pin. The other two are terminals that **vie for connection to the common** — the common swings to one or the other.",
            },
            {
              kind: "teach",
              body: "So instead of on/off, the SPDT **routes**: whatever is on the common goes to terminal 1, or to terminal 2 — never both. It's a selector.",
            },
            {
              kind: "teach",
              body: "The manual's use-cases: **selecting between two power sources, swapping inputs**, or steering one circuit to one of two places. Most simple **slide switches** are of the SPDT variety — and it should usually have three terminals.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "How many terminals does an SPDT switch have?",
              options: ["Two", "Three", "Four", "Six"],
              answer: 1,
              praise: "Three — one common and two that compete for it.",
            },
            {
              kind: "check",
              prompt: "In an SPDT, the COMMON terminal…",
              options: [
                "is never connected to anything",
                "connects to one of the two other terminals at a time",
                "connects to both other terminals at once",
                "carries no current",
              ],
              answer: 1,
              praise: "Exactly — the common swings to one side or the other, one at a time.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Picture a corridor light switched from two ends of a hallway — flip either switch, the light changes state. That two-way wiring is built from SPDT switches, each common feeding the next.",
            },
            {
              kind: "check",
              prompt: "You-try-one: which job suits an SPDT, not an SPST?",
              options: [
                "Turning a single lamp fully on or off",
                "Selecting which of two power sources feeds a circuit",
                "Melting when current is too high",
                "Breaking both line and neutral together",
              ],
              answer: 1,
              praise: "Selecting between two — that's the double-throw at work.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'An SPDT connects the common to both output terminals simultaneously.' What's the error?",
              options: [
                "Nothing, that's correct",
                "The two throw terminals VIE for the common — it reaches one at a time, not both",
                "An SPDT has no common terminal",
                "An SPDT only has two terminals",
              ],
              answer: 1,
              praise: "Right — 'vie for connection' means one at a time; both-at-once would defeat the point of a selector.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Line them up: **SPST** breaks or makes one path. **SPDT** re-routes one path between two destinations.\n\nThat routing is the secret of the godown-wiring circuit two circles from now: one lamp is lit, and throwing an SPDT hands the light to the *next* lamp while dropping the one before. Hold that image.",
            },
            {
              kind: "check",
              prompt: "The single feature that lets an SPDT hand a circuit from one lamp to another is its…",
              options: [
                "melting wire",
                "second throw — a choice of two output terminals",
                "electromagnet coil",
                "glass tube",
              ],
              answer: 1,
              praise: "The second throw — the choice of destination is the whole trick.",
            },
          ],
        },
      ],
    },

    // ── DPDT & DPST ──────────────────────────────────────────────────
    {
      id: "mec-dpdt-dpst",
      title: "DPDT & DPST — doubling the poles",
      unit: 1,
      weight: "medium",
      deps: ["mec-spdt"],
      whyItMatters:
        "Add a second pole and one lever now controls two circuits together. DPDT and DPST round out the switch family you must identify in Experiment 6.",
      recap: [
        "DPDT = Double Pole Double Throw: basically two SPDT switches ganged, controlling two separate circuits but always switched together by a single actuator. Six terminals.",
        "DPST = Double Pole Single Throw: basically two SPST switches in one package, worked by a single lever.",
        "DPST is used where you must break BOTH ground and line at the same time.",
        "The 'double pole' in each means one actuator moving two independent circuits at once.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "So far every switch had a single pole — one circuit. Add a **second pole** and one lever now moves **two circuits at once**.",
            },
            {
              kind: "teach",
              body: "**DPDT — Double Pole, Double Throw.** Adding another pole to the SPDT creates it. Basically **two SPDT switches**, controlling two separate circuits, but **always switched together by a single actuator**. A DPDT should have **six terminals**.",
            },
            {
              kind: "teach",
              body: "**DPST — Double Pole, Single Throw.** Basically **two SPST switches in one package**, operated by a single lever. Its job: where you must **break both ground and line at the same time**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A DPDT switch is essentially…",
              options: [
                "two SPST switches",
                "two SPDT switches ganged to one actuator",
                "a single SPDT with extra current",
                "a fuse with two wires",
              ],
              answer: 1,
              praise: "Two SPDTs on one actuator — six terminals, two circuits, switched together.",
            },
            {
              kind: "check",
              prompt: "Why would you choose a DPST switch?",
              options: [
                "To select between two power sources",
                "To break both line and ground at the same time",
                "To melt on overcurrent",
                "To amplify a small current",
              ],
              answer: 1,
              praise: "Right — two poles, one throw, breaking line and ground together.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: how many terminals should a DPDT switch have?",
              options: ["Two", "Three", "Four", "Six"],
              answer: 3,
              praise: "Six — two SPDTs of three terminals each.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A DPDT controls one circuit with two actuators.' What's wrong?",
              options: [
                "Nothing, that's right",
                "It's the reverse — DPDT controls TWO circuits with ONE actuator",
                "A DPDT controls four circuits",
                "A DPDT has no actuator",
              ],
              answer: 1,
              praise: "Flipped correctly — one actuator, two circuits moved together.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The whole family in one line, by (poles × throws):\n\n**SPST** 1×1 · **SPDT** 1×2 · **DPST** 2×1 · **DPDT** 2×2.\n\n'Double pole' always means *one lever, two circuits*. 'Double throw' always means *each circuit picks one of two*. Everything else follows.",
            },
            {
              kind: "check",
              prompt: "Which switch is 'two circuits, each just on/off, thrown together'?",
              options: ["SPST", "SPDT", "DPST", "DPDT"],
              answer: 2,
              praise: "DPST — double pole (two circuits), single throw (on/off), one lever.",
            },
          ],
        },
      ],
    },

    // ── Godown wiring ────────────────────────────────────────────────
    {
      id: "mec-godown",
      title: "Godown wiring",
      unit: 1,
      weight: "heavy",
      deps: ["mec-spst", "mec-spdt"],
      whyItMatters:
        "Experiment 1 itself: a linear switching layout where lamps light one at a time as you walk through a store. It puts the SPST and SPDT you just learned to real work.",
      recap: [
        "Godown wiring is a LINEAR sequence of switching for single-phase lighting: 1 SPST + 2 SPDT drive 3 lamps.",
        "Neutral from the MCB goes directly to all three lamps; the Line (phase) feeds the first SPST.",
        "Each SPDT's common takes over from the previous switch, and its two throws feed the next lamps.",
        "Working: switch ON the SPST → lamp 1 on. Throw the 1st SPDT → lamp 2 on, lamp 1 off. Throw the 2nd SPDT → lamp 3 on, lamp 2 off. One lamp at a time, moving with the person.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A **godown** is a warehouse or store — a long space you walk *through*. Godown wiring lights it so that the lamp near you is on and the ones behind you switch off as you move. The manual calls it a **linear sequence of switching**.",
            },
            {
              kind: "teach",
              body: "The parts: **one SPST + two SPDT** switches driving **three lamps**, on single-phase supply from an **MCB**.",
            },
            {
              kind: "teach",
              body: "First, the safe part. The **Neutral** wire from the MCB goes **directly to all three lamps**. And every switch's frame is connected to the **earthing / grounding** terminal. Only then do we route the live wire.",
            },
            {
              kind: "teach",
              body: "The **Line (phase/live)** wire feeds the **first terminal of the SPST**. The SPST is the master on/off for the whole chain.",
            },
            {
              kind: "teach",
              body: "Then the chain: the **first SPDT's common** connects to the second terminal of the SPST. Its **upper** terminal feeds **lamp 1**; its **lower** terminal passes on to the **common of the second SPDT**, whose upper and lower feed **lamp 2** and **lamp 3**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Godown wiring for three lamps uses which combination of switches?",
              options: [
                "Three SPST switches",
                "One SPST and two SPDT switches",
                "Two DPDT switches",
                "One SPDT and two SPST switches",
              ],
              answer: 1,
              praise: "One SPST + two SPDT — the master and two selectors.",
            },
            {
              kind: "check",
              prompt: "Where does the Neutral wire from the MCB go?",
              options: [
                "To the first SPST only",
                "Directly to all three lamps",
                "To the earthing terminal",
                "To the common of the second SPDT",
              ],
              answer: 1,
              praise: "Straight to all three lamps — only the live wire is switched.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Now walk the working. A person enters the store. Every light is **OFF**, because the **first SPST is OFF** — the master hasn't let the live wire in yet.",
            },
            {
              kind: "teach",
              body: "They switch **ON the SPST** → **lamp 1 lights**.\nThey throw the **first SPDT** → **lamp 2 lights and lamp 1 goes off**.\nThey throw the **second SPDT** → **lamp 3 lights and lamp 2 goes off**.\n\nAlways exactly one lamp lit, travelling with the person. That's the linear sequence.",
            },
            {
              kind: "check",
              prompt: "You-try-one: lamp 2 is currently lit. The person throws the second SPDT. What happens?",
              options: [
                "Lamp 3 lights and lamp 2 goes off",
                "All three lamps light",
                "Lamp 1 lights and lamp 2 stays on",
                "Everything switches off",
              ],
              answer: 0,
              praise: "Lamp 3 on, lamp 2 off — the light steps forward one place.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Throwing an SPDT in godown wiring lights the next lamp AND keeps the previous one on.' Why is that wrong?",
              options: [
                "It should turn on all lamps",
                "The selector routes the live feed onward, so the previous lamp loses its supply and goes OFF",
                "SPDT switches cannot control lamps",
                "The neutral would disconnect",
              ],
              answer: 1,
              praise: "Right — the SPDT re-routes the one live path, so exactly one lamp is ever lit.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Before any of this, step 1 of the procedure is blunt: **turn off the main breaker so the supply is OFF.** You wire dead, then energise.\n\nAnd notice *why* it works: the SPDT's double throw is doing exactly what you learned — routing one live feed to one of two places — chained so 'the next place' is always the next lamp. Godown wiring is SPDT theory, made physical.",
            },
            {
              kind: "check",
              prompt: "The very first step before making any godown-wiring connection is to…",
              options: [
                "switch on all the lamps",
                "turn off the main breaker so the supply is off",
                "throw both SPDT switches",
                "connect the line before the neutral",
              ],
              answer: 1,
              praise: "Kill the supply first — wire dead, energise last.",
            },
          ],
        },
      ],
    },

    // ── The fuse ─────────────────────────────────────────────────────
    {
      id: "mec-fuse",
      title: "The fuse",
      unit: 1,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "The circuit's sacrificial guardian — it melts so the wiring doesn't burn. Its definition, its causes, and its two types are core Experiment 6 material.",
      recap: [
        "A fuse is a conductor that melts easily and breaks the connection when current exceeds a predetermined value.",
        "Its essential part is a metal wire or strip that melts when too much current flows, interrupting the circuit it connects.",
        "Causes of excessive current: short circuits, overloading, mismatched loads, or device failure.",
        "A fuse is an ALTERNATIVE to a circuit breaker — same protective job, different mechanism.",
        "Kit-Kat (rewireable): a fuse base (permanent line) + a removable fuse carrier/cutout holding the wire. Cartridge: fuse wire sealed in a glass tube — replaced whole, can't be rewired.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Wiring has a weak point on purpose. If too much current ever flows, something must give way *first* — before the cables overheat. That something is the **fuse**.",
            },
            {
              kind: "teach",
              body: "The manual's definition: a fuse is **part of the circuit which consists of a conductor that melts easily and breaks the connection when current exceeds a predetermined value.**",
            },
            {
              kind: "teach",
              body: "Its **essential component** is a metal **wire or strip** that **melts when too much current flows through it**, interrupting the circuit it connects. Melt = break = protection.",
            },
            {
              kind: "teach",
              body: "Why would current get too high? The manual lists four culprits: **short circuits, overloading, mismatched loads, or device failure.** Any of these can drive the excessive current a fuse is there to stop.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A fuse protects a circuit by…",
              options: [
                "amplifying the current",
                "melting and breaking the connection when current exceeds a set value",
                "storing charge until it is safe",
                "cooling the wire down",
              ],
              answer: 1,
              praise: "It melts to break the circuit — sacrificing itself on purpose.",
            },
            {
              kind: "check",
              prompt: "Which is NOT one of the manual's causes of excessive current?",
              options: ["Short circuit", "Overloading", "Device failure", "Low voltage supply"],
              answer: 3,
              praise: "Right — short circuits, overloading, mismatched loads and device failure are the four; low voltage isn't one.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "There are two builds. The **Kit-Kat (rewireable) fuse** — the everyday one — has two parts: the **fuse base**, where the incoming and outgoing line stay permanently connected, and the removable **fuse carrier** (also called the **cutout**) that holds the fuse wire and fits into the base.",
            },
            {
              kind: "teach",
              body: "The **cartridge fuse** encloses its fuse wire in a **sealed transparent glass tube**. When it blows you **replace it with a new one** — because the seal means it **cannot be rewired**.",
            },
            {
              kind: "check",
              prompt: "You-try-one: which fuse can be reused by fitting a fresh wire into its carrier?",
              options: [
                "The cartridge fuse",
                "The Kit-Kat (rewireable) fuse",
                "Neither can ever be reused",
                "Both are single-use",
              ],
              answer: 1,
              praise: "The Kit-Kat — its carrier takes a new wire; the cartridge is sealed and replaced whole.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A blown cartridge fuse is rewired by opening its glass tube.' What's wrong?",
              options: [
                "Nothing, that's how it's done",
                "The cartridge is sealed and cannot be rewired — it is replaced with a new one",
                "Cartridge fuses never blow",
                "The glass tube holds no fuse wire",
              ],
              answer: 1,
              praise: "Correct — sealed means replaced, not rewired.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "One comparison worth banking: a fuse is described as **an alternative to a circuit breaker**. Both cut the circuit on excess current — but a fuse does it by **melting once** (then it's spent), while a breaker *trips* and can be reset.\n\nThat's why the distribution board (two circles on) leans on **MCBs** — resettable — while a fuse box relies on sacrificial wire.",
            },
            {
              kind: "check",
              prompt: "A fuse and a circuit breaker are related how?",
              options: [
                "They do opposite jobs",
                "They are alternatives — both interrupt a circuit on excessive current",
                "A fuse resets itself; a breaker melts",
                "Only fuses are used in modern boards",
              ],
              answer: 1,
              praise: "Alternatives for the same protective job — one melts, one trips.",
            },
          ],
        },
      ],
    },

    // ── The relay ────────────────────────────────────────────────────
    {
      id: "mec-relay",
      title: "The relay",
      unit: 1,
      weight: "medium",
      deps: ["mec-spdt"],
      whyItMatters:
        "An electromagnetic switch that lets a tiny current command a large one — the bridge between delicate sensors and heavy apparatus. A key protective/control device in Experiment 6.",
      recap: [
        "A relay is an electromagnetic switch operated by a relatively small current that can turn a much larger current on or off.",
        "Its heart is an electromagnet — a coil of wire that becomes a temporary magnet when electricity flows through it.",
        "Think of it as an electric lever: a tiny current 'leverages' a much bigger one driving another appliance.",
        "It bridges the gap because sensors give only small currents but often must drive big apparatus. It can act as a switch (on/off) or as an amplifier (small current → larger one).",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A sensor might produce only a whisper of current — far too little to run a motor or a lamp bank. You need something that lets the whisper *command* the roar. That's a **relay**.",
            },
            {
              kind: "teach",
              body: "The manual: a relay is an **electromagnetic switch operated by a relatively small electric current that can turn on or off a much larger electric current.**",
            },
            {
              kind: "teach",
              body: "Its **heart is an electromagnet** — a **coil of wire that becomes a temporary magnet when electricity flows through it**. Energise the coil, it pulls a contact shut; de-energise, the contact springs open.",
            },
            {
              kind: "teach",
              body: "The manual's picture for it: an **electric lever**. Switch it on with a **tiny current** and it 'leverages' — switches on — **another appliance using a much bigger current**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The 'heart' of a relay is…",
              options: [
                "a melting wire",
                "an electromagnet — a coil that becomes a temporary magnet",
                "a sealed glass tube",
                "a common terminal with two throws",
              ],
              answer: 1,
              praise: "The electromagnet coil — magnetised only while current flows.",
            },
            {
              kind: "check",
              prompt: "What makes a relay useful?",
              options: [
                "A large current controls a tiny one",
                "A relatively small current turns a much larger current on or off",
                "It melts to protect the circuit",
                "It stores energy for later",
              ],
              answer: 1,
              praise: "Small commands large — the whole point of the relay.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Why does this matter so much? Because, as the manual says, **many sensors are incredibly sensitive and produce only small currents**, yet we often need them to **drive bigger apparatus that uses bigger currents**. The relay **bridges the gap**.",
            },
            {
              kind: "check",
              prompt: "You-try-one: a relay can act in two roles. Which pair does the manual give?",
              options: [
                "As a fuse and as a wire",
                "As a switch (on/off) and as an amplifier (small current → larger)",
                "As a scriber and as a snip",
                "As a pole and as a throw",
              ],
              answer: 1,
              praise: "Switch or amplifier — turning things on/off, or converting a small current into control of a larger one.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A relay's coil stays magnetic even after its current stops.' What's wrong?",
              options: [
                "Nothing, it's a permanent magnet",
                "The coil is a TEMPORARY magnet — it is magnetic only while electricity flows through it",
                "A relay has no coil",
                "The coil melts when energised",
              ],
              answer: 1,
              praise: "Right — temporary magnet: magnetism appears with current and vanishes without it.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Compare the switches you've met. An SPST or SPDT needs a **hand** to move it. A relay is a switch moved by **electricity itself** — a small current where the finger used to be.\n\nThat's the leap: mechanical switching becomes electrical switching, and suddenly circuits can command other circuits without a person in the loop.",
            },
            {
              kind: "check",
              prompt: "The key difference between a relay and an ordinary SPST switch is that the relay is operated by…",
              options: [
                "a larger voltage only",
                "an electric current (via its coil), not a human hand",
                "melting instead of moving",
                "a sealed glass tube",
              ],
              answer: 1,
              praise: "Operated by current through its coil — a switch that switches itself.",
            },
          ],
        },
      ],
    },

    // ── Distribution board ───────────────────────────────────────────
    {
      id: "mec-db",
      title: "The distribution board",
      unit: 1,
      weight: "heavy",
      deps: ["mec-fuse"],
      whyItMatters:
        "Experiment 2: the panel that takes one incoming supply and splits it safely to final sub-circuits, guarded by main switch, ELCB and MCB. The capstone that assembles everything in this unit.",
      recap: [
        "A distribution board splits one incoming supply into several protected final sub-circuits.",
        "Its apparatus: DP main switch, ELCB (Earth Leakage Circuit Breaker), SP MCB(s), bus bar, neutral link and fuse.",
        "Connection order: fix all apparatus in place → wire per the circuit diagram → connect the main-switch output to the ELCB input and the MCB output, joined via the SP (MCB & Neutral Link).",
        "Then switch ON the DP main switch, ELCB & MCB, and check the output with a series board. Connections must be tight.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "One supply comes into a building; many circuits need feeding — lights here, sockets there — each protected on its own. The panel that does the splitting-and-guarding is the **distribution board**.",
            },
            {
              kind: "teach",
              body: "Meet its apparatus, named in Experiment 2:\n\n• **DP main switch** — the double-pole master isolator for the whole board.\n• **ELCB** — Earth Leakage Circuit Breaker, trips on leakage to earth.\n• **MCB** (single-pole) — Miniature Circuit Breaker on each sub-circuit.\n• **Bus bar**, **Neutral Link (N.L)** and a **fuse**.",
            },
            {
              kind: "teach",
              body: "The flow is: supply → main switch → ELCB → MCBs → **final sub-circuits**. Each stage is a guard the current must pass, so a fault on one sub-circuit trips its own MCB, not the whole building.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What does ELCB stand for on the distribution board?",
              options: [
                "Electrical Load Control Box",
                "Earth Leakage Circuit Breaker",
                "External Line Connection Bar",
                "Every Live Cable Barrier",
              ],
              answer: 1,
              praise: "Earth Leakage Circuit Breaker — it trips on current leaking to earth.",
            },
            {
              kind: "check",
              prompt: "The job of a distribution board is to…",
              options: [
                "melt when current is too high",
                "split one incoming supply into several protected sub-circuits",
                "convert AC to DC",
                "store electricity",
              ],
              answer: 1,
              praise: "Split and protect — one supply becomes many guarded sub-circuits.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "The build order from the procedure: **fix all the apparatus** — MCB, main switch and ELCB — in their places. Then **make the connections as per the circuit diagram**.",
            },
            {
              kind: "teach",
              body: "The key joint: connect the **output of the main switch to the input of the ELCB** and the **output of the MCB**, joined via the **SP (MCB & Neutral Link)**. Then **switch ON the DP main switch, ELCB & MCB** and **check the output with a series board** (a test lamp).",
            },
            {
              kind: "check",
              prompt: "You-try-one: after wiring the board, how do you check the output?",
              options: [
                "With a series board (test lamp)",
                "By touching the bus bar",
                "By melting a fuse",
                "By counting the MCBs",
              ],
              answer: 0,
              praise: "The series board — a safe test lamp confirms the output before real load.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Loose connections on a distribution board are fine as long as the MCB works.' Why is that dangerous?",
              options: [
                "It isn't — looseness is acceptable",
                "The procedure insists connections should be tightly done; loose joints cause heat, arcing and faults the MCB can't fully prevent",
                "Loose joints make the ELCB faster",
                "The MCB tightens them automatically",
              ],
              answer: 1,
              praise: "Right — the manual's rule is 'connection should be tightly done'; loose joints are a hazard in their own right.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "See how the whole unit meets here. The **main switch** is a double-pole isolator (DPST family). The **MCB** is the resettable cousin of the **fuse** you studied. The **ELCB** watches for leakage the fuse can't see. Together they layer protection: isolate, breaker, leakage-guard.",
            },
            {
              kind: "teach",
              body: "And carry the manual's working discipline out of Experiment 2: **connections tight**, and — its own words — **keep your mind and eyes on the experiment, don't talk to anyone while working, and don't let tools scatter on the table.** Safe hands make safe boards.",
            },
            {
              kind: "check",
              prompt: "On the distribution board, the MCB plays the same protective role as which earlier device — but resettable?",
              options: ["The relay", "The fuse", "The SPDT switch", "The bus bar"],
              answer: 1,
              praise: "The fuse — the MCB breaks on overcurrent too, but trips and resets instead of melting.",
            },
          ],
        },
      ],
    },

    // ── Unit 1 review ────────────────────────────────────────────────
    {
      id: "mec-u1-review",
      title: "Unit 1 quick review",
      unit: 1,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-spdt", "mec-godown", "mec-fuse", "mec-relay", "mec-db"],
        count: 5,
      },
      deps: ["mec-db"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
