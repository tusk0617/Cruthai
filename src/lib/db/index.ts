import type { Pool, PoolClient } from "pg";

export const SCHEMA_SQL = `
create table if not exists users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  plan text not null default 'free',
  credits integer not null default 0,
  role text not null default 'user',
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists projects (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  mode text not null default 'product',
  status text not null default 'draft',
  brief jsonb not null,
  selected_hook_id text,
  selected_cta_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists products (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default '',
  benefits text not null default '',
  target_audience text not null default ''
);
create table if not exists video_concepts (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  concept text not null,
  target_audience text not null default '',
  objective text not null default '',
  tone text not null default '',
  angle text not null default '',
  editing_guide jsonb not null,
  assumptions jsonb not null
);
create table if not exists hooks (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  position integer not null,
  text text not null,
  visual text not null default '',
  voice_over text not null default '',
  type text not null
);
create table if not exists scripts (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  segments jsonb not null,
  caption text not null default '',
  hashtags jsonb not null
);
create table if not exists scenes (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  position integer not null,
  start_sec integer not null,
  end_sec integer not null,
  scene text not null default '',
  visual text not null default '',
  camera_shot text not null default '',
  camera_movement text not null default '',
  voice_over text not null default '',
  on_screen_text text not null default '',
  b_roll text not null default '',
  transition text not null default '',
  sfx text not null default '',
  editing_notes text not null default ''
);
create table if not exists shot_lists (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  position integer not null,
  name text not null,
  shot_type text not null default '',
  purpose text not null default '',
  duration_sec integer not null default 0,
  camera_angle text not null default '',
  done boolean not null default false
);
create table if not exists ctas (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  position integer not null,
  style text not null,
  text text not null
);
create table if not exists app_settings (
  key text primary key,
  value text not null
);
create table if not exists audit_logs (
  id text primary key,
  actor_id text,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null,
  ip text,
  created_at timestamptz not null default now()
);
create table if not exists generation_history (
  id text primary key,
  project_id text,
  user_id text not null,
  section text not null,
  provider text not null,
  attempts integer not null default 1,
  created_at timestamptz not null default now()
);
`;

const g = globalThis as unknown as { __clipplanPool?: Promise<Pool> };

async function createPool(): Promise<Pool> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: process.env.VERCEL ? 3 : 10 }) // small pool: serverless instances multiply;
    await pool.query(SCHEMA_SQL);
    // Upgrade databases created before the admin panel existed.
    await pool.query("alter table users add column if not exists role text not null default 'user'");
    await pool.query("alter table users add column if not exists disabled boolean not null default false");
    return pool;
  }
  // No DATABASE_URL: in-memory Postgres (pg-mem) so the app runs out of the box. Data resets on restart.
  const { newDb } = await import("pg-mem");
  const mem = newDb();
  mem.public.none(SCHEMA_SQL);
  const { Pool } = mem.adapters.createPg();
  console.warn("[clipplan] DATABASE_URL kosong — memakai Postgres in-memory (data hilang saat restart).");
  return new Pool() as unknown as Pool;
}

export function getPool(): Promise<Pool> {
  if (!g.__clipplanPool) {
    // Don't cache a failed connection forever.
    g.__clipplanPool = createPool().catch((e) => { g.__clipplanPool = undefined; throw e; });
  }
  return g.__clipplanPool;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const pool = await getPool();
  return (await pool.query(text, params as any[])).rows as T[];
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const c = await pool.connect();
  try {
    await c.query("begin");
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
