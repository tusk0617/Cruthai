"use client";

import { useRouter } from "next/navigation";
import type { AdminProject } from "@/lib/db/admin";

export function AdminProjectsTable({ projects }: { projects: AdminProject[] }) {
  const router = useRouter();
  if (projects.length === 0) return <div className="card text-center text-sm text-sub">Tidak ada project.</div>;
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="card flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-sub">{p.productName} · {p.platform} · {p.status}</p>
            <p className="truncate text-xs text-sub">Owner: {p.owner} ({p.ownerEmail}) · {new Date(p.updatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          <button className="btn-ghost btn-sm text-red-600" onClick={async () => {
            if (!confirm(`Hapus project "${p.name}" milik ${p.owner}? Tidak bisa dibatalkan.`)) return;
            const res = await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
            if (!res.ok) alert("Gagal menghapus");
            router.refresh();
          }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
