import type { Plan } from "@/lib/ai/schema";

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Plain-text/markdown export that an editor or creator can paste anywhere. */
export function planToMarkdown(name: string, p: Plan): string {
  const hook = p.hooks.find((h) => h.id === p.selectedHookId);
  const cta = p.ctas.find((c) => c.id === p.selectedCtaId);
  const L: string[] = [`# ${name}`, ""];
  if (p.assumptions.length) L.push("> Asumsi: " + p.assumptions.join(" | "), "");
  L.push("## Video Concept", `- Title: ${p.concept.title}`, `- Concept: ${p.concept.concept}`, `- Target audience: ${p.concept.targetAudience}`,
    `- Objective: ${p.concept.objective}`, `- Tone: ${p.concept.tone}`, `- Content angle: ${p.concept.angle}`, "");
  if (hook) L.push("## Selected Hook", `"${hook.text}" (${hook.type})`, `Visual: ${hook.visual}`, "");
  L.push("## Script");
  for (const s of p.script) L.push(`${mmss(s.startSec)}–${mmss(s.endSec)} ${s.label}`, `  VO: ${s.voiceOver}`, `  Text: ${s.onScreenText}`);
  L.push("", "## Scene Breakdown", "| Time | Dur | Scene | Visual | Shot | Movement | VO | Text | B-roll | Transition | SFX | Editing |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
  const c = (x: string) => (x || "").replace(/\|/g, "/").replace(/\n/g, " ");
  for (const s of p.scenes)
    L.push(`| ${mmss(s.startSec)}–${mmss(s.endSec)} | ${s.endSec - s.startSec}s | ${[s.scene, s.visual, s.cameraShot, s.cameraMovement, s.voiceOver, s.onScreenText, s.bRoll, s.transition, s.sfx, s.editingNotes].map(c).join(" | ")} |`);
  L.push("", "## Shot List");
  for (const s of p.shotList) L.push(`- [${s.done ? "x" : " "}] ${s.name} — ${s.shotType}, ${s.durationSec}s, ${s.cameraAngle} (${s.purpose})`);
  const g = p.editingGuide;
  L.push("", "## Editing Guide", `- Pacing: ${g.pacing}`, `- Cut frequency: ${g.cutFrequency}`, `- Transition: ${g.transition}`, `- Text animation: ${g.textAnimation}`,
    `- Subtitle: ${g.subtitle}`, `- B-roll: ${g.bRoll}`, `- SFX: ${g.sfx}`, `- Music: ${g.music}`, `- Color: ${g.color}`);
  if (cta) L.push("", "## CTA", `${cta.style}: "${cta.text}"`);
  L.push("", "## Caption", p.caption, "", p.hashtags.join(" "));
  return L.join("\n");
}
