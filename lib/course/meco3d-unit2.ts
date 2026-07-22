// MECO3D Unit 2: Sheet Metal Work. Four-quarter circles, one concept per
// circle. Source: Workshop Practice lab manual — Experiment 3 (soap case,
// 28 SWG GI sheet) and Experiment 4 (book rack stand, 22 SWG). Grounded
// strictly in the manual's tools, operations and drawings.
import type { Section } from "./types";

export const sectionU2: Section = {
  id: "mec-sec-u2",
  letter: "B",
  title: "Sheet Metal Work",
  tagline: "Turning a flat sheet into a finished article — measured, marked, cut, formed and joined.",
  unit: 2,
  topics: [
    // ── The operations vocabulary ────────────────────────────────────
    {
      id: "mec-sm-operations",
      title: "Sheet-metal operations",
      unit: 2,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Both jobs in this unit are just these operations in sequence. Name each one and the two experiments read like a recipe you already know.",
      recap: [
        "The soap case teaches the full set: Measurement, Marking, Cutting, Notching, Hand Forming, Filing, Punching, Hand Shearing and Soldering.",
        "Marking = scribing the drawing's lines onto the sheet; Cutting/Shearing = separating metal along them.",
        "Notching = removing a wedge (e.g. the corner cut-outs) so the sheet can fold cleanly; Hand Forming = bending it to shape.",
        "Filing smooths edges; Punching marks or pierces; Soldering joins the formed corners.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A sheet-metal job is never one action — it's a **sequence of named operations**. Learn the names once and every drawing becomes a to-do list.",
            },
            {
              kind: "teach",
              body: "The soap case (Experiment 3) lists the full set as its learning objective: **Measurement, Marking, Cutting, Notching, Hand Forming, Filing, Punching, Hand Shearing and Soldering.**",
            },
            {
              kind: "teach",
              body: "Group them by what they *do*:\n\n• **Lay out** — Measurement, Marking (scribe the lines).\n• **Separate** — Cutting, Hand Shearing, Notching (remove metal).\n• **Shape & finish** — Hand Forming (bend), Filing (smooth), Punching (mark/pierce).\n• **Join** — Soldering.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which operation MARKS the drawing's lines onto the sheet before any metal is removed?",
              options: ["Soldering", "Marking", "Hand forming", "Filing"],
              answer: 1,
              praise: "Marking — the scribed lines every later cut follows.",
            },
            {
              kind: "check",
              prompt: "Removing a wedge of metal from a corner so the sides can fold up is called…",
              options: ["Filing", "Punching", "Notching", "Soldering"],
              answer: 2,
              praise: "Notching — the wedge cut-out that lets the sheet fold cleanly.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: the soap case's four upright sides are raised by which operation?",
              options: ["Hand forming (bending)", "Filing", "Measurement", "Punching"],
              answer: 0,
              praise: "Hand forming — bending the flat blank into a tray.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Filing separates the sheet into two pieces.' What's wrong?",
              options: [
                "Nothing, filing cuts metal in two",
                "Filing SMOOTHS edges; it's cutting/shearing that separates the sheet",
                "Filing only marks lines",
                "Filing joins two sheets",
              ],
              answer: 1,
              praise: "Right — files finish edges; snips and shears do the separating.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "One operation only appears in the soap case, not the book rack: **soldering**. The soap case's corners must be *joined* into a watertight tray, so it ends in soldering. The book rack's opening is just *cut and bent*, so it never needs a join.\n\nThat single difference is why Experiment 3 lists nine operations and Experiment 4 lists a shorter set — the job decides the operations.",
            },
            {
              kind: "check",
              prompt: "Why does the soap case need soldering but the book rack does not?",
              options: [
                "The book rack is smaller",
                "The soap case's corners must be joined into a tray; the book rack is only cut and bent",
                "The book rack uses thinner sheet",
                "Soldering is only for steel",
              ],
              answer: 1,
              praise: "The job decides — corners to join means solder; cut-and-bend needs none.",
            },
          ],
        },
      ],
    },

    // ── Tools ────────────────────────────────────────────────────────
    {
      id: "mec-sm-tools",
      title: "Sheet-metal tools",
      unit: 2,
      weight: "medium",
      deps: ["mec-sm-operations"],
      whyItMatters:
        "Each operation has its own tool. Match tool to job and the procedure steps stop being a list to memorise.",
      recap: [
        "Steel foot rule + scriber + spring divider: measure and mark (the divider swings arcs and the 60° corner angles).",
        "Straight snip and lever shearing machine: cut and shear the sheet; the snip also does notching.",
        "Mallet + bench vice + anvil: bend and hand-form without denting (a mallet is soft-faced).",
        "Half round file: smooth edges; dot punch: mark centres and lines; soldering iron: join.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Every operation from the last circle has a tool. Meet the soap case's kit, grouped by the job it does.",
            },
            {
              kind: "teach",
              body: "**Measure & mark:** the **steel foot rule** (measure), the **scriber** (scratch the lines), and the **spring divider** (swing arcs and step off the corner angles).",
            },
            {
              kind: "teach",
              body: "**Cut & shear:** the **straight snip** (hand cutting and notching) and the **lever shearing machine** (heavier straight cuts).\n\n**Bend & form:** the **mallet** (a soft face that won't dent the sheet), the **bench vice** (grips the fold line) and the **anvil**.",
            },
            {
              kind: "teach",
              body: "**Finish & join:** the **half round file** (smooths edges), the **dot punch** (marks centres and lines), and the **soldering iron** (joins the corners).",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Why is a MALLET used to bend sheet metal rather than a steel hammer?",
              options: [
                "It is heavier",
                "Its soft face bends the sheet without denting or marking it",
                "It is magnetic",
                "It cuts as it strikes",
              ],
              answer: 1,
              praise: "Soft face, no dents — that's the mallet's whole reason for being.",
            },
            {
              kind: "check",
              prompt: "Which tool scratches the drawing's lines onto the metal surface?",
              options: ["Scriber", "Mallet", "Anvil", "Soldering iron"],
              answer: 0,
              praise: "The scriber — a hardened point that marks the layout lines.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: to mark the 60° angles at the soap case's corners, you'd use the…",
              options: ["half round file", "spring divider", "soldering iron", "lever shearing machine"],
              answer: 1,
              praise: "The spring divider — it steps off and marks the corner angles.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The half round file is used to cut the sheet to size.' What's wrong?",
              options: [
                "Nothing, files cut sheets",
                "The file SMOOTHS edges after cutting; the snip or shearing machine does the cutting",
                "The half round file only bends metal",
                "Files are for soldering",
              ],
              answer: 1,
              praise: "Right — file finishes, snip/shear cuts.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Notice the pairing: a **cutting** tool always has a **finishing** partner. The snip cuts a rough edge; the **half round file** cleans it. The divider marks an arc; the scriber sharpens the line.\n\nGood sheet-metal work is this rhythm — a coarse operation followed by a fine one — right up to the soldering iron that seals the job.",
            },
            {
              kind: "check",
              prompt: "After the straight snip cuts a rough edge, which tool cleans it up?",
              options: ["The anvil", "The half round file", "The dot punch", "The bench vice"],
              answer: 1,
              praise: "The half round file — coarse cut, then fine finish.",
            },
          ],
        },
      ],
    },

    // ── SWG gauge ────────────────────────────────────────────────────
    {
      id: "mec-swg",
      title: "Sheet gauge (SWG)",
      unit: 2,
      weight: "light",
      deps: [],
      whyItMatters:
        "The two jobs use different thicknesses on purpose — 28 SWG for the soap case, 22 SWG for the book rack. Knowing which is thicker tells you which job it suits.",
      recap: [
        "SWG = Standard Wire Gauge, the number that states a sheet's thickness.",
        "The soap case uses GI sheet of 28 SWG; the book rack uses 22 SWG.",
        "A LOWER SWG number means a THICKER, stronger sheet — so 22 SWG is thicker than 28 SWG.",
        "GI = galvanised iron (zinc-coated), the sheet both jobs are made from.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Both jobs are made from **GI sheet** — galvanised (zinc-coated) iron. But the material line gives a number: the soap case is **28 SWG**, the book rack is **22 SWG**.",
            },
            {
              kind: "teach",
              body: "**SWG = Standard Wire Gauge** — it states the sheet's **thickness**. The counter-intuitive part: a **lower number means a thicker sheet**. So **22 SWG is thicker** than 28 SWG.",
            },
            {
              kind: "teach",
              body: "That's why the assignment splits them: the **soap case** (a light tray) uses thin **28 SWG**; the **book rack** (which must stand up and hold books) uses the stronger, thicker **22 SWG**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which sheet is thicker?",
              options: ["28 SWG", "22 SWG", "They are equal", "SWG has nothing to do with thickness"],
              answer: 1,
              praise: "22 SWG — lower number, thicker sheet.",
            },
            {
              kind: "check",
              prompt: "What does 'GI' stand for in GI sheet?",
              options: ["Ground Iron", "Galvanised Iron", "General Issue", "Grade Interior"],
              answer: 1,
              praise: "Galvanised iron — zinc-coated sheet.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: the book rack must stand and bear weight, so it uses the thicker 22 SWG. The soap case, a light tray, uses…",
              options: ["22 SWG", "28 SWG", "the same 22 SWG", "no gauge"],
              answer: 1,
              praise: "28 SWG — thinner, fine for a light tray.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A higher SWG number means a stronger, thicker sheet.' What's wrong?",
              options: [
                "Nothing, higher is thicker",
                "It's the reverse — a higher SWG number means a THINNER sheet",
                "SWG measures width, not thickness",
                "SWG only applies to wire, never sheet",
              ],
              answer: 1,
              praise: "Flipped correctly — higher number, thinner sheet.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The lesson to carry: **thickness is chosen to match the load.** A soap tray holds a bar of soap — thin sheet is plenty and folds easily. A book rack holds a shelf of books — it needs the thicker gauge to stay rigid.\n\nSame skill for both, different sheet, because the *function* changed.",
            },
            {
              kind: "check",
              prompt: "The reason the book rack uses a thicker gauge than the soap case is that it must…",
              options: [
                "be soldered",
                "stay rigid and bear the weight of books",
                "be cut faster",
                "resist rust better",
              ],
              answer: 1,
              praise: "Rigidity for load — thickness follows function.",
            },
          ],
        },
      ],
    },

    // ── Soap case job ────────────────────────────────────────────────
    {
      id: "mec-soap-case",
      title: "The soap case job",
      unit: 2,
      weight: "heavy",
      deps: ["mec-sm-operations", "mec-sm-tools"],
      whyItMatters:
        "Experiment 3 itself — reading the drawing and running the operations in the right order to fold a flat blank into a soldered tray.",
      recap: [
        "Cut a GI sheet (28 SWG) to 150 × 120 mm — the overall blank.",
        "Mark the base 70 × 70 mm from all corners, and mark 60° angles at the corners with the spring divider.",
        "Cut between the two angles at each corner (notching), then file the edges with the half round file.",
        "Bend the sides up on the bench vice with the mallet (hand forming), notch with the straight snip, then solder all four corners.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Now put the operations and tools together on a real job: the **soap case** — a small folded tray with soldered corners.",
            },
            {
              kind: "teach",
              body: "**Lay out.** Cut the GI sheet to the overall **150 × 120 mm** blank. On it, mark the **base 70 × 70 mm** measured in from the corners, and use the spring divider to mark a **60° angle** at each corner.",
            },
            {
              kind: "teach",
              body: "**Separate.** **Cut between the two angle lines** at every corner — this notches out the corner so the sides can rise. Then **file** each cut edge smooth with the half round file.",
            },
            {
              kind: "teach",
              body: "**Shape & join.** **Bend the sides up** on the bench vice using the mallet (hand forming), tidy with the **straight snip** where needed, and finally **solder all four corners** with the soldering wire and iron. Tray complete.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What is the overall size of the soap case blank?",
              options: ["70 × 70 mm", "150 × 120 mm", "200 × 250 mm", "48 × 48 mm"],
              answer: 1,
              praise: "150 × 120 mm — the full sheet before folding; 70 × 70 is the base.",
            },
            {
              kind: "check",
              prompt: "The corners of the soap case are marked at what angle?",
              options: ["30°", "45°", "60°", "90°"],
              answer: 2,
              praise: "60° — stepped off with the spring divider.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: the corner metal is cut away between the two angle lines so that…",
              options: [
                "the tray weighs less",
                "the four sides can bend up without the corners overlapping",
                "the sheet becomes 22 SWG",
                "soldering is avoided",
              ],
              answer: 1,
              praise: "Right — notch the corner and the sides fold up cleanly.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Solder the corners first, then bend the sides up.' Why is the order wrong?",
              options: [
                "Soldering is never needed",
                "You must bend the sides up FIRST — only then do the corners meet to be soldered",
                "Bending comes after filing only",
                "The base is 150 × 120 mm",
              ],
              answer: 1,
              praise: "Order matters — form the tray, then solder the corners that now touch.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Step back and see the arc: a flat **150 × 120** rectangle became a tray with a **70 × 70** base and four soldered walls — purely by *layout → notch → file → form → solder*, the operations from the first circle in exactly that order.\n\nThat ordering is the real lesson. Sheet-metal work is choreography: each operation prepares the sheet for the next.",
            },
            {
              kind: "check",
              prompt: "The soap case demonstrates that sheet-metal operations must be performed…",
              options: [
                "in any order",
                "in a set sequence — layout, then separate, then form, then join",
                "all at once",
                "only with power tools",
              ],
              answer: 1,
              praise: "A set sequence — the choreography that turns a flat sheet into an article.",
            },
          ],
        },
      ],
    },

    // ── Book rack ────────────────────────────────────────────────────
    {
      id: "mec-book-rack",
      title: "The book rack stand",
      unit: 2,
      weight: "medium",
      deps: ["mec-sm-operations", "mec-swg"],
      whyItMatters:
        "Experiment 4 — a bend-and-cut job on thicker 22 SWG sheet, adding edge forming and a punched-then-chiselled opening the soap case never needed.",
      recap: [
        "Cut a GI sheet (22 SWG) to 200 × 250 mm, then bend it 90° at 60 mm from the base to form the upright and foot.",
        "Leaving 40 mm on both sides, draw a rectangle in the centre with a 35 mm semi-circle on top — the book slot.",
        "Dot-punch along the vertical lines and the semi-circle, then cut the punched area out with a chisel and hammer.",
        "New skills over the soap case: edge forming and bending on the heavier sheet, and cutting an internal opening.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The **book rack stand** is the soap case's tougher sibling: thicker **22 SWG** sheet, and instead of a folded tray it needs a **bend** and a **cut-out opening**.",
            },
            {
              kind: "teach",
              body: "**Lay out & bend.** Cut the sheet to **200 × 250 mm**. Then **bend it 90° at 60 mm from the base** — that fold makes the upright back and the flat foot the rack stands on.",
            },
            {
              kind: "teach",
              body: "**Mark the opening.** Leaving **40 mm on both sides**, draw a **rectangle in the centre** topped with a **35 mm semi-circle** — the slot a book slides into.",
            },
            {
              kind: "teach",
              body: "**Cut the opening.** **Dot-punch** along the vertical lines and around the semi-circle, then **cut the punched area out with a chisel and hammer.** The punched dots guide the chisel along the line.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The book rack sheet is bent 90° at what distance from the base?",
              options: ["40 mm", "60 mm", "35 mm", "250 mm"],
              answer: 1,
              praise: "60 mm from the base — the fold that makes the upright and foot.",
            },
            {
              kind: "check",
              prompt: "After dot-punching the opening's outline, the punched area is removed with…",
              options: ["a soldering iron", "a chisel and hammer", "a spring divider", "a mallet"],
              answer: 1,
              praise: "Chisel and hammer — the punched dots guide the cut.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: what is the purpose of dot-punching along the opening's lines before chiselling?",
              options: [
                "To decorate the surface",
                "To guide the chisel accurately along the marked line",
                "To bend the sheet",
                "To solder the edges",
              ],
              answer: 1,
              praise: "The punch marks steer the chisel so the cut follows the line.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The book rack, like the soap case, is finished by soldering its joints.' What's wrong?",
              options: [
                "Nothing, both are soldered",
                "The book rack is a single bent sheet with a cut opening — it has no joints to solder",
                "The book rack uses 28 SWG",
                "Soldering replaces the bend",
              ],
              answer: 1,
              praise: "Right — one folded sheet, no joints, so no soldering.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Compare the two jobs and you've mapped sheet-metal work:\n\n**Soap case** — thin 28 SWG, notch corners, **fold up four walls, solder** → a closed tray.\n**Book rack** — thick 22 SWG, **one 90° bend**, **punch-and-chisel an opening** → an open stand.\n\nOne joins, one cuts open; one is thin, one is thick. Between them they cover forming, joining, and internal cutting — the whole sheet-metal syllabus.",
            },
            {
              kind: "check",
              prompt: "Which skill does the book rack add that the soap case did not require?",
              options: [
                "Soldering corners",
                "Cutting an internal opening (punch-and-chisel) in the sheet",
                "Measuring with a steel rule",
                "Marking with a scriber",
              ],
              answer: 1,
              praise: "The internal cut-out — punched and chiselled open, unique to the rack.",
            },
          ],
        },
      ],
    },

    // ── Review ───────────────────────────────────────────────────────
    {
      id: "mec-u2-review",
      title: "Unit 2 quick review",
      unit: 2,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-sm-operations", "mec-sm-tools", "mec-soap-case", "mec-book-rack"],
        count: 5,
      },
      deps: ["mec-book-rack"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
