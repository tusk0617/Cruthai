import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById, type UserRow } from "@/lib/db/repo";

const COOKIE = "cp_session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET wajib diisi di production");
  if (s && process.env.NODE_ENV === "production" && s.length < 32) throw new Error("AUTH_SECRET minimal 32 karakter");
  return new TextEncoder().encode(s || "dev-only-secret-change-me-dev-only-secret");
};

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
/** Burns the same CPU as a real check so login timing does not reveal which emails exist. */
const dummyHash = bcrypt.hash("clipplan-dummy-password", 10);
export const burnPasswordCheck = async (p: string) => { await bcrypt.compare(p, await dummyHash); };
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function setSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }

export type SessionUser = Pick<UserRow, "id" | "email" | "name" | "plan" | "credits"> & { isAdmin: boolean };

/** Admins = users with role=admin in DB, or emails listed in ADMIN_EMAILS (comma separated). */
export const isAdminUser = (u: Pick<UserRow, "email" | "role">) =>
  u.role === "admin" || (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((x) => x.trim()).filter(Boolean).includes(u.email.toLowerCase());

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const u = payload.sub ? await getUserById(payload.sub) : null;
    return u && !u.disabled ? { id: u.id, email: u.email, name: u.name, plan: u.plan, credits: u.credits, isAdmin: isAdminUser(u) } : null;
  } catch { return null; }
}

export async function requireAdmin() {
  const u = await requireUser();
  if (!u.isAdmin) redirect("/dashboard");
  return u;
}

/** For server components/pages. */
export async function requireUser() {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  return u;
}
