// INT42D — Internet and Web Technologies. Unit 5: CSS (Section B).
// Authored from the unit's slide deck. The deck's box-model slides are bare
// images; they are redrawn here as diagrams so the nesting is actually taught.
import type { Section, ExamQuestion } from "./types";

// The box model — the deck shows this only as pictures.
const SVG_BOX_MODEL = `<svg viewBox="0 0 340 210">
  <rect x="10" y="10" width="320" height="190" rx="6" fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="20" y="26" font-size="10.5" font-family="monospace" fill="currentColor" opacity="0.85">margin</text>
  <rect x="48" y="42" width="244" height="126" rx="5" fill="none" stroke="currentColor" stroke-width="3"/>
  <text x="58" y="58" font-size="10.5" font-family="monospace" fill="currentColor" opacity="0.85">border</text>
  <rect x="80" y="72" width="180" height="66" rx="4" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="90" y="88" font-size="10.5" font-family="monospace" fill="currentColor" opacity="0.85">padding</text>
  <rect x="112" y="96" width="116" height="34" rx="3" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.5"/>
  <text x="170" y="118" text-anchor="middle" font-size="11.5" font-family="monospace" fill="currentColor">content</text>
  <text x="170" y="192" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.85">outward: content → padding → border → margin</text>
</svg>`;

// Block fills the line and stacks; inline flows within the text.
const SVG_BLOCK_INLINE = `<svg viewBox="0 0 340 168">
  <text x="20" y="18" font-size="11" font-family="monospace" fill="currentColor">block (div)</text>
  <rect x="20" y="26" width="300" height="26" rx="4" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.8"/>
  <rect x="20" y="58" width="300" height="26" rx="4" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.8"/>
  <text x="170" y="44" text-anchor="middle" font-size="10.5" fill="currentColor">fills the width · starts a new line</text>
  <text x="170" y="76" text-anchor="middle" font-size="10.5" fill="currentColor">the next one sits below</text>
  <text x="20" y="112" font-size="11" font-family="monospace" fill="currentColor">inline (span)</text>
  <rect x="20" y="120" width="300" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="30" y="139" font-size="10.5" fill="currentColor">text text </text>
  <rect x="92" y="126" width="74" height="16" rx="3" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.4"/>
  <text x="129" y="138" text-anchor="middle" font-size="9.5" font-family="monospace" fill="currentColor">span</text>
  <text x="174" y="139" font-size="10.5" fill="currentColor">text continues — no break</text>
</svg>`;

export const sectionB: Section = {
  id: "sec-b",
  letter: "B",
  title: "Cascading Style Sheets",
  tagline: "Separating how a page looks from what it says.",
  unit: 5,
  topics: [
    {
      id: "css-why",
      title: "What CSS is, and why it exists",
      unit: 5,
      weight: "medium",
      deps: [],
      whyItMatters:
        "The 'why use CSS?' / HTML-only-vs-CSS comparison is a standard short theory question, and the separation idea underpins everything else in the unit.",
      recap: [
        "CSS (Cascading Style Sheets) controls the PRESENTATION of a page: colours, fonts, layout, spacing, borders, backgrounds.",
        "It separates content (HTML) from presentation (CSS).",
        "Style is defined once and reused, instead of being written inside every tag — less redundancy.",
        "One stylesheet can style many pages, so the design stays consistent and is easy to update.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Two jobs, two languages",
          body: "HTML says **what** is on the page — this is a heading, this is a paragraph. [[CSS|Cascading Style Sheets — the language that controls how HTML elements are presented]] says **how it should look** — this colour, this font, this spacing.\n\nThat split is the whole point. Without CSS a page is plain text and images. With it, presentation lives in one place, separate from the content it decorates.",
        },
        {
          kind: "teach",
          title: "Why the separation earns its keep",
          body: "The deck's comparison is worth holding as a four-line answer:\n\n**HTML only** — style is written inside each tag; hard to maintain; no consistency; limited control over layout.\n**With CSS** — style is defined once and reused; easy to modify; consistent look; precise control.\n\nThe practical version: change one line in one stylesheet and every page updates. Do it the HTML-only way and you are editing hundreds of tags by hand.",
        },
        {
          kind: "check",
          prompt: "What is the main purpose of CSS?",
          options: [
            "To define the structure and content of a page",
            "To control the presentation — how HTML elements look",
            "To store data on the server",
            "To validate form input",
          ],
          answer: 1,
          praise:
            "Right — structure is HTML's job, presentation is CSS's. That one sentence is the whole 'separation of concerns' answer.",
        },
        {
          kind: "check",
          prompt: "Which is a genuine advantage of using CSS over styling inside each tag?",
          options: [
            "Pages load without HTML",
            "Style is defined once and reused, so the site is consistent and easy to update",
            "It removes the need for a browser",
            "It makes JavaScript unnecessary",
          ],
          answer: 1,
          praise:
            "Exactly — define once, reuse everywhere. Maintenance is the argument that actually convinces, not just 'it looks nicer'.",
        },
      ],
    },
    {
      id: "css-syntax",
      title: "The anatomy of a rule",
      unit: 5,
      weight: "heavy",
      deps: ["css-why"],
      whyItMatters:
        "Naming the parts — selector, property, value, declaration, rule — is a guaranteed label-the-diagram or define-the-terms question.",
      recap: [
        "A CSS rule is: selector { property: value; }",
        "Selector — targets the HTML element to style (h1).",
        "Property — what you are changing (color, font-size).",
        "Value — the setting for that property (blue, 24px).",
        "Declaration — one property–value pair (color: blue;). Rule — a selector plus its whole declaration block.",
        "Declarations sit inside { }, each ended with a semicolon.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Five words for one small thing",
          body: "Every piece of CSS has the same shape:\n\nThe vocabulary the exam wants:\n\n**Selector** — *who* is being styled (`h1`).\n**Property** — *what* is being changed (`color`).\n**Value** — *what to* (`blue`).\n**[[declaration|one property–value pair, e.g. color: blue;]]** — one property–value pair together: `color: blue;`\n**Rule** — the selector plus its entire `{ … }` block.\n\nSo the example below is **one rule**, containing **two declarations**.",
          code: "selector {\n   property: value;\n}\n\nh1 {\n   color: blue;\n   font-size: 24px;\n}",
        },
        {
          kind: "check",
          prompt: "In h1 { color: blue; } what is 'color'?",
          options: ["The selector", "The property", "The value", "The declaration"],
          answer: 1,
          praise:
            "Right — color is the property, blue is the value, and the pair together (color: blue;) is the declaration. Precision with these words is free marks.",
        },
        {
          kind: "check",
          prompt: "How many DECLARATIONS are in this rule?",
          code: "p {\n  color: gray;\n  font-family: Arial;\n  text-align: center;\n}",
          options: ["One — it's one rule", "Two", "Three", "Four"],
          answer: 2,
          praise:
            "Exactly — three property–value pairs, so three declarations, all inside a single rule. Counting them is how this question is usually asked.",
        },
      ],
    },
    {
      id: "css-selectors",
      title: "The five selector types",
      unit: 5,
      weight: "heavy",
      deps: ["css-syntax"],
      whyItMatters:
        "A match-the-selector-to-its-symbol table appears in nearly every CSS paper — and the . vs # confusion is the most common lost mark.",
      recap: [
        "Element selector: p { color: red; } — selects ALL <p> tags.",
        "ID selector: #title { color: blue; } — selects the one element with id=\"title\". Symbol: #",
        "Class selector: .note { font-size: 16px; } — selects every element with class=\"note\". Symbol: . (dot)",
        "Universal selector: * { margin: 0; } — selects everything.",
        "Group selector: h1, h2, p { color: green; } — applies one rule to several selectors, separated by commas.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Choosing who gets styled",
          body: "A [[selector|the part of a CSS rule that chooses which HTML elements to style]] decides which elements a rule applies to. Five kinds cover almost everything:\n\n**Element** — `p { }` styles every `<p>` on the page.\n**ID** — `#title { }` styles the single element with `id=\"title\"`. Symbol: **#**\n**Class** — `.note { }` styles every element with `class=\"note\"`. Symbol: **.** (a dot)\n**Universal** — `* { }` styles everything.\n**Group** — `h1, h2, p { }` applies one block to several selectors at once, comma-separated.",
          code: "p        { color: red; }        /* element   */\n#title   { color: blue; }       /* id        */\n.note    { font-size: 16px; }   /* class     */\n*        { margin: 0; }         /* universal */\nh1, h2, p { color: green; }     /* group     */",
        },
        {
          kind: "check",
          prompt: "Which selector styles EVERY element that has class=\"note\"?",
          options: ["#note", ".note", "note", "*note"],
          answer: 1,
          praise:
            "Right — dot for class, hash for id. Say it out loud once: 'dot-class, hash-id' — that's the pair people scramble under pressure.",
        },
        {
          kind: "check",
          prompt: "What does h1, h2, p { color: green; } do?",
          options: [
            "Styles only h1 elements that contain h2 and p",
            "Applies the same style to all h1, h2 and p elements",
            "Creates a new element called h1h2p",
            "Nothing — commas aren't valid in CSS",
          ],
          answer: 1,
          praise:
            "Exactly — the comma means 'and also'. It's the group selector, and it exists purely to save you writing the same block three times.",
        },
      ],
    },
    {
      id: "css-placement",
      title: "Inline, internal & external CSS",
      unit: 5,
      weight: "heavy",
      deps: ["css-syntax"],
      whyItMatters:
        "'Explain the three types of CSS with syntax' is one of the most predictable long-answer questions in this unit.",
      recap: [
        "Inline CSS — written in a tag's style attribute: <p style=\"color: blue;\">. Affects that one element only.",
        "Internal CSS — written inside <style> … </style> in the <head>. Affects that one document.",
        "External CSS — written in a separate .css file and linked in: <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">",
        "External is the recommended approach — one file styles many pages.",
        "The external file contains only rules — no <style> tag inside it.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Three places the style can live",
          body: "Same CSS, three homes — and the difference is **how far its reach goes**.\n\n**Inline** — inside the element's own `style` attribute. Reaches exactly one element.\n**Internal** — a `<style>` block in the page's `<head>`. Reaches one document.\n**External** — a separate `.css` file linked from the page. Reaches every page that links it.",
          code: "<!-- inline: one element -->\n<p style=\"color: blue; font-size: 20px;\">This is inline CSS.</p>\n\n<!-- internal: one document -->\n<head>\n  <style>\n    p { color: gray; }\n  </style>\n</head>",
        },
        {
          kind: "teach",
          title: "Why external is the recommended one",
          body: "The external file (`style.css`) holds **only rules** — no `<style>` tag, no HTML. The page pulls it in with a `<link>` in the `<head>`:\n\nThis is the recommended way, and the reason connects straight back to why CSS exists at all: one file, many pages, one edit to restyle the whole site. Inline CSS is the opposite extreme — it re-couples presentation to content, the very thing CSS was invented to separate.",
          code: "/* style.css — the whole file */\np {\n  color: green;\n  font-size: 22px;\n}\n\n<!-- index.html -->\n<link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n<p>This is external CSS.</p>",
        },
        {
          kind: "check",
          prompt: "Which type of CSS is written directly in an element's style attribute?",
          options: ["External", "Internal", "Inline", "Universal"],
          answer: 2,
          praise:
            "Right — inline sits IN the line of HTML. And because it only reaches that one element, it's the least reusable of the three.",
        },
        {
          kind: "check",
          prompt: "Which tag links an external stylesheet to an HTML page?",
          options: [
            "<style src=\"style.css\">",
            "<link rel=\"stylesheet\" href=\"style.css\">",
            "<css href=\"style.css\">",
            "<script src=\"style.css\">",
          ],
          answer: 1,
          praise:
            "Exactly — <link> in the head, with rel=\"stylesheet\". Note <style> is for rules written in the page itself, which is the distractor here.",
        },
        {
          kind: "check",
          prompt: "Why is external CSS usually recommended?",
          options: [
            "It loads before the HTML",
            "One stylesheet can style many pages, so updates are made in one place",
            "It's the only type that supports classes",
            "It works without a <head> section",
          ],
          answer: 1,
          praise:
            "That's the reasoning that earns the mark — reuse and maintenance, not just 'it's cleaner'.",
        },
      ],
    },
    {
      id: "css-class-id",
      title: "Class vs ID: the contrast",
      unit: 5,
      weight: "heavy",
      deps: ["css-selectors"],
      whyItMatters:
        "The class-vs-ID comparison table is a near-certain question, and 'which would you use here?' tests whether you understand reusability.",
      recap: [
        "Class (.) — for styling MULTIPLE elements the same way; reusable as often as you like.",
        "ID (#) — for one UNIQUE element; each id must appear only once per document.",
        "Use IDs for special sections: header, footer, main containers.",
        "ID has HIGHER specificity (priority) than class.",
        "An element can carry both: <p class=\"highlight\" id=\"intro\"> takes styles from each.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Many, or exactly one",
          body: "Both target elements precisely — the difference is **how many**.\n\nA [[class|a reusable selector (.) for styling any number of elements the same way]] is for a style you want to reuse. Give the same class to a heading and a paragraph and both get it:\n\nAn [[ID|a unique selector (#) for exactly one element per page]] is for one specific element. Each id must be **unique in the document** — you cannot have two elements with the same id.",
          code: "<h2 class=\"note\">Chapter 1</h2>\n<p class=\"note\">This section is important.</p>\n\n.note { background-color: yellow; }   /* both get it */\n\n<h1 id=\"mainTitle\">Welcome to My Website</h1>\n\n#mainTitle { color: blue; text-align: center; }",
        },
        {
          kind: "teach",
          title: "The table, and what happens when both apply",
          body: "The comparison worth knowing cold:\n\n**Purpose** — class styles many; id styles one.\n**Symbol** — class `.`; id `#`.\n**Reusability** — class as often as you like; id once per page.\n**Specificity (priority)** — class lower; **id higher**.\n\nAn element can wear both. When they collide on the same property, the **id wins** — that is what higher specificity means:\n\nHere the text is red (from the class) *and* 22px (from the id) — no conflict, so both apply.",
          code: "<p class=\"highlight\" id=\"intro\">Welcome to CSS!</p>\n\n.highlight { color: red; }\n#intro     { font-size: 22px; }",
        },
        {
          kind: "check",
          prompt: "You want the same style on six different paragraphs. Class or ID?",
          options: ["ID — it's more specific", "Class — it's reusable across many elements", "Either works equally", "Neither; use inline CSS"],
          answer: 1,
          praise:
            "Right — 'more than one element' is exactly the class's job. Reusability is the deciding question, not which one looks fancier.",
        },
        {
          kind: "check",
          prompt: "A class and an ID both set color on the same element. Which wins?",
          options: [
            "The class — it was written first",
            "The ID — it has higher specificity",
            "Neither; the element keeps its default",
            "Both apply, producing a blended colour",
          ],
          answer: 1,
          praise:
            "Exactly — higher specificity is precisely what the ID's priority means. That's the practical consequence the table is really teaching.",
        },
        {
          kind: "check",
          prompt: "How many times may one id value appear in a single HTML document?",
          options: ["Once", "Twice", "As many times as needed", "Once per section"],
          answer: 0,
          praise:
            "Right — ids are unique per document. Reusing one is invalid HTML, and it's the rule this question exists to check.",
        },
      ],
    },
    {
      id: "css-span-div",
      title: "span vs div: inline and block",
      unit: 5,
      weight: "heavy",
      deps: ["css-class-id"],
      whyItMatters:
        "The span/div contrast and the block-vs-inline behaviour list are classic theory questions, and they explain layout bugs students hit constantly.",
      recap: [
        "<span> is an INLINE tag — no line break before or after; it flows inside the text.",
        "<div> is a BLOCK tag — the browser adds a break before and after, so it starts on its own line.",
        "Block elements: if no width is set they expand to fill the parent; they accept margins and padding; they stack below previous elements.",
        "Inline elements: flow with the text; IGNORE top and bottom margins and the width/height properties; left/right margins and padding do apply.",
        "Block examples: h1–h6, p, pre, ul, ol, dl, div, body, hr, form, fieldset, table. Inline examples: b, i, small, strong, a, br, img, span, sub, sup, button, input, label, select, textarea.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Breaking the line, or not",
          body: "Both `<span>` and `<div>` are containers with no look of their own — they exist so you can grab a chunk of the page and style it. The difference is one thing: **whether a line break happens**.\n\n[[span|an inline container — flows within text, no line break]] is **inline**: it sits inside the flow of text, no break before or after.\n[[div|a block container — starts on its own line and fills the width]] is **block**: the browser puts a break before and after, so it starts on a new line.",
          code: "<p>Normal text except <span class=\"red\">this part, styled\ninside the sentence</span> and now back to normal.</p>\n\n<p>Normal text, then <div class=\"red\">this breaks onto its\nown line</div> and the text resumes after it.</p>",
          svg: SVG_BLOCK_INLINE,
        },
        {
          kind: "teach",
          title: "What each one obeys",
          body: "That break has consequences the exam lists explicitly.\n\n**Block elements** — with no `width` set they expand to fill the parent container; with no `height` they grow to fit their contents; they take margins and padding on all sides; they stack below whatever came before.\n\n**Inline elements** — they flow with the text, so they are subject to white-space rules; they **ignore top and bottom margins**, and they **ignore `width` and `height`** altogether. Left/right margins and padding *do* apply.\n\nThat last rule is the source of a very common frustration: setting a height on a `<span>` and seeing nothing happen.",
        },
        {
          kind: "check",
          prompt: "Which statement is TRUE of an inline element such as <span>?",
          options: [
            "It starts on a new line",
            "It ignores the width and height properties",
            "It always fills its parent's width",
            "It cannot be styled at all",
          ],
          answer: 1,
          praise:
            "Exactly — and that's why a height on a span appears to do nothing. Knowing the rule turns a baffling bug into an expected behaviour.",
        },
        {
          kind: "check",
          prompt: "You want to style three words in the middle of a sentence WITHOUT breaking the line. Which tag?",
          options: ["<div>", "<span>", "<p>", "<fieldset>"],
          answer: 1,
          praise:
            "Right — span is the inline one, so the sentence stays intact. Reach for div and the browser would split your paragraph in two.",
        },
        {
          kind: "check",
          prompt: "Which of these is a BLOCK-level element?",
          options: ["<b>", "<a>", "<p>", "<sup>"],
          answer: 2,
          praise:
            "Right — paragraphs are block. The others (b, a, sup) all flow inside text, which is the pattern in that whole inline list.",
        },
      ],
    },
    {
      id: "css-box-model",
      title: "The box model",
      unit: 5,
      weight: "heavy",
      deps: ["css-span-div"],
      whyItMatters:
        "Label-the-box-model is one of the most drawn diagrams in web papers — four layers, in order, is the entire answer.",
      recap: [
        "Every rendered element occupies a box: content, padding, border, margin.",
        "Content — where the text and images actually appear.",
        "Padding — clears space around the content, INSIDE the border; it takes the box's background colour.",
        "Border — goes around the padding and content.",
        "Margin — clears space OUTSIDE the border; it is completely transparent (no background colour).",
        "Order outward from the middle: content → padding → border → margin.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Four layers, from the inside out",
          body: "In CSS, the [[box model|the four layers — content, padding, border, margin — that wrap every rendered element]] describes the box that wraps **every** rendered element. Learn it outward from the middle:\n\n**Content** — the text or image itself.\n**Padding** — space around the content, inside the border. It **takes the element's background colour**.\n**Border** — the line drawn around the padding and content.\n**Margin** — space outside the border. It is **completely transparent** — no background colour.\n\nThat background-colour difference is the cleanest way to tell padding from margin when you look at a real page: coloured space is padding, blank space is margin.",
          svg: SVG_BOX_MODEL,
        },
        {
          kind: "check",
          prompt: "Working outward from the middle, what is the correct order?",
          options: [
            "content → border → padding → margin",
            "content → padding → border → margin",
            "margin → border → padding → content",
            "padding → content → margin → border",
          ],
          answer: 1,
          praise:
            "Right — padding hugs the content, the border wraps that, and margin holds other elements away. Drawing it once from the inside out makes it stick.",
        },
        {
          kind: "check",
          prompt: "Which layer is completely transparent (has no background colour)?",
          options: ["Padding", "Border", "Margin", "Content"],
          answer: 2,
          praise:
            "Exactly — margin is transparent, padding takes the background. That single contrast answers most 'which is which' questions on sight.",
        },
      ],
    },
    {
      id: "css-margin-padding",
      title: "Margins & padding, and the shorthand",
      unit: 5,
      weight: "heavy",
      deps: ["css-box-model"],
      whyItMatters:
        "The margin shorthand with 1, 2, 3 or 4 values is a guaranteed 'what are the four margins here?' question — pure clock-order recall.",
      recap: [
        "Margin = space outside the border; padding = space inside the border, around the content.",
        "Margins CAN be negative (to overlap content deliberately); padding CANNOT.",
        "Margins affect where background graphics/colours sit relative to the block's edges; padding only moves the content.",
        "Both can be set per side (top/right/bottom/left) or all at once with shorthand.",
        "Four values = top, right, bottom, left (clockwise). Three = top, right+left, bottom. Two = top+bottom, right+left. One = all four.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Outside vs inside",
          body: "[[margin|space outside the border, separating an element from its neighbours]] pushes other elements **away** from this one. [[padding|space inside the border, between it and the content]] pushes this element's own **content** away from its border.\n\nTwo rules that separate them beyond position:\n\n**Margins can be negative** — deliberately overlapping content is a legitimate technique. **Padding cannot** be negative.\n**Margins move the box** relative to background graphics; padding only moves the content inside it.\n\nIf that feels familiar, it should: you met exactly this pair as `cellspacing` and `cellpadding` on tables in Unit 4.",
        },
        {
          kind: "teach",
          title: "The shorthand clock",
          body: "One property can set all four sides, and the number of values decides how they are shared out. Read four values **clockwise from the top**:\n\n`margin: 25px 50px 75px 100px;` → top 25, right 50, bottom 75, left 100.\n`margin: 25px 50px 75px;` → top 25, **right and left** 50, bottom 75.\n`margin: 25px 50px;` → **top and bottom** 25, **right and left** 50.\n`margin: 25px;` → all four sides 25.\n\nThe pattern is always: missing sides copy the side opposite them.",
          code: "margin: 25px 50px 75px 100px;  /* T  R  B  L        */\nmargin: 25px 50px 75px;        /* T  R+L  B         */\nmargin: 25px 50px;             /* T+B  R+L          */\nmargin: 25px;                  /* all four          */",
        },
        {
          kind: "check",
          prompt: "For margin: 10px 20px 30px; what is the LEFT margin?",
          options: ["10px", "20px", "30px", "0"],
          answer: 1,
          praise:
            "Right — with three values the middle one covers right AND left, so left is 20px. The missing side always copies its opposite.",
        },
        {
          kind: "check",
          prompt: "Which is TRUE?",
          options: [
            "Padding can be negative, margins cannot",
            "Margins can be negative, padding cannot",
            "Both can be negative",
            "Neither can be negative",
          ],
          answer: 1,
          praise:
            "Exactly — negative margins are a real technique for overlapping elements; negative padding has no meaning, since you can't pad inward past the content.",
        },
        {
          kind: "check",
          prompt: "In margin: 25px 50px 75px 100px; which side gets 75px?",
          options: ["Top", "Right", "Bottom", "Left"],
          answer: 2,
          praise:
            "Right — clockwise from the top: top, right, bottom, left. Saying 'TRouBLe' in your head gets you the order every time.",
        },
      ],
    },
    {
      id: "u5-review",
      title: "Unit 5 quick review",
      unit: 5,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["css-selectors", "css-placement", "css-class-id", "css-box-model", "css-margin-padding"],
        count: 5,
      },
      deps: ["css-margin-padding"],
      whyItMatters:
        "Five fresh questions over the unit's heaviest ideas — selectors, placement, specificity and the box model.",
      recap: [],
      steps: [],
    },
  ],
};

export const unit5Exam: ExamQuestion[] = [
  {
    id: "i5q1",
    topicId: "css-why",
    unit: 5,
    prompt: "CSS stands for…",
    options: [
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Creative Styling System",
      "Coded Style Syntax",
    ],
    answer: 1,
    hint: "The first word describes how rules cascade down.",
    explanation: "CSS = Cascading Style Sheets — the language controlling presentation.",
  },
  {
    id: "i5q2",
    topicId: "css-why",
    unit: 5,
    prompt: "The main benefit of separating CSS from HTML is that…",
    options: [
      "pages load without a browser",
      "style is defined once and reused across pages, making updates easy",
      "HTML becomes optional",
      "images compress automatically",
    ],
    answer: 1,
    hint: "Think about editing a hundred pages by hand.",
    explanation:
      "One stylesheet styles many pages, so the design stays consistent and a single edit updates everything.",
  },
  {
    id: "i5q3",
    topicId: "css-syntax",
    unit: 5,
    prompt: "In p { font-size: 18px; } which part is the VALUE?",
    options: ["p", "font-size", "18px", "the whole block"],
    answer: 2,
    hint: "Property is what changes; value is what it changes to.",
    explanation:
      "p is the selector, font-size the property, 18px the value; together the pair is one declaration.",
  },
  {
    id: "i5q4",
    topicId: "css-syntax",
    unit: 5,
    prompt: "A 'declaration' in CSS means…",
    options: [
      "the selector plus its whole block",
      "a single property–value pair such as color: blue;",
      "the <style> tag",
      "the link to an external file",
    ],
    answer: 1,
    hint: "One pair, not the whole rule.",
    explanation:
      "A declaration is one property–value pair. Selector + the whole declaration block is a rule.",
  },
  {
    id: "i5q5",
    topicId: "css-selectors",
    unit: 5,
    prompt: "Which symbol begins an ID selector?",
    options: [". (dot)", "# (hash)", "* (star)", "@ (at)"],
    answer: 1,
    hint: "The other symbol belongs to classes.",
    explanation: "# selects by id (#title); . selects by class (.note).",
  },
  {
    id: "i5q6",
    topicId: "css-selectors",
    unit: 5,
    prompt: "What does * { margin: 0; } select?",
    options: [
      "Only elements with a class",
      "All elements on the page",
      "Nothing — * is invalid",
      "Only the body element",
    ],
    answer: 1,
    hint: "It's called the universal selector.",
    explanation: "The universal selector * matches every element on the page.",
  },
  {
    id: "i5q7",
    topicId: "css-placement",
    unit: 5,
    prompt: "Where is INTERNAL CSS written?",
    options: [
      "In a separate .css file",
      "Inside a <style> tag in the document's <head>",
      "In the style attribute of each tag",
      "At the end of the <body>",
    ],
    answer: 1,
    hint: "Internal = inside this one document, but not inside each tag.",
    explanation:
      "Internal CSS lives in a <style> block in the <head>, affecting that single document.",
  },
  {
    id: "i5q8",
    topicId: "css-placement",
    unit: 5,
    prompt: "Which line correctly links an external stylesheet?",
    options: [
      "<style href=\"style.css\">",
      "<link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">",
      "<import src=\"style.css\">",
      "<css file=\"style.css\">",
    ],
    answer: 1,
    hint: "It's a <link> in the head, with a rel telling the browser what it is.",
    explanation:
      "<link rel=\"stylesheet\" href=\"style.css\"> attaches an external stylesheet to the page.",
  },
  {
    id: "i5q9",
    topicId: "css-class-id",
    unit: 5,
    prompt: "Which has HIGHER specificity (priority)?",
    options: ["Class", "ID", "They are equal", "Element selector"],
    answer: 1,
    hint: "The unique one wins.",
    explanation:
      "An ID selector outranks a class selector, so when both set the same property the ID's value applies.",
  },
  {
    id: "i5q10",
    topicId: "css-class-id",
    unit: 5,
    prompt: "How many elements may share one id value on a page?",
    options: ["One", "Two", "Unlimited", "One per section"],
    answer: 0,
    hint: "The word 'unique' is doing the work here.",
    explanation:
      "Each id must be unique within a document; use a class when several elements need the same style.",
  },
  {
    id: "i5q11",
    topicId: "css-span-div",
    unit: 5,
    prompt: "Which tag is INLINE (adds no line break)?",
    options: ["<div>", "<span>", "<p>", "<form>"],
    answer: 1,
    hint: "One of them flows inside a sentence.",
    explanation:
      "<span> is inline — it flows within text. <div> is block and starts on a new line.",
  },
  {
    id: "i5q12",
    topicId: "css-span-div",
    unit: 5,
    prompt: "Setting height on an inline element such as <span> has what effect?",
    options: [
      "It sets the height as normal",
      "None — inline elements ignore width and height",
      "It converts the element to block",
      "It causes an error",
    ],
    answer: 1,
    hint: "Recall what inline elements ignore.",
    explanation:
      "Inline elements ignore width and height (and top/bottom margins); only left/right margins and padding apply.",
  },
  {
    id: "i5q13",
    topicId: "css-box-model",
    unit: 5,
    prompt: "Which box-model layer lies between the content and the border?",
    options: ["Margin", "Padding", "Outline", "Border-box"],
    answer: 1,
    hint: "It's the one that takes the background colour.",
    explanation:
      "Padding sits inside the border, around the content, and shares the element's background colour.",
  },
  {
    id: "i5q14",
    topicId: "css-box-model",
    unit: 5,
    prompt: "Which layer is OUTSIDE the border and fully transparent?",
    options: ["Padding", "Content", "Margin", "Border"],
    answer: 2,
    hint: "It separates this element from its neighbours.",
    explanation:
      "Margin clears space outside the border and has no background colour of its own.",
  },
  {
    id: "i5q15",
    topicId: "css-margin-padding",
    unit: 5,
    prompt: "For margin: 25px 50px; what are the top and right margins?",
    options: [
      "top 25px, right 25px",
      "top 25px, right 50px",
      "top 50px, right 25px",
      "top 50px, right 50px",
    ],
    answer: 1,
    hint: "Two values: first is top+bottom, second is right+left.",
    explanation:
      "With two values the first sets top and bottom (25px), the second right and left (50px).",
  },
  {
    id: "i5q16",
    topicId: "css-margin-padding",
    unit: 5,
    prompt: "Which can take a NEGATIVE value?",
    options: ["padding", "margin", "both", "neither"],
    answer: 1,
    hint: "One of them can pull elements over each other on purpose.",
    explanation:
      "Margins may be negative to overlap content deliberately; padding may not be negative.",
  },
];
