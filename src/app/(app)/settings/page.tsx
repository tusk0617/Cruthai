import { PLANS, formatIdr, getPlan } from "@/config/pricing";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireUser } from "@/lib/auth";

export default async function Settings() {
  const user = await requireUser();
  const plan = getPlan(user.plan);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="card space-y-2">
        <h2 className="font-semibold">Akun</h2>
        <p className="text-sm"><span className="text-sub">Nama:</span> {user.name}</p>
        <p className="text-sm"><span className="text-sub">Email:</span> {user.email}</p>
        <div className="flex items-center gap-2 pt-1 text-sm"><span className="text-sub">Tema:</span><ThemeToggle /></div>
      </section>
      <section className="card space-y-2">
        <h2 className="font-semibold">Paket & kredit</h2>
        <p className="text-sm">Paket saat ini: <b>{plan.name}</b> ({formatIdr(plan.priceIdr)}/bulan)</p>
        <p className="text-sm">Sisa kredit: <b>{user.credits}</b> · 1 kredit = 1 video plan. Regenerate per section gratis.</p>
        <p className="text-xs text-sub">Upgrade belum tersedia di MVP. Paket tersedia: {PLANS.map((p) => p.name).join(", ")}.</p>
      </section>
    </div>
  );
}
