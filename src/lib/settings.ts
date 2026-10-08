import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { query } from "@/lib/db";

export type ProviderId = "mock" | "openai" | "gemini";
export const PROVIDER_IDS: ProviderId[] = ["mock", "openai", "gemini"];

export interface AiConfig {
  provider: ProviderId;
  openaiKey?: string; geminiKey?: string;
  openaiModel: string; geminiModel: string;
}

const g = globalThis as unknown as { __clipplanAi?: { at: number; cfg: AiConfig } };
const TTL = 15_000;

async function readAll(): Promise<Record<string, string>> {
  const rows = await query<{ key: string; value: string }>("select key, value from app_settings where key like 'ai.%'");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** DB settings (set from the admin UI) take precedence over environment variables. */
export async function getAiConfig(): Promise<AiConfig> {
  if (g.__clipplanAi && Date.now() - g.__clipplanAi.at < TTL) return g.__clipplanAi.cfg;
  const m = await readAll();
  const dec = (k: string) => (m[k] ? decryptSecret(m[k]) : undefined);
  const p = (m["ai.provider"] || process.env.AI_PROVIDER || "mock").toLowerCase() as ProviderId;
  const cfg: AiConfig = {
    provider: PROVIDER_IDS.includes(p) ? p : "mock",
    openaiKey: dec("ai.openai_key") || process.env.OPENAI_API_KEY || undefined,
    geminiKey: dec("ai.gemini_key") || process.env.GEMINI_API_KEY || undefined,
    openaiModel: m["ai.openai_model"] || process.env.OPENAI_MODEL || "gpt-4o-mini",
    geminiModel: m["ai.gemini_model"] || process.env.GEMINI_MODEL || "gemini-2.0-flash",
  };
  g.__clipplanAi = { at: Date.now(), cfg };
  return cfg;
}

async function put(key: string, value: string) {
  await query("delete from app_settings where key = $1", [key]);
  await query("insert into app_settings (key, value) values ($1, $2)", [key, value]);
}

export interface AiUpdate {
  provider?: ProviderId;
  openaiModel?: string; geminiModel?: string;
  openaiKey?: string; geminiKey?: string;
  clearKey?: "openai" | "gemini";
}

export async function saveAiConfig(u: AiUpdate): Promise<string[]> {
  const changed: string[] = [];
  if (u.provider) { await put("ai.provider", u.provider); changed.push("provider"); }
  if (u.openaiModel) { await put("ai.openai_model", u.openaiModel); changed.push("openaiModel"); }
  if (u.geminiModel) { await put("ai.gemini_model", u.geminiModel); changed.push("geminiModel"); }
  if (u.openaiKey) { await put("ai.openai_key", encryptSecret(u.openaiKey)); changed.push("openaiKey"); }
  if (u.geminiKey) { await put("ai.gemini_key", encryptSecret(u.geminiKey)); changed.push("geminiKey"); }
  if (u.clearKey) { await query("delete from app_settings where key = $1", [`ai.${u.clearKey}_key`]); changed.push(`clear:${u.clearKey}Key`); }
  g.__clipplanAi = undefined; // apply immediately on this instance
  return changed;
}

const hint = (k?: string) => (k ? `••••${k.slice(-4)}` : null);

/** Safe for the browser: never contains a full key. */
export async function getAiStatus() {
  const m = await readAll();
  const cfg = await getAiConfig();
  const src = (dbKey: string, envKey?: string): "database" | "env" | null => (m[dbKey] && decryptSecret(m[dbKey]) ? "database" : envKey ? "env" : null);
  return {
    provider: cfg.provider,
    openai: { model: cfg.openaiModel, keyHint: hint(cfg.openaiKey), keySource: src("ai.openai_key", process.env.OPENAI_API_KEY) },
    gemini: { model: cfg.geminiModel, keyHint: hint(cfg.geminiKey), keySource: src("ai.gemini_key", process.env.GEMINI_API_KEY) },
  };
}
