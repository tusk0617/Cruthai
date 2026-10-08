import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// AES-256-GCM for secrets stored in the DB (API keys). Key is derived from AUTH_SECRET.
// NOTE: rotating AUTH_SECRET makes stored keys undecryptable — admins must re-enter them.
const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET wajib diisi di production");
  return createHash("sha256").update(s || "dev-only-secret-change-me-dev-only-secret").digest();
};

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload: string): string | undefined {
  try {
    const [iv, tag, ct] = payload.split(".").map((p) => Buffer.from(p, "base64"));
    const d = createDecipheriv("aes-256-gcm", key(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
  } catch {
    return undefined;
  }
}
