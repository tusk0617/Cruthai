import { requireAdmin } from "@/lib/auth";
import { PLANS, formatIdr } from "@/config/pricing";

export default async function AdminPlans() {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-sm text-sub">Read-only. Ubah harga & kredit di <code className="rounded bg-muted px-1">src/config/pricing.ts</code> — satu-satunya sumber harga.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.id} className="card">
            <h2 className="font-semibold uppercase">{p.name}</h2>
            <p className="mt-1 text-2xl font-bold">{formatIdr(p.priceIdr)}<span className="text-sm font-normal text-sub">/bulan</span></p>
            <p className="mt-1 text-sm text-sub">{p.creditsPerMonth} kredit / bulan</p>
            <ul className="mt-3 space-y-1 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
