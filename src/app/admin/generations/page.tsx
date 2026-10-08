import { requireAdmin } from "@/lib/auth";
import { adminListGenerations } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export default async function AdminGenerations() {
  await requireAdmin();
  const rows = await adminListGenerations(200);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Generation History <span className="text-base font-normal text-sub">(200 terbaru)</span></h1>
      {rows.length === 0 ? <div className="card text-center text-sm text-sub">Belum ada generate.</div> : (
        <div className="overflow-x-auto rounded-xl2 border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-xs text-sub"><tr>{["Waktu", "User", "Project", "Section", "Provider", "Percobaan"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="whitespace-nowrap px-3 py-2 text-sub">{new Date(r.at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-3 py-2">{r.user}</td><td className="px-3 py-2">{r.project}</td>
                  <td className="px-3 py-2"><span className="chip">{r.section}</span></td><td className="px-3 py-2">{r.provider}</td><td className="px-3 py-2">{r.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
