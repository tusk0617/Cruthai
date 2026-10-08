import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

export interface AuditEntry {
  actor?: { id?: string | null; email?: string | null } | null;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

/** Append-only audit trail. Never throws: auditing must not break the request. Never put secrets in `meta`. */
export async function audit(action: string, e: AuditEntry = {}) {
  try {
    await query(
      "insert into audit_logs (id, actor_id, actor_email, action, target_type, target_id, meta, ip) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [randomUUID(), e.actor?.id ?? null, e.actor?.email ?? null, action, e.targetType ?? null, e.targetId ?? null, JSON.stringify(e.meta ?? {}), e.ip ?? null],
    );
  } catch (err) {
    console.error("[audit] gagal menulis log", err);
  }
}
