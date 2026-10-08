import { audit } from "@/lib/audit";
import { duplicateProject } from "@/lib/db/repo";
import { authed, clientIp, fail, json, limit } from "@/lib/http";

export const POST = authed(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await limit(`dup:${user.id}`, 20, 60_000);
  const src = (await params).id;
  const id = await duplicateProject(user.id, src);
  if (!id) return fail("Project tidak ditemukan", 404);
  await audit("project.duplicate", { actor: user, targetType: "project", targetId: id, meta: { from: src }, ip: clientIp(req) });
  return json({ id });
});
