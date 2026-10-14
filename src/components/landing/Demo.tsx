"use client";

import { useRef, useState } from "react";
import { Reveal } from "./Reveal";

const TABS = ["Hook", "Script", "Scene", "Shot List"] as const;
type Tab = (typeof TABS)[number];

const HOOKS = [
  ["Curiosity", "Ternyata Parfum Senja ini beda dari yang gue kira.", "Close-up botol, perlahan diputar ke kamera"],
  ["Problem", "Bingung milih parfum yang pas? Lihat ini dulu.", "Creator menggaruk kepala di depan beberapa pilihan"],
  ["FOMO", "Sebelum ikut-ikutan beli, lihat Parfum Senja dulu.", "Produk di tengah frame, tangan terangkat isyarat “tunggu”"],
];
const SCRIPT = [
  ["00:00–00:03", "HOOK", "Ternyata Parfum Senja ini beda dari yang gue kira.", "Parfum Senja?!"],
  ["00:03–00:05", "PROBLEM", "Jujur, kadang bingung nentuin pilihan yang cocok.", "Masalahnya..."],
  ["00:05–00:09", "PRODUCT", "Makanya gue coba Parfum Senja.", "Parfum Senja"],
  ["00:09–00:13", "BENEFIT", "Ini kesan pertama gue. Nilai sendiri ya di video ini.", "First impression"],
  ["00:13–00:15", "CTA", "Klik link sekarang dan cobain sendiri.", "Cek link di bio"],
];
const SCENES = [
  ["0–3s", "Close-up botol", "Close-up", "Push-in cepat", "Hard cut", "Bass hit"],
  ["3–5s", "Creator bicara", "Medium", "Handheld stabil", "Hard cut", "Whoosh"],
  ["5–9s", "Reveal produk", "Close-up", "Tilt", "Swipe", "Click"],
  ["9–13s", "Detail kemasan", "Macro", "Slider kiri-kanan", "Match cut", "Click"],
  ["13–15s", "CTA penutup", "Medium close-up", "Statis", "Hard cut", "Pop"],
];
const SHOTS = ["Product hero shot", "Product close-up", "Product in hand", "Detail / macro", "Creator reaction", "Final CTA shot"];

export function Demo() {
  const [tab, setTab] = useState<Tab>("Hook");
  const [done, setDone] = useState<Set<number>>(new Set([0, 1]));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[n]);
    refs.current[n]?.focus();
  };

  return (
    <section id="demo" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-24">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <p className="lp-mono mb-3 text-xs uppercase tracking-[0.2em] text-acc2">Contoh nyata</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Parfum lokal · TikTok · 15 detik</h2>
        <p className="mt-4 text-lsub">Contoh ilustrasi untuk produk fiktif “Parfum Senja”. Klik tab untuk melihat tiap bagian rencana.</p>
      </Reveal>

      <Reveal>
        <div className="lp-card lp-card-static overflow-hidden p-0">
          <div role="tablist" aria-label="Bagian rencana video" className="flex gap-1 overflow-x-auto border-b border-lglass/10 p-2">
            {TABS.map((t, i) => (
              <button key={t} ref={(el) => { refs.current[i] = el; }} role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="demo-panel" tabIndex={tab === t ? 0 : -1}
                onClick={() => setTab(t)} onKeyDown={(e) => onKey(e, i)}
                className={"lp-mono min-h-[44px] shrink-0 rounded-xl px-4 text-sm font-medium transition " + (tab === t ? "bg-gradient-to-r from-acc1 to-acc2 text-white" : "text-lsub hover:bg-lglass/[0.06] hover:text-lfg")}>
                {t}
              </button>
            ))}
          </div>

          <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-h-[340px] p-5 sm:p-7">
            {tab === "Hook" && (
              <div className="grid gap-3 md:grid-cols-3">
                {HOOKS.map(([type, text, visual], i) => (
                  <div key={type} className={"rounded-xl border p-4 " + (i === 0 ? "border-acc1/60 bg-acc1/10" : "border-lglass/10")}>
                    <span className="lp-mono text-[11px] font-semibold uppercase tracking-widest text-acc2">{type}</span>
                    <p className="mt-2 font-medium leading-snug">“{text}”</p>
                    <p className="mt-3 text-xs text-lsub">Visual: {visual}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "Script" && (
              <ul className="space-y-3">
                {SCRIPT.map(([time, label, vo, text]) => (
                  <li key={time} className="grid gap-1 rounded-xl border border-lglass/10 p-4 sm:grid-cols-[130px_1fr_180px] sm:gap-4">
                    <div><span className="lp-mono text-xs text-lsub">{time}</span><span className="lp-mono ml-2 text-[11px] font-semibold text-acc2">{label}</span></div>
                    <p className="text-sm"><span className="text-lsub">VO: </span>{vo}</p>
                    <p className="text-sm"><span className="text-lsub">Teks: </span>{text}</p>
                  </li>
                ))}
              </ul>
            )}

            {tab === "Scene" && (
              <div className="overflow-x-auto">
                <table className="lp-mono w-full min-w-[560px] text-left text-xs">
                  <thead className="text-lsub"><tr>{["Waktu", "Scene", "Shot", "Gerakan", "Transisi", "SFX"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
                  <tbody>
                    {SCENES.map((r) => (
                      <tr key={r[0]} className="border-t border-lglass/10">{r.map((c, i) => <td key={i} className={"px-3 py-3 " + (i === 0 ? "text-acc2" : "")}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Shot List" && (
              <div>
                <p className="lp-mono mb-4 text-xs text-lsub">{done.size}/{SHOTS.length} sudah direkam — coba centang</p>
                <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-lglass/10"><div className="h-full rounded-full bg-gradient-to-r from-acc1 to-acc2 transition-all" style={{ width: `${(done.size / SHOTS.length) * 100}%` }} /></div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {SHOTS.map((s, i) => (
                    <li key={s}>
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-lglass/10 px-4 text-sm hover:bg-lglass/[0.04]">
                        <input type="checkbox" className="h-4 w-4 accent-[#7C5CFF]" checked={done.has(i)}
                          onChange={() => setDone((d) => { const n = new Set(d); if (n.has(i)) n.delete(i); else n.add(i); return n; })} />
                        <span className={done.has(i) ? "text-lsub line-through" : ""}>{s}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
