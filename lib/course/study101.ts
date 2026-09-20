// STUDY — "How to Actually Study". Kube's public taster course: a short,
// universal mini on the science of learning, authored to be FELT in about a
// minute. Unlike the other built-ins (gated to specific accounts), this one is
// visible to everyone — it's the sample a signed-out visitor climbs at /try,
// and it stays on every account's shelf afterwards as a free bonus subject.
//
// The medium is the message: the lesson teaches spacing, retrieval and
// spaced repetition — the very things Kube's ladder and Practice deck do for
// you. Keep it tight, warm, and true.
import { buildCourseBundle } from "./bundle";
import type { Section, ExamQuestion } from "./types";

// The forgetting curve: memory decays fast after one sitting (steep drop),
// but each review resets it higher and the next drop is gentler.
const SVG_FORGETTING = `<svg viewBox="0 0 340 170">
  <line x1="34" y1="18" x2="34" y2="140" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
  <line x1="34" y1="140" x2="322" y2="140" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
  <text x="10" y="30" font-size="9" fill="currentColor" opacity="0.7">100%</text>
  <text x="20" y="146" font-size="9" fill="currentColor" opacity="0.7">0</text>
  <text x="150" y="162" font-size="9.5" fill="currentColor" opacity="0.75">time since you studied →</text>
  <path d="M34 30 C 70 118, 120 132, 200 136 C 250 138, 290 139, 322 139" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4" opacity="0.55"/>
  <text x="120" y="126" font-size="9.5" fill="currentColor" opacity="0.7">cram once, forget fast</text>
  <path d="M34 30 C 55 70, 78 80, 96 82" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <line x1="96" y1="82" x2="96" y2="40" stroke="currentColor" stroke-width="2.4"/>
  <circle cx="96" cy="40" r="3.2" fill="currentColor"/>
  <path d="M96 40 C 116 66, 140 72, 158 74" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <line x1="158" y1="74" x2="158" y2="40" stroke="currentColor" stroke-width="2.4"/>
  <circle cx="158" cy="40" r="3.2" fill="currentColor"/>
  <path d="M158 40 C 190 60, 240 64, 300 66" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <text x="150" y="30" font-size="9.5" fill="currentColor" opacity="0.9">each review lifts it back up — and it fades slower</text>
</svg>`;

const sectionA: Section = {
  id: "sec-learn",
  letter: "A",
  title: "Learning that sticks",
  tagline: "Three habits, backed by decades of research, that quietly double what you keep.",
  unit: 1,
  topics: [
    {
      id: "forgetting-curve",
      title: "Why cramming fails: the forgetting curve",
      unit: 1,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Almost every study mistake traces back to one misunderstanding of memory — see it clearly once and the rest of these habits make obvious sense.",
      recap: [
        "Memory of a single study session decays fast — much of it is gone within a day or two.",
        "Cramming feels effective because the material is fresh in the moment, but that feeling fades with the memory.",
        "Each time you revisit something, you forget it more slowly the next time.",
        "The fix isn't studying more — it's spacing the same effort across days.",
      ],
      flashcards: [
        { front: "What does the forgetting curve describe?", back: "How quickly newly learned information fades from memory over time when it isn't revisited — steeply at first, then more gradually." },
        { front: "Why does cramming feel effective but rarely work?", back: "The material is fresh during the session, so recall feels easy, but a single exposure decays fast — by exam day most of it is gone." },
        { front: "What happens to the forgetting curve each time you review?", back: "Each review lifts your memory back up and flattens the next decline, so the same fact fades more slowly after every revisit." },
      ],
      steps: [
        {
          kind: "teach",
          title: "You forget faster than you think",
          body: "In the 1880s, [[Hermann Ebbinghaus|a psychologist who ran the first memory experiments, on himself]] measured how fast he forgot freshly learned material. The result — the [[forgetting curve|the steep drop-off in memory after a single study session]] — has held up for 140 years.\n\nAfter one sitting, memory drops **steeply**: a large share is gone within a day, and more the next. This isn't a flaw in *your* brain — it's how everyone's memory works by default.",
          svg: SVG_FORGETTING,
        },
        {
          kind: "check",
          prompt: "According to the forgetting curve, what happens to most of what you learn in a single cram session?",
          options: [
            "It stays stable for weeks",
            "It fades quickly — much of it within a day or two",
            "It gets stronger on its own over time",
            "It is lost instantly, all at once",
          ],
          answer: 1,
          praise:
            "Exactly — the drop is steep and early. That's why the exam-eve cram that felt solid last night can feel hollow by morning.",
        },
        {
          kind: "teach",
          title: "Why cramming fools you",
          body: "Cramming works *in the moment*: the material is right there in your mind, so recall feels effortless. Students read this fluency as **\"I know this\"**.\n\nBut fluency in the moment and memory next week are two different things. The cram gives you the first and almost none of the second — which is why so much studying feels productive yet doesn't show up in the grade.",
        },
        {
          kind: "check",
          prompt: "What's the catch with the confident feeling you get right after cramming?",
          options: [
            "It means the material is now in long-term memory",
            "It's a reliable signal you can stop studying",
            "That fluency fades with the memory — feeling you know it now doesn't mean you'll recall it later",
            "It only happens if you studied the wrong way",
          ],
          answer: 2,
          praise:
            "Right — momentary fluency isn't durable memory. Spotting that gap is the whole reason the next two habits exist.",
        },
      ],
    },
    {
      id: "active-recall",
      title: "Active recall: test, don't reread",
      unit: 1,
      weight: "heavy",
      deps: ["forgetting-curve"],
      whyItMatters:
        "Retrieval practice is the single highest-leverage change most students can make — and it's usually the opposite of what they do.",
      recap: [
        "Rereading and highlighting feel productive but build little durable memory.",
        "Active recall — trying to retrieve an answer from memory — is what actually strengthens it.",
        "The struggle to remember is the moment the memory gets stronger, not a sign you're failing.",
        "Flashcards, self-quizzing and closing the book to explain a topic are all active recall.",
      ],
      flashcards: [
        { front: "What is active recall?", back: "Deliberately retrieving information from memory — self-testing — rather than passively re-exposing yourself to it by rereading." },
        { front: "Why is rereading a weak study method?", back: "It creates a feeling of familiarity without forcing retrieval, so it builds little durable memory even though it feels productive." },
        { front: "Why is the 'struggle' to recall a good sign?", back: "The effort of retrieving a memory is exactly what strengthens it — a little difficulty makes the memory more durable (desirable difficulty)." },
      ],
      steps: [
        {
          kind: "teach",
          title: "The most common study trap",
          body: "The default way to study is to **reread** notes and **highlight** the textbook. It feels productive — you're spending time, the page looks marked up — but decades of research find it builds surprisingly little lasting memory.\n\nThe reason: rereading gives your brain the answer. It never has to *retrieve* anything, and retrieval is where memory is built.",
        },
        {
          kind: "check",
          prompt: "Why do rereading and highlighting disappoint, despite feeling productive?",
          options: [
            "They take too little time",
            "They give your brain the answer, so it never practises retrieving it",
            "They only work for maths, not other subjects",
            "They strengthen memory too quickly to last",
          ],
          answer: 1,
          praise:
            "Yes — no retrieval, little gain. Recognising material is not the same as being able to produce it.",
        },
        {
          kind: "teach",
          title: "Make your brain do the work",
          body: "[[Active recall|trying to pull an answer from memory instead of looking it up]] flips this. You close the book and ask: *what were the causes? what's the definition? how does this work?* — then try to answer before checking.\n\nThat little **struggle** to remember is not failure; it's the memory getting stronger. Flashcards, self-quizzing, and explaining a topic out loud from memory are all the same move: retrieve first, confirm second. (It's exactly what Kube's lesson checks and Practice deck have you do.)",
        },
        {
          kind: "check",
          prompt: "You're studying a chapter. Which is active recall?",
          options: [
            "Highlighting the key sentences in three colours",
            "Reading the chapter summary twice",
            "Closing the book and writing down everything you remember, then checking",
            "Copying the notes out neatly",
          ],
          answer: 2,
          praise:
            "That's it — book closed, retrieve, then check. Everything else just re-exposes you to the answer.",
        },
      ],
    },
    {
      id: "spaced-repetition",
      title: "Spaced repetition: review at growing gaps",
      unit: 1,
      weight: "medium",
      deps: ["active-recall"],
      whyItMatters:
        "Combining spacing with recall is the highest-return study method known — and it's the engine behind Kube's Practice deck.",
      recap: [
        "Spacing the same review across days beats massing it into one block (the spacing effect).",
        "Review a fact just as you're about to forget it, and each successful recall lets you wait longer next time.",
        "Growing the gaps — 1 day, 3 days, a week — is spaced repetition.",
        "Spaced repetition = spacing + active recall together, which is why it's so effective.",
      ],
      flashcards: [
        { front: "What is the spacing effect?", back: "The finding that the same amount of study produces far more durable memory when spread across multiple days than when massed into one session." },
        { front: "How do the intervals change in spaced repetition?", back: "They grow: after each successful recall you wait longer before the next review (e.g. 1 day, then 3, then a week), because the memory is now more durable." },
        { front: "Why is spaced repetition so powerful?", back: "It combines the two strongest habits — spacing and active recall — reviewing a fact by retrieval right when you're about to forget it." },
      ],
      steps: [
        {
          kind: "teach",
          title: "Same effort, spread out",
          body: "Take the hours you'd spend cramming and **spread them across days** instead of one block. This is the [[spacing effect|the finding that spread-out study beats massed study for the same total time]], and it's one of the most reliable results in all of learning research.\n\nThe curve from the first lesson tells you why: revisiting a fact resets it higher *and* makes the next fade slower. Massing your reviews into one night wastes that.",
        },
        {
          kind: "check",
          prompt: "You have four hours to prepare. Which is likely to stick best?",
          options: [
            "All four hours the night before",
            "One hour a day across four days",
            "Two hours twice on the same afternoon",
            "It makes no difference how you split it",
          ],
          answer: 1,
          praise:
            "Right — same four hours, but spread out so each session revisits a fading memory. That's the spacing effect at work.",
        },
        {
          kind: "teach",
          title: "Grow the gaps",
          body: "The best time to review something is *just as you're about to forget it*. Recall it successfully and you can wait a little longer next time — so the gaps **grow**: maybe a day, then three, then a week.\n\nThat's [[spaced repetition|reviewing by active recall at gradually increasing intervals]] — spacing and active recall combined. You don't have to schedule it by hand: Kube's Practice deck already spaces your cards this way, surfacing each one right when it's ripe.",
        },
        {
          kind: "check",
          prompt: "In spaced repetition, what happens to the gap before the next review after you recall a card correctly?",
          options: [
            "It stays exactly the same each time",
            "It gets shorter",
            "It grows — you can wait longer before the next review",
            "The card is never shown again",
          ],
          answer: 2,
          praise:
            "Exactly — each success earns a longer gap. That's the whole engine, and it's running under your Practice deck.",
        },
      ],
    },
  ],
};

const examBank: ExamQuestion[] = [
  {
    id: "study-q1",
    topicId: "forgetting-curve",
    unit: 1,
    prompt: "The forgetting curve shows that, after a single study session, memory typically…",
    options: [
      "stays flat for weeks",
      "drops steeply at first, then more gradually",
      "increases slowly on its own",
      "vanishes completely within an hour",
    ],
    answer: 1,
    hint: "Think about how the material feels the morning after a cram.",
    explanation:
      "Memory decays fast right after one exposure and more slowly later — which is why a single cram rarely survives to exam day.",
    source: "generated",
  },
  {
    id: "study-q2",
    topicId: "active-recall",
    unit: 1,
    prompt: "Which activity is an example of active recall?",
    options: [
      "Re-reading the chapter summary",
      "Highlighting key terms",
      "Closing the book and trying to explain the topic from memory",
      "Copying your notes more neatly",
    ],
    answer: 2,
    hint: "Which one forces you to retrieve, not just re-read?",
    explanation:
      "Active recall means retrieving from memory — closing the book and producing the answer — not re-exposing yourself to it.",
    source: "generated",
  },
  {
    id: "study-q3",
    topicId: "spaced-repetition",
    unit: 1,
    prompt: "Spaced repetition schedules reviews so that the interval between them…",
    options: [
      "shrinks after each correct recall",
      "grows after each correct recall",
      "is random",
      "is always exactly 24 hours",
    ],
    answer: 1,
    hint: "Each success means the memory is more durable now.",
    explanation:
      "After a successful recall the memory is stronger, so you can wait longer — the gaps grow (1 day, 3 days, a week…).",
    source: "generated",
  },
];

export const study101 = buildCourseBundle(
  {
    id: "study101",
    code: "STUDY",
    title: "How to Actually Study",
    sections: [sectionA],
  },
  examBank
);
