import { audit } from "@/lib/audit";
import { clearSession, getSessionUser } from "@/lib/auth";
import { clientIp, json, publicRoute } from "@/lib/http";

export const POST = publicRoute(async (req) => {
  const u = await getSessionUser();
  await clearSession();
  if (u) await audit("auth.logout", { actor: { id: u.id, email: u.email }, ip: clientIp(req) });
  return json({ ok: true });
});
