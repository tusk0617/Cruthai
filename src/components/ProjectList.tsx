"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectSummary } from "@/lib/db/repo";

const STATUS: Record<string, string> = { draft: "Draft", ready: "Siap shooting", shooting: "Shooting", done: "Selesai" };

export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, fn: () => Promise<Response>) {
    setBusy(id);
    const res = await fn();
    setBusy(null);
    if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Gagal");
    router.refresh();
  }

  if (projects.length === 0)
    return (
      <div className="card py-12 text-center">
        <p className="font-medium">Belum ada project</p>
        <p className="mt-1 text-sm text-sub">Mulai dari satu produk — dapatkan plan shooting lengkap dalam hitungan detik.</p>
        <Link href="/projects/new" className="btn-primary mt-4">Create Project</Link>
      </div>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <div key={p.id} className={"card flex flex-col " + (busy === p.id ? "opacity-60" : "")}>
          <div className="mb-3 flex items-start justify-between gap-2">
            <Link href={`/projects/${p.id}`} className="font-semibold leading-snug hover:text-brand">{p.name}</Link>
            <span className="chip shrink-0">{STATUS[p.status] ?? p.status}</span>
          </div>
          <p className="text-sm text-sub">{p.productName}</p>
          <p className="mt-1 text-xs text-sub">{p.platform} · diubah {new Date(p.updatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Link href={`/projects/${p.id}`} className="btn-primary btn-sm">Open</Link>
            <button className="btn-ghost btn-sm" onClick={() => act(p.id, () => fetch(`/api/projects/${p.id}/duplicate`, { method: "POST" }))}>Duplicate</button>
            <button className="btn-ghost btn-sm" onClick={() => {
              const name = prompt("Nama baru project:", p.name)?.trim();
              if (name) act(p.id, () => fetch(`/api/projects/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }));
            }}>Rename</button>
            <button className="btn-ghost btn-sm text-red-600" onClick={() => {
              if (confirm(`Hapus "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) act(p.id, () => fetch(`/api/projects/${p.id}`, { method: "DELETE" }));
            }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
