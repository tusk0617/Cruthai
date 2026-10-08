import { requireAdmin } from "@/lib/auth";
import { adminListAudit } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export default async function AdminAudit({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const rows = await adminListAudit(q);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-sub">Login, perubahan akun, dan aksi admin. Append-only. {rows.length} entri terbaru.</p>
        </div>
        <form className="w-full sm:w-72"><input name="q" defaultValue={q} placeholder="Cari aksi / email / IP…" className="input" aria-label="Cari audit log" /></form>
      </div>
      {rows.length === 0 ? <div className="card text-center text-sm text-sub">Belum ada log.</div> : (
        <div className="overflow-x-auto rounded-xl2 border border-line bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted text-xs text-sub"><tr>{["Waktu", "Aktor", "Aksi", "Target", "Detail", "IP"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-sub">{new Date(r.at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" })}</td>
                  <td className="px-3 py-2">{r.actor}</td>
                  <td className="px-3 py-2"><span className={"chip " + (r.action.includes("failed") || r.action.includes("blocked") ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "")}>{r.action}</span></td>
                  <td className="px-3 py-2 text-sub">{r.target}</td>
                  <td className="max-w-[260px] break-words px-3 py-2 font-mono text-xs text-sub">{r.meta === "{}" ? "" : r.meta}</td>
                  <td className="px-3 py-2 text-sub">{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
