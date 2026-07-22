// MECO3D — Workshop Practice (Mechanical Engineering lab course).
// Hand-authored by Kube from the uploaded Workshop Practice lab manual
// (12 experiments), one concept per four-quarter circle per
// KUBE_LESSON_DEPTH.md. Sections mirror the manual's own grouping:
//   A: Switches, Fuses & Wiring   (Exp 1, 2, 6)   — BUILT
//   B: Sheet Metal Work           (Exp 3, 4)      — pending
//   C: Joining: Solder & Weld     (Exp 5, 7, 8)   — pending
//   D: Bench Fitting              (Exp 9, 10)     — pending
//   E: Computer Peripherals       (Exp 11)        — pending
//   F: Interfacing                (Exp 12)        — pending
import { buildCourseBundle } from "./bundle";
import type { ExamQuestion, SyllabusInfo } from "./types";
import { sectionU1 } from "./meco3d-unit1";

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
];

export const meco3d = buildCourseBundle(
  {
    id: "meco3d",
    code: "MECO3D",
    title: "Workshop Practice",
    sections: [sectionU1],
  },
  examBank
);
