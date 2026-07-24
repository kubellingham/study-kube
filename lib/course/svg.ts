// Sanitize a model-generated SVG diagram before it's ever stored or rendered.
// Kube can attach a small labeled diagram (a chip pinout, a gate wiring, a
// waveform) to a teach step. That SVG is rendered inline so it can inherit the
// theme via `currentColor` — which means it must be scrubbed to an allowlist of
// safe tags/attributes first, or an uploaded file could prompt-inject a
// <script> into a lesson. We drop anything not on the list rather than trust it.

// Stored lowercase — names are lowercased before the check; CANONICAL_TAG
// restores the case-sensitive spelling on output.
const ALLOWED_TAGS = new Set([
  "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "title", "defs", "marker", "lineargradient", "radialgradient", "stop",
]);

// Attributes that are safe geometry / styling. Everything else (href, xlink:*,
// on*, style, class refs, external URLs) is stripped.
const ALLOWED_ATTRS = new Set([
  "id", "transform", "viewbox", "xmlns", "preserveaspectratio",
  "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
  "stroke-dasharray", "stroke-miterlimit", "opacity", "fill-opacity", "stroke-opacity",
  "fill-rule", "clip-rule",
  "d", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
  "width", "height", "points", "dx", "dy", "rotate",
  "text-anchor", "dominant-baseline", "alignment-baseline",
  "font-size", "font-family", "font-weight", "font-style", "letter-spacing",
  "gradientunits", "gradienttransform", "offset", "stop-color", "stop-opacity",
  "orient", "refx", "refy", "markerwidth", "markerheight", "markerunits",
  "marker-end", "marker-start", "marker-mid",
]);

// SVG is case-SENSITIVE for these camelCased names — we compare against the
// allowlist in lowercase but must emit the exact SVG spelling or the browser
// ignores them (a lowercased `viewbox` doesn't scale; `lineargradient` is not
// an element). Anything not here is genuinely all-lowercase, emitted as-is.
const CANONICAL_TAG: Record<string, string> = {
  lineargradient: "linearGradient",
  radialgradient: "radialGradient",
};
const CANONICAL_ATTR: Record<string, string> = {
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform",
  markerwidth: "markerWidth",
  markerheight: "markerHeight",
  markerunits: "markerUnits",
  refx: "refX",
  refy: "refY",
};

const MAX_SVG_CHARS = 14_000;
const MAX_TAGS = 400;

/** Returns a scrubbed SVG string, or null if it isn't a usable/safe SVG. */
export function sanitizeSvg(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let svg = input.trim();
  if (svg.length < 20 || svg.length > MAX_SVG_CHARS * 2) return null;
  if (!/^<svg[\s>]/i.test(svg)) return null;

  // Drop declarations, comments, CDATA, and whole dangerous element blocks
  // (content included) before the tag walk.
  svg = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<(script|style|foreignObject|a|image|use|iframe|set|animate[a-zA-Z]*)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|foreignObject|a|image|use|iframe|set|animate[a-zA-Z]*)\b[^>]*\/?>/gi, "");

  let tagCount = 0;
  let dangerous = false;

  const cleaned = svg.replace(/<\/?([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/g, (match, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    const closing = match.startsWith("</");
    if (!ALLOWED_TAGS.has(name)) return ""; // drop unknown tag markup, keep text
    const outName = CANONICAL_TAG[name] ?? name;
    if (closing) return `</${outName}>`;
    if (++tagCount > MAX_TAGS) { dangerous = true; return ""; }

    const selfClose = /\/>$/.test(match);
    const attrs: string[] = [];
    const attrRe = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(rawAttrs)) !== null) {
      const key = m[1].toLowerCase();
      const val = (m[3] ?? m[4] ?? m[5] ?? "").trim();
      if (key.startsWith("on")) continue; // event handlers
      if (key === "href" || key.startsWith("xlink")) continue; // no external refs
      if (key === "style" || key === "class") continue; // no CSS injection
      if (!ALLOWED_ATTRS.has(key)) continue;
      // Colors/refs must not smuggle a url()/javascript:/data: payload.
      if (/(javascript:|expression\(|url\(|data:|<)/i.test(val)) { continue; }
      // Re-quote safely (strip any stray quotes/brackets from the value).
      const safeVal = val.replace(/["'<>]/g, "");
      attrs.push(`${CANONICAL_ATTR[key] ?? key}="${safeVal}"`);
    }
    return `<${outName}${attrs.length ? " " + attrs.join(" ") : ""}${selfClose ? "/" : ""}>`;
  });

  if (dangerous) return null;
  const out = cleaned.trim();
  if (out.length > MAX_SVG_CHARS) return null;
  if (!/^<svg[\s\S]*<\/svg>\s*$/i.test(out)) return null;
  // Must actually draw something.
  if (!/<(path|rect|circle|ellipse|line|polyline|polygon|text)\b/i.test(out)) return null;
  return out;
}
