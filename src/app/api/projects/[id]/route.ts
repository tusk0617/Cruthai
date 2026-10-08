import { z } from "zod";
import { planEditSchema, type Plan } from "@/lib/ai/schema";
import { audit } from "@/lib/audit";
import { deleteProject, getProject, renameProject, savePlan } from "@/lib/db/repo";
import { authed, clientIp, fail, json, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Ownership: every repo call below is scoped by user.id, so another user's project id behaves as "not found".
export const GET = authed(async (user, _req: Request, { params }: Ctx) => {
  const p = await getProject(user.id, (await params).id);
  return p ? json(p) : fail("Project tidak ditemukan", 404);
});

const putBody = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["draft", "ready", "shooting", "done"]).optional(),
  plan: planEditSchema,
});

export const PUT = authed(async (user, req: Request, { params }: Ctx) => {
  const p = putBody.safeParse(await readJson(req));
  if (!p.success) return fail("Data tidak valid: " + p.error.issues[0].path.join(".") + " " + p.error.issues[0].message);
  const ok = await savePlan(user.id, (await params).id, p.data.plan as Plan, { name: p.data.name, status: p.data.status });
  return ok ? json({ ok: true, savedAt: new Date().toISOString() }) : fail("Project tidak ditemukan", 404);
});

export const PATCH = authed(async (user, req: Request, { params }: Ctx) => {
  const id = (await params).id;
  const name = z.string().trim().min(1).max(120).safeParse(((await readJson(req)) as { name?: unknown }).name);
  if (!name.success) return fail("Nama tidak valid");
  if (!(await getProject(user.id, id))) return fail("Project tidak ditemukan", 404);
  await renameProject(user.id, id, name.data);
  await audit("project.rename", { actor: user, targetType: "project", targetId: id, ip: clientIp(req) });
  return json({ ok: true });
});

export const DELETE = authed(async (user, req: Request, { params }: Ctx) => {
  const id = (await params).id;
  if (!(await getProject(user.id, id))) return fail("Project tidak ditemukan", 404);
  await deleteProject(user.id, id);
  await audit("project.delete", { actor: user, targetType: "project", targetId: id, ip: clientIp(req) });
  return json({ ok: true });
});
