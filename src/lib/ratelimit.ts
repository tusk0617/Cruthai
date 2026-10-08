// Rate limiter with two backends:
//  - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set — required on Vercel/serverless,
//    where every request can land on a different instance.
//  - In-memory sliding window otherwise (fine for local dev or a single long-running server).
const g = globalThis as unknown as { __clipplanRl?: Map<string, number[]> };
const store = (g.__clipplanRl ??= new Map<string, number[]>());

type Result = { ok: boolean; retryAfter: number };

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000)) };
  }
  hits.push(now);
  store.set(key, hits);
  if (store.size > 20_000) for (const [k, v] of store) if (!v.some((t) => now - t < windowMs)) store.delete(k); // bound memory
  return { ok: true, retryAfter: 0 };
}

/** Fixed window counter in Redis: INCR, set expiry on first hit, read TTL. */
async function upstashLimit(url: string, token: string, key: string, limit: number, windowMs: number): Promise<Result> {
  const k = `clipplan:rl:${key}`;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", k], ["PEXPIRE", k, windowMs, "NX"], ["PTTL", k]]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const out = (await res.json()) as { result: number }[];
  const count = out[0].result;
  const ttl = out[2].result;
  return count > limit ? { ok: false, retryAfter: Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000)) } : { ok: true, retryAfter: 0 };
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await upstashLimit(url.replace(/\/$/, ""), token, key, limit, windowMs);
    } catch (e) {
      console.error("[ratelimit] Upstash gagal, fallback ke memori", e); // fail-open to local limiter rather than locking everyone out
    }
  }
  return memoryLimit(key, limit, windowMs);
}
