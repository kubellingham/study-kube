// MECO3D Unit 3: Joining — Soldering & Welding. Four-quarter circles, one
// concept per circle. Source: Workshop Practice lab manual — Experiment 5
// (soldering/desoldering PCBs), Experiment 7 (butt joint by arc welding),
// Experiment 8 (T-joint by arc welding). Grounded strictly in the manual.
import type { Section } from "./types";

export const sectionU3: Section = {
  id: "mec-sec-u3",
  letter: "C",
  title: "Joining: Soldering & Welding",
  tagline: "Two ways to make metal hold to metal — the gentle heat of solder and the fierce heat of the arc.",
  unit: 3,
  topics: [
    // ── Soldering a PCB joint ────────────────────────────────────────
    {
      id: "mec-soldering",
      title: "Soldering a PCB joint",
      unit: 3,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Experiment 5's core skill: a clean electrical joint made in two or three seconds. The manual's ten-step method is exam-favourite material.",
      recap: [
        "All parts must be clean and free of dirt and grease, and the work held firmly, before you start.",
        "'Tin' the iron tip with a little solder, clean it on a damp sponge, then add a touch of fresh solder to the cleansed tip.",
        "Heat all parts of the joint for a second or so, then apply just enough solder to form an adequate joint.",
        "It takes only two or three seconds to solder an average PCB joint — and you must not move the parts until the solder has cooled.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Soldering joins electronic parts with a low-melting metal. Done right it's fast and clean; done wrong it's a weak or 'dry' joint. The manual gives a **ten-step method** — walk it slowly.",
            },
            {
              kind: "teach",
              body: "**Prepare.** (1) All parts **clean and free from dirt and grease**. (2) **Secure the work firmly** so nothing moves.",
            },
            {
              kind: "teach",
              body: "**Ready the iron.** (3) **'Tin' the iron tip** with a small amount of solder — do this immediately with a new tip. (4) **Clean the tip on a damp sponge.** (5) Add a **tiny amount of fresh solder** to the cleansed tip.",
            },
            {
              kind: "teach",
              body: "**Make the joint.** (6) **Heat all parts of the joint** with the iron for a second or so. (7) Keep heating, then apply **enough solder only** to form an adequate joint. (8) Remove and **return the iron safely to its stand**.",
            },
            {
              kind: "teach",
              body: "**Finish.** (9) It only takes **two or three seconds** to solder the average PCB joint. (10) **Do not move the parts until the solder has cooled.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "What does 'tinning' the soldering iron tip mean?",
              options: [
                "Cooling it in water",
                "Coating it with a small amount of solder",
                "Filing it to a point",
                "Wrapping it in tin foil",
              ],
              answer: 1,
              praise: "Coating the tip with a little solder — done immediately on a new tip.",
            },
            {
              kind: "check",
              prompt: "Roughly how long should soldering an average PCB joint take?",
              options: ["Two or three seconds", "Thirty seconds", "Two minutes", "As long as possible"],
              answer: 0,
              praise: "Two or three seconds — fast heat, then off.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: right after applying the solder, what must you NOT do?",
              options: [
                "Return the iron to its stand",
                "Move the parts before the solder has cooled",
                "Clean the tip",
                "Inspect the joint",
              ],
              answer: 1,
              praise: "Don't move it until cool — movement while molten makes a bad joint.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Load the joint with as much solder as possible for strength.' Why is that wrong?",
              options: [
                "Nothing, more solder is stronger",
                "You apply ENOUGH solder ONLY to form an adequate joint — excess is not the goal",
                "Solder should never touch the joint",
                "Strength comes from moving the parts",
              ],
              answer: 1,
              praise: "Right — 'enough only', not a blob; a good joint is neat, not drowned.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "See the theme running through all ten steps: **clean, quick, still.** Clean parts and a clean tinned tip; a quick two-second heat; and stillness while it cools.\n\nBreak any one and you get a bad joint — which is exactly what the troubleshooting circle (two on) diagnoses.",
            },
            {
              kind: "check",
              prompt: "The three ideas that run through the whole soldering method are…",
              options: [
                "hot, heavy, slow",
                "clean parts, quick heat, stillness while cooling",
                "flux, aluminium, water",
                "mark, cut, file",
              ],
              answer: 1,
              praise: "Clean, quick, still — the recipe for a sound joint.",
            },
          ],
        },
      ],
    },

    // ── Desoldering ──────────────────────────────────────────────────
    {
      id: "mec-desoldering",
      title: "Desoldering with a pump",
      unit: 3,
      weight: "medium",
      deps: ["mec-soldering"],
      whyItMatters:
        "The reverse skill — removing a component cleanly so a board can be repaired. Experiment 5's second half.",
      recap: [
        "First melt the existing solder joint with the iron tip (about 1–2 seconds), with the spring-loaded desoldering pump primed and ready.",
        "Apply the pump's PTFE nozzle to the molten solder and release the plunger — it draws the molten solder up into the pump.",
        "Remove the iron tip; repeat the process if needed.",
        "Desoldering = re-melt the joint, then suck the solder away, to free the component or wire.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "To *remove* a component you must undo the solder that holds it. That's **desoldering**, and the tool is a **spring-loaded desoldering pump**.",
            },
            {
              kind: "teach",
              body: "**Step 1: melt.** Apply the **soldering iron tip to the joint first** to melt the solder — say for **1–2 seconds**. Have the spring-loaded pump already **'primed' and ready to go**.",
            },
            {
              kind: "teach",
              body: "**Step 2: suck.** Put the pump's **PTFE nozzle onto the molten solder** and **release the plunger** — the spring drives it back and **draws the molten solder up into the pump**. Remove the iron tip. **Repeat if needed.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Before the desoldering pump can remove solder, you must first…",
              options: [
                "cool the joint in water",
                "melt the solder joint with the iron tip",
                "add fresh flux",
                "cut the component leg",
              ],
              answer: 1,
              praise: "Melt it first — you can only pump molten solder.",
            },
            {
              kind: "check",
              prompt: "How does the spring-loaded pump lift the solder away?",
              options: [
                "It blows the solder off",
                "Releasing the plunger draws the molten solder up into the pump",
                "It files the solder off",
                "It cools and cracks the joint",
              ],
              answer: 1,
              praise: "The released plunger sucks the molten solder up — that's the whole action.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: some solder is left after one attempt. What does the manual say to do?",
              options: [
                "Leave it — one pass is enough",
                "Repeat the process — melt again and pump again",
                "Scrape it with a file",
                "Add more solder",
              ],
              answer: 1,
              praise: "Repeat if needed — melt and pump again until the joint is clear.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Apply the pump nozzle to the solder while it is still solid.' Why is that wrong?",
              options: [
                "Nothing, that works",
                "The pump can only draw up MOLTEN solder — the joint must be melted by the iron first",
                "The pump melts the solder itself",
                "Solid solder is easier to pump",
              ],
              answer: 1,
              praise: "Right — molten only; the iron does the melting, the pump does the lifting.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Soldering and desoldering are mirror images. Soldering: **heat, then add** solder. Desoldering: **heat, then remove** solder. The iron does the same job — melt — in both; only the direction changes.\n\nTogether they let you not just build a board but *repair* one, swapping a failed part for a good one.",
            },
            {
              kind: "check",
              prompt: "What is the same in both soldering and desoldering?",
              options: [
                "You add solder in both",
                "The iron melts the solder in both — only adding vs removing differs",
                "Both cool the joint in water",
                "Both use a pump",
              ],
              answer: 1,
              praise: "The iron melts in both — build adds, repair removes.",
            },
          ],
        },
      ],
    },

    // ── Solder-joint faults ──────────────────────────────────────────
    {
      id: "mec-solder-faults",
      title: "Solder-joint faults",
      unit: 3,
      weight: "medium",
      deps: ["mec-soldering"],
      whyItMatters:
        "The troubleshooting guide — reading a bad joint tells you exactly which step went wrong. Diagnosis is what separates a technician from a beginner.",
      recap: [
        "Solder won't 'take' → grease or dirt is present (desolder and clean), or the material isn't solderable with lead/tin solder (e.g. aluminium).",
        "A crystalline or grainy-looking joint → the joint was moved before it cooled, or it wasn't heated adequately (iron too small / joint too large) — a 'dry joint'.",
        "The joint forms a 'spike' → it was probably overheated, burning away the flux.",
        "Each fault points back to a specific soldering step: cleanliness, stillness, correct heat, or not overheating.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A finished joint *tells you* how it was made. The manual's troubleshooting guide reads three common faults — learn to diagnose backwards.",
            },
            {
              kind: "teach",
              body: "**Solder won't 'take'.** Cause: **grease or dirt is present** — desolder and clean the parts. Or the **material isn't suitable** for lead/tin solder (for example, **aluminium**).",
            },
            {
              kind: "teach",
              body: "**Joint is crystalline or grainy-looking.** Cause: the joint was **moved before it was allowed to cool**, or it **wasn't heated adequately** — too small an iron, or too large a joint. This is the classic **dry joint**.",
            },
            {
              kind: "teach",
              body: "**Joint forms a 'spike'.** Cause: **probably overheated**, burning away the flux.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The solder simply won't 'take' to the joint. The most likely cause is…",
              options: [
                "the iron is too hot",
                "grease or dirt on the parts (or an unsolderable material like aluminium)",
                "too much flux",
                "the parts cooled too fast",
              ],
              answer: 1,
              praise: "Dirty or unsuitable surface — clean it, or the metal simply won't solder.",
            },
            {
              kind: "check",
              prompt: "A grainy, crystalline joint usually means it was…",
              options: [
                "overheated",
                "moved before it cooled, or not heated enough — a dry joint",
                "cleaned too well",
                "soldered too quickly",
              ],
              answer: 1,
              praise: "A dry joint — moved while setting, or under-heated.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: a joint has formed a sharp 'spike'. What went wrong?",
              options: [
                "It was overheated, burning away the flux",
                "It was not heated at all",
                "The parts were too clean",
                "Too little solder was used",
              ],
              answer: 0,
              praise: "Overheated — the flux burned off and left a spike.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A dry joint means you used too much solder.' What's the real cause?",
              options: [
                "Too much solder, exactly",
                "It was moved before cooling, or under-heated (iron too small / joint too large)",
                "The flux was too fresh",
                "The parts were aluminium",
              ],
              answer: 1,
              praise: "Right — a dry joint is about movement or too little heat, not solder quantity.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Line the faults up against the method and each one accuses a step:\n\n• **Won't take** ← step 1 (parts not clean).\n• **Grainy / dry** ← step 6–7 (not enough heat) or step 10 (moved while cooling).\n• **Spike** ← too much heat (overdid step 6).\n\nSo the troubleshooting guide is really the ten-step method, read in reverse. Master one and you've mastered both.",
            },
            {
              kind: "check",
              prompt: "A dry (grainy) joint caused by movement traces back to which soldering rule?",
              options: [
                "Clean the parts first",
                "Do not move the parts until the solder has cooled",
                "Tin the tip",
                "Return the iron to its stand",
              ],
              answer: 1,
              praise: "The 'don't move until cool' rule — broken, it makes the dry joint.",
            },
          ],
        },
      ],
    },

    // ── Arc welding basics ───────────────────────────────────────────
    {
      id: "mec-arc-basics",
      title: "Arc welding — the setup",
      unit: 3,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Where gentle solder ends and fierce heat begins. The 400 A arc, the gear, the common procedure and the strict safety rules underpin both welding experiments.",
      recap: [
        "Arc welding fuses Mild Steel (MS) flat pieces using a welding transformer set at 400 amp A.C.",
        "The kit: electrode holder, face shield, chipping hammer, wire brush, tong, hand gloves, try square, steel foot rule, hand hacksaw, bench vice and file.",
        "Common procedure: cut the pieces to size, mark with chalk where to weld, run the arc from left to right, then remove the flux and chips with a chipping hammer and wire brush.",
        "Safety is non-negotiable: lab coat, safety goggles, shoes; no bangles/rings/chains/tie or loose clothes; don't stand on the operator's left; don't lean on the machines.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Solder melts at a few hundred degrees. Welding **melts the steel itself**, fusing two pieces into one. The heat comes from an electric **arc** — and it is powerful enough to demand real protection.",
            },
            {
              kind: "teach",
              body: "The source: a **welding transformer set at 400 amp A.C.** The material both experiments join is **Mild Steel (MS) flat**.",
            },
            {
              kind: "teach",
              body: "The gear: an **electrode holder** (grips the welding rod), a **face shield** (protects eyes from the arc), a **chipping hammer** and **wire brush** (clean off the flux/slag afterwards), plus **tong, hand gloves, try square, steel foot rule, hand hacksaw, bench vice and file**.",
            },
            {
              kind: "teach",
              body: "The common procedure both joints share: **cut the pieces to size → mark with chalk where to weld → run the arc from left to right → remove the flux and chips with the chipping hammer and wire brush.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The welding transformer for these experiments is set to…",
              options: ["40 amp D.C.", "400 amp A.C.", "15–25 watt", "230 volt only"],
              answer: 1,
              praise: "400 amp A.C. — the heavy current the arc needs.",
            },
            {
              kind: "check",
              prompt: "After welding, the flux and chips (slag) are removed with…",
              options: [
                "a desoldering pump",
                "a chipping hammer and wire brush",
                "a spring divider",
                "a damp sponge",
              ],
              answer: 1,
              praise: "Chipping hammer and wire brush — knock off and brush away the slag.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: what is the face shield's job during arc welding?",
              options: [
                "To hold the electrode",
                "To protect the eyes and face from the intense arc",
                "To chip off the slag",
                "To measure the joint",
              ],
              answer: 1,
              praise: "It shields eyes and face from the blinding, burning arc.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Wear loose clothes and rings while welding for comfort.' Why is this dangerous?",
              options: [
                "It isn't — comfort matters most",
                "The manual forbids bangles, rings, chains, ties and loose clothes near the machines — they catch, conduct or catch fire",
                "Rings improve the weld",
                "Loose clothes keep you cool safely",
              ],
              answer: 1,
              praise: "Right — no jewellery, no loose clothing; the safety list is strict for good reason.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Carry the full safety code, straight from the manual: **wear shoes, a white lab coat and safety goggles; no bangles, bracelets, rings, chains or neck tie; no loose clothes near machines; don't touch anything unknown; don't let anyone stand on the operator's left side; don't lean on the machines.**\n\nThe leap from soldering to welding isn't just more heat — it's a whole discipline of protection. Respect it before you strike an arc.",
            },
            {
              kind: "check",
              prompt: "Which is one of the manual's arc-welding safety rules?",
              options: [
                "Stand on the operator's left side",
                "Do not let anybody stand on the left side of the operator",
                "Lean on the machine for a steady hand",
                "Skip goggles if you have a face shield",
              ],
              answer: 1,
              praise: "No one on the operator's left — one of the strict welding-bay rules.",
            },
          ],
        },
      ],
    },

    // ── Butt joint ───────────────────────────────────────────────────
    {
      id: "mec-butt-joint",
      title: "The butt joint",
      unit: 3,
      weight: "medium",
      deps: ["mec-arc-basics"],
      whyItMatters:
        "Experiment 7 — the simplest weld: two flats meeting edge to edge in the same plane, welded along the seam.",
      recap: [
        "Cut two Mild Steel flat pieces to the required dimension.",
        "Place one MS flat on the table and place the second parallel with it, with the edges of both pieces in touch with each other.",
        "Start the arc welding set and weld the seam from left to right.",
        "Afterwards, remove the flux and chips with the chipping hammer and wire brush — a butt joint is two edges fused in one flat plane.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The **butt joint** is the plainest weld: two flat pieces laid **end to end in the same flat plane**, their edges touching, welded along the seam where they meet.",
            },
            {
              kind: "teach",
              body: "**Set it up.** Cut two **MS flat** pieces to size. **Place one flat on the table** and place the **second parallel with it**, with the **edges of both pieces in touch with each other**.",
            },
            {
              kind: "teach",
              body: "**Weld it.** **Start the arc welding set** and run the bead **from left to right** along the touching edges. Then **remove the flux and chips** with the chipping hammer and wire brush.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "In a butt joint, the two MS flat pieces are arranged so that…",
              options: [
                "one stands vertically on the other",
                "their edges touch, lying in the same flat plane",
                "they overlap face to face",
                "they form a right angle",
              ],
              answer: 1,
              praise: "Edge to edge in one plane — the defining shape of a butt joint.",
            },
            {
              kind: "check",
              prompt: "The weld bead is run in which direction?",
              options: ["Right to left", "Left to right", "Top to bottom", "In a circle"],
              answer: 1,
              praise: "Left to right — the manual's standard direction.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: before welding, how close should the two edges be?",
              options: [
                "A few centimetres apart",
                "In touch with each other",
                "Overlapping by half",
                "It doesn't matter",
              ],
              answer: 1,
              praise: "In contact — the arc fuses the edges where they touch.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A butt joint is made by standing one plate upright on another.' What's wrong?",
              options: [
                "Nothing, that's a butt joint",
                "That describes a T-joint; a butt joint keeps both plates flat and edge-to-edge",
                "A butt joint overlaps the plates",
                "A butt joint needs no welding",
              ],
              answer: 1,
              praise: "Right — upright-on-flat is the T-joint next; the butt joint stays flat.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The butt joint is your welding baseline: two edges, one plane, one seam. Everything else is a variation on where the second plate sits.\n\nRaise that second plate to stand **upright** on the first, and the same procedure makes a **T-joint** — the next circle.",
            },
            {
              kind: "check",
              prompt: "The butt joint differs from the T-joint mainly in…",
              options: [
                "the welding current used",
                "how the two pieces are positioned — flat edge-to-edge vs one standing on the other",
                "whether flux is removed",
                "the direction of welding",
              ],
              answer: 1,
              praise: "Position is the difference — same arc, same procedure, different geometry.",
            },
          ],
        },
      ],
    },

    // ── T-joint ──────────────────────────────────────────────────────
    {
      id: "mec-tee-joint",
      title: "The T-joint",
      unit: 3,
      weight: "light",
      deps: ["mec-butt-joint"],
      whyItMatters:
        "Experiment 8 — one plate standing perpendicular on another, welded along both sides of the join. The same arc skill on a new geometry.",
      recap: [
        "Cut the MS flat pieces to size and mark with chalk where the weld goes.",
        "Place the job on the table with one piece standing on the other to form a 'T', and start arc welding from left to right.",
        "Afterwards remove the flux with the chipping hammer and wire brush, and remove any unwanted material with a chisel or chipping hammer.",
        "A T-joint fuses one plate perpendicular to another — the same procedure as the butt joint on an upright geometry.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "Stand one plate **upright on the middle of another** and you get the shape of a letter **T** — the **T-joint**.",
            },
            {
              kind: "teach",
              body: "**Set it up.** Cut the MS flat pieces and **mark with chalk** where the weld goes. **Place the job on the table** in the T shape.",
            },
            {
              kind: "teach",
              body: "**Weld & clean.** **Start arc welding from left to right** along the join. Afterwards **remove the flux** with the chipping hammer and wire brush, and **remove any unwanted material with a chisel or chipping hammer.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A T-joint is formed when the two pieces are arranged so that…",
              options: [
                "they lie flat, edge to edge",
                "one stands perpendicular on the other, like the letter T",
                "they overlap face to face",
                "they are welded in a circle",
              ],
              answer: 1,
              praise: "One upright on the other — the T shape names the joint.",
            },
            {
              kind: "check",
              prompt: "Besides the wire brush and chipping hammer, what removes unwanted material after a T-joint weld?",
              options: ["A chisel", "A soldering iron", "A spring divider", "A desoldering pump"],
              answer: 0,
              praise: "A chisel (or the chipping hammer) clears the unwanted material.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: what is marked with chalk before welding the T-joint?",
              options: [
                "The operator's name",
                "The point/line where the welding has to be done",
                "The current setting",
                "The cooling time",
              ],
              answer: 1,
              praise: "Chalk marks where the weld goes — same as the butt joint.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The T-joint needs a completely different welding procedure from the butt joint.' What's wrong?",
              options: [
                "Nothing, it's a new procedure",
                "It uses the SAME arc procedure — cut, chalk-mark, weld left to right, clean the slag — only the geometry differs",
                "The T-joint uses soldering, not welding",
                "The T-joint needs no cleaning",
              ],
              answer: 1,
              praise: "Right — same procedure, different geometry; that's the whole point.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Zoom out on the whole unit. **Soldering** joins electronics with gentle heat; **welding** fuses steel with the fierce arc. Within welding, the **butt joint** (flat, edge-to-edge) and the **T-joint** (upright, perpendicular) share one procedure and differ only in how the plates sit.\n\nOne skill — controlled heat to make metal hold to metal — scaled from a PCB pad to a steel frame.",
            },
            {
              kind: "check",
              prompt: "Across this whole unit, the single idea shared by soldering and welding is…",
              options: [
                "using a 400 A transformer",
                "applying controlled heat to make metal join to metal",
                "removing slag with a wire brush",
                "cutting with a hacksaw",
              ],
              answer: 1,
              praise: "Controlled heat to join metal — the thread from PCB pad to welded frame.",
            },
          ],
        },
      ],
    },

    // ── Review ───────────────────────────────────────────────────────
    {
      id: "mec-u3-review",
      title: "Unit 3 quick review",
      unit: 3,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-soldering", "mec-solder-faults", "mec-arc-basics", "mec-butt-joint"],
        count: 5,
      },
      deps: ["mec-tee-joint"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
