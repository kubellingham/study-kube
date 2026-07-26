// INT42D — Internet and Web Technologies. Unit 4: Tables & Forms (Section A).
// Authored from the unit's slide deck. The deck teaches forms twice (an early
// pass and a fuller one later) and buttons twice — those repeats are folded
// into one topic each, built from the fullest treatment.
import type { Section, ExamQuestion } from "./types";

// colspan / rowspan — the deck shows this as a picture slide; redrawn so the
// merge is actually visible.
const SVG_SPAN = `<svg viewBox="0 0 340 150">
  <rect x="20" y="20" width="70" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="90" y="20" width="80" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="170" y="20" width="150" height="34" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="2"/>
  <text x="55" y="42" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">Roll No</text>
  <text x="130" y="42" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">Name</text>
  <text x="245" y="42" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">Marks</text>
  <text x="245" y="14" text-anchor="middle" font-size="9.5" fill="currentColor" opacity="0.8">colspan="2"</text>
  <rect x="20" y="54" width="70" height="34" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="2"/>
  <rect x="90" y="54" width="80" height="34" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="2"/>
  <rect x="170" y="54" width="75" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="245" y="54" width="75" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="207" y="76" text-anchor="middle" font-size="10.5" font-family="monospace" fill="currentColor">Internal</text>
  <text x="282" y="76" text-anchor="middle" font-size="10.5" font-family="monospace" fill="currentColor">External</text>
  <rect x="20" y="88" width="70" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="90" y="88" width="80" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="170" y="88" width="75" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="245" y="88" width="75" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="55" y="110" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">101</text>
  <text x="130" y="110" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">Manpreet</text>
  <text x="207" y="110" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">45</text>
  <text x="282" y="110" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor">50</text>
  <text x="8" y="76" text-anchor="start" font-size="9.5" fill="currentColor" opacity="0.8">rowspan="2" ↕</text>
  <text x="170" y="142" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.85">shaded cells are merged — the row below writes fewer &lt;td&gt;</text>
</svg>`;

export const sectionA: Section = {
  id: "sec-a",
  letter: "A",
  title: "Tables & Forms",
  tagline: "Laying data out in rows and columns — then asking the user for input.",
  unit: 4,
  topics: [
    {
      id: "table-structure",
      title: "Tables: the four tags that build a grid",
      unit: 4,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "Every table question starts here — a 'write the HTML for this table' question is near-certain, and it is pure tag structure.",
      recap: [
        "<table> defines the table; <tr> defines a row.",
        "<th> is a header cell — bold and centred by default; <td> is a normal data cell.",
        "Cells live inside rows: <table> → <tr> → <th>/<td>. Nesting order is the whole grammar.",
        "A table is read row by row: each <tr> is one horizontal line of cells.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Rows first, then cells",
          body: "An HTML [[table|an element that lays data out in rows and columns]] displays data in a **grid**. Only four tags do the work, and they nest in a strict order:\n\n`<table>` is the container. Inside it, each `<tr>` is one **row**. Inside a row, each cell is either a `<th>` ([[header cell|a table cell for a column or row title — bold and centred by default]]) or a `<td>` (ordinary data).\n\nThe order matters: you never put a `<td>` straight inside `<table>` — it must live in a `<tr>`.",
          code: "<table>\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Data 1</td>\n    <td>Data 2</td>\n  </tr>\n</table>",
        },
        {
          kind: "check",
          prompt: "Which tag defines a single ROW of a table?",
          options: ["<td>", "<tr>", "<th>", "<table>"],
          answer: 1,
          praise:
            "Right — tr for table row. The cells (td/th) then live inside it; that nesting is what the write-the-table questions check.",
        },
        {
          kind: "check",
          prompt: "What is the difference between <th> and <td>?",
          options: [
            "<th> is a header cell (bold and centred by default); <td> is a normal data cell",
            "<th> is a row, <td> is a column",
            "They are identical",
            "<th> can only be used once per table",
          ],
          answer: 0,
          praise:
            "Exactly — and note the styling is a DEFAULT the browser applies, not something you wrote. That's why headers look different without any CSS.",
        },
        {
          kind: "teach",
          title: "Reading the grid back",
          body: "Because rows come first, the shape of a table is set by how many cells each `<tr>` holds. Two `<tr>` elements each holding two cells is a **2×2** grid.\n\nA quick way to check your own markup: count the `<td>`/`<th>` inside one row — that's your column count. Every row should agree (unless you deliberately merge cells, which is next).",
        },
        {
          kind: "check",
          prompt: "How many rows and columns does this produce?",
          code: "<table>\n  <tr><th>A</th><th>B</th><th>C</th></tr>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n</table>",
          options: ["3 rows, 2 columns", "2 rows, 3 columns", "6 rows, 1 column", "1 row, 6 columns"],
          answer: 1,
          praise:
            "Two <tr> elements → two rows; three cells inside each → three columns. Counting cells-in-a-row is the fastest way to read any table markup.",
        },
      ],
    },
    {
      id: "table-attrs",
      title: "Table attributes and the caption",
      unit: 4,
      weight: "medium",
      deps: ["table-structure"],
      whyItMatters:
        "The attribute table is a straight recall question — especially the cellspacing/cellpadding pair, which students routinely swap.",
      recap: [
        "border sets border thickness: <table border=\"2\">.",
        "cellspacing = space BETWEEN cells; cellpadding = space INSIDE a cell, around its content.",
        "width and height size the table (px or %): <table width=\"80%\">.",
        "align positions the table on the page (left/center/right); bgcolor sets a background colour.",
        "<caption> adds a title to the table and appears above it by default — placed immediately inside <table>.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The attributes that shape a table",
          body: "Attributes go on the opening `<table>` tag and change how the grid is drawn:\n\n`border` — thickness of the border.\n`cellspacing` — the gap **between** cells.\n`cellpadding` — the gap **inside** a cell, between its edge and its content.\n`width` / `height` — the table's size, in pixels or a percentage.\n`align` — left, center or right on the page.\n`bgcolor` — background colour.\n\nThe pair worth burning in is **spacing vs padding**: *spacing* pushes cells apart from each other, *padding* pushes a cell's content away from its own walls. You will meet exactly this pair again in CSS as margin vs padding.",
          code: "<table border=\"2\" cellspacing=\"5\" cellpadding=\"10\" width=\"80%\" align=\"center\">",
        },
        {
          kind: "check",
          prompt: "Which attribute adds space INSIDE a cell, between the cell's edge and its content?",
          options: ["cellspacing", "cellpadding", "border", "margin"],
          answer: 1,
          praise:
            "Right — padding is inside. Remember it as 'padding is what you stuff in the box'; spacing is the gap between boxes.",
        },
        {
          kind: "teach",
          title: "Naming the table",
          body: "A [[caption|a title for a table, written inside <table> and shown above it by default]] gives the table a title. It goes **immediately inside** the `<table>` tag, before the first row, and renders **above** the table by default.\n\nIt is not decoration — a caption tells a reader (and a screen reader) what the grid is actually about.",
          code: "<table border=\"1\">\n  <caption>Student Information Table</caption>\n  <tr><th>Roll No</th><th>Name</th></tr>\n  <tr><td>101</td><td>Manpreet Kaur</td></tr>\n</table>",
        },
        {
          kind: "check",
          prompt: "Where does the <caption> tag go, and where does it appear?",
          options: [
            "Before <table>; appears below the table",
            "Immediately inside <table>; appears above the table by default",
            "Inside the first <tr>; appears in the first cell",
            "After </table>; appears wherever CSS puts it",
          ],
          answer: 1,
          praise:
            "Exactly — inside the table element, above the grid. Writing it outside <table> is the classic mistake this question is fishing for.",
        },
      ],
    },
    {
      id: "table-spans",
      title: "colspan & rowspan: merging cells",
      unit: 4,
      weight: "heavy",
      deps: ["table-structure"],
      whyItMatters:
        "The merged-header table (Marks split into Internal/External) is the deck's showcase example and a guaranteed draw-this-table question.",
      recap: [
        "colspan=\"n\" makes a cell span n COLUMNS (merges horizontally).",
        "rowspan=\"n\" makes a cell span n ROWS (merges vertically).",
        "Both are written on the cell itself: <td colspan=\"2\">Total</td>.",
        "When a cell spans down into the next row, that row writes FEWER cells — the spanned column is already filled.",
        "Classic layout: a 'Marks' header with colspan=\"2\" above Internal and External, while Roll No and Name use rowspan=\"2\".",
      ],
      steps: [
        {
          kind: "teach",
          title: "One cell, more than one square",
          body: "Sometimes one cell should cover several squares of the grid — a heading that sits over two columns, or a label that runs down two rows.\n\n`colspan=\"n\"` merges **horizontally** (across columns).\n`rowspan=\"n\"` merges **vertically** (down rows).\n\nBoth are attributes on the **cell**, not the row or the table.",
          code: "<td colspan=\"2\">Total</td>   <!-- covers 2 columns -->\n<td rowspan=\"2\">Name</td>    <!-- covers 2 rows    -->",
          svg: SVG_SPAN,
        },
        {
          kind: "teach",
          title: "The part that trips people",
          body: "When a cell spans **down** with `rowspan`, the row beneath it has one less cell to write — that column is already occupied from above.\n\nLook at the diagram: row 1 declares `Roll No` and `Name` with `rowspan=\"2\"`, plus `Marks` with `colspan=\"2\"`. Row 2 then writes **only two cells** — `Internal` and `External` — because the first two columns are already filled by the spans reaching down into it.\n\nCounting cells per row is how you debug a table that renders crooked.",
          code: "<tr>\n  <th rowspan=\"2\">Roll No</th>\n  <th rowspan=\"2\">Name</th>\n  <th colspan=\"2\">Marks</th>\n</tr>\n<tr>\n  <th>Internal</th>\n  <th>External</th>\n</tr>",
        },
        {
          kind: "check",
          prompt: "A cell is written as <td rowspan=\"3\">. What does it do?",
          options: [
            "Covers 3 columns across",
            "Covers 3 rows downward",
            "Creates 3 separate cells",
            "Repeats its text 3 times",
          ],
          answer: 1,
          praise:
            "Right — ROWspan runs down through rows. The name says it: it spans rows. colspan is the horizontal one.",
        },
        {
          kind: "check",
          prompt:
            "Row 1 has a cell with rowspan=\"2\" in the first column. How many cells must row 2 write?",
          options: [
            "The same number as row 1",
            "One fewer — the first column is already filled from above",
            "One more",
            "None — row 2 is skipped entirely",
          ],
          answer: 1,
          praise:
            "Exactly the insight — the span reaches down and occupies that square, so row 2 starts at the second column. That's why merged tables look broken when you write the full count out of habit.",
        },
      ],
    },
    {
      id: "form-element",
      title: "The form element: action & method",
      unit: 4,
      weight: "heavy",
      deps: ["table-structure"],
      whyItMatters:
        "GET vs POST is the single most asked form theory question, and every write-a-form answer opens with the <form> tag and its two attributes.",
      recap: [
        "An HTML form collects user input; all input elements live inside <form>.",
        "action = WHERE the data goes (a file or server-side script): <form action=\"thankyou.html\">.",
        "method = HOW it is sent: GET or POST.",
        "GET appends the data to the URL, so it is visible in the address bar: thankyou.html?username=Manpreet",
        "POST sends the data invisibly — not shown in the URL. Use it for anything private.",
      ],
      steps: [
        {
          kind: "teach",
          title: "The container that collects",
          body: "A [[form|a container element that collects user input and sends it somewhere]] is how a page asks the user for something — a name, an email, feedback. Every input control (text boxes, radio buttons, checkboxes, buttons) goes **inside** the `<form>` tag.\n\nOn its own the form is just a container. Two attributes make it do something:",
          code: "<form action=\"submit.html\" method=\"post\">\n   <!-- input fields go here -->\n</form>",
        },
        {
          kind: "teach",
          title: "Where, and how",
          body: "**`action`** answers *where*: the page or script the data is sent to when the user submits. `<form action=\"thankyou.html\">` sends the user to `thankyou.html`.\n\n**`method`** answers *how*, and there are exactly two answers:\n\n[[GET|sends form data appended to the URL, visible in the address bar]] — the data is stuck onto the end of the URL, so anyone can see it:\n`thankyou.html?username=Manpreet&useremail=test@gmail.com`\n\n[[POST|sends form data in the request body, hidden from the URL]] — the data travels invisibly; nothing appears in the address bar.\n\nThat visibility difference is the whole answer to \"when would you use POST?\" — passwords and anything private.",
          code: "<form action=\"thankyou.html\" method=\"get\">\n<!-- after submit the URL shows:              -->\n<!-- thankyou.html?username=Manpreet&useremail=test@gmail.com -->",
        },
        {
          kind: "check",
          prompt: "Which attribute specifies WHERE the form data is sent?",
          options: ["method", "action", "name", "target"],
          answer: 1,
          praise:
            "Right — action is the destination, method is the manner. Pairing them like that in your head keeps them straight under exam pressure.",
        },
        {
          kind: "check",
          prompt: "A form is submitted and the browser's address bar shows ?username=Manpreet. Which method was used?",
          options: ["POST", "GET", "Either — the URL always shows the data", "Neither; that's the action"],
          answer: 1,
          praise:
            "Exactly — visible in the URL means GET. That single observation is how these questions are usually framed.",
        },
        {
          kind: "check",
          prompt: "Why would you choose POST over GET for a login form?",
          options: [
            "POST is faster",
            "POST hides the data from the URL, so a password isn't shown in the address bar",
            "GET cannot send text",
            "POST allows more input fields",
          ],
          answer: 1,
          praise:
            "That's the reasoning, not just the fact — privacy is the reason POST exists for this job. An answer that says WHY earns the mark.",
        },
      ],
    },
    {
      id: "form-text-inputs",
      title: "Text inputs, passwords, textarea & labels",
      unit: 4,
      weight: "heavy",
      deps: ["form-element"],
      whyItMatters:
        "These are the fields every 'design a registration form' answer needs — and the label's for/id pairing is an easy mark most students drop.",
      recap: [
        "<input type=\"text\"> takes single-line input (name, email).",
        "<input type=\"password\"> hides what is typed behind dots/asterisks.",
        "<textarea rows=\"4\" cols=\"40\"> takes multi-line input (address, comments) — it has a closing tag.",
        "<label for=\"name\"> connects text to the input whose id=\"name\" — improves accessibility.",
        "placeholder shows grey hint text inside the box; name is what identifies the value when submitted.",
      ],
      steps: [
        {
          kind: "teach",
          title: "One line, hidden, or many lines",
          body: "Most form fields are just `<input>` with a different `type`:\n\n`type=\"text\"` — a single-line box for a name or email.\n`type=\"password\"` — the same box, but the characters render as dots so a shoulder-surfer can't read them.\n\nFor longer input there is a different tag entirely: `<textarea>`, sized with `rows` and `cols`. Note it has an **opening and closing tag** (`<textarea></textarea>`) while `<input>` stands alone.",
          code: "<input type=\"text\" id=\"name\" name=\"username\" placeholder=\"Enter your name\">\n\n<input type=\"password\" id=\"pass\" name=\"password\" placeholder=\"Enter password\">\n\n<textarea id=\"address\" name=\"address\" rows=\"4\" cols=\"40\"\n          placeholder=\"Enter your address\"></textarea>",
        },
        {
          kind: "teach",
          title: "label, for and id — the pairing",
          body: "A [[label|text tied to a form field via for=\"…\" matching the field's id]] is the visible text beside a field. It is tied to its input by matching `for` to the input's `id`:\n\n`<label for=\"name\">` ↔ `<input id=\"name\">`\n\nWhy bother? [[accessibility|making a page usable by everyone, including screen-reader users]] — a screen reader can then announce which box it is on, and clicking the label focuses the field.\n\nDon't confuse the two identifiers: **`id`** links the label to the field; **`name`** is the key the value is submitted under.",
          code: "<label for=\"name\">Name:</label>\n<input type=\"text\" id=\"name\" name=\"username\">\n<!-- for=\"name\"  matches  id=\"name\"       -->\n<!-- the value arrives at the server as: username=… -->",
        },
        {
          kind: "check",
          prompt: "Which attribute of <label> connects it to its input field?",
          options: ["name", "for", "id", "link"],
          answer: 1,
          praise:
            "Right — for on the label matches id on the input. The mirrored pair (for ↔ id) is the bit worth memorising.",
        },
        {
          kind: "check",
          prompt: "Which control should you use for a multi-line address?",
          options: [
            "<input type=\"text\">",
            "<textarea rows=\"4\" cols=\"40\"></textarea>",
            "<input type=\"address\">",
            "<input type=\"password\">",
          ],
          answer: 1,
          praise:
            "Exactly — and textarea is the one form control with a closing tag, sized by rows and cols rather than a width attribute.",
        },
      ],
    },
    {
      id: "form-choices",
      title: "Radio buttons vs checkboxes",
      unit: 4,
      weight: "heavy",
      deps: ["form-text-inputs"],
      whyItMatters:
        "The 'why must radio buttons share a name?' question separates memorising from understanding — and choose-the-right-control appears in every form question.",
      recap: [
        "Radio buttons: pick ONE option from several. Checkboxes: pick ANY number, including none.",
        "All radio buttons in one group MUST share the same name (e.g. name=\"gender\") — that shared name is what makes them mutually exclusive.",
        "value is what gets submitted for the chosen option; the visible text comes from the <label>.",
        "Checkboxes in a set often share a name too (name=\"hobby\"), so several values arrive under one key.",
        "Each control still needs its own id so its label can point at it.",
      ],
      steps: [
        {
          kind: "teach",
          title: "One of many, or many of many",
          body: "Two controls look similar and mean opposite things:\n\n**Radio buttons** — the user may select **only one** of the group. Gender, a single course choice.\n**Checkboxes** — the user may select **as many as they like**, or none. Hobbies, interests.\n\nChoosing between them is a design decision the exam loves: *is more than one answer sensible here?*",
          code: "<p>Gender:</p>\n<input type=\"radio\" id=\"male\" name=\"gender\" value=\"Male\">\n<label for=\"male\">Male</label>\n<input type=\"radio\" id=\"female\" name=\"gender\" value=\"Female\">\n<label for=\"female\">Female</label>",
        },
        {
          kind: "teach",
          title: "The shared name is the mechanism",
          body: "Here is the part worth truly understanding. Radio buttons are not mutually exclusive because they are radio buttons — they are mutually exclusive because **they share a `name`**.\n\n`name=\"gender\"` on both options tells the browser \"these belong to one question\", so selecting one clears the other. Give two radios *different* names and the user can select both — the classic bug.\n\nCheckboxes use a shared name for a different reason: to collect several answers under one key (`hobby=Reading`, `hobby=Music`).",
          code: "<p>Hobbies:</p>\n<input type=\"checkbox\" id=\"reading\" name=\"hobby\" value=\"Reading\">\n<label for=\"reading\">Reading</label>\n<input type=\"checkbox\" id=\"sports\" name=\"hobby\" value=\"Sports\">\n<label for=\"sports\">Sports</label>\n<input type=\"checkbox\" id=\"music\" name=\"hobby\" value=\"Music\">\n<label for=\"music\">Music</label>",
        },
        {
          kind: "check",
          prompt: "Why must all radio buttons in one group share the same name?",
          options: [
            "To save typing",
            "The shared name is what groups them, making the selection mutually exclusive",
            "Because ids must be unique",
            "So they all submit at once",
          ],
          answer: 1,
          praise:
            "That's the real mechanism — the name IS the grouping. Different names would let the user tick both, which is exactly the bug this question is testing for.",
        },
        {
          kind: "check",
          prompt: "A form asks which hobbies you enjoy — a user might have several. Which control fits?",
          options: ["Radio buttons", "Checkboxes", "A password field", "A submit button"],
          answer: 1,
          praise:
            "Right — 'several answers allowed' is precisely the checkbox's job. Ask yourself 'can more than one be true?' and the choice makes itself.",
        },
      ],
    },
    {
      id: "form-menus",
      title: "Drop-down menus: select, option & optgroup",
      unit: 4,
      weight: "medium",
      deps: ["form-choices"],
      whyItMatters:
        "A country/course drop-down appears in most form questions, and the value-vs-visible-text distinction is a favourite one-mark trap.",
      recap: [
        "<select> creates a drop-down list; each item inside is an <option>.",
        "<select> attributes: name (the submitted key), size (how many items show at once), multiple (allow several selections).",
        "<option value=\"x\">Visible Text</option> — value is sent to the server, the text is what the user sees.",
        "selected pre-selects an option by default.",
        "<optgroup label=\"Group\"> groups related options under a heading; disabled greys the whole group out.",
      ],
      steps: [
        {
          kind: "teach",
          title: "A list that folds away",
          body: "A drop-down (pull-down) list saves space when there are many choices — countries, states, courses. `<select>` makes the list; each `<option>` is one item.\n\nThe `<select>` tag carries the attributes that shape the list: `name` (the key the answer is submitted under), `size` (how many rows are visible at once), and `multiple` (let the user pick more than one).",
          code: "<select name=\"course\">\n    <option value=\"cse\">Computer Science</option>\n    <option value=\"ece\">Electronics</option>\n    <option value=\"me\">Mechanical</option>\n</select>",
        },
        {
          kind: "teach",
          title: "What the user sees vs what the server gets",
          body: "An `<option>` has two different pieces of text, and mixing them up is a classic slip:\n\n`<option value=\"cse\">Computer Science</option>`\n\nThe **`value`** (`cse`) is what is actually **sent**. The text between the tags (`Computer Science`) is only what the **user reads**. Add `selected` to make an option the default.\n\nWhen the list gets long, `<optgroup label=\"…\">` wraps related options under a category heading so the list is scannable.",
          code: "<select name=\"city\">\n   <optgroup label=\"Punjab\">\n      <option value=\"ldh\">Ludhiana</option>\n      <option value=\"asr\">Amritsar</option>\n   </optgroup>\n   <optgroup label=\"Delhi\">\n      <option value=\"nd\" selected>New Delhi</option>\n   </optgroup>\n</select>",
        },
        {
          kind: "check",
          prompt: "In <option value=\"cse\">Computer Science</option>, what is sent to the server when it is chosen?",
          options: ["Computer Science", "cse", "Both", "Neither — options aren't submitted"],
          answer: 1,
          praise:
            "Right — value travels, the text is only shown. That split is exactly why value exists: a short code for the server, a readable phrase for the human.",
        },
        {
          kind: "check",
          prompt: "Which attribute lets the user select MORE THAN ONE item from a <select> list?",
          options: ["size", "multiple", "selected", "name"],
          answer: 1,
          praise:
            "Exactly — and note size only changes how many rows are visible, which is the distractor this question is built on.",
        },
      ],
    },
    {
      id: "form-buttons",
      title: "Grouping and buttons: fieldset, legend, submit & reset",
      unit: 4,
      weight: "medium",
      deps: ["form-menus"],
      whyItMatters:
        "Submit and reset close every form answer, and fieldset/legend is the easy structure mark in 'make this form organised' questions.",
      recap: [
        "<fieldset> draws a box around a group of related form controls; <legend> is its caption, placed immediately inside.",
        "<input type=\"submit\" value=\"Submit\"> sends the form data to the action page.",
        "<input type=\"reset\" value=\"Reset\"> clears the fields back to their defaults.",
        "<input type=\"button\"> is a general-purpose button (usually driven by JavaScript).",
        "<button type=\"submit\">…</button> does the same job but is more flexible — it can hold text, images or icons.",
        "On an <input> button the visible text comes from value; on a <button> it is the content between the tags.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Boxing up related fields",
          body: "Long forms (registrations, surveys) get hard to read. [[fieldset|an element that groups related form controls and draws a box around them]] groups related controls and draws a border around them; [[legend|the caption for a fieldset, written immediately inside it]] gives that box a title.\n\nThe `<legend>` goes **immediately inside** the `<fieldset>` — same pattern as `<caption>` inside `<table>`, which you met earlier in this unit.",
          code: "<fieldset>\n   <legend>Registration Details</legend>\n   <label for=\"name\">Name:</label>\n   <input type=\"text\" id=\"name\" name=\"name\">\n</fieldset>",
        },
        {
          kind: "teach",
          title: "Two buttons, two jobs",
          body: "**Submit** sends the form's data to the page named in `action`. **Reset** wipes the fields back to their original values — it does not send anything.\n\nThere are two ways to write them. The `<input>` form takes its visible text from `value`:\n\nThe `<button>` form takes its text from **between** the tags, and can hold richer content (an icon, an image):\n`<button type=\"submit\">Submit</button>`\n\nThere is also `type=\"button\"` — a plain button that does nothing on its own, meant to be wired up with JavaScript.",
          code: "<input type=\"submit\" value=\"Submit Form\">\n<input type=\"reset\"  value=\"Clear Form\">\n\n<button type=\"submit\">Submit</button>\n<button type=\"reset\">Reset</button>",
        },
        {
          kind: "check",
          prompt: "What does <input type=\"reset\"> do?",
          options: [
            "Sends the form data to the server",
            "Clears the form fields back to their default values",
            "Reloads the whole page from the server",
            "Deletes the form from the page",
          ],
          answer: 1,
          praise:
            "Right — reset clears, submit sends. Nothing leaves the browser when reset is pressed, which is the distinction being tested.",
        },
        {
          kind: "check",
          prompt: "On <input type=\"submit\" value=\"Register\">, what does value control?",
          options: [
            "Where the form is sent",
            "The text displayed on the button",
            "The method used",
            "The name of the form",
          ],
          answer: 1,
          praise:
            "Exactly — on a button, value is the caption. (Contrast <button>Register</button>, where the caption sits between the tags.)",
        },
      ],
    },
    {
      id: "form-table-layout",
      title: "Laying out a form with a table",
      unit: 4,
      weight: "light",
      deps: ["table-spans", "form-buttons"],
      whyItMatters:
        "This is the unit's pay-off — the one question that asks you to combine tables and forms in a single answer.",
      recap: [
        "By default form controls stack one below the other, so labels and boxes don't line up.",
        "Wrapping the form in a <table> aligns them: labels in the left column, inputs in the right.",
        "Each field becomes one <tr>: <td>Label:</td><td><input …></td>.",
        "The <form> goes OUTSIDE the <table> so every control stays inside the form.",
      ],
      steps: [
        {
          kind: "teach",
          title: "Making the columns line up",
          body: "Left to itself, a form renders each control on its own line and nothing lines up — the boxes start at whatever point the label text ends.\n\nThe classic fix in this unit is to lay the form out **inside a table**: one `<tr>` per field, the label in the first `<td>` and the input in the second. Now every input starts at the same x-position because the column has one width.\n\nNote the nesting: `<form>` wraps the `<table>`, not the other way round — every control must sit inside the form to be submitted.",
          code: "<form action=\"register.php\" method=\"post\">\n  <table>\n    <tr>\n      <td>Name:</td>\n      <td><input type=\"text\" name=\"name\"></td>\n    </tr>\n    <tr>\n      <td>Email:</td>\n      <td><input type=\"email\" name=\"email\"></td>\n    </tr>\n  </table>\n</form>",
        },
        {
          kind: "check",
          prompt: "In the table-layout technique, what goes in the LEFT column of each row?",
          options: ["The input fields", "The labels", "The submit button", "The form's action"],
          answer: 1,
          praise:
            "Right — labels left, inputs right. That single shared column width is the whole reason the form suddenly looks tidy.",
        },
        {
          kind: "check",
          prompt: "Which nesting is correct?",
          options: [
            "<table> outside, <form> inside one cell",
            "<form> outside, <table> inside it",
            "They cannot be combined",
            "Both tags must be siblings",
          ],
          answer: 1,
          praise:
            "Exactly — the form must contain the controls, so it wraps the table. Getting this backwards is why some fields silently fail to submit.",
        },
      ],
    },
    {
      id: "u4-review",
      title: "Unit 4 quick review",
      unit: 4,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["table-spans", "form-element", "form-choices", "form-menus"],
        count: 5,
      },
      deps: ["form-table-layout"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes tables and forms permanent.",
      recap: [],
      steps: [],
    },
  ],
};

export const unit4Exam: ExamQuestion[] = [
  {
    id: "u4q1",
    topicId: "table-structure",
    unit: 4,
    prompt: "Which tag creates a table HEADER cell?",
    options: ["<td>", "<th>", "<tr>", "<thead>"],
    answer: 1,
    hint: "It's the one the browser makes bold and centred without any CSS.",
    explanation:
      "<th> is a header cell — bold and centred by default. <td> is an ordinary data cell.",
  },
  {
    id: "u4q2",
    topicId: "table-structure",
    unit: 4,
    prompt: "What is the correct nesting order?",
    options: [
      "<table> → <td> → <tr>",
      "<table> → <tr> → <td>",
      "<tr> → <table> → <td>",
      "<td> → <tr> → <table>",
    ],
    answer: 1,
    hint: "Rows hold cells, and the table holds rows.",
    explanation:
      "Cells live inside rows, and rows inside the table: <table> → <tr> → <td>/<th>.",
  },
  {
    id: "u4q3",
    topicId: "table-attrs",
    unit: 4,
    prompt: "cellspacing controls…",
    options: [
      "the space inside a cell around its content",
      "the space between adjacent cells",
      "the thickness of the border",
      "the width of the table",
    ],
    answer: 1,
    hint: "Spacing separates things; padding stuffs a box.",
    explanation:
      "cellspacing is the gap BETWEEN cells; cellpadding is the gap inside a cell, around its content.",
  },
  {
    id: "u4q4",
    topicId: "table-spans",
    unit: 4,
    prompt: "Which attribute makes one cell stretch across two columns?",
    options: ["rowspan=\"2\"", "colspan=\"2\"", "width=\"2\"", "span=\"2\""],
    answer: 1,
    hint: "Which direction are columns? Across.",
    explanation:
      "colspan merges horizontally across columns; rowspan merges vertically down rows.",
  },
  {
    id: "u4q5",
    topicId: "table-spans",
    unit: 4,
    prompt:
      "A header row uses two cells with rowspan=\"2\" and one with colspan=\"2\". How many cells does the NEXT row contain?",
    options: ["4", "3", "2", "0"],
    answer: 2,
    hint: "The rowspan cells already occupy their columns in the next row.",
    explanation:
      "The two rowspan cells fill the first two columns of the next row, so only the two columns under the colspan header remain: 2 cells.",
  },
  {
    id: "u4q6",
    topicId: "form-element",
    unit: 4,
    prompt: "Which method sends form data visibly in the URL?",
    options: ["POST", "GET", "SEND", "SUBMIT"],
    answer: 1,
    hint: "One of them appends ?key=value to the address.",
    explanation:
      "GET appends the data to the URL, so it appears in the address bar. POST sends it invisibly.",
  },
  {
    id: "u4q7",
    topicId: "form-element",
    unit: 4,
    prompt: "The action attribute of <form> specifies…",
    options: [
      "how the data is sent",
      "where the data is sent",
      "which button submits the form",
      "the form's name",
    ],
    answer: 1,
    hint: "Action = destination.",
    explanation:
      "action names the page or script that receives the data; method says how it travels (GET or POST).",
  },
  {
    id: "u4q8",
    topicId: "form-text-inputs",
    unit: 4,
    prompt: "Which pairing correctly links a label to its input?",
    options: [
      "<label name=\"x\"> with <input id=\"x\">",
      "<label for=\"x\"> with <input id=\"x\">",
      "<label id=\"x\"> with <input for=\"x\">",
      "<label for=\"x\"> with <input name=\"x\">",
    ],
    answer: 1,
    hint: "The label points at the field's id.",
    explanation:
      "for on the label must match id on the input. name is separate — it's the key the value submits under.",
  },
  {
    id: "u4q9",
    topicId: "form-choices",
    unit: 4,
    prompt:
      "Two radio buttons are given DIFFERENT name attributes. What happens?",
    options: [
      "Nothing changes — they're still mutually exclusive",
      "The user can select both, because the shared name is what groups them",
      "Neither can be selected",
      "The form refuses to submit",
    ],
    answer: 1,
    hint: "What actually creates the group?",
    explanation:
      "The shared name is the grouping mechanism. Different names means two separate one-option groups, so both can be selected.",
  },
  {
    id: "u4q10",
    topicId: "form-choices",
    unit: 4,
    prompt: "Which control suits a question where several answers may be true at once?",
    options: ["Radio buttons", "Checkboxes", "A <select> without multiple", "A password field"],
    answer: 1,
    hint: "Can more than one be true?",
    explanation:
      "Checkboxes allow any number of selections (including none); radio buttons allow exactly one from the group.",
  },
  {
    id: "u4q11",
    topicId: "form-menus",
    unit: 4,
    prompt: "What does <optgroup> do?",
    options: [
      "Allows multiple selections",
      "Groups related <option> items under a labelled heading",
      "Pre-selects an option",
      "Sets how many options are visible",
    ],
    answer: 1,
    hint: "It's about organising a long list, not about selection.",
    explanation:
      "<optgroup label=\"…\"> groups related options under a category heading, making long lists readable.",
  },
  {
    id: "u4q12",
    topicId: "form-buttons",
    unit: 4,
    prompt: "Which tag pair gives a fieldset its visible title?",
    options: ["<caption>", "<legend>", "<label>", "<title>"],
    answer: 1,
    hint: "Same idea as <caption> for a table, different tag.",
    explanation:
      "<legend>, placed immediately inside <fieldset>, captions the grouped controls.",
  },
  {
    id: "u4q13",
    topicId: "form-buttons",
    unit: 4,
    prompt: "What is the main advantage of <button> over <input type=\"submit\">?",
    options: [
      "It submits faster",
      "It can contain text, images or icons between its tags",
      "It works without a form",
      "It doesn't need a type attribute",
    ],
    answer: 1,
    hint: "One takes its caption from an attribute; the other from its content.",
    explanation:
      "<button> takes its content between the tags, so it can hold rich content. <input> only shows its value attribute.",
  },
  {
    id: "u4q14",
    topicId: "form-table-layout",
    unit: 4,
    prompt: "When laying out a form with a table, which element wraps which?",
    options: [
      "<table> wraps <form>",
      "<form> wraps <table>",
      "They are siblings",
      "Both wrap a <fieldset>",
    ],
    answer: 1,
    hint: "Every control must end up inside the form to be submitted.",
    explanation:
      "The form wraps the table so all controls remain inside the form and are submitted with it.",
  },
];
