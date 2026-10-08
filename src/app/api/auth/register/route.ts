import { z } from "zod";
import { DEFAULT_PLAN, getPlan } from "@/config/pricing";
import { audit } from "@/lib/audit";
import { hashPassword, setSession } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/db/repo";
import { clientIp, fail, json, limit, publicRoute, readJson } from "@/lib/http";

const body = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(200),
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password maksimal 72 karakter"), // bcrypt limit
});

export const POST = publicRoute(async (req) => {
  const ip = clientIp(req);
  await limit(`register:${ip}`, 5, 60 * 60_000, "Terlalu banyak pendaftaran dari jaringan ini.");
  const p = body.safeParse(await readJson(req, 10_000));
  if (!p.success) return fail(p.error.issues[0].message);
  if (await getUserByEmail(p.data.email)) {
    await audit("auth.register_duplicate", { ip, meta: { email: p.data.email.toLowerCase() } });
    return fail("Email sudah terdaftar", 409);
  }
  const id = await createUser(p.data.email, p.data.name, await hashPassword(p.data.password), getPlan(DEFAULT_PLAN).creditsPerMonth);
  await setSession(id);
  await audit("auth.register", { actor: { id, email: p.data.email.toLowerCase() }, ip });
  return json({ ok: true });
});
