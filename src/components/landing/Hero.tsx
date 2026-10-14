"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BRIEF = "Parfum lokal Senja 50ml · pria 18–25 · TikTok · 15 detik · cinematic";
const OUT = [
  { tag: "HOOK · Curiosity", from: 0, to: 3, text: "“Ternyata parfum lokal ini beda dari yang gue kira.”", color: "#7C5CFF" },
  { tag: "PROBLEM", from: 3, to: 5, text: "Creator bicara ke kamera · hard cut", color: "#4F8BFF" },
  { tag: "PRODUCT", from: 5, to: 9, text: "Produk di tangan, label ke kamera · swipe", color: "#22D3EE" },
  { tag: "BENEFIT", from: 9, to: 13, text: "Close-up detail kemasan · speed ramp", color: "#34D399" },
  { tag: "CTA", from: 13, to: 15, text: "“Klik link sekarang dan cobain sendiri.”", color: "#FBBF24" },
];
const STEP = 14; // ticks between each revealed block
const LOOP = BRIEF.length + 10 + OUT.length * STEP + 80;
const DONE = 9999;

const mmss = (s: number) => `00:${String(s).padStart(2, "0")}`;

function HeroMockup() {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(DONE); return; }
    let id = 0;
    const start = () => { id = window.setInterval(() => setT((x) => x + 1), 45); };
    const onVis = () => { if (document.hidden) window.clearInterval(id); else start(); };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const p = t === DONE ? LOOP - 1 : t % LOOP;
  const typed = t === DONE ? BRIEF.length : Math.min(BRIEF.length, p);
  const shown = t === DONE ? OUT.length : Math.max(0, Math.min(OUT.length, Math.floor((p - BRIEF.length - 10) / STEP) + 1));
  const progress = t === DONE ? 1 : Math.max(0, Math.min(1, (p - BRIEF.length - 10) / (OUT.length * STEP)));

  return (
    <div className="lp-card lp-card-static lp-float relative overflow-hidden p-0 shadow-[0_40px_120px_-40px_rgba(124,92,255,.55)]" aria-label="Contoh hasil crutha.ai" role="img">
      <div className="flex items-center gap-2 border-b border-lglass/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-lglass/25" /><span className="h-2.5 w-2.5 rounded-full bg-lglass/25" /><span className="h-2.5 w-2.5 rounded-full bg-lglass/25" />
        <span className="lp-mono ml-2 text-[11px] text-lsub">crutha.ai / video-plan</span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <p className="lp-mono mb-1.5 text-[11px] uppercase tracking-widest text-lsub">Brief</p>
          <p className="lp-mono min-h-[3.2em] rounded-xl border border-lglass/10 bg-lglass/[0.04] px-3 py-2.5 text-[13px] leading-relaxed text-lfg">
            {BRIEF.slice(0, typed)}{typed < BRIEF.length && <span className="lp-caret">&nbsp;</span>}
          </p>
        </div>

        <ul className="space-y-2">
          {OUT.map((o, i) => (
            <li key={o.tag}
              className={"rounded-xl border border-lglass/10 bg-lglass/[0.04] px-3 py-2.5 transition-all duration-500 " + (i >= 3 ? "hidden sm:block " : "") + (i < shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
              <div className="flex items-center justify-between gap-2">
                <span className="lp-mono flex items-center gap-2 text-[11px] font-semibold tracking-wide" style={{ color: o.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />{o.tag}
                </span>
                <span className="lp-mono text-[11px] text-lsub">{mmss(o.from)}–{mmss(o.to)}</span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-lfg">{o.text}</p>
            </li>
          ))}
        </ul>

        <div aria-hidden>
          <div className="relative h-7">
            {OUT.map((o) => (
              <div key={o.tag} className="absolute top-2 h-3 rounded-sm opacity-80" style={{ left: `${(o.from / 15) * 100}%`, width: `calc(${((o.to - o.from) / 15) * 100}% - 2px)`, background: o.color }} />
            ))}
            <div className="absolute -top-0.5 bottom-0 w-px bg-lfg/90 shadow-[0_0_12px_2px_rgba(34,211,238,.8)]" style={{ left: `${progress * 100}%` }}>
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-acc2" />
            </div>
          </div>
          <div className="lp-mono mt-1 flex justify-between text-[10px] text-lsub"><span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span></div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={ref} onPointerMove={onMove} className="lp-grain relative isolate overflow-hidden pb-20 pt-28 sm:pt-36">
      <div className="lp-spot pointer-events-none absolute inset-0 -z-10" />
      <div className="lp-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="lp-glow-pulse pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-acc1/30 blur-[120px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="lp-mono inline-flex items-center gap-2 rounded-full border border-lglass/15 bg-lglass/[0.05] px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-lsub">
            <span className="h-1.5 w-1.5 rounded-full bg-acc2 shadow-[0_0_10px_2px_rgba(34,211,238,.9)]" />AI Pre-Production Planner
          </span>
          <h1 className="mt-5 text-[2.4rem] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Ubah Produkmu Jadi Rencana Video <span className="lp-grad-text">Siap Shooting.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-lsub sm:text-lg">
            Dari brief produk ke hook, script per timestamp, scene, shot list, dan arahan editing untuk TikTok, Reels, dan Shorts. Rekam dengan jelas, edit tanpa bolak-balik.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="lp-btn lp-btn-primary px-7">Mulai Gratis <span className="lp-arrow" aria-hidden>→</span></Link>
            <a href="#demo" className="lp-btn lp-btn-ghost px-7">Lihat Contoh</a>
          </div>
          <p className="lp-mono mt-4 text-xs text-lsub">Gratis 5 plan. Tanpa kartu kredit.</p>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
