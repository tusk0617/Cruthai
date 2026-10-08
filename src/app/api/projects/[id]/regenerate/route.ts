import { z } from "zod";
import { regenerateSection } from "@/lib/ai/engine";
import { SECTIONS, planEditSchema, type Plan } from "@/lib/ai/schema";
import { getProject, logGeneration } from "@/lib/db/repo";
import { authed, fail, json, limit, readJson } from "@/lib/http";

export const maxDuration = 60;

const body = z.object({ section: z.enum(SECTIONS), plan: planEditSchema.optional() });

// The client sends its current (possibly unsaved) plan so manual edits are respected as context.
// It is fully validated here — it ends up inside an LLM prompt.
export const POST = authed(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await limit(`regen:${user.id}`, 20, 60_000, "Terlalu banyak regenerate.");
  await limit(`regen-day:${user.id}`, 300, 24 * 60 * 60_000, "Batas regenerate harian tercapai.");
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success) return fail("Data tidak valid");
  const project = await getProject(user.id, (await params).id); // ownership check
  if (!project) return fail("Project tidak ditemukan", 404);
  try {
    const { patch, provider } = await regenerateSection(project.brief, (parsed.data.plan as Plan | undefined) ?? project.plan, parsed.data.section);
    await logGeneration(user.id, project.id, parsed.data.section, provider, 1);
    return json({ patch });
  } catch (e) {
    console.error(e);
    return fail("Gagal regenerate. Coba lagi.", 502);
  }
});
