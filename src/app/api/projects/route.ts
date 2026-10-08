import { generateFullPlan } from "@/lib/ai/engine";
import { briefSchema } from "@/lib/ai/schema";
import { audit } from "@/lib/audit";
import { createProject, listProjects, logGeneration, refundCredits, spendCredits } from "@/lib/db/repo";
import { authed, clientIp, fail, json, limit, readJson } from "@/lib/http";

export const maxDuration = 60;

export const GET = authed(async (user, req: Request) =>
  json(await listProjects(user.id, (new URL(req.url).searchParams.get("q") ?? "").slice(0, 100))));

export const POST = authed(async (user, req: Request) => {
  await limit(`gen:${user.id}`, 10, 60_000, "Terlalu banyak generate.");
  await limit(`gen-day:${user.id}`, 100, 24 * 60 * 60_000, "Batas generate harian tercapai.");
  const parsed = briefSchema.safeParse(((await readJson(req)) as { brief?: unknown }).brief);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (!(await spendCredits(user.id, 1))) return fail("Kredit habis. Upgrade paket untuk lanjut generate.", 402);
  try {
    const { plan, provider, attempts } = await generateFullPlan(parsed.data);
    const id = await createProject(user.id, parsed.data, plan);
    await logGeneration(user.id, id, "all", provider, attempts);
    await audit("project.create", { actor: user, targetType: "project", targetId: id, ip: clientIp(req) });
    return json({ id });
  } catch (e) {
    await refundCredits(user.id, 1);
    console.error(e);
    return fail("Gagal membuat plan. Kredit dikembalikan, coba lagi.", 502);
  }
});
