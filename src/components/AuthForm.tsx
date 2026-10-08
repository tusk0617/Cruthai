"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(signup ? "/api/auth/register" : "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    if (res.ok) { router.push("/dashboard"); router.refresh(); return; }
    setErr((await res.json().catch(() => ({}))).error || "Gagal. Coba lagi.");
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="card space-y-4">
          <h1 className="text-lg font-semibold">{signup ? "Buat akun gratis" : "Masuk ke crutha.ai"}</h1>
          {signup && <div><label className="label">Nama</label><input name="name" required className="input" autoComplete="name" /></div>}
          <div><label className="label">Email</label><input name="email" type="email" required className="input" autoComplete="email" /></div>
          <div><label className="label">Password</label><input name="password" type="password" required minLength={signup ? 8 : 1} className="input" autoComplete={signup ? "new-password" : "current-password"} /></div>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Memproses…" : signup ? "Daftar" : "Masuk"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-sub">
          {signup ? <>Sudah punya akun? <Link className="text-brand" href="/login">Masuk</Link></> : <>Belum punya akun? <Link className="text-brand" href="/signup">Daftar gratis</Link></>}
        </p>
      </div>
    </main>
  );
}
