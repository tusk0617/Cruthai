import Link from "next/link";
import { PLANS, formatIdr } from "@/config/pricing";
import { LogoMark } from "./Navbar";
import { Reveal } from "./Reveal";

function Head({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="lp-mono mb-3 text-xs uppercase tracking-[0.2em] text-acc2">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-base text-lsub">{sub}</p>}
    </Reveal>
  );
}

/* ───────── Platform strip ───────── */
export function PlatformStrip() {
  return (
    <section aria-label="Platform yang didukung" className="border-y border-lglass/10 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5">
        <span className="lp-mono text-xs uppercase tracking-[0.2em] text-lsub">Dibuat untuk</span>
        {["TikTok", "Instagram Reels", "YouTube Shorts"].map((p) => <span key={p} className="text-sm font-semibold tracking-tight text-lfg/90">{p}</span>)}
      </div>
    </section>
  );
}

/* ───────── Problem → solution ───────── */
export function ProblemSolution() {
  const qs = ["Apa yang harus saya rekam?", "Bagaimana urutannya?", "Teks apa yang muncul di layar?", "Bagaimana editor mengeditnya?"];
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="lp-mono mb-3 text-xs uppercase tracking-[0.2em] text-acc2">Masalahnya</p>
          <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Video bagus dimulai sebelum kamera menyala.</h2>
          <p className="mt-4 text-lsub">Brief yang kabur bikin shooting berulang dan editor menebak-nebak. crutha.ai menjawab semuanya sebelum kamu menekan record.</p>
        </Reveal>
        <div className="grid gap-3">
          {qs.map((q, i) => (
            <Reveal key={q} delay={i * 70}>
              <div className="lp-card lp-card-static flex items-center gap-4 px-5 py-4">
                <span className="lp-mono grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-acc1/15 text-xs font-semibold text-acc1">0{i + 1}</span>
                <p className="font-medium">{q}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Bento features ───────── */
const Tag = ({ children, hot }: { children: React.ReactNode; hot?: boolean }) => (
  <span className={"lp-mono rounded-md border px-2 py-1 text-[11px] " + (hot ? "border-acc1/60 bg-acc1/15 text-lfg" : "border-lglass/12 bg-lglass/[0.04] text-lsub")}>{children}</span>
);

function BentoCard({ title, text, className = "", children }: { title: string; text: string; className?: string; children: React.ReactNode }) {
  return (
    <Reveal className={className}>
      <article className="lp-card flex h-full flex-col overflow-hidden p-6">
        <div className="mb-5 min-h-[120px] flex-1">{children}</div>
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-lsub">{text}</p>
      </article>
    </Reveal>
  );
}

export function Bento() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Head eyebrow="Fitur" title={<>Satu brief. <span className="lp-grad-text">Semua yang dibutuhkan</span> tim produksi.</>} />
      <div className="grid gap-4 lg:grid-cols-12">
        <BentoCard className="lg:col-span-7" title="Hook generator" text="3–5 hook per video dengan tipe berbeda: Curiosity, Problem, FOMO, dan lainnya. Pilih satu, script ikut menyesuaikan.">
          <div className="flex flex-wrap gap-2">
            {["Curiosity", "Problem", "FOMO", "Relatable", "Storytelling", "Direct selling"].map((h, i) => <Tag key={h} hot={i === 0}>{h}</Tag>)}
          </div>
          <p className="mt-4 rounded-xl border border-acc1/40 bg-acc1/10 p-3 text-sm">“Ternyata Parfum Senja ini beda dari yang gue kira.”</p>
        </BentoCard>

        <BentoCard className="lg:col-span-5" title="Script per timestamp" text="Voice over dan on-screen text tertata per detik, mudah dibaca saat shooting.">
          <ul className="lp-mono space-y-2 text-[12px]">
            {[["00:00–00:03", "HOOK", "w-4/5"], ["00:03–00:05", "PROBLEM", "w-3/5"], ["00:05–00:09", "PRODUCT", "w-full"], ["00:13–00:15", "CTA", "w-2/5"]].map(([t, l, w]) => (
              <li key={t} className="flex items-center gap-3"><span className="w-[88px] shrink-0 text-lsub">{t}</span><span className={`lp-line h-2 rounded-full ${w}`} /><span className="text-lfg">{l}</span></li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard className="lg:col-span-5" title="Scene breakdown" text="Tabel lengkap: visual, kamera, transisi, SFX, dan catatan editing untuk setiap scene.">
          <div className="lp-mono overflow-hidden rounded-xl border border-lglass/10 text-[11px]">
            {[["0–3s", "Close-up", "Hard cut"], ["3–5s", "Medium", "Swipe"], ["5–9s", "Macro", "Match cut"]].map(([a, b, c], i) => (
              <div key={a} className={"grid grid-cols-3 px-3 py-2 " + (i % 2 ? "bg-lglass/[0.03]" : "")}><span className="text-acc2">{a}</span><span>{b}</span><span className="text-lsub">{c}</span></div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="lg:col-span-7" title="Shot list yang bisa dicentang" text="Centang setiap footage yang sudah direkam. Progres terlihat jelas, tidak ada shot yang terlewat.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {["Product hero shot", "Close-up detail", "Product in hand", "Creator reaction", "Demonstrasi", "Final CTA shot"].map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-md border border-acc2/60 bg-acc2/15">
                  <svg className="lp-tick text-acc2" style={{ ["--d" as string]: `${i * 0.25}s` }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-10" /></svg>
                </span>{s}
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard className="lg:col-span-4" title="Editing guide" text="Pacing, frekuensi cut, transisi, SFX, musik, dan warna dalam satu panduan.">
          <div className="flex flex-wrap gap-2"><Tag hot>Pacing: Fast</Tag><Tag>Cut 1–2 dtk</Tag><Tag>Whoosh</Tag><Tag>Bass hit</Tag><Tag>High contrast</Tag></div>
        </BentoCard>

        <BentoCard className="lg:col-span-4" title="CTA 3 gaya" text="Soft selling, direct selling, atau engagement. Pilih yang sesuai tujuanmu.">
          <div className="space-y-2 text-sm">
            {[["Soft", "Cek link di bio kalau penasaran."], ["Direct", "Klik link sekarang."], ["Engage", "Menurut kamu worth it?"]].map(([k, v], i) => (
              <div key={k} className={"flex gap-3 rounded-lg border px-3 py-2 " + (i === 1 ? "border-acc1/50 bg-acc1/10" : "border-lglass/10")}><span className="lp-mono w-12 shrink-0 text-[11px] text-lsub">{k}</span><span>{v}</span></div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="lg:col-span-4" title="Kendali penuh" text="Regenerate satu bagian saja, atau edit manual: teks, timestamp, tambah, hapus, dan urutkan scene.">
          <div className="flex items-center gap-3">
            <span className="lp-btn lp-btn-ghost !min-h-0 !px-3 !py-1.5 !text-xs"><svg className="lp-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>Regenerate</span>
            <span className="text-xs text-lsub">hanya bagian yang kamu pilih</span>
          </div>
          <p className="lp-mono mt-4 rounded-lg border border-lglass/10 bg-lglass/[0.04] px-3 py-2 text-[12px]">Parfum 200K?!<span className="lp-caret">&nbsp;</span></p>
        </BentoCard>
      </div>
    </section>
  );
}

/* ───────── How it works ───────── */
export function HowItWorks() {
  const steps = [
    ["01", "Masukkan produk", "Isi nama produk, audiens, platform, durasi, dan gaya konten. Satu form singkat."],
    ["02", "Generate plan", "crutha.ai menyusun hook, script, scene, shot list, dan editing guide."],
    ["03", "Shoot & edit", "Rekam sesuai shot list, lalu kirim plan ke editor sebagai dokumen yang rapi."],
  ];
  return (
    <section id="cara-kerja" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Head eyebrow="Cara kerja" title="Dari brief ke shooting dalam tiga langkah." />
      <div className="relative grid gap-4 md:grid-cols-3">
        <div className="lp-line absolute left-[16%] right-[16%] top-[34px] hidden h-px opacity-60 md:block" aria-hidden />
        {steps.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 100}>
            <div className="lp-card lp-card-static relative h-full p-6">
              <span className="lp-mono relative mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-acc1 to-acc2 text-sm font-bold text-white">{n}</span>
              <h3 className="text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-lsub">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Personas ───────── */
export function Personas() {
  const items = [
    ["Content Creator", "Berhenti bengong di depan kamera. Tahu persis apa yang direkam dan diucapkan di tiap detik."],
    ["Video Editor", "Terima brief yang jelas: urutan footage, teks layar, transisi, dan SFX. Revisi jauh berkurang."],
    ["Affiliate Creator", "Hook dan CTA yang sesuai tujuan jualan, tanpa klaim yang tidak kamu berikan."],
    ["UMKM", "Rencana video promosi tanpa perlu tim kreatif. Cukup ponsel dan produkmu."],
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Head eyebrow="Untuk siapa" title="Dirancang untuk orang yang membuat video setiap hari." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([t, d], i) => (
          <Reveal key={t} delay={i * 70}><article className="lp-card h-full p-6"><h3 className="font-bold tracking-tight">{t}</h3><p className="mt-2 text-sm leading-relaxed text-lsub">{d}</p></article></Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Trust ───────── */
export function Trust() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="lp-card lp-card-static grid items-center gap-8 overflow-hidden p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="lp-mono mb-3 text-xs uppercase tracking-[0.2em] text-acc2">Prinsip kami</p>
            <h2 className="text-3xl font-extrabold tracking-[-0.03em]">Tidak mengarang klaim.</h2>
            <p className="mt-4 text-lsub">AI hanya memakai benefit yang kamu berikan. Kalau informasinya kurang, crutha.ai menyebut asumsinya dengan jelas, supaya kamu bisa melengkapinya sebelum shooting.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-sm">
            <p className="lp-mono mb-2 text-[11px] font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-300">Asumsi AI</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Benefit produk tidak diisi — script memakai framing first impression, bukan klaim manfaat.</li>
              <li>Target audiens tidak diisi — diasumsikan audiens umum TikTok.</li>
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────── Pricing ───────── */
export function Pricing() {
  return (
    <section id="harga" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Head eyebrow="Harga" title="Mulai gratis, naik kalau sudah butuh." sub="1 kredit = 1 video plan. Regenerate per section tidak memakai kredit." />
      <Reveal className="mb-8 flex justify-center">
        <div className="lp-mono inline-flex rounded-full border border-lglass/15 bg-lglass/[0.05] p-1 text-xs" role="group" aria-label="Periode tagihan">
          <span className="rounded-full bg-lfg px-4 py-1.5 font-semibold text-lbg" aria-current="true">Bulanan</span>
          <span className="px-4 py-1.5 text-lsub" aria-disabled="true">Tahunan · segera</span>
        </div>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <div className={"lp-card flex h-full flex-col p-6 " + (p.highlight ? "!border-acc1/70 shadow-[0_0_60px_-20px_rgba(124,92,255,.7)]" : "")}>
              {p.highlight && <span className="lp-mono mb-3 w-fit rounded-full bg-gradient-to-r from-acc1 to-acc2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">Populer</span>}
              <h3 className="font-bold uppercase tracking-wide">{p.name}</h3>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{formatIdr(p.priceIdr)}<span className="text-sm font-medium text-lsub">/bulan</span></p>
              <p className="mt-1 text-sm text-lsub">{p.tagline}</p>
              <ul className="my-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-acc2" aria-hidden>✓</span>{f}</li>)}
              </ul>
              <Link href="/signup" className={"lp-btn " + (p.highlight ? "lp-btn-primary" : "lp-btn-ghost")}>Pilih {p.name}</Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
const FAQ = [
  ["Apakah crutha.ai membuat video otomatis?", "Tidak. crutha.ai adalah perencana pra-produksi: ia menyusun rencana video (hook, script, scene, shot list, editing guide) yang kamu rekam dan edit sendiri atau bersama editor."],
  ["Platform apa saja yang didukung?", "TikTok, Instagram Reels, dan YouTube Shorts. Hook dan caption disesuaikan dengan platform yang kamu pilih."],
  ["Bagaimana cara kerja kredit?", "Setiap video plan baru memakai 1 kredit. Regenerate satu bagian (hook, script, scene, dan seterusnya) tidak memakai kredit. Jumlah kredit mengikuti paketmu."],
  ["Apakah hasilnya bisa diedit?", "Bisa. Semua output dapat diedit: teks, timestamp, on-screen text, CTA, serta menambah, menghapus, dan mengurutkan scene. Perubahan tersimpan otomatis."],
  ["Apakah data saya aman?", "Password disimpan dalam bentuk hash, project hanya dapat diakses pemiliknya, dan kunci layanan AI hanya berada di server, tidak pernah dikirim ke browser."],
  ["Bisa dipakai di HP?", "Bisa. Tampilannya responsif dan aplikasinya bisa dipasang ke layar utama ponsel (Add to Home Screen)."],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-24">
      <Head eyebrow="FAQ" title="Pertanyaan yang sering muncul." />
      <div className="space-y-3">
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 50}>
            <details className="lp-faq lp-card lp-card-static group px-5 py-4">
              <summary className="flex min-h-[44px] items-center justify-between gap-4 font-semibold">
                {q}
                <svg className="lp-chev shrink-0 text-lsub" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-relaxed text-lsub">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Final CTA + footer ───────── */
export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="lp-grain relative isolate overflow-hidden rounded-[2rem] border border-lglass/10 bg-lglass/[0.04] px-6 py-16 text-center sm:py-20">
          <div className="lp-glow-pulse pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[640px] -translate-x-1/2 rounded-full bg-acc1/35 blur-[110px]" />
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">Rencanakan videonya <span className="lp-grad-text">sebelum</span> kamu merekamnya.</h2>
          <p className="mx-auto mt-4 max-w-md text-lsub">Mulai gratis dengan 5 video plan. Tanpa kartu kredit.</p>
          <Link href="/signup" className="lp-btn lp-btn-primary mt-8 px-8">Mulai Gratis <span className="lp-arrow" aria-hidden>→</span></Link>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-lglass/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-lsub sm:flex-row">
        <LogoMark />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
          <a href="#fitur" className="hover:text-lfg">Fitur</a><a href="#harga" className="hover:text-lfg">Harga</a><a href="#faq" className="hover:text-lfg">FAQ</a>
          <Link href="/login" className="hover:text-lfg">Masuk</Link><Link href="/signup" className="hover:text-lfg">Daftar</Link>
        </nav>
        <p>© {new Date().getFullYear()} crutha.ai</p>
      </div>
    </footer>
  );
}
