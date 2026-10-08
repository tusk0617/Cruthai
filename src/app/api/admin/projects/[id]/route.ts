import { audit } from "@/lib/audit";
import { adminDeleteProject } from "@/lib/db/admin";
import { adminOnly, clientIp, json } from "@/lib/http";

export const DELETE = adminOnly(async (admin, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  await adminDeleteProject(id);
  await audit("admin.project_delete", { actor: admin, targetType: "project", targetId: id, ip: clientIp(req) });
  return json({ ok: true });
});
