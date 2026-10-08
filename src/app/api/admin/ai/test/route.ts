import { audit } from "@/lib/audit";
import { getProvider } from "@/lib/ai/engine";
import { adminOnly, clientIp, json, limit } from "@/lib/http";
import { getAiConfig } from "@/lib/settings";

export const maxDuration = 60;

/** Redacts anything that looks like an API key before it reaches the browser or logs. */
const redact = (s: string) => s.replace(/(sk-|AIza)[^\s"]*/g, "$1•••").slice(0, 300);

// Tests the SAVED configuration with a tiny prompt.
export const POST = adminOnly(async (admin, req: Request) => {
  await limit(`admin-ai-test:${admin.id}`, 5, 60_000, "Terlalu sering tes koneksi.");
  const cfg = await getAiConfig();
  const t0 = Date.now();
  try {
    const provider = await getProvider();
    const raw = await provider.generate({
      system: "Balas HANYA dengan JSON valid.",
      user: 'Balas dengan objek JSON {"ok": true}',
      // Mock ignores the prompt; real providers only use system/user.
      task: { section: "all", brief: { productName: "tes", description: "", category: "", benefits: "", targetAudience: "", platform: "TikTok", duration: 15, style: "Cinematic", objective: "Sales", language: "id", ctaStyle: "Direct Selling" }, strategy: { sceneCount: 4, hookWindowSec: 3, pacing: "Fast", cutFrequency: "", preferredHookTypes: ["Curiosity", "Problem", "Direct selling", "FOMO"], ctaFocus: "", benefits: [], assumptions: [], captionRules: "" } },
    });
    const ok = provider.name === "mock" || /\{[\s\S]*\}/.test(raw);
    await audit("admin.ai_test", { actor: admin, meta: { provider: cfg.provider, ok }, ip: clientIp(req) });
    return json({ ok, provider: provider.name, ms: Date.now() - t0, message: ok ? "Koneksi berhasil" : "Provider membalas, tapi bukan JSON" });
  } catch (e) {
    await audit("admin.ai_test", { actor: admin, meta: { provider: cfg.provider, ok: false }, ip: clientIp(req) });
    return json({ ok: false, provider: cfg.provider, ms: Date.now() - t0, message: redact((e as Error).message) });
  }
});
