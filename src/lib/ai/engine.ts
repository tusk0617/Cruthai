import { randomUUID } from "node:crypto";
import { z } from "zod";
import { GeminiProvider } from "./gemini";
import { MockAIProvider } from "./mock";
import { OpenAIProvider } from "./openai";
import { buildPrompt, buildRepairPrompt } from "./prompt";
import type { AIProvider } from "./provider";
import { planSchema, sectionSchemas, type Brief, type Plan, type Section } from "./schema";
import { buildStrategy } from "./strategy";
import { getAiConfig } from "@/lib/settings";

/** Provider comes from admin settings (DB) first, then env. Callers never touch keys. */
export async function getProvider(): Promise<AIProvider> {
  const c = await getAiConfig();
  switch (c.provider) {
    case "openai": return new OpenAIProvider({ key: c.openaiKey, model: c.openaiModel });
    case "gemini": return new GeminiProvider({ key: c.geminiKey, model: c.geminiModel });
    default: return new MockAIProvider();
  }
}

const MAX_ATTEMPTS = 3;

function extractJson(raw: string): unknown {
  const t = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch { /* fall back to brace scan */ }
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error("Tidak ada objek JSON pada output");
}

/** Prompt → provider → JSON parse → schema validation, with repair retries. */
async function run(section: Section | "all", brief: Brief, plan: Plan | undefined, schema: z.ZodTypeAny) {
  const provider = await getProvider();
  const strategy = buildStrategy(brief);
  const { system, user } = buildPrompt(section, brief, strategy, plan);
  let userMsg = user;
  let lastErr = "";
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    const raw = await provider.generate({ system, user: userMsg, task: { section, brief, strategy, plan } });
    try {
      const parsed = schema.safeParse(extractJson(raw));
      if (parsed.success) return { data: parsed.data as Record<string, any>, provider: provider.name, attempts: i };
      lastErr = parsed.error.issues.slice(0, 8).map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    } catch (e) {
      lastErr = (e as Error).message;
    }
    userMsg = buildRepairPrompt(user, raw, lastErr);
  }
  throw new Error(`AI menghasilkan JSON tidak valid setelah ${MAX_ATTEMPTS} percobaan: ${lastErr}`);
}

const withId = <T extends { id?: string }>(xs: T[]) => xs.map((x) => ({ ...x, id: x.id ?? randomUUID() })) as (T & { id: string })[];

/** Sort by start, make the last item end exactly at the video duration. */
function normalizeTimeline<T extends { startSec: number; endSec: number }>(items: T[], duration: number): T[] {
  const sorted = [...items].sort((a, b) => a.startSec - b.startSec);
  return sorted.map((it, i) => ({
    ...it,
    startSec: Math.min(it.startSec, duration),
    endSec: i === sorted.length - 1 ? duration : Math.min(Math.max(it.endSec, it.startSec + 1), duration),
  }));
}

export async function generateFullPlan(brief: Brief) {
  const r = await run("all", brief, undefined, planSchema);
  const g = r.data as z.infer<typeof planSchema>;
  const hooks = withId(g.hooks);
  const ctas = withId(g.ctas);
  const plan: Plan = {
    concept: g.concept, hooks, selectedHookId: hooks[0].id,
    script: withId(normalizeTimeline(g.script, brief.duration)),
    scenes: withId(normalizeTimeline(g.scenes, brief.duration)),
    shotList: withId(g.shotList), editingGuide: g.editingGuide,
    ctas, selectedCtaId: (ctas.find((c) => c.style === brief.ctaStyle) ?? ctas[0]).id,
    caption: g.caption, hashtags: g.hashtags, assumptions: g.assumptions,
  };
  return { plan, provider: r.provider, attempts: r.attempts };
}

/** Regenerates one section only; returns a patch for the client to merge into its plan. */
export async function regenerateSection(brief: Brief, plan: Plan, section: Section) {
  const r = await run(section, brief, plan, sectionSchemas[section]);
  const d = r.data;
  const patch: Partial<Plan> = {};
  if (d.concept) patch.concept = d.concept;
  if (d.hooks) { patch.hooks = withId(d.hooks); patch.selectedHookId = patch.hooks[0].id; }
  if (d.script) patch.script = withId(normalizeTimeline(d.script, brief.duration));
  if (d.scenes) patch.scenes = withId(normalizeTimeline(d.scenes, brief.duration));
  if (d.shotList) patch.shotList = withId(d.shotList);
  if (d.editingGuide) patch.editingGuide = d.editingGuide;
  if (d.ctas) {
    patch.ctas = withId(d.ctas);
    patch.selectedCtaId = (patch.ctas.find((c) => c.style === brief.ctaStyle) ?? patch.ctas[0]).id;
  }
  if (d.caption) { patch.caption = d.caption; patch.hashtags = d.hashtags; }
  return { patch, provider: r.provider };
}
