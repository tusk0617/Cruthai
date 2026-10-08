import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** CSRF defence in depth (on top of SameSite=Lax): browsers always send Origin on cross-site writes. */
export function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let ok = false;
  try { ok = new URL(origin).host === host; } catch { /* malformed origin */ }
  if (!ok) throw new HttpError(403, "Origin tidak diizinkan");
}

/** Throws 429 when the bucket is exhausted. */
export async function limit(key: string, max: number, windowMs: number, message = "Terlalu banyak permintaan. Coba lagi sebentar.") {
  const r = await rateLimit(key, max, windowMs);
  if (!r.ok) throw new HttpError(429, `${message} (coba lagi dalam ${r.retryAfter} detik)`);
}

/** Reads a JSON body with a hard size cap; malformed JSON becomes {} so zod reports a validation error. */
export async function readJson(req: Request, max = 256_000): Promise<unknown> {
  if (Number(req.headers.get("content-length") ?? 0) > max) throw new HttpError(413, "Request terlalu besar");
  const text = await req.text();
  if (text.length > max) throw new HttpError(413, "Request terlalu besar");
  try { return JSON.parse(text); } catch { return {}; }
}

function toResponse(e: unknown) {
  if (e instanceof HttpError) return fail(e.message, e.status);
  console.error(e);
  return fail("Terjadi kesalahan pada server", 500); // never leak internals to the client
}

/** Public (unauthenticated) route: origin check + error mapping. */
export function publicRoute(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try { assertSameOrigin(req); return await fn(req); } catch (e) { return toResponse(e); }
  };
}

/** Authenticated route: session, origin check, per-user rate limit (120 req/min), error mapping. */
export function authed<A extends unknown[]>(fn: (user: SessionUser, ...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      const req = args[0] as Request;
      assertSameOrigin(req);
      const user = await getSessionUser();
      if (!user) return fail("Belum login", 401);
      await limit(`api:${user.id}`, 120, 60_000);
      return await fn(user, ...args);
    } catch (e) {
      return toResponse(e);
    }
  };
}

/** Like authed(), but RBAC: admins only. Role is re-read from the DB on every request. */
export function adminOnly<A extends unknown[]>(fn: (user: SessionUser, ...args: A) => Promise<Response>) {
  return authed<A>(async (user, ...args) => (user.isAdmin ? fn(user, ...args) : fail("Khusus admin", 403)));
}
