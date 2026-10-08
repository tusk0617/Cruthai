import { requireAdmin } from "@/lib/auth";
import { adminStats } from "@/lib/db/admin";
import { getPlan } from "@/config/pricing";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return <div className="card"><p className="label">{label}</p><p className="text-3xl font-bold">{value}</p>{sub && <p className="text-xs text-sub">{sub}</p>}</div>;
}

function Bars({ title, data }: { title: string; data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold">{title} <span className="font-normal text-sub">· 14 hari</span></p>
      <div className="flex h-28 items-end gap-1" role="img" aria-label={title}>
        {data.map((d) => (
          <div key={d.date} className="group flex flex-1 flex-col items-center justify-end" title={`${d.date}: ${d.count}`}>
            <span className="mb-0.5 text-[10px] text-sub">{d.count || ""}</span>
            <div className="w-full rounded-t bg-brand/80" style={{ height: `${Math.max(d.count ? 6 : 2, (d.count / max) * 80)}px`, opacity: d.count ? 1 : 0.25 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-sub"><span>{data[0].date.slice(5)}</span><span>{data.at(-1)!.date.slice(5)}</span></div>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {entries.length === 0 && <p className="text-sm text-sub">Belum ada data.</p>}
      <ul className="space-y-2">
        {entries.map(([k, n]) => (
          <li key={k} className="text-sm">
            <div className="flex justify-between"><span>{k}</span><span className="text-sub">{n}</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${(n / total) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminOverview() {
  await requireAdmin();
  const s = await adminStats();
  const plans = Object.fromEntries(Object.entries(s.planCounts).map(([k, v]) => [getPlan(k).name, v]));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total user" value={s.totals.users} sub={`${s.totals.active} aktif · ${s.totals.admins} admin`} />
        <Stat label="Project" value={s.totals.projects} />
        <Stat label="Total generate" value={s.totals.generations} sub={`${s.totals.fullGenerations} plan penuh`} />
        <Stat label="Regenerate section" value={s.totals.generations - s.totals.fullGenerations} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Bars title="Sign up baru" data={s.signups} />
        <Bars title="Generate per hari" data={s.generationsPerDay} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Breakdown title="User per paket" data={plans} />
        <Breakdown title="Generate per section" data={s.bySection} />
        <Breakdown title="Generate per provider AI" data={s.byProvider} />
      </div>
    </div>
  );
}
