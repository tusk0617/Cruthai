"use client";

import { useState } from "react";

type Prov = "mock" | "openai" | "gemini";
interface ProvStatus { model: string; keyHint: string | null; keySource: "database" | "env" | null }
interface Status { provider: Prov; openai: ProvStatus; gemini: ProvStatus }

const INFO: Record<Prov, { name: string; desc: string }> = {
  mock: { name: "Mock (tanpa AI)", desc: "Template offline, gratis. Untuk demo dan pengembangan." },
  openai: { name: "OpenAI", desc: "GPT. Key dari platform.openai.com/api-keys" },
  gemini: { name: "Google Gemini", desc: "Gemini. Key dari aistudio.google.com/apikey" },
};

export function AiSettingsForm({ initial }: { initial: Status }) {
  const [st, setSt] = useState(initial);
  const [provider, setProvider] = useState<Prov>(initial.provider);
  const [models, setModels] = useState({ openai: initial.openai.model, gemini: initial.gemini.model });
  const [keys, setKeys] = useState({ openai: "", gemini: "" });
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    return { res, data: await res.json().catch(() => ({})) };
  }

  async function save(extra: Record<string, unknown> = {}) {
    setBusy("save"); setMsg(null);
    const body: Record<string, unknown> = { provider, openaiModel: models.openai, geminiModel: models.gemini, ...extra };
    if (keys.openai.trim()) body.openaiKey = keys.openai.trim();
    if (keys.gemini.trim()) body.geminiKey = keys.gemini.trim();
    const { res, data } = await call("/api/admin/ai", "PUT", body);
    setBusy(null);
    if (!res.ok) return setMsg({ ok: false, text: data.error || "Gagal menyimpan" });
    setSt(data.status); setKeys({ openai: "", gemini: "" }); setProvider(data.status.provider);
    setMsg({ ok: true, text: "Tersimpan. Berlaku untuk generate berikutnya." });
  }

  async function test() {
    setBusy("test"); setMsg(null);
    const { data } = await call("/api/admin/ai/test", "POST");
    setBusy(null);
    setMsg({ ok: !!data.ok, text: `${data.ok ? "✓" : "✗"} ${data.provider ?? ""}: ${data.message ?? data.error ?? "Gagal"}${data.ms ? ` (${data.ms} ms)` : ""}` });
  }

  const keyBox = (p: "openai" | "gemini") => {
    const s = st[p];
    return (
      <div className="mt-3 space-y-3 border-t border-line pt-3">
        <div>
          <label className="label">Model</label>
          <input className="input" value={models[p]} onChange={(e) => setModels({ ...models, [p]: e.target.value })} />
        </div>
        <div>
          <label className="label">API key {s.keyHint && <span className="ml-1 font-normal">— tersimpan {s.keyHint} ({s.keySource === "env" ? "dari environment" : "dari database"})</span>}</label>
          <input type="password" autoComplete="off" className="input" placeholder={s.keyHint ? "Kosongkan jika tidak diganti" : "Tempel API key di sini"}
            value={keys[p]} onChange={(e) => setKeys({ ...keys, [p]: e.target.value })} />
        </div>
        {s.keySource === "database" && (
          <button type="button" className="text-xs text-red-600" onClick={() => confirm("Hapus API key tersimpan?") && save({ clearKey: p, provider: provider === p ? "mock" : provider })}>Hapus key tersimpan</button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {(Object.keys(INFO) as Prov[]).map((p) => (
        <div key={p} className={"card " + (provider === p ? "border-brand ring-2 ring-brand/20" : "")}>
          <div className="flex items-start gap-3">
            <input id={"prov-" + p} type="radio" name="provider" className="mt-1 accent-[rgb(var(--brand))]" checked={provider === p} onChange={() => setProvider(p)} />
            <div className="flex-1">
              <label htmlFor={"prov-" + p} className="block cursor-pointer"><p className="font-semibold">{INFO[p].name}{st.provider === p && <span className="chip ml-2 bg-brand/10 text-brand">Aktif</span>}</p>
              <p className="text-sm text-sub">{INFO[p].desc}</p></label>
              {provider === p && p !== "mock" && keyBox(p)}
            </div>
          </div>
        </div>
      ))}

      {msg && <p role="status" className={"rounded-xl border p-3 text-sm " + (msg.ok ? "border-green-300 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300" : "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300")}>{msg.text}</p>}

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={busy !== null} onClick={() => save()}>{busy === "save" ? "Menyimpan…" : "Simpan"}</button>
        <button className="btn-ghost" disabled={busy !== null} onClick={test}>{busy === "test" ? "Menguji…" : "Tes koneksi"}</button>
      </div>
      <p className="text-xs text-sub">Tes koneksi memakai konfigurasi yang sudah tersimpan — klik Simpan dulu setelah mengubah. Pengaturan di sini mengalahkan environment variable.</p>
    </div>
  );
}
