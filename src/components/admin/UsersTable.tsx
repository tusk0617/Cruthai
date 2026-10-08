"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS } from "@/config/pricing";
import type { AdminUser } from "@/lib/db/admin";

export function UsersTable({ users, meId }: { users: AdminUser[]; meId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function update(id: string, body: Record<string, unknown>) {
    setBusy(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(null);
    if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Gagal");
    router.refresh();
  }

  if (users.length === 0) return <div className="card text-center text-sm text-sub">Tidak ada user.</div>;

  return (
    <div className="space-y-3">
      {users.map((u) => {
        const me = u.id === meId;
        return (
          <div key={u.id} className={"card flex flex-col gap-3 lg:flex-row lg:items-center " + (busy === u.id ? "opacity-60" : "") + (u.disabled ? " bg-muted" : "")}>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {u.name}
                {u.role === "admin" && <span className="chip bg-brand/10 text-brand">Admin</span>}
                {u.disabled && <span className="chip bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">Nonaktif</span>}
                {me && <span className="chip">Kamu</span>}
              </p>
              <p className="truncate text-sm text-sub">{u.email}</p>
              <p className="text-xs text-sub">Daftar {new Date(u.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} · {u.projects} project · {u.generations} generate</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="input w-auto py-1.5 text-xs" value={u.plan} aria-label="Paket" onChange={(e) => update(u.id, { plan: e.target.value })}>
                {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="chip">⚡ {u.credits}</span>
              <button className="btn-ghost btn-sm" onClick={() => update(u.id, { addCredits: 10 })}>+10</button>
              <button className="btn-ghost btn-sm" onClick={() => {
                const v = prompt(`Set kredit untuk ${u.email}:`, String(u.credits));
                if (v !== null && v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= 0) update(u.id, { credits: Number(v) });
              }}>Set</button>
              <button className="btn-ghost btn-sm" disabled={me} onClick={() => update(u.id, { role: u.role === "admin" ? "user" : "admin" })}>
                {u.role === "admin" ? "Cabut admin" : "Jadikan admin"}
              </button>
              <button className={"btn-ghost btn-sm " + (u.disabled ? "" : "text-red-600")} disabled={me} onClick={() => {
                if (u.disabled || confirm(`Nonaktifkan ${u.email}? User tidak bisa masuk lagi.`)) update(u.id, { disabled: !u.disabled });
              }}>{u.disabled ? "Aktifkan" : "Nonaktifkan"}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
