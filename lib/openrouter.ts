// OpenRouter (OpenAI-compatible) client for the budget tiers. Climb's
// distillation — the concept map + exam bank that feed practice, notes and
// exams — runs here on a cheap model instead of Sonnet, which is where the
// tier's margin comes from. The key lives ONLY in OPENROUTER_API_KEY (Vercel
// env), never in the repo.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// Budget models, overridable by env so we can swap the exact slug we settle on
// after the bake-off without a code deploy. Defaults are widely-available,
// cheap, strong-for-price OpenRouter slugs.
export const CLIMB_MODEL = process.env.OPENROUTER_CLIMB_MODEL || "deepseek/deepseek-chat";
// Vision model for image-carried uploads (scanned pages, photographed notes) —
// DeepSeek chat is text-only, so those route here instead.
export const CLIMB_VISION_MODEL = process.env.OPENROUTER_CLIMB_VISION_MODEL || "openai/gpt-4o-mini";

// Rough list prices (USD per 1M tokens) for the Climb cost estimate. Override
// to match the exact model we land on. DeepSeek-class defaults.
export const CLIMB_PRICE_IN = Number(process.env.OPENROUTER_CLIMB_PRICE_IN ?? 0.14);
export const CLIMB_PRICE_OUT = Number(process.env.OPENROUTER_CLIMB_PRICE_OUT ?? 0.28);

export interface ORImage {
  mediaType: string;
  data: string; // bare base64
}

type ORContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/** Turn Kube's source images into OpenAI-style image_url blocks (data URIs). */
export function orImageBlocks(images: ORImage[] | undefined): ORContent[] {
  return (images ?? []).map((img) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:${img.mediaType === "image/png" ? "image/png" : "image/jpeg"};base64,${img.data}`,
    },
  }));
}

export interface ORUsage {
  input_tokens: number;
  output_tokens: number;
}

/** One JSON chat call to OpenRouter. Returns the parsed object + token usage;
 *  the caller Zod-validates the shape. Throws on transport / empty / non-JSON. */
export async function chatJSON(opts: {
  model: string;
  system: string;
  content: string | ORContent[];
  maxTokens?: number;
}): Promise<{ data: unknown; usage: ORUsage }> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // OpenRouter attribution headers (optional but polite).
      "X-Title": "StudyingKube",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.content },
      ],
      max_tokens: opts.maxTokens ?? 4000,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const text: unknown = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter returned no content.");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    // Some models fence the JSON or wrap it in prose — salvage the object.
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("OpenRouter did not return JSON.");
    data = JSON.parse(m[0]);
  }

  const u = json?.usage ?? {};
  return {
    data,
    usage: { input_tokens: u.prompt_tokens ?? 0, output_tokens: u.completion_tokens ?? 0 },
  };
}
