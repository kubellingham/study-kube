// MECO3D — Workshop Practice (Mechanical Engineering lab course).
// Hand-authored by Kube from the uploaded Workshop Practice lab manual
// (12 experiments), one concept per four-quarter circle per
// KUBE_LESSON_DEPTH.md. Sections mirror the manual's own grouping:
//   A: Switches, Fuses & Wiring   (Exp 1, 2, 6)   — BUILT
//   B: Sheet Metal Work           (Exp 3, 4)      — BUILT
//   C: Joining: Solder & Weld     (Exp 5, 7, 8)   — BUILT
//   D: Bench Fitting              (Exp 9, 10)     — BUILT
//   E: Computer Peripherals       (Exp 11)        — BUILT
//   F: Interfacing                (Exp 12)        — BUILT
import { buildCourseBundle } from "./bundle";
import type { ExamQuestion, SyllabusInfo } from "./types";
import { sectionU1 } from "./meco3d-unit1";
import { sectionU2 } from "./meco3d-unit2";
import { sectionU3 } from "./meco3d-unit3";
import { sectionU4 } from "./meco3d-unit4";
import { sectionU5 } from "./meco3d-unit5";
import { sectionU6 } from "./meco3d-unit6";

export const meco3dSyllabus: SyllabusInfo = {
  units: [
    { unit: 1, title: "Switches, Fuses & Wiring" },
    { unit: 2, title: "Sheet Metal Work" },
    { unit: 3, title: "Joining: Soldering & Welding" },
    { unit: 4, title: "Bench Fitting" },
    { unit: 5, title: "Computer Peripherals" },
    { unit: 6, title: "Interfacing: Scanner, Monitor & Motherboard" },
  ],
  cos: [
    { id: "CO1", text: "Identify switches, fuses, relays and protective devices, and observe electrical safety." },
    { id: "CO2", text: "Lay out single-phase wiring circuits such as godown wiring and a distribution board." },
    { id: "CO3", text: "Perform sheet-metal operations — marking, cutting, forming, soldering — to a given drawing." },
    { id: "CO4", text: "Make sound joints by soldering, desoldering and electric arc welding." },
    { id: "CO5", text: "Produce a fitting job to size by measuring, marking, cutting and filing." },
    { id: "CO6", text: "Understand computer peripherals and interfacing of scanner, monitor and motherboard." },
  ],
};

const examBank: ExamQuestion[] = [
  // ---- Unit 1: Switches, Fuses & Wiring (CO1/CO2) ----
  {
    id: "mec-u1q1", topicId: "mec-poles-throws", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "On a switch, the number of POLES defines…",
    options: [
      "how many separate circuits it can control",
      "how many positions each contact can reach",
      "how much current it can safely carry",
      "how many times it may be switched",
    ], answer: 0,
    hint: "One pole influences one circuit.",
    explanation: "Poles count the independent circuits a switch controls; throws count the positions each pole can reach.",
  },
  {
    id: "mec-u1q2", topicId: "mec-poles-throws", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "A switch described as 'double throw' gives each pole…",
    options: [
      "two independent circuits to control",
      "a choice between two connection terminals",
      "twice its rated current",
      "a single fixed on/off position",
    ], answer: 1,
    hint: "Throw = position, not circuit.",
    explanation: "Double throw means each pole can be connected to one of two terminals — a choice of destination.",
  },
  {
    id: "mec-u1q3", topicId: "mec-spst", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "The SPST switch is also known in the manual as the…",
    options: ["Two Way Switch", "Change-over Switch", "One Way Switch", "Selector Switch"], answer: 2,
    hint: "It only opens or closes one path.",
    explanation: "SPST — a plain ON/OFF switch — is called the One Way Switch; press to connect the plates, release to break.",
  },
  {
    id: "mec-u1q4", topicId: "mec-spdt", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "An SPDT switch has three terminals arranged as…",
    options: [
      "three commons wired in parallel",
      "one common and two that vie for connection to it",
      "two commons and one earth",
      "three independent on/off contacts",
    ], answer: 1,
    hint: "Only one common; the other two compete.",
    explanation: "SPDT has one common pin and two pins that vie for the common — a selector between two destinations.",
  },
  {
    id: "mec-u1q5", topicId: "mec-dpdt-dpst", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "A DPST switch is used mainly where you must…",
    options: [
      "select between two supply sources",
      "break both the line and the ground at the same time",
      "melt on excessive current",
      "route one circuit to one of two lamps",
    ], answer: 1,
    hint: "Two poles, single throw, one lever.",
    explanation: "DPST is two SPST switches in one package, breaking both line and ground together with a single lever.",
  },
  {
    id: "mec-u1q6", topicId: "mec-godown", unit: 1, co: "CO2", level: "L2", source: "generated",
    prompt: "In godown wiring, throwing the next SPDT switch causes the…",
    options: [
      "previous lamp to stay on while the next also lights",
      "next lamp to light while the previous lamp goes off",
      "whole circuit to switch off at the main",
      "neutral wire to disconnect from the lamps",
    ], answer: 1,
    hint: "Only one lamp is ever lit.",
    explanation: "The selector re-routes the single live feed forward, so the next lamp lights and the previous one loses supply — a linear sequence.",
  },
  {
    id: "mec-u1q7", topicId: "mec-godown", unit: 1, co: "CO2", level: "L2", source: "generated",
    prompt: "In the godown-wiring circuit, the Neutral wire from the MCB is connected…",
    options: [
      "to the first SPST terminal",
      "to the earthing terminal of each switch",
      "directly to all three lamps",
      "to the common of the second SPDT",
    ], answer: 2,
    hint: "Only the live wire needs switching.",
    explanation: "Neutral runs straight to all three lamps; only the Line (phase) wire is routed through the SPST and SPDT switches.",
  },
  {
    id: "mec-u1q8", topicId: "mec-fuse", unit: 1, co: "CO1", level: "L1", source: "generated",
    prompt: "A fuse protects a circuit because its metal element…",
    options: [
      "stores excess current until it is safe",
      "melts and breaks the circuit when current exceeds a set value",
      "cools the conductors as current rises",
      "increases resistance to slow the current",
    ], answer: 1,
    hint: "It sacrifices itself.",
    explanation: "A fuse is a conductor that melts easily, breaking the connection when current exceeds a predetermined value.",
  },
  {
    id: "mec-u1q9", topicId: "mec-fuse", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "Which statement about a cartridge fuse is correct?",
    options: [
      "Its wire is sealed in a glass tube, so a blown one is replaced whole",
      "Its carrier is removed and fitted with fresh wire when it blows",
      "It resets itself once the fault clears",
      "It has a separate base and a rewireable cutout",
    ], answer: 0,
    hint: "Sealed means not rewireable.",
    explanation: "The cartridge fuse seals its wire in a glass tube and cannot be rewired — it is replaced by a new one; the Kit-Kat fuse is the rewireable type.",
  },
  {
    id: "mec-u1q10", topicId: "mec-relay", unit: 1, co: "CO1", level: "L2", source: "generated",
    prompt: "A relay allows a small current to control a large one because its heart is…",
    options: [
      "a fuse wire that melts on overload",
      "an electromagnet coil that becomes a temporary magnet when energised",
      "a sealed glass cartridge",
      "a common terminal shared by two throws",
    ], answer: 1,
    hint: "A coil that magnetises only while current flows.",
    explanation: "The relay's electromagnet — a coil that becomes a temporary magnet — pulls its contacts, so a small coil current switches a much larger load current.",
  },
  {
    id: "mec-u1q11", topicId: "mec-db", unit: 1, co: "CO2", level: "L1", source: "generated",
    prompt: "On a distribution board, the ELCB is there to…",
    options: [
      "split the neutral among sub-circuits",
      "trip when current leaks to earth",
      "melt on a short circuit",
      "step the voltage down",
    ], answer: 1,
    hint: "Its name says earth leakage.",
    explanation: "The Earth Leakage Circuit Breaker trips on current leaking to earth — a guard the plain fuse cannot provide.",
  },
  {
    id: "mec-u1q12", topicId: "mec-db", unit: 1, co: "CO2", level: "L2", source: "generated",
    prompt: "After wiring a distribution board, the output is verified using…",
    options: ["a bus bar", "a series board (test lamp)", "a spare MCB", "the neutral link"], answer: 1,
    hint: "A safe test before real load.",
    explanation: "The procedure checks the board's output with a series board (test lamp) after switching on the main switch, ELCB and MCB.",
  },
  // ---- Unit 2: Sheet Metal Work (CO3) ----
  {
    id: "mec-u2q1", topicId: "mec-sm-operations", unit: 2, co: "CO3", level: "L1", source: "generated",
    prompt: "Removing a wedge of metal from a corner so the sides can fold up is called…",
    options: ["filing", "notching", "punching", "soldering"], answer: 1,
    hint: "It clears the corner for a clean bend.",
    explanation: "Notching cuts away the corner metal so the sheet's sides can be folded up without overlapping.",
  },
  {
    id: "mec-u2q2", topicId: "mec-sm-tools", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "A mallet is preferred over a steel hammer for bending sheet metal because it…",
    options: [
      "is heavier and hits harder",
      "has a soft face that bends the sheet without denting it",
      "is magnetic and grips the sheet",
      "cuts the sheet as it strikes",
    ], answer: 1,
    hint: "It's about the surface finish of the sheet.",
    explanation: "The mallet's soft face forms the metal without leaving the dents a steel hammer would.",
  },
  {
    id: "mec-u2q3", topicId: "mec-swg", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "Comparing the two jobs' sheets, which statement is correct?",
    options: [
      "22 SWG (book rack) is thicker than 28 SWG (soap case)",
      "28 SWG (soap case) is thicker than 22 SWG (book rack)",
      "Both gauges are exactly the same thickness",
      "SWG describes the sheet's width, not its thickness",
    ], answer: 0,
    hint: "Lower number, thicker sheet.",
    explanation: "A lower SWG number means a thicker sheet, so the book rack's 22 SWG is thicker than the soap case's 28 SWG.",
  },
  {
    id: "mec-u2q4", topicId: "mec-soap-case", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "In making the soap case, the corners are cut and the sides bent up before which final operation?",
    options: ["Marking the base", "Soldering the four corners", "Cutting the 150 × 120 blank", "Choosing the SWG"],
    answer: 1,
    hint: "The last step joins the formed tray.",
    explanation: "After notching and hand-forming, the last operation is soldering the four corners into a tray.",
  },
  {
    id: "mec-u2q5", topicId: "mec-book-rack", unit: 2, co: "CO3", level: "L2", source: "generated",
    prompt: "The book rack's central opening is cut out by…",
    options: [
      "soldering along its outline",
      "dot-punching the lines, then cutting the punched area with a chisel and hammer",
      "bending it at 90 degrees",
      "filing it away with a half round file",
    ], answer: 1,
    hint: "The punched dots guide the cut.",
    explanation: "The opening is dot-punched along its lines, then chiselled out — the punch marks steer the chisel.",
  },
  // ---- Unit 3: Joining — Soldering & Welding (CO4) ----
  {
    id: "mec-u3q1", topicId: "mec-soldering", unit: 3, co: "CO4", level: "L1", source: "generated",
    prompt: "'Tinning' a soldering iron refers to…",
    options: [
      "cooling the tip in water",
      "coating the tip with a small amount of solder",
      "filing the tip to a sharp point",
      "wrapping the tip in tin foil",
    ], answer: 1,
    hint: "Done immediately on a new tip.",
    explanation: "Tinning means coating the iron's tip with a little solder so it transfers heat and solder well.",
  },
  {
    id: "mec-u3q2", topicId: "mec-solder-faults", unit: 3, co: "CO4", level: "L2", source: "generated",
    prompt: "A grainy, crystalline-looking solder joint is usually caused by…",
    options: [
      "overheating that burned off the flux",
      "moving the parts before the joint cooled, or heating it inadequately",
      "using parts that were too clean",
      "applying too much flux",
    ], answer: 1,
    hint: "It's the classic 'dry joint'.",
    explanation: "A dry joint is grainy because it was disturbed while setting or never reached full soldering heat.",
  },
  {
    id: "mec-u3q3", topicId: "mec-arc-basics", unit: 3, co: "CO4", level: "L1", source: "generated",
    prompt: "The welding transformer for these arc-welding experiments is set at…",
    options: ["15–25 watt", "400 amp A.C.", "40 amp D.C.", "230 volt fixed"], answer: 1,
    hint: "Heavy current for melting steel.",
    explanation: "Arc welding here uses a welding transformer set at 400 amp A.C. to fuse mild-steel flats.",
  },
  {
    id: "mec-u3q4", topicId: "mec-butt-joint", unit: 3, co: "CO4", level: "L2", source: "generated",
    prompt: "A butt joint is made by arranging the two MS flats so that they…",
    options: [
      "stand one upright on the other like a T",
      "lie flat in the same plane with their edges in contact",
      "overlap face to face",
      "meet at a 45-degree bevel",
    ], answer: 1,
    hint: "Edge to edge, one plane.",
    explanation: "In a butt joint both plates lie flat with edges touching, welded along the seam where they meet.",
  },
  {
    id: "mec-u3q5", topicId: "mec-tee-joint", unit: 3, co: "CO4", level: "L1", source: "generated",
    prompt: "A T-joint is formed when the two pieces are positioned so that one…",
    options: [
      "lies flat, edge to edge with the other",
      "stands perpendicular on the other, forming a T",
      "overlaps the other by half its length",
      "is welded in a circular pattern",
    ], answer: 1,
    hint: "The shape names the joint.",
    explanation: "A T-joint stands one plate upright on another, welded along the join — the same arc procedure as the butt joint.",
  },
  // ---- Unit 4: Bench Fitting (CO5) ----
  {
    id: "mec-u4q1", topicId: "mec-fitting-idea", unit: 4, co: "CO5", level: "L1", source: "generated",
    prompt: "Bench fitting produces a part to an exact size mainly by…",
    options: [
      "casting it in a mould",
      "hand work — measuring, cutting and filing to size",
      "arc welding two pieces",
      "3D printing",
    ], answer: 1,
    hint: "Files and measurement at the bench.",
    explanation: "Fitting brings mild steel to exact size and shape by hand: measure, mark, cut, file and check.",
  },
  {
    id: "mec-u4q2", topicId: "mec-fitting-tools", unit: 4, co: "CO5", level: "L2", source: "generated",
    prompt: "Which tool is used to check that two adjacent sides meet at a true right angle?",
    options: ["Outside caliper", "Try-square", "Dot punch", "Hand hacksaw"], answer: 1,
    hint: "Its name says the angle it checks.",
    explanation: "The try-square verifies the 90° between adjacent sides as the piece is filed square.",
  },
  {
    id: "mec-u4q3", topicId: "mec-reference-side", unit: 4, co: "CO5", level: "L2", source: "generated",
    prompt: "In the reference-side method, why are the first two true sides made before anything else?",
    options: [
      "They are the thickest sides",
      "They become the datums that every other side is measured and squared from",
      "They are left rough for gripping",
      "They are the sides that get soldered",
    ], answer: 1,
    hint: "Everything is measured from them.",
    explanation: "The two reference sides are trusted datums; measuring the rest from them keeps the part accurate.",
  },
  {
    id: "mec-u4q4", topicId: "mec-reference-side", unit: 4, co: "CO5", level: "L2", source: "generated",
    prompt: "The finished tail-end (male) fitting part measures…",
    options: ["150 × 120 × 28 mm", "48 × 48 × 5 mm", "70 × 70 mm", "200 × 250 mm"], answer: 1,
    hint: "A small squared block of mild steel.",
    explanation: "The male part is worked to a 48 × 48 × 5 mm square from its reference sides.",
  },
  {
    id: "mec-u4q5", topicId: "mec-male-female", unit: 4, co: "CO5", level: "L2", source: "generated",
    prompt: "The groove-end (female) part differs from the male part because it has…",
    options: [
      "a slot/groove cut into it for the male part to seat into",
      "a different metal entirely",
      "no need for accurate reference sides",
      "soldered corners",
    ], answer: 0,
    hint: "'Female' receives the 'male'.",
    explanation: "The female part carries a groove that the male tail seats into — a made-to-fit pair.",
  },
  // ---- Unit 5: Computer Peripherals (CO6) ----
  {
    id: "mec-u5q1", topicId: "mec-keyboard", unit: 5, co: "CO6", level: "L1", source: "generated",
    prompt: "The grid of circuits beneath a keyboard's keys is the…",
    options: ["character map", "key matrix", "chipset", "fuser unit"], answer: 1,
    hint: "The processor scans it for a closed circuit.",
    explanation: "The key matrix is the grid of circuits under the keys; pressing a key closes one and the processor locates it.",
  },
  {
    id: "mec-u5q2", topicId: "mec-kb-switches", unit: 5, co: "CO6", level: "L2", source: "generated",
    prompt: "Capacitive keyboards have no 'bounce' because…",
    options: [
      "they lack a processor to detect it",
      "their two surfaces never actually touch, so there is no contact vibration",
      "they filter every keystroke three times",
      "they use a rubber dome under each key",
    ], answer: 1,
    hint: "Bounce comes from physical contact.",
    explanation: "Capacitive switches sense a plate moving closer rather than touching, so there is no contact bounce.",
  },
  {
    id: "mec-u5q3", topicId: "mec-kb-trouble", unit: 5, co: "CO6", level: "L2", source: "generated",
    prompt: "The quickest hardware check for a suspect keyboard is to…",
    options: [
      "reinstall the operating system",
      "swap it with a known-good keyboard",
      "replace the system board",
      "re-solder the key matrix",
    ], answer: 1,
    hint: "It is external, detachable and cheap.",
    explanation: "Swapping in a known-good keyboard isolates whether the fault is the keyboard or the system board.",
  },
  {
    id: "mec-u5q4", topicId: "mec-mouse", unit: 5, co: "CO6", level: "L2", source: "generated",
    prompt: "A trackball mouse whose cursor keeps freezing and jumping most likely has…",
    options: [
      "a blown +5V fuse",
      "dirt or lint on the trackball hindering its movement",
      "the wrong character map",
      "a failed corona wire",
    ], answer: 1,
    hint: "The trackball picks something up from the desk.",
    explanation: "Dirt/lint on the trackball hinders its motion; removing and cleaning it fixes the freezing cursor.",
  },
  {
    id: "mec-u5q5", topicId: "mec-printer", unit: 5, co: "CO6", level: "L2", source: "generated",
    prompt: "In a laser printer, positively-charged toner sticks to the drum where the laser has…",
    options: [
      "left the charge positive (the white areas)",
      "erased the charge to negative (the black areas)",
      "heated the surface",
      "sprayed liquid ink",
    ], answer: 1,
    hint: "Opposite charges attract.",
    explanation: "The laser flips the drum's charge to negative on the black areas; the positive toner is drawn to them.",
  },
  {
    id: "mec-u5q6", topicId: "mec-printer", unit: 5, co: "CO6", level: "L1", source: "generated",
    prompt: "In a laser printer, what permanently bonds the toner into the paper?",
    options: ["The corona wire", "The fuser unit's hot rollers", "The photoreceptor drum", "The ink roller"], answer: 1,
    hint: "Heat and pressure at the very end.",
    explanation: "The fuser unit's hot rollers press and heat the toner, bonding it permanently into the paper fibres.",
  },
  // ---- Unit 6: Interfacing (CO6) ----
  {
    id: "mec-u6q1", topicId: "mec-scanner", unit: 6, co: "CO6", level: "L1", source: "generated",
    prompt: "A scanner is an input device whose basic job is to…",
    options: [
      "print a hard copy of a document",
      "optically read an image and convert it into a digital signal",
      "display the computer's video output",
      "store the BIOS settings",
    ], answer: 1,
    hint: "It digitises a physical image.",
    explanation: "A scanner optically reads an image and converts it into a digital signal — a printed picture becomes a digital file.",
  },
  {
    id: "mec-u6q2", topicId: "mec-scanner-comm", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "How does parallel communication compare with serial?",
    options: [
      "It is slower, sending one bit at a time",
      "It is faster, sending eight bits at a time over separate wires",
      "It is wireless, sending data through the air",
      "It is identical, just a different connector",
    ], answer: 1,
    hint: "Eight wires, eight bits at once.",
    explanation: "Parallel moves eight bits at a time over eight wires, making it faster than one-bit-at-a-time serial.",
  },
  {
    id: "mec-u6q3", topicId: "mec-monitor", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Which statement about monitor display technologies is correct?",
    options: [
      "CRT is slim and energy-efficient; LCD is bulky",
      "CRT uses electron guns and is bulky; LCD uses polarized pixels and uses less energy",
      "Both CRT and LCD use electron guns",
      "LCD cannot display colour images",
    ], answer: 1,
    hint: "One is a vacuum tube, one is liquid crystal.",
    explanation: "CRTs bombard a screen with electrons (bulky, power-hungry); LCDs polarize liquid-crystal pixels (slim, efficient).",
  },
  {
    id: "mec-u6q4", topicId: "mec-monitor", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Which monitor port carries an analog signal?",
    options: ["DVI", "VGA", "HDMI", "DisplayPort"], answer: 1,
    hint: "The oldest of the four.",
    explanation: "VGA carries an analog signal; DVI, HDMI and DisplayPort are digital.",
  },
  {
    id: "mec-u6q5", topicId: "mec-motherboard", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "On a motherboard, the Northbridge chip's role is to…",
    options: [
      "handle slow input/output devices",
      "interface the CPU with main memory and other fast components",
      "store the BIOS settings when powered off",
      "supply power to the drives",
    ], answer: 1,
    hint: "It sits closest to the CPU and memory.",
    explanation: "The Northbridge links the CPU to main memory and fast components; the Southbridge handles I/O via the Northbridge.",
  },
  {
    id: "mec-u6q6", topicId: "mec-mb-slots", unit: 6, co: "CO6", level: "L2", source: "generated",
    prompt: "Which expansion slot is the latest and fastest, using a full-duplex serial bus?",
    options: ["ISA", "AGP", "PCI Express (PCIe)", "PCI"], answer: 2,
    hint: "The newest name on the board.",
    explanation: "PCIe is the latest, fastest expansion bus; ISA is the oldest 16-bit slot and PCI a 64-bit bus.",
  },
];

export const meco3d = buildCourseBundle(
  {
    id: "meco3d",
    code: "MECO3D",
    title: "Workshop Practice",
    sections: [sectionU1, sectionU2, sectionU3, sectionU4, sectionU5, sectionU6],
  },
  examBank
);
