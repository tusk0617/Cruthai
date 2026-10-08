import { z } from "zod";
import { audit } from "@/lib/audit";
import { adminOnly, clientIp, fail, json, limit, readJson } from "@/lib/http";
import { getAiConfig, getAiStatus, saveAiConfig } from "@/lib/settings";

export const GET = adminOnly(async () => json(await getAiStatus()));

const key = z.string().trim().min(10).max(300).regex(/^[\x21-\x7E]+$/, "Key mengandung karakter tidak valid");
const model = z.string().trim().min(2).max(80).regex(/^[\w.\-:/]+$/, "Nama model tidak valid");
const body = z.object({
  provider: z.enum(["mock", "openai", "gemini"]).optional(),
  openaiModel: model.optional(), geminiModel: model.optional(),
  openaiKey: key.optional(), geminiKey: key.optional(),
  clearKey: z.enum(["openai", "gemini"]).optional(),
});

export const PUT = adminOnly(async (admin, req: Request) => {
  await limit(`admin-ai:${admin.id}`, 20, 60_000);
  const p = body.safeParse(await readJson(req, 10_000));
  if (!p.success) return fail(p.error.issues[0].message);
  const d = p.data;

  // A provider can only be activated if a key will exist afterwards.
  if (d.provider === "openai" || d.provider === "gemini") {
    const cfg = await getAiConfig();
    const will = d.provider === "openai"
      ? (d.openaiKey || (cfg.openaiKey && d.clearKey !== "openai"))
      : (d.geminiKey || (cfg.geminiKey && d.clearKey !== "gemini"));
    if (!will) return fail(`Isi API key ${d.provider === "openai" ? "OpenAI" : "Gemini"} dulu sebelum mengaktifkannya`);
  }
  const changed = await saveAiConfig(d);
  // Audit records WHAT changed, never the secret itself.
  await audit("admin.ai_update", { actor: admin, targetType: "settings", targetId: "ai", meta: { changed, provider: d.provider }, ip: clientIp(req) });
  return json({ ok: true, status: await getAiStatus() });
});
