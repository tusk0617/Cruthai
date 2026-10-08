import { z } from "zod";
import { PLANS } from "@/config/pricing";
import { audit } from "@/lib/audit";
import { adminUpdateUser } from "@/lib/db/admin";
import { getUserById } from "@/lib/db/repo";
import { adminOnly, clientIp, fail, json, readJson } from "@/lib/http";

const body = z.object({
  plan: z.enum(PLANS.map((p) => p.id) as [string, ...string[]]).optional(),
  credits: z.number().int().min(0).max(1_000_000).optional(),
  addCredits: z.number().int().min(-1_000_000).max(1_000_000).optional(),
  role: z.enum(["user", "admin"]).optional(),
  disabled: z.boolean().optional(),
});

export const PATCH = adminOnly(async (admin, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const p = body.safeParse(await readJson(req, 10_000));
  if (!p.success) return fail("Data tidak valid");
  const target = await getUserById(id);
  if (!target) return fail("User tidak ditemukan", 404);
  if (id === admin.id && (p.data.disabled === true || p.data.role === "user"))
    return fail("Tidak bisa menonaktifkan atau menurunkan akun admin sendiri");
  await adminUpdateUser(id, p.data);
  await audit("admin.user_update", { actor: admin, targetType: "user", targetId: id, meta: { email: target.email, changes: p.data }, ip: clientIp(req) });
  return json({ ok: true });
});
