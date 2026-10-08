import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLANS, formatIdr } from "@/config/pricing";

const steps = [
  ["1", "Enter Your Product", "Isi nama produk, audiens, platform, dan gaya konten. Cukup satu form singkat."],
  ["2", "Generate Your Plan", "crutha.ai menyusun hook, script per timestamp, scene, shot list, dan editing guide."],
  ["3", "Shoot & Edit", "Centang shot saat merekam, lalu kirim plan ke editor. Tanpa bolak-balik brief."],
];
const why = [
  ["Better hooks", "3–5 hook per video dengan tipe berbeda; fokus retention di 3 detik pertama."],
  ["Faster scripting", "Script berbasis timestamp dengan voice over dan on-screen text."],
  ["Clear shot lists", "Checklist shooting yang bisa dicentang satu per satu."],
  ["Editor-ready plans", "Tabel scene lengkap: kamera, transisi, SFX, dan catatan editing."],
  ["Made for short-form", "TikTok, Reels, dan Shorts — dengan aturan caption dan hook per platform."],
  ["Tidak mengarang klaim", "AI hanya memakai benefit yang kamu berikan dan menyebut asumsinya."],
];

export default function Landing() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="flex items-center gap-1.5 text-sm sm:gap-2">
          <a href="#pricing" className="hidden px-3 text-sub hover:text-ink sm:inline">Pricing</a>
          <ThemeToggle />
          <Link href="/login" className="btn-ghost btn-sm sm:px-4 sm:py-2 sm:text-sm">Masuk</Link>
          <Link href="/signup" className="btn-primary btn-sm sm:px-4 sm:py-2 sm:text-sm">Start Creating</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-20 pt-16 text-center">
        <span className="chip mb-5">AI Pre-Production Planner for Short-Form Video</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-6xl">Turn Your Product Into a Shoot-Ready Video Plan.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-sub">
          Generate hooks, scripts, scenes, shot lists, and editing directions for TikTok, Reels, and Shorts.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3">Start Creating</Link>
          <a href="#example" className="btn-ghost px-6 py-3">See Example</a>
        </div>
        <p className="mt-4 text-sm text-sub">Plan the video before you shoot it.</p>
      </section>

      <section id="example" className="mx-auto max-w-4xl px-5 pb-20">
        <div className="card overflow-hidden p-0">
          <div className="border-b border-line bg-muted px-5 py-3 text-sm font-medium">Contoh output — Parfum lokal · TikTok · 15 detik</div>
          <div className="grid gap-px bg-line sm:grid-cols-2">
            <div className="bg-surface p-5">
              <p className="label">HOOK · Curiosity</p>
              <p className="font-medium">“Ternyata parfum ini beda dari yang gue kira.”</p>
              <p className="mt-3 text-sm text-sub">Visual: close-up botol, perlahan diputar ke kamera.</p>
            </div>
            <div className="bg-surface p-5">
              <p className="label">SCENE BREAKDOWN</p>
              <ul className="space-y-1.5 text-sm">
                <li><b>0–3s</b> · Close-up · Quick zoom · “Parfum lokal?!”</li>
                <li><b>3–5s</b> · Creator bicara · Hard cut</li>
                <li><b>5–9s</b> · Produk di tangan · Swipe</li>
                <li><b>9–15s</b> · Demo + CTA · Pop text</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <div key={n} className="card">
              <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">{n}</span>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-sub">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold">Why crutha.ai?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(([t, d]) => (
            <div key={t} className="card"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-sub">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="mb-8 text-center text-2xl font-bold">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.id} className={"card flex flex-col " + (p.highlight ? "border-brand ring-2 ring-brand/20" : "")}>
              <h3 className="font-semibold uppercase tracking-wide">{p.name}</h3>
              <p className="mt-2 text-3xl font-bold">{formatIdr(p.priceIdr)}<span className="text-sm font-normal text-sub">/bulan</span></p>
              <p className="mt-1 text-sm text-sub">{p.tagline}</p>
              <ul className="my-4 flex-1 space-y-1.5 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
              <Link href="/signup" className={p.highlight ? "btn-primary" : "btn-ghost"}>Pilih {p.name}</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-sub">
        © {new Date().getFullYear()} crutha.ai — From Product Brief to Shoot-Ready Video Plan.
      </footer>
    </div>
  );
}
