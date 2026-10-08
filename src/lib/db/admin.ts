import { query } from "./index";

// NOTE: aggregations are done in JS over narrow column selects (works on pg-mem and Postgres).
// Move to SQL GROUP BY once row counts grow large.

const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);
const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => day(new Date(Date.now() - (n - 1 - i) * 86400000)));

const countBy = <T,>(rows: T[], key: (r: T) => string) => {
  const m: Record<string, number> = {};
  for (const r of rows) m[key(r)] = (m[key(r)] ?? 0) + 1;
  return m;
};

export async function adminStats() {
  const [users, projects, gens] = await Promise.all([
    query("select plan, role, disabled, created_at from users"),
    query("select created_at from projects"),
    query("select section, provider, created_at from generation_history"),
  ]);
  const days = lastDays(14);
  const series = (rows: { created_at: string }[]) => {
    const c = countBy(rows, (r) => day(r.created_at));
    return days.map((d) => ({ date: d, count: c[d] ?? 0 }));
  };
  return {
    totals: {
      users: users.length,
      active: users.filter((u) => !u.disabled).length,
      admins: users.filter((u) => u.role === "admin").length,
      projects: projects.length,
      generations: gens.length,
      fullGenerations: gens.filter((g) => g.section === "all").length,
    },
    planCounts: countBy(users, (u) => u.plan),
    bySection: countBy(gens, (g) => g.section),
    byProvider: countBy(gens, (g) => g.provider),
    signups: series(users),
    generationsPerDay: series(gens),
  };
}

export interface AdminUser {
  id: string; name: string; email: string; plan: string; credits: number; role: string; disabled: boolean; createdAt: string; projects: number; generations: number;
}

export async function adminListUsers(search = ""): Promise<AdminUser[]> {
  const [users, projects, gens] = await Promise.all([
    query("select id, name, email, plan, credits, role, disabled, created_at from users order by created_at desc"),
    query("select user_id from projects"),
    query("select user_id from generation_history"),
  ]);
  const pc = countBy(projects, (p) => p.user_id);
  const gc = countBy(gens, (g) => g.user_id);
  const q = search.trim().toLowerCase();
  return users
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .map((u) => ({ id: u.id, name: u.name, email: u.email, plan: u.plan, credits: u.credits, role: u.role, disabled: u.disabled, createdAt: new Date(u.created_at).toISOString(), projects: pc[u.id] ?? 0, generations: gc[u.id] ?? 0 }));
}

export async function adminUpdateUser(id: string, p: { plan?: string; credits?: number; addCredits?: number; role?: string; disabled?: boolean }) {
  if (p.plan !== undefined) await query("update users set plan = $1 where id = $2", [p.plan, id]);
  if (p.credits !== undefined) await query("update users set credits = $1 where id = $2", [p.credits, id]);
  if (p.addCredits) await query("update users set credits = credits + $1 where id = $2", [p.addCredits, id]);
  if (p.role !== undefined) await query("update users set role = $1 where id = $2", [p.role, id]);
  if (p.disabled !== undefined) await query("update users set disabled = $1 where id = $2", [p.disabled, id]);
}

export interface AdminProject { id: string; name: string; productName: string; platform: string; status: string; owner: string; ownerEmail: string; updatedAt: string }

export async function adminListProjects(search = ""): Promise<AdminProject[]> {
  const [projects, users] = await Promise.all([
    query("select id, name, user_id, status, brief, updated_at from projects order by updated_at desc"),
    query("select id, name, email from users"),
  ]);
  const um = new Map(users.map((u) => [u.id, u]));
  const q = search.trim().toLowerCase();
  return projects
    .map((p) => ({ id: p.id, name: p.name, productName: p.brief.productName, platform: p.brief.platform, status: p.status, owner: um.get(p.user_id)?.name ?? "?", ownerEmail: um.get(p.user_id)?.email ?? "", updatedAt: new Date(p.updated_at).toISOString() }))
    .filter((p) => !q || [p.name, p.productName, p.owner, p.ownerEmail].some((x) => x.toLowerCase().includes(q)));
}

export const adminDeleteProject = (id: string) => query("delete from projects where id = $1", [id]);

export async function adminListGenerations(limit = 200) {
  const [gens, users, projects] = await Promise.all([
    query("select id, project_id, user_id, section, provider, attempts, created_at from generation_history order by created_at desc"),
    query("select id, email from users"),
    query("select id, name from projects"),
  ]);
  const um = new Map(users.map((u) => [u.id, u.email]));
  const pm = new Map(projects.map((p) => [p.id, p.name]));
  return gens.slice(0, limit).map((g) => ({
    id: g.id as string, section: g.section as string, provider: g.provider as string, attempts: g.attempts as number,
    user: um.get(g.user_id) ?? "?", project: pm.get(g.project_id) ?? "(dihapus)", at: new Date(g.created_at).toISOString(),
  }));
}

export async function adminListAudit(search = "", limit = 300) {
  const rows = await query("select id, actor_email, action, target_type, target_id, meta, ip, created_at from audit_logs order by created_at desc");
  const q = search.trim().toLowerCase();
  return rows
    .filter((r) => !q || [r.action, r.actor_email ?? "", r.target_id ?? "", r.ip ?? ""].some((x: string) => x.toLowerCase().includes(q)))
    .slice(0, limit)
    .map((r) => ({
      id: r.id as string, actor: (r.actor_email ?? "—") as string, action: r.action as string,
      target: r.target_type ? `${r.target_type}:${String(r.target_id).slice(0, 8)}` : "—",
      meta: JSON.stringify(r.meta ?? {}), ip: (r.ip ?? "—") as string, at: new Date(r.created_at).toISOString(),
    }));
}
