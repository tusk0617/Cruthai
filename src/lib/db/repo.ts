import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { Brief, Plan } from "@/lib/ai/schema";
import { query, tx } from "./index";

export interface UserRow { id: string; email: string; name: string; password_hash: string; plan: string; credits: number; role: string; disabled: boolean }

export const getUserByEmail = async (email: string) =>
  (await query<UserRow>("select * from users where email = $1", [email.toLowerCase()]))[0];
export const getUserById = async (id: string) => (await query<UserRow>("select * from users where id = $1", [id]))[0];

export async function createUser(email: string, name: string, passwordHash: string, credits: number) {
  const id = randomUUID();
  await query("insert into users (id, email, name, password_hash, plan, credits) values ($1,$2,$3,$4,'free',$5)", [id, email.toLowerCase(), name, passwordHash, credits]);
  return id;
}

/** Atomically takes credits; returns false when the balance is too low. */
export async function spendCredits(userId: string, n: number): Promise<boolean> {
  const u = await getUserById(userId);
  if (!u || u.credits < n) return false;
  await query("update users set credits = credits - $1 where id = $2", [n, userId]);
  return true;
}
export const refundCredits = (userId: string, n: number) => query("update users set credits = credits + $1 where id = $2", [n, userId]);

export interface ProjectSummary {
  id: string; name: string; productName: string; platform: string; status: string; updatedAt: string; mode: string;
}

export async function listProjects(userId: string, search = ""): Promise<ProjectSummary[]> {
  const rows = await query(
    "select id, name, mode, status, brief, updated_at from projects where user_id = $1 order by updated_at desc", [userId]);
  const q = search.trim().toLowerCase();
  return rows
    .map((r) => ({ id: r.id, name: r.name, mode: r.mode, productName: r.brief.productName, platform: r.brief.platform, status: r.status, updatedAt: new Date(r.updated_at).toISOString() }))
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q));
}

async function writePlan(c: PoolClient, projectId: string, brief: Brief, plan: Plan) {
  for (const t of ["products", "video_concepts", "hooks", "scripts", "scenes", "shot_lists", "ctas"])
    await c.query(`delete from ${t} where project_id = $1`, [projectId]);

  await c.query("insert into products (id, project_id, name, description, category, benefits, target_audience) values ($1,$2,$3,$4,$5,$6,$7)",
    [randomUUID(), projectId, brief.productName, brief.description, brief.category, brief.benefits, brief.targetAudience]);
  const k = plan.concept;
  await c.query("insert into video_concepts (id, project_id, title, concept, target_audience, objective, tone, angle, editing_guide, assumptions) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [randomUUID(), projectId, k.title, k.concept, k.targetAudience, k.objective, k.tone, k.angle, JSON.stringify(plan.editingGuide), JSON.stringify(plan.assumptions)]);
  for (const [i, h] of plan.hooks.entries())
    await c.query("insert into hooks (id, project_id, position, text, visual, voice_over, type) values ($1,$2,$3,$4,$5,$6,$7)", [h.id, projectId, i, h.text, h.visual, h.voiceOver, h.type]);
  await c.query("insert into scripts (id, project_id, segments, caption, hashtags) values ($1,$2,$3,$4,$5)",
    [randomUUID(), projectId, JSON.stringify(plan.script), plan.caption, JSON.stringify(plan.hashtags)]);
  for (const [i, s] of plan.scenes.entries())
    await c.query("insert into scenes (id, project_id, position, start_sec, end_sec, scene, visual, camera_shot, camera_movement, voice_over, on_screen_text, b_roll, transition, sfx, editing_notes) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
      [s.id, projectId, i, Math.round(s.startSec), Math.round(s.endSec), s.scene, s.visual, s.cameraShot, s.cameraMovement, s.voiceOver, s.onScreenText, s.bRoll, s.transition, s.sfx, s.editingNotes]);
  for (const [i, s] of plan.shotList.entries())
    await c.query("insert into shot_lists (id, project_id, position, name, shot_type, purpose, duration_sec, camera_angle, done) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [s.id, projectId, i, s.name, s.shotType, s.purpose, Math.round(s.durationSec), s.cameraAngle, !!s.done]);
  for (const [i, s] of plan.ctas.entries())
    await c.query("insert into ctas (id, project_id, position, style, text) values ($1,$2,$3,$4,$5)", [s.id, projectId, i, s.style, s.text]);
  await c.query("update projects set selected_hook_id = $1, selected_cta_id = $2, updated_at = now() where id = $3", [plan.selectedHookId, plan.selectedCtaId, projectId]);
}

export async function createProject(userId: string, brief: Brief, plan: Plan, name?: string) {
  const id = randomUUID();
  await tx(async (c) => {
    await c.query("insert into projects (id, user_id, name, mode, status, brief) values ($1,$2,$3,'product','draft',$4)",
      [id, userId, name || plan.concept.title || brief.productName, JSON.stringify(brief)]);
    await writePlan(c, id, brief, plan);
  });
  return id;
}

export interface ProjectFull { id: string; name: string; status: string; brief: Brief; plan: Plan; updatedAt: string }

export async function getProject(userId: string, id: string): Promise<ProjectFull | null> {
  const p = (await query("select * from projects where id = $1 and user_id = $2", [id, userId]))[0];
  if (!p) return null;
  const [vc, hooks, script, scenes, shots, ctas] = await Promise.all([
    query("select * from video_concepts where project_id = $1", [id]),
    query("select * from hooks where project_id = $1 order by position", [id]),
    query("select * from scripts where project_id = $1", [id]),
    query("select * from scenes where project_id = $1 order by position", [id]),
    query("select * from shot_lists where project_id = $1 order by position", [id]),
    query("select * from ctas where project_id = $1 order by position", [id]),
  ]);
  const v = vc[0], s = script[0];
  const plan: Plan = {
    concept: { title: v.title, concept: v.concept, targetAudience: v.target_audience, objective: v.objective, tone: v.tone, angle: v.angle },
    hooks: hooks.map((h) => ({ id: h.id, text: h.text, visual: h.visual, voiceOver: h.voice_over, type: h.type })),
    selectedHookId: p.selected_hook_id,
    script: s.segments,
    scenes: scenes.map((r) => ({ id: r.id, startSec: r.start_sec, endSec: r.end_sec, scene: r.scene, visual: r.visual, cameraShot: r.camera_shot, cameraMovement: r.camera_movement, voiceOver: r.voice_over, onScreenText: r.on_screen_text, bRoll: r.b_roll, transition: r.transition, sfx: r.sfx, editingNotes: r.editing_notes })),
    shotList: shots.map((r) => ({ id: r.id, name: r.name, shotType: r.shot_type, purpose: r.purpose, durationSec: r.duration_sec, cameraAngle: r.camera_angle, done: r.done })),
    editingGuide: v.editing_guide,
    ctas: ctas.map((r) => ({ id: r.id, style: r.style, text: r.text })),
    selectedCtaId: p.selected_cta_id,
    caption: s.caption, hashtags: s.hashtags, assumptions: v.assumptions,
  };
  return { id: p.id, name: p.name, status: p.status, brief: p.brief, plan, updatedAt: new Date(p.updated_at).toISOString() };
}

export async function savePlan(userId: string, id: string, plan: Plan, meta: { name?: string; status?: string }) {
  const p = await getProject(userId, id);
  if (!p) return false;
  await tx(async (c) => {
    await writePlan(c, id, p.brief, plan);
    if (meta.name) await c.query("update projects set name = $1 where id = $2", [meta.name, id]);
    if (meta.status) await c.query("update projects set status = $1 where id = $2", [meta.status, id]);
  });
  return true;
}

export async function renameProject(userId: string, id: string, name: string) {
  await query("update projects set name = $1, updated_at = now() where id = $2 and user_id = $3", [name, id, userId]);
}
export async function deleteProject(userId: string, id: string) {
  await query("delete from projects where id = $1 and user_id = $2", [id, userId]);
}

export async function duplicateProject(userId: string, id: string) {
  const p = await getProject(userId, id);
  if (!p) return null;
  // Fresh ids for every child row; remap selections.
  const remap = new Map<string, string>();
  const fresh = <T extends { id: string }>(xs: T[]) => xs.map((x) => { const n = randomUUID(); remap.set(x.id, n); return { ...x, id: n }; });
  const plan: Plan = { ...p.plan, hooks: fresh(p.plan.hooks), script: fresh(p.plan.script), scenes: fresh(p.plan.scenes), shotList: fresh(p.plan.shotList), ctas: fresh(p.plan.ctas) };
  plan.selectedHookId = p.plan.selectedHookId ? remap.get(p.plan.selectedHookId) ?? null : null;
  plan.selectedCtaId = p.plan.selectedCtaId ? remap.get(p.plan.selectedCtaId) ?? null : null;
  return createProject(userId, p.brief, plan, `${p.name} (copy)`);
}

export const logGeneration = (userId: string, projectId: string | null, section: string, provider: string, attempts: number) =>
  query("insert into generation_history (id, project_id, user_id, section, provider, attempts) values ($1,$2,$3,$4,$5,$6)", [randomUUID(), projectId, userId, section, provider, attempts]);
