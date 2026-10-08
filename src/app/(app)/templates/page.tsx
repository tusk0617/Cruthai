import Link from "next/link";
import { TEMPLATES } from "@/config/templates";

export default function Templates() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Templates</h1><p className="text-sub">Mulai cepat dengan brief yang sudah terisi. Ganti detailnya sesuai produkmu.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="card flex flex-col">
            <h3 className="font-semibold">{t.name}</h3>
            <p className="mt-1 flex-1 text-sm text-sub">{t.description}</p>
            <p className="mt-3 text-xs text-sub">{t.brief.platform} · {t.brief.duration}s · {t.brief.style} · {t.brief.objective}</p>
            <Link href={`/projects/new?template=${t.id}`} className="btn-primary mt-4">Use Template</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
