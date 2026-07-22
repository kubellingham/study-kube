// MECO3D Unit 5: Computer Peripherals. Four-quarter circles, one concept per
// circle. Source: Workshop Practice lab manual — Experiment 11 (Keyboard,
// Mouse and Printer: working, repairing and troubleshooting). Grounded
// strictly in the manual.
import type { Section } from "./types";

export const sectionU5: Section = {
  id: "mec-sec-u5",
  letter: "E",
  title: "Computer Peripherals",
  tagline: "How the everyday devices — keyboard, mouse and printer — actually work, and how to fix them.",
  unit: 5,
  topics: [
    // ── Inside the keyboard ──────────────────────────────────────────
    {
      id: "mec-keyboard",
      title: "Inside the keyboard",
      unit: 5,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Experiment 11's first device. A keyboard is a tiny computer — the key matrix and the character map explain how a keypress becomes a letter.",
      recap: [
        "A keyboard has its own processor and circuitry; a large part of that is the key matrix — a grid of circuits under the keys.",
        "Pressing a key presses a switch that completes (closes) a circuit, letting a tiny current flow; the switch's vibration is 'bounce', which the processor filters out.",
        "The processor finds the closed circuit's location on the key matrix and compares it to the character map in ROM — a lookup table.",
        "The character map says what each keystroke means: the key alone gives 'a'; Shift + that key gives 'A'.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A keyboard looks passive, but it is 'a lot like a **miniature computer**' — it has its own **processor and circuitry** that carries information to and from that processor.",
            },
            {
              kind: "teach",
              body: "The important part is the **key matrix**: a **grid of circuits underneath the keys**. In most keyboards each circuit is broken at a point below each key.",
            },
            {
              kind: "teach",
              body: "When you **press a key**, it presses a switch that **completes the circuit**, allowing a **tiny current to flow**. The mechanical switch also causes a little vibration called **bounce**, which the processor **filters out** (so one press isn't read as many).",
            },
            {
              kind: "teach",
              body: "The processor finds **which circuit closed**, then compares that **location on the key matrix to the character map in ROM** — a comparison/lookup table. The character map tells it what the keystroke means: the key by itself is a small **'a'**, but **Shift + a** together make a capital **'A'**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The grid of circuits under a keyboard's keys is called the…",
              options: ["character map", "key matrix", "ROM chip", "system board"],
              answer: 1,
              praise: "The key matrix — the grid the processor scans for a closed circuit.",
            },
            {
              kind: "check",
              prompt: "Where does the processor look up what a pressed key means?",
              options: [
                "The character map stored in ROM",
                "The key matrix itself",
                "The system board's CPU",
                "The monitor",
              ],
              answer: 0,
              praise: "The character map in ROM — the lookup table for each keystroke.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: what is 'bounce' in a keyboard, and what handles it?",
              options: [
                "A stuck key; the user fixes it",
                "The switch's vibration on contact; the processor filters it out",
                "A ROM error; the BIOS clears it",
                "A power surge; the fuse stops it",
              ],
              answer: 1,
              praise: "Contact vibration, filtered by the processor so one press reads as one keystroke.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Pressing a key breaks the circuit, stopping current so the processor notices.' What's wrong?",
              options: [
                "Nothing, that's right",
                "Pressing a key COMPLETES (closes) the circuit, letting a tiny current flow — that's what the processor detects",
                "Keys never affect circuits",
                "The current flows before the key is pressed",
              ],
              answer: 1,
              praise: "Right — a press closes the circuit; the flowing current is the signal.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "So a keypress is a three-step chain: **close a circuit** in the matrix → **processor locates it** → **character map turns location into a character.** The keyboard doesn't send 'the letter A'; it sends *which circuit closed*, and its own little computer translates.\n\nThat's why Shift works: it's not a letter at all — it just changes which entry of the character map applies.",
            },
            {
              kind: "check",
              prompt: "Capital 'A' is produced because…",
              options: [
                "there is a separate 'A' key matrix",
                "Shift + the key together map to a different character-map entry than the key alone",
                "the ROM heats up",
                "the processor doubles the current",
              ],
              answer: 1,
              praise: "Shift selects a different character-map entry — same key, different meaning.",
            },
          ],
        },
      ],
    },

    // ── Keyboard switch technologies ─────────────────────────────────
    {
      id: "mec-kb-switches",
      title: "Keyboard switch types",
      unit: 5,
      weight: "medium",
      deps: ["mec-keyboard"],
      whyItMatters:
        "The manual splits keyboards into capacitive and mechanical. The difference explains cost, feel and reliability — and why one never suffers bounce.",
      recap: [
        "Capacitive switches are non-mechanical: current flows constantly through the matrix, and each spring-loaded key moves a tiny plate closer to the one below, changing the current the processor detects.",
        "Capacitive keyboards are expensive but last longer than any other, and have no bounce because the two surfaces never actually touch.",
        "All other switches are mechanical, giving audible and tactile response: rubber dome, membrane, metal contact and foam element.",
        "So the trade-off is capacitive (costly, durable, no bounce) vs mechanical (cheaper, with feel and sound, but with bounce and wear).",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Keyboards use different **switch technologies** under the keys. The manual splits them into two families: **capacitive** and **mechanical**.",
            },
            {
              kind: "teach",
              body: "**Capacitive** switches are **non-mechanical** — they don't physically complete a circuit. Instead, current **flows constantly through the matrix**. Each key is spring-loaded with a **tiny plate**; pressing it **moves the plate closer to the plate below**, and that changes the amount of current, which the processor reads as a keypress.",
            },
            {
              kind: "teach",
              body: "Because the two surfaces **never actually touch**, capacitive keyboards have **no bounce**. They are **expensive**, but they **last longer than any other keyboard**.",
            },
            {
              kind: "teach",
              body: "**All the other types are mechanical.** Each gives a level of **audible and tactile** response — the sound and feel of typing. The mechanical switches named are: **rubber dome, membrane, metal contact and foam element.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Why does a capacitive keyboard have no bounce?",
              options: [
                "It has no processor",
                "Its two surfaces never actually touch, so there's no contact vibration",
                "It filters every keystroke twice",
                "It uses a membrane",
              ],
              answer: 1,
              praise: "No physical contact means no bounce — the capacitive advantage.",
            },
            {
              kind: "check",
              prompt: "Which is a MECHANICAL keyboard switch type from the manual?",
              options: ["Capacitive", "Rubber dome", "Character map", "Key matrix"],
              answer: 1,
              praise: "Rubber dome — one of the mechanical family (with membrane, metal contact, foam element).",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: how does a capacitive key register a press if nothing touches?",
              options: [
                "It completes a broken circuit",
                "Its plate moves closer to the plate below, changing the current the processor detects",
                "It melts a fuse",
                "It sends the letter directly",
              ],
              answer: 1,
              praise: "The plate nears the one below, current changes, processor reads it — no contact needed.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Capacitive keyboards are cheap and wear out fastest.' What's wrong?",
              options: [
                "Nothing, that's correct",
                "They are EXPENSIVE and last LONGER than any other keyboard",
                "They are mechanical",
                "They have the most bounce",
              ],
              answer: 1,
              praise: "Reversed correctly — costly but the most durable, and bounce-free.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The trade-off in one line: **capacitive** = expensive, longest life, no bounce, no real 'click'. **Mechanical** = cheaper, with the **audible and tactile** feedback people like, but with contact bounce and wear.\n\nAnd it ties back to the last circle: mechanical types *close a circuit* (so the processor must filter bounce); capacitive types *change a current* (so there's nothing to bounce). Same job, two physics.",
            },
            {
              kind: "check",
              prompt: "Compared with mechanical switches, capacitive switches trade away cheap price and tactile click in return for…",
              options: [
                "louder typing",
                "longer life and freedom from bounce",
                "a simpler character map",
                "no need for a processor",
              ],
              answer: 1,
              praise: "Durability and no bounce — the capacitive bargain.",
            },
          ],
        },
      ],
    },

    // ── Keyboard troubleshooting ─────────────────────────────────────
    {
      id: "mec-kb-trouble",
      title: "Keyboard troubleshooting",
      unit: 5,
      weight: "medium",
      deps: ["mec-keyboard"],
      whyItMatters:
        "The repair half of the keyboard experiment — read the symptom, isolate the fault, and know the one hot-swap hazard that can destroy a board.",
      recap: [
        "Symptoms of failure: no characters onscreen, some keys work and others don't, a Keyboard/Interface Test Failure error, six short beeps at boot, wrong characters, a 301 error, an 'unplugged keyboard' message, or a stuck key.",
        "The processor can detect a stuck (closed) key but has no way to detect an open key; an unplugged or bad-cable keyboard also throws an error at startup.",
        "Because the keyboard is external, detachable and cheap, the first hardware check is to swap it with a known-good keyboard.",
        "If the new one works, check inside the faulty keyboard for a blown fuse in the +5V DC supply — but never hot-swap 5-pin DIN or 6-pin PS/2 keyboards; plugging them in while power is on can cause the keyboard to fail.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "When a keyboard misbehaves, the **symptom names the fault**. The manual lists the usual ones: **no characters appear**, **some keys work and others don't**, a **Keyboard (or KB/Interface) Test Failure error**, **six short beeps** at boot, **wrong characters**, a **301 error**, an **'unplugged keyboard' message**, or a **stuck key**.",
            },
            {
              kind: "teach",
              body: "A useful quirk: the system **can detect a stuck (closed) key** — it produces an error — but it has **no way to detect an open key** that simply makes no contact. An **unplugged keyboard or bad cable** also produces an error at startup.",
            },
            {
              kind: "teach",
              body: "The first hardware check is easy because the keyboard is **external, detachable and inexpensive**: **swap it with a known-good keyboard.** If the good one works, the original is the fault.",
            },
            {
              kind: "teach",
              body: "Then look inside the faulty unit for a **blown fuse in the +5V DC supply** and check its continuity. One hard rule: **never hot-swap 5-pin DIN or 6-pin PS/2 keyboards** — plugging them in while the power is on **can cause the keyboard to fail.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The quickest hardware check for a suspected bad keyboard is to…",
              options: [
                "replace the system board",
                "swap it with a known-good keyboard",
                "reinstall the operating system",
                "re-solder the key matrix",
              ],
              answer: 1,
              praise: "Swap in a known-good one — cheap, external, and it isolates the fault instantly.",
            },
            {
              kind: "check",
              prompt: "Which fault can the system detect?",
              options: [
                "An open key that makes no contact",
                "A stuck (closed) key",
                "A faded key label",
                "A dirty keycap",
              ],
              answer: 1,
              praise: "A stuck key throws an error; an open key can't be detected.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: the known-good keyboard works, so the fault is in the original. What do you check inside it?",
              options: [
                "The monitor cable",
                "A blown fuse in the +5V DC supply",
                "The character map",
                "The mouse driver",
              ],
              answer: 1,
              praise: "The +5V DC supply fuse — check it for continuity.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Plug a PS/2 keyboard in while the PC is running — it's hot-swappable.' Why is that dangerous?",
              options: [
                "Nothing, PS/2 is hot-swappable",
                "5-pin DIN and 6-pin PS/2 keyboards can NOT be hot-swapped — plugging in with power on can make the keyboard fail",
                "It only works with USB keyboards",
                "It corrupts the character map",
              ],
              answer: 1,
              praise: "Right — power off first for DIN/PS/2; hot-plugging can kill the keyboard.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Notice the repair logic: **isolate before you open.** Swapping a known-good unit tells you *which side* the fault is on before you unscrew anything — because most keyboard circuitry is in the keyboard, but the **interface circuitry is on the system board**.\n\nThat 'swap to isolate, then check the cheap external part first' method is exactly how the mouse and printer are diagnosed too.",
            },
            {
              kind: "check",
              prompt: "Swapping in a known-good keyboard is valuable because it…",
              options: [
                "repairs the original",
                "isolates whether the fault is the keyboard or the system board before you open anything",
                "updates the BIOS",
                "cleans the key matrix",
              ],
              answer: 1,
              praise: "Isolate first — it points at the faulty side before any teardown.",
            },
          ],
        },
      ],
    },

    // ── The mouse ────────────────────────────────────────────────────
    {
      id: "mec-mouse",
      title: "The mouse",
      unit: 5,
      weight: "medium",
      deps: [],
      whyItMatters:
        "The second peripheral — its functions, its parts and the trackball/port faults that make up its troubleshooting.",
      recap: [
        "A mouse is a handheld input device that controls a cursor in a GUI; it has a primary (left) button for most tasks and a secondary (right) button for special commands.",
        "Its functions: move the cursor, open/execute, select, drag-and-drop, hover, scroll and other programmable actions.",
        "Its parts: buttons; a ball-and-rollers (mechanical) or laser/LED (optical) to track motion on x and y axes; and usually a scroll wheel.",
        "Troubleshooting: most problems are the port connection, the driver, the trackball or the buttons — check the mouse is on the green (PS/2) connector, and clean dirt/lint from a trackball that freezes the cursor.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The **mouse** is a handheld input device that **controls a cursor in a GUI** and can move and select things on screen. It has a **primary (left) button** for most tasks and a **secondary (right) button** for special commands and options.",
            },
            {
              kind: "teach",
              body: "Its **functions**, per the manual: **move the cursor, open/execute a program, select, drag-and-drop, hover, scroll**, and **other programmable** actions (like side buttons set to 'go back').",
            },
            {
              kind: "teach",
              body: "Its **parts**: the **buttons**; a **ball and rollers** if it's a mechanical mouse, or a **laser/LED** if optical — these track motion on the **x and y axes**; and usually a **scroll wheel**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The mouse's primary (left) button is used for…",
              options: [
                "special commands and options",
                "carrying out most tasks",
                "scrolling only",
                "nothing — it's decorative",
              ],
              answer: 1,
              praise: "Most tasks go through the primary button; the right button is for special cases.",
            },
            {
              kind: "check",
              prompt: "In a mechanical mouse, what tracks its movement on the x and y axes?",
              options: ["A ball and rollers", "A laser only", "The scroll wheel", "The character map"],
              answer: 0,
              praise: "The ball and rollers — the optical mouse uses a laser/LED instead.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: a trackball mouse's cursor keeps freezing and jumping. The likely cause is…",
              options: [
                "a broken monitor",
                "dirt or lint picked up by the trackball, hindering its movement",
                "a blown +5V fuse",
                "the wrong character map",
              ],
              answer: 1,
              praise: "Dirt on the trackball — remove and clean it (twist the latch counter-clockwise).",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A perfectly good mouse that acts up should always be thrown away.' What does the manual suggest first?",
              options: [
                "Nothing, always replace it",
                "Check the mouse Properties in the OS first — its buttons may just be set up for left-hand use",
                "Re-solder its ball",
                "Replace the system board",
              ],
              answer: 1,
              praise: "Right — check the OS button settings before binning a working mouse.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The mouse is diagnosed just like the keyboard: **isolate it from its host port** and swap in a known-good one; if that works, the original is defective. Most faults are the **port connection, the driver, the trackball or the buttons.**\n\nOne connector tip: on older systems the mouse and keyboard share the same 6-pin mini-DIN and are **not interchangeable** — the ports are colour-coded, so make sure the mouse is on the **green connector.**",
            },
            {
              kind: "check",
              prompt: "On a colour-coded PS/2 system, the mouse should be plugged into the…",
              options: ["purple connector", "green connector", "blue connector", "any connector — they're the same"],
              answer: 1,
              praise: "The green connector — the keyboard and mouse ports aren't interchangeable.",
            },
          ],
        },
      ],
    },

    // ── The printer ──────────────────────────────────────────────────
    {
      id: "mec-printer",
      title: "The printer & how laser printing works",
      unit: 5,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "The third peripheral — its types, and the elegant static-electricity process by which a laser printer puts toner exactly where the page should be black.",
      recap: [
        "A printer is an external output device that takes electronic data and makes a hard copy; common types are inkjet and laser (plus 3D, dot-matrix, LED, MFP, plotter, thermal).",
        "Laser process: data streams in; an electronic circuit fires the corona wire, which gives the photoreceptor drum a uniform positive charge.",
        "The laser (bounced off a moving mirror) draws the image, erasing charge to negative where the page should be black; the ink roller coats the drum with positively-charged toner, which sticks only to the negative (black) areas.",
        "The paper is given a strong positive charge by another corona wire, pulling the toner off the drum; then the fuser unit's hot rollers bond the toner permanently into the paper.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A **printer** is an **external output device** that takes the electronic data on a computer and **generates a hard copy**. The manual lists many types — **inkjet, laser, 3D, dot-matrix, LED, MFP, plotter, thermal** — but says the two most common are **inkjet and laser**.",
            },
            {
              kind: "teach",
              body: "Follow a **laser** print, step by step. Data streams in, and an **electronic circuit** figures out how the page should look. It fires the **corona wire** — a high-voltage wire that gives a static charge to anything nearby — which charges the **photoreceptor drum** with a **uniform positive charge**.",
            },
            {
              kind: "teach",
              body: "Then the **laser** (bounced off a moving mirror) **draws the image on the drum**: where it hits, it **erases the positive charge to negative.** So the drum ends up positive where the page is white, and **negative where the page should be black.**",
            },
            {
              kind: "teach",
              body: "An **ink roller** coats the drum with **positively-charged toner** (powdered ink). Opposite charges attract, so the toner **sticks only to the negative (black) areas** — building an inked image on the drum.",
            },
            {
              kind: "teach",
              body: "Finally, **paper** is given a **strong positive charge** by another corona wire. As it nears the drum, its charge **pulls the negatively-charged toner off** onto the page. Then the **fuser unit's hot rollers** press and heat the toner, **bonding it permanently into the paper** — 'hot off the press.'",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What gives the photoreceptor drum its uniform positive charge?",
              options: ["The fuser unit", "The corona wire", "The laser", "The ink roller"],
              answer: 1,
              praise: "The corona wire — a high-voltage wire that charges the drum.",
            },
            {
              kind: "check",
              prompt: "The laser draws the image on the drum by…",
              options: [
                "adding toner directly",
                "erasing the positive charge to negative where the page should be black",
                "heating the paper",
                "spraying ink",
              ],
              answer: 1,
              praise: "It flips charge to negative on the black areas — an electrostatic image.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: the positively-charged toner sticks to which parts of the drum?",
              options: [
                "The positive (white) areas",
                "The negative (black) areas, because opposite charges attract",
                "The whole drum evenly",
                "Only the edges",
              ],
              answer: 1,
              praise: "Negative areas — opposite charges attract, so toner marks the black image.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The fuser unit charges the paper to pull toner off the drum.' What's its real job?",
              options: [
                "Nothing, the fuser charges the paper",
                "A corona wire charges the paper; the FUSER's hot rollers bond the toner permanently into the paper afterwards",
                "The fuser draws the image",
                "The fuser cools the drum",
              ],
              answer: 1,
              praise: "Right — corona wire charges the paper; the fuser heat-bonds the toner at the end.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The whole laser process is **one idea — opposite charges attract — used three times**: the corona charges the drum, the laser reverses charge to draw, the toner is pulled to the opposite-charged areas, and the charged paper pulls it off again.\n\nOn the repair side, the manual's fixes are practical: printing too slow? Switch the driver to **Fast/Draft** quality (which also saves ink). Jobs going to the wrong printer? **Set the correct default** in Devices and Printers.",
            },
            {
              kind: "check",
              prompt: "A user complains printing is too slow. The manual's fix is to…",
              options: [
                "replace the corona wire",
                "reduce print quality to Fast/Draft mode (which also saves ink)",
                "add a second monitor",
                "swap the mouse",
              ],
              answer: 1,
              praise: "Draft mode — faster output and less ink used.",
            },
          ],
        },
      ],
    },

    // ── Review ───────────────────────────────────────────────────────
    {
      id: "mec-u5-review",
      title: "Unit 5 quick review",
      unit: 5,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-keyboard", "mec-kb-switches", "mec-kb-trouble", "mec-mouse", "mec-printer"],
        count: 5,
      },
      deps: ["mec-printer"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
