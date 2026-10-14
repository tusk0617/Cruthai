"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [["#fitur", "Fitur"], ["#cara-kerja", "Cara Kerja"], ["#harga", "Harga"], ["#faq", "FAQ"]];

export function LogoMark() {
  return (
    <span className="flex items-center gap-2 font-bold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-acc1 to-acc2 text-white shadow-[0_0_24px_-4px_rgba(124,92,255,.8)]" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span>crutha<span className="lp-grad-text">.ai</span></span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={"fixed inset-x-0 top-0 z-50 transition-colors " + (scrolled || open ? "border-b border-lglass/10 bg-lbg/75 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="crutha.ai beranda"><LogoMark /></Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-lsub transition hover:text-lfg">{label}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/login" className="lp-btn lp-btn-ghost">Masuk</Link>
          <Link href="/signup" className="lp-btn lp-btn-primary">Mulai Gratis <span className="lp-arrow" aria-hidden>→</span></Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="lp-btn lp-btn-ghost !px-3" aria-expanded={open} aria-controls="lp-mobile-menu" aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen(!open)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="lp-mobile-menu" className="border-t border-lglass/10 px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col" aria-label="Menu mobile">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-[44px] items-center border-b border-lglass/10 text-base text-lfg">{label}</a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/login" className="lp-btn lp-btn-ghost">Masuk</Link>
            <Link href="/signup" className="lp-btn lp-btn-primary">Mulai Gratis</Link>
          </div>
        </div>
      )}
    </header>
  );
}
