import { z } from "zod";
import { audit } from "@/lib/audit";
import { burnPasswordCheck, setSession, verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db/repo";
import { clientIp, fail, json, limit, publicRoute, readJson } from "@/lib/http";

const body = z.object({ email: z.string().trim().email().max(200), password: z.string().min(1).max(200) });
const BAD = "Email atau password salah";

export const POST = publicRoute(async (req) => {
  const ip = clientIp(req);
  const p = body.safeParse(await readJson(req, 10_000));
  if (!p.success) return fail(BAD, 401);
  const email = p.data.email.toLowerCase();
  // Brute-force protection: per IP and per (IP, account).
  await limit(`login-ip:${ip}`, 30, 15 * 60_000, "Terlalu banyak percobaan masuk.");
  await limit(`login:${ip}:${email}`, 8, 15 * 60_000, "Terlalu banyak percobaan masuk.");

  const u = await getUserByEmail(email);
  const valid = u ? await verifyPassword(p.data.password, u.password_hash) : (await burnPasswordCheck(p.data.password), false);
  if (!u || !valid) {
    await audit("auth.login_failed", { ip, meta: { email } });
    return fail(BAD, 401);
  }
  if (u.disabled) {
    await audit("auth.login_blocked", { actor: { id: u.id, email }, ip });
    return fail("Akun dinonaktifkan. Hubungi admin.", 403);
  }
  await setSession(u.id);
  await audit("auth.login", { actor: { id: u.id, email }, ip });
  return json({ ok: true });
});
