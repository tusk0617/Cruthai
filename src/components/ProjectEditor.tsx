"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CTA_STYLES, HOOK_TYPES, type Plan, type Section } from "@/lib/ai/schema";
import type { ProjectFull } from "@/lib/db/repo";
import { mmss, planToMarkdown } from "@/lib/export";

type SaveState = "saved" | "dirty" | "saving" | "error";
const uid = () => crypto.randomUUID();

/* ---------- small primitives ---------- */
function Field({ label, value, onChange, area, className = "" }: { label?: string; value: string; onChange: (v: string) => void; area?: boolean; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {area
        ? <textarea className="input min-h-[60px]" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}
function Num({ value, onChange, label }: { value: number; onChange: (n: number) => void; label?: string }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input type="number" min={0} className="input w-20" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
    </div>
  );
}

function Card({ id, title, hint, children, onRegen, busy, extra }: {
  id: string; title: string; hint?: string; children: React.ReactNode; onRegen?: () => void; busy?: boolean; extra?: React.ReactNode;
}) {
  return (
    <section id={id} className="card scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>{hint && <p className="text-xs text-sub">{hint}</p>}</div>
        <div className="flex gap-2">
          {extra}
          {onRegen && <button className="btn-ghost btn-sm" disabled={busy} onClick={onRegen}>{busy ? "Generating…" : "↻ Regenerate"}</button>}
        </div>
      </div>
      <div className={busy ? "pointer-events-none opacity-50" : ""}>{children}</div>
    </section>
  );
}

const TABS = [
  ["concept", "Concept"], ["hooks", "Hook"], ["script", "Script"], ["scenes", "Scenes"],
  ["shots", "Shot List"], ["editing", "Editing"], ["cta", "CTA"], ["caption", "Caption"],
];

/* ---------- editor ---------- */
export function ProjectEditor({ project }: { project: ProjectFull }) {
  const [plan, setPlan] = useState<Plan>(project.plan);
  const [name, setName] = useState(project.name);
  const [status, setStatus] = useState(project.status);
  const [save, setSave] = useState<SaveState>("saved");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const first = useRef(true);

  const edit = useCallback((fn: (p: Plan) => Plan) => { setPlan(fn); setSave("dirty"); }, []);
  const patch = <K extends keyof Plan>(k: K, v: Plan[K]) => edit((p) => ({ ...p, [k]: v }));

  const persist = useCallback(async () => {
    setSave("saving");
    const res = await fetch(`/api/projects/${project.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, name, status }) });
    if (res.ok) setSave("saved"); else { setSave("error"); setErr((await res.json().catch(() => ({}))).error || "Gagal menyimpan"); }
  }, [plan, name, status, project.id]);

  // Debounced autosave.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (save !== "dirty") return;
    const t = setTimeout(persist, 1500);
    return () => clearTimeout(t);
  }, [plan, name, status, save, persist]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (save === "dirty" || save === "saving") e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  async function regenerate(section: Section, basePlan: Plan = plan, key: string = section) {
    setBusy((b) => new Set(b).add(key)); setErr("");
    try {
      const res = await fetch(`/api/projects/${project.id}/regenerate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, plan: basePlan }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal regenerate");
      setPlan({ ...basePlan, ...data.patch }); setSave("dirty");
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy((b) => { const n = new Set(b); n.delete(key); return n; }); }
  }

  function useHook(id: string) {
    const next = { ...plan, selectedHookId: id };
    setPlan(next); setSave("dirty");
    regenerate("scriptScenes", next, "script");
  }

  const copy = async () => { await navigator.clipboard.writeText(planToMarkdown(name, plan)); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([planToMarkdown(name, plan)], { type: "text/markdown" }));
    a.download = `${name.replace(/[^\w-]+/g, "_")}.md`; a.click(); URL.revokeObjectURL(a.href);
  };

  const done = plan.shotList.filter((s) => s.done).length;
  const move = <T,>(arr: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const c = [...arr]; [c[i], c[j]] = [c[j], c[i]]; return c; };
  const setAt = <T,>(arr: T[], i: number, v: Partial<T>) => arr.map((x, k) => (k === i ? { ...x, ...v } : x));
  const scriptBusy = busy.has("script") || busy.has("scenes");
  const total = project.brief.duration;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="z-10 -mx-4 sm:sticky flex flex-wrap items-center gap-2 border-b border-line bg-bg/90 px-4 py-2.5 sm:top-[57px] sm:-mx-5 sm:px-5 sm:py-3 backdrop-blur">
        <input className="input w-full min-w-0 text-base font-semibold sm:w-auto sm:min-w-[200px] sm:flex-1" value={name} onChange={(e) => { setName(e.target.value); setSave("dirty"); }} aria-label="Nama project" />
        <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setSave("dirty"); }} aria-label="Status">
          <option value="draft">Draft</option><option value="ready">Siap shooting</option><option value="shooting">Shooting</option><option value="done">Selesai</option>
        </select>
        <span className="text-xs text-sub" aria-live="polite">{{ saved: "✓ Tersimpan", dirty: "Belum disimpan…", saving: "Menyimpan…", error: "⚠ Gagal simpan" }[save]}</span>
        <button className="btn-primary btn-sm" onClick={persist} disabled={save === "saving" || save === "saved"}>Save</button>
        <button className="btn-ghost btn-sm" onClick={copy}>{copied ? "Tersalin ✓" : "Copy"}</button>
        <button className="btn-ghost btn-sm" onClick={download}>Export .md</button>
      </div>
      <nav className="-mt-1 flex gap-1 overflow-x-auto text-sm">
        {TABS.map(([id, l]) => <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sub hover:bg-muted hover:text-ink">{l}</a>)}
      </nav>

      {err && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{err}</p>}
      {plan.assumptions.length > 0 && (
        <div className="rounded-xl2 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <b>Asumsi AI</b>
          <ul className="mt-1 list-disc pl-5">{plan.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}

      {/* CONCEPT */}
      <Card id="concept" title="Video Concept" onRegen={() => regenerate("concept")} busy={busy.has("concept")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" value={plan.concept.title} onChange={(v) => patch("concept", { ...plan.concept, title: v })} className="sm:col-span-2" />
          <Field label="Concept" area value={plan.concept.concept} onChange={(v) => patch("concept", { ...plan.concept, concept: v })} className="sm:col-span-2" />
          <Field label="Target audience" value={plan.concept.targetAudience} onChange={(v) => patch("concept", { ...plan.concept, targetAudience: v })} />
          <Field label="Objective" value={plan.concept.objective} onChange={(v) => patch("concept", { ...plan.concept, objective: v })} />
          <Field label="Tone" value={plan.concept.tone} onChange={(v) => patch("concept", { ...plan.concept, tone: v })} />
          <Field label="Content angle" value={plan.concept.angle} onChange={(v) => patch("concept", { ...plan.concept, angle: v })} />
        </div>
      </Card>

      {/* HOOKS */}
      <Card id="hooks" title="Hook" hint="Pilih satu hook — script & scene akan disesuaikan." onRegen={() => regenerate("hooks")} busy={busy.has("hooks")}>
        <div className="grid gap-3 md:grid-cols-2">
          {plan.hooks.map((h, i) => {
            const sel = h.id === plan.selectedHookId;
            return (
              <div key={h.id} className={"space-y-2 rounded-xl border p-3 " + (sel ? "border-brand bg-brand/5" : "border-line")}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sub">HOOK {i + 1}</span>
                  <select className="rounded-lg border border-line bg-surface px-2 py-0.5 text-xs" value={h.type}
                    onChange={(e) => patch("hooks", setAt(plan.hooks, i, { type: e.target.value as (typeof HOOK_TYPES)[number] }))}>
                    {HOOK_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <Field area value={h.text} onChange={(v) => patch("hooks", setAt(plan.hooks, i, { text: v, voiceOver: h.voiceOver === h.text ? v : h.voiceOver }))} />
                <Field label="Visual" value={h.visual} onChange={(v) => patch("hooks", setAt(plan.hooks, i, { visual: v }))} />
                <Field label="Voice over" value={h.voiceOver} onChange={(v) => patch("hooks", setAt(plan.hooks, i, { voiceOver: v }))} />
                <button className={sel ? "btn-ghost btn-sm w-full" : "btn-primary btn-sm w-full"} disabled={sel || scriptBusy} onClick={() => useHook(h.id)}>
                  {sel ? "✓ Hook terpilih" : "Use This Hook"}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SCRIPT */}
      <Card id="script" title="Script" hint={`Total ${total} detik`} onRegen={() => regenerate("script")} busy={busy.has("script")}
        extra={<button className="btn-ghost btn-sm" onClick={() => {
          const end = plan.script.at(-1)?.endSec ?? 0;
          patch("script", [...plan.script, { id: uid(), label: "SEGMENT", startSec: end, endSec: Math.min(total, end + 3), voiceOver: "", onScreenText: "" }]);
        }}>+ Segment</button>}>
        <div className="space-y-3">
          {plan.script.map((s, i) => (
            <div key={s.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[auto_1fr_1fr_auto]">
              <div className="flex items-end gap-2">
                <Num label="Start (s)" value={s.startSec} onChange={(n) => patch("script", setAt(plan.script, i, { startSec: n }))} />
                <Num label="End (s)" value={s.endSec} onChange={(n) => patch("script", setAt(plan.script, i, { endSec: n }))} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><span className="chip">{mmss(s.startSec)}–{mmss(s.endSec)}</span>
                  <input className="input py-1 text-xs font-semibold uppercase" value={s.label} onChange={(e) => patch("script", setAt(plan.script, i, { label: e.target.value }))} /></div>
                <Field label="Voice over" area value={s.voiceOver} onChange={(v) => patch("script", setAt(plan.script, i, { voiceOver: v }))} />
              </div>
              <Field label="On-screen text" area value={s.onScreenText} onChange={(v) => patch("script", setAt(plan.script, i, { onScreenText: v }))} />
              <button className="btn-ghost btn-sm self-start text-red-600" aria-label="Hapus segment" onClick={() => patch("script", plan.script.filter((_, k) => k !== i))}>✕</button>
            </div>
          ))}
        </div>
      </Card>

      {/* SCENES */}
      <Card id="scenes" title="Scene Breakdown" hint="Edit langsung. Di desktop tampil sebagai tabel, di HP sebagai kartu per scene." onRegen={() => regenerate("scenes")} busy={busy.has("scenes")}
        extra={<button className="btn-ghost btn-sm" onClick={() => {
          const end = plan.scenes.at(-1)?.endSec ?? 0;
          patch("scenes", [...plan.scenes, { id: uid(), startSec: end, endSec: end + 3, scene: "New scene", visual: "", cameraShot: "", cameraMovement: "", voiceOver: "", onScreenText: "", bRoll: "", transition: "Hard cut", sfx: "", editingNotes: "" }]);
        }}>+ Scene</button>}>
        <div className="space-y-3 md:hidden">
          {plan.scenes.map((s, i) => {
            const f = (label: string, k: keyof typeof s, area = false) => (
              <Field key={k} label={label} area={area} value={String(s[k])} onChange={(v) => patch("scenes", setAt(plan.scenes, i, { [k]: v } as Partial<typeof s>))} />
            );
            return (
              <div key={s.id} className="space-y-2 rounded-xl border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="chip">#{i + 1} · {mmss(s.startSec)}–{mmss(s.endSec)} · {Math.max(0, s.endSec - s.startSec)}s</span>
                  <div className="flex gap-1">
                    <button className="btn-ghost btn-sm" aria-label="Naik" onClick={() => patch("scenes", move(plan.scenes, i, -1))}>▲</button>
                    <button className="btn-ghost btn-sm" aria-label="Turun" onClick={() => patch("scenes", move(plan.scenes, i, 1))}>▼</button>
                    <button className="btn-ghost btn-sm text-red-600" aria-label="Hapus scene" onClick={() => patch("scenes", plan.scenes.filter((_, k) => k !== i))}>✕</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Num label="Start (s)" value={s.startSec} onChange={(n) => patch("scenes", setAt(plan.scenes, i, { startSec: n }))} />
                  <Num label="End (s)" value={s.endSec} onChange={(n) => patch("scenes", setAt(plan.scenes, i, { endSec: n }))} />
                  <div className="flex-1">{f("Scene", "scene")}</div>
                </div>
                {f("Visual", "visual", true)}
                <div className="grid grid-cols-2 gap-2">{f("Camera shot", "cameraShot")}{f("Camera movement", "cameraMovement")}</div>
                {f("Voice over", "voiceOver", true)}
                {f("On-screen text", "onScreenText")}
                {f("B-roll", "bRoll")}
                <div className="grid grid-cols-2 gap-2">{f("Transition", "transition")}{f("SFX", "sfx")}</div>
                {f("Editing notes", "editingNotes", true)}
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
          <table className="w-full min-w-[1500px] text-left text-xs">
            <thead className="bg-muted text-sub">
              <tr>{["", "Start", "End", "Dur", "Scene", "Visual", "Camera Shot", "Camera Movement", "Voice Over", "On-Screen Text", "B-Roll", "Transition", "SFX", "Editing Notes", ""].map((h, i) => <th key={i} className="px-2 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {plan.scenes.map((s, i) => {
                const t = (k: keyof typeof s, w = "w-36") => (
                  <textarea rows={2} className={`${w} resize-y rounded-lg border border-transparent bg-transparent p-1.5 hover:border-line focus:border-brand focus:outline-none`}
                    value={String(s[k])} onChange={(e) => patch("scenes", setAt(plan.scenes, i, { [k]: e.target.value } as Partial<typeof s>))} />
                );
                return (
                  <tr key={s.id} className="border-t border-line align-top">
                    <td className="px-1 py-1"><div className="flex flex-col"><button className="px-1 text-sub hover:text-ink" aria-label="Naik" onClick={() => patch("scenes", move(plan.scenes, i, -1))}>▲</button><button className="px-1 text-sub hover:text-ink" aria-label="Turun" onClick={() => patch("scenes", move(plan.scenes, i, 1))}>▼</button></div></td>
                    <td className="px-1 py-1"><input type="number" min={0} className="w-14 rounded-lg border border-transparent bg-transparent p-1.5 hover:border-line focus:border-brand focus:outline-none" value={s.startSec} onChange={(e) => patch("scenes", setAt(plan.scenes, i, { startSec: Number(e.target.value) || 0 }))} /></td>
                    <td className="px-1 py-1"><input type="number" min={0} className="w-14 rounded-lg border border-transparent bg-transparent p-1.5 hover:border-line focus:border-brand focus:outline-none" value={s.endSec} onChange={(e) => patch("scenes", setAt(plan.scenes, i, { endSec: Number(e.target.value) || 0 }))} /></td>
                    <td className="whitespace-nowrap px-2 py-2 text-sub">{Math.max(0, s.endSec - s.startSec)}s</td>
                    <td>{t("scene")}</td><td>{t("visual", "w-48")}</td><td>{t("cameraShot")}</td><td>{t("cameraMovement")}</td>
                    <td>{t("voiceOver", "w-48")}</td><td>{t("onScreenText")}</td><td>{t("bRoll")}</td><td>{t("transition", "w-28")}</td><td>{t("sfx", "w-28")}</td><td>{t("editingNotes", "w-44")}</td>
                    <td className="px-1 py-1"><button className="text-red-600" aria-label="Hapus scene" onClick={() => patch("scenes", plan.scenes.filter((_, k) => k !== i))}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SHOT LIST */}
      <Card id="shots" title="Shot List" hint={`${done}/${plan.shotList.length} sudah direkam`} onRegen={() => regenerate("shotList")} busy={busy.has("shotList")}
        extra={<button className="btn-ghost btn-sm" onClick={() => patch("shotList", [...plan.shotList, { id: uid(), name: "New shot", shotType: "", purpose: "", durationSec: 3, cameraAngle: "", done: false }])}>+ Shot</button>}>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand transition-all" style={{ width: `${plan.shotList.length ? (done / plan.shotList.length) * 100 : 0}%` }} /></div>
        <div className="space-y-2">
          {plan.shotList.map((s, i) => (
            <div key={s.id} className={"grid items-center gap-2 rounded-xl border border-line p-2 md:grid-cols-[auto_1.4fr_1fr_1.2fr_80px_1fr_auto] " + (s.done ? "opacity-60" : "")}>
              <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--brand))]" checked={s.done} aria-label={`Sudah direkam: ${s.name}`} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { done: e.target.checked }))} />
              <input className="input" value={s.name} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { name: e.target.value }))} aria-label="Nama shot" />
              <input className="input" placeholder="Shot type" value={s.shotType} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { shotType: e.target.value }))} />
              <input className="input" placeholder="Purpose" value={s.purpose} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { purpose: e.target.value }))} />
              <div className="flex items-center gap-1"><input type="number" min={0} className="input" value={s.durationSec} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { durationSec: Number(e.target.value) || 0 }))} aria-label="Durasi (detik)" /><span className="text-xs text-sub">s</span></div>
              <input className="input" placeholder="Camera angle" value={s.cameraAngle} onChange={(e) => patch("shotList", setAt(plan.shotList, i, { cameraAngle: e.target.value }))} />
              <button className="text-red-600" aria-label="Hapus shot" onClick={() => patch("shotList", plan.shotList.filter((_, k) => k !== i))}>✕</button>
            </div>
          ))}
        </div>
      </Card>

      {/* EDITING GUIDE */}
      <Card id="editing" title="Editing Guide" onRegen={() => regenerate("editingGuide")} busy={busy.has("editingGuide")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([["pacing", "Pacing"], ["cutFrequency", "Cut frequency"], ["transition", "Transition"], ["textAnimation", "Text animation"], ["subtitle", "Subtitle"], ["bRoll", "B-roll"], ["sfx", "SFX"], ["music", "Music"], ["color", "Color"]] as const).map(([k, l]) => (
            <Field key={k} label={l} area value={plan.editingGuide[k]} onChange={(v) => patch("editingGuide", { ...plan.editingGuide, [k]: v })} />
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card id="cta" title="CTA" hint="Pilih satu CTA untuk dipakai." onRegen={() => regenerate("ctas")} busy={busy.has("ctas")}>
        <div className="grid gap-3 md:grid-cols-3">
          {plan.ctas.map((c, i) => {
            const sel = c.id === plan.selectedCtaId;
            return (
              <div key={c.id} className={"space-y-2 rounded-xl border p-3 " + (sel ? "border-brand bg-brand/5" : "border-line")}>
                <select className="rounded-lg border border-line bg-surface px-2 py-0.5 text-xs" value={c.style} onChange={(e) => patch("ctas", setAt(plan.ctas, i, { style: e.target.value as (typeof CTA_STYLES)[number] }))}>
                  {CTA_STYLES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Field area value={c.text} onChange={(v) => patch("ctas", setAt(plan.ctas, i, { text: v }))} />
                <button className={sel ? "btn-ghost btn-sm w-full" : "btn-primary btn-sm w-full"} disabled={sel} onClick={() => patch("selectedCtaId", c.id)}>{sel ? "✓ Dipakai" : "Use This CTA"}</button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* CAPTION */}
      <Card id="caption" title={`Caption · ${project.brief.platform}`} onRegen={() => regenerate("caption")} busy={busy.has("caption")}>
        <Field area value={plan.caption} onChange={(v) => patch("caption", v)} />
        <div className="mt-3"><Field label="Hashtags (pisahkan dengan spasi)" value={plan.hashtags.join(" ")} onChange={(v) => patch("hashtags", v.split(/\s+/).filter(Boolean))} /></div>
      </Card>
    </div>
  );
}
