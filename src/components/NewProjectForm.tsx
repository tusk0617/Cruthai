"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CTA_STYLES, DURATIONS, LANGUAGES, OBJECTIVES, PLATFORMS, STYLES, type Brief } from "@/lib/ai/schema";

const MODES = [
  { id: "product", title: "Product → Video Plan", desc: "Dari info produk jadi plan video lengkap.", on: true },
  { id: "brief", title: "Brief → Production Plan", desc: "Dari content brief untuk editor.", on: false },
  { id: "footage", title: "Raw Footage → Editing Plan", desc: "Susun urutan dari footage yang ada.", on: false },
  { id: "repurpose", title: "Content Repurpose", desc: "Ubah konten lama jadi beberapa versi.", on: false },
];

const STEPS = ["Menganalisis brief…", "Menyusun strategi konten…", "Menulis hook & script…", "Membuat scene & shot list…", "Merapikan editing guide…"];

export function NewProjectForm({ initial, templateName }: { initial?: Partial<Brief>; templateName?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [more, setMore] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const brief = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setErr(""); setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal generate");
      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch (ex) {
      setErr((ex as Error).message);
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  const sel = (name: string, opts: readonly (string | number)[], def: string | number | undefined, fmt?: (o: any) => string) => (
    <select name={name} defaultValue={def} className="input">{opts.map((o) => <option key={o} value={o}>{fmt ? fmt(o) : o}</option>)}</select>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((m) => (
          <div key={m.id} className={"rounded-xl2 border p-4 " + (m.on ? "border-brand bg-brand/5" : "border-line opacity-60")}>
            <p className="text-sm font-semibold">{m.title}{!m.on && <span className="chip ml-2">Segera</span>}</p>
            <p className="mt-0.5 text-xs text-sub">{m.desc}</p>
          </div>
        ))}
      </div>
      {templateName && <p className="text-sm text-sub">Template: <b>{templateName}</b> — lengkapi detail produk di bawah.</p>}

      <div className="card space-y-4">
        <div><label className="label">Product / Topic *</label>
          <input name="productName" required minLength={2} className="input" placeholder="mis. Parfum lokal Senja 50ml" /></div>
        <div><label className="label">Description</label>
          <textarea name="description" rows={3} className="input" placeholder="Ceritakan produknya: bahan, keunikan, harga, dll. Semakin jelas, semakin akurat." /></div>
        <div><label className="label">Target Audience</label>
          <input name="targetAudience" className="input" placeholder="mis. pria 18–25 tahun, mahasiswa" /></div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="label">Platform</label>{sel("platform", PLATFORMS, initial?.platform ?? "TikTok")}</div>
          <div><label className="label">Duration</label>{sel("duration", DURATIONS, initial?.duration ?? 30, (d) => `${d} sec`)}</div>
          <div><label className="label">Content Style</label>{sel("style", STYLES, initial?.style ?? "Cinematic")}</div>
          <div><label className="label">Objective</label>{sel("objective", OBJECTIVES, initial?.objective ?? "Sales")}</div>
          <div><label className="label">Language</label>
            <select name="language" defaultValue={initial?.language ?? "id"} className="input">{LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></div>
          <div><label className="label">CTA Style</label>{sel("ctaStyle", CTA_STYLES, initial?.ctaStyle ?? "Direct Selling")}</div>
        </div>

        <button type="button" className="text-sm text-brand" onClick={() => setMore(!more)}>{more ? "− Sembunyikan" : "+ Tambah"} detail opsional (kategori & benefit)</button>
        <div className={more ? "space-y-4" : "hidden"}>
          <div><label className="label">Product Category</label><input name="category" className="input" placeholder="mis. parfum, skincare, fashion" /></div>
          <div><label className="label">Product Benefits (hanya ini yang akan diklaim AI)</label>
            <textarea name="benefits" rows={2} className="input" placeholder="mis. wangi woody tahan 6 jam; botol 50ml; harga 199 ribu" /></div>
        </div>
      </div>

      {err && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{err}</p>}
      <button className="btn-primary w-full py-3 text-base" disabled={busy}>
        {busy ? STEPS[step] : "Generate Video Plan"}
      </button>
      <p className="text-center text-xs text-sub">Memakai 1 kredit. Regenerate per section gratis.</p>
    </form>
  );
}
