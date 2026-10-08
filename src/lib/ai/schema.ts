import { z } from "zod";

export const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts"] as const;
export const DURATIONS = [15, 30, 45, 60] as const;
export const STYLES = ["Cinematic", "Casual / UGC", "Edukatif", "Storytelling", "Humor", "Aesthetic"] as const;
export const OBJECTIVES = ["Sales", "Awareness", "Engagement", "Edukasi"] as const;
export const LANGUAGES = [{ id: "id", label: "Bahasa Indonesia" }, { id: "en", label: "English" }] as const;
export const CTA_STYLES = ["Soft Selling", "Direct Selling", "Engagement"] as const;
export const HOOK_TYPES = ["Curiosity", "Problem", "FOMO", "Controversy", "Relatable", "Storytelling", "Direct selling"] as const;

export const briefSchema = z.object({
  productName: z.string().trim().min(2, "Isi nama produk / topik").max(120),
  description: z.string().trim().max(1500).default(""),
  category: z.string().trim().max(80).default(""),
  benefits: z.string().trim().max(800).default(""),
  targetAudience: z.string().trim().max(300).default(""),
  platform: z.enum(PLATFORMS).default("TikTok"),
  duration: z.coerce.number().refine((n) => (DURATIONS as readonly number[]).includes(n), "Durasi tidak valid").default(30),
  style: z.enum(STYLES).default("Cinematic"),
  objective: z.enum(OBJECTIVES).default("Sales"),
  language: z.enum(["id", "en"]).default("id"),
  ctaStyle: z.enum(CTA_STYLES).default("Direct Selling"),
});
export type Brief = z.infer<typeof briefSchema>;

const str = z.string().trim();
const sec = z.coerce.number().min(0).max(180);

export const conceptSchema = z.object({
  title: str.min(1), concept: str.min(1), targetAudience: str, objective: str, tone: str, angle: str,
});
export const hookSchema = z.object({
  id: z.string().optional(), text: str.min(1), visual: str, voiceOver: str, type: z.enum(HOOK_TYPES),
});
export const scriptSegmentSchema = z.object({
  id: z.string().optional(), label: str.min(1), startSec: sec, endSec: sec, voiceOver: str, onScreenText: str,
});
export const sceneSchema = z.object({
  id: z.string().optional(), startSec: sec, endSec: sec, scene: str, visual: str, cameraShot: str, cameraMovement: str,
  voiceOver: str, onScreenText: str, bRoll: str, transition: str, sfx: str, editingNotes: str,
});
export const shotSchema = z.object({
  id: z.string().optional(), name: str.min(1), shotType: str, purpose: str, durationSec: z.coerce.number().min(0).max(120), cameraAngle: str,
  done: z.boolean().default(false),
});
export const editingGuideSchema = z.object({
  pacing: str, cutFrequency: str, transition: str, textAnimation: str, subtitle: str, bRoll: str, sfx: str, music: str, color: str,
});
export const ctaSchema = z.object({
  id: z.string().optional(), style: z.enum(CTA_STYLES), text: str.min(1),
});

export const planSchema = z.object({
  concept: conceptSchema,
  hooks: z.array(hookSchema).min(3).max(5),
  script: z.array(scriptSegmentSchema).min(3),
  scenes: z.array(sceneSchema).min(3),
  shotList: z.array(shotSchema).min(3),
  editingGuide: editingGuideSchema,
  ctas: z.array(ctaSchema).min(3).max(3),
  caption: str.min(1),
  hashtags: z.array(str.min(1)).min(3).max(20),
  assumptions: z.array(str).default([]),
});
export type GeneratedPlan = z.infer<typeof planSchema>;

/** Plan as held in the editor/DB (ids always present, selections included). */
export interface Plan {
  concept: z.infer<typeof conceptSchema>;
  hooks: (z.infer<typeof hookSchema> & { id: string })[];
  selectedHookId: string | null;
  script: (z.infer<typeof scriptSegmentSchema> & { id: string })[];
  scenes: (z.infer<typeof sceneSchema> & { id: string })[];
  shotList: (z.infer<typeof shotSchema> & { id: string })[];
  editingGuide: z.infer<typeof editingGuideSchema>;
  ctas: (z.infer<typeof ctaSchema> & { id: string })[];
  selectedCtaId: string | null;
  caption: string;
  hashtags: string[];
  assumptions: string[];
}

export const SECTIONS = ["concept", "hooks", "script", "scenes", "shotList", "editingGuide", "ctas", "caption", "scriptScenes"] as const;
export type Section = (typeof SECTIONS)[number];

/** Zod shape returned by the AI for each regenerable section. */
export const sectionSchemas: Record<Section, z.ZodTypeAny> = {
  concept: z.object({ concept: conceptSchema }),
  hooks: z.object({ hooks: planSchema.shape.hooks }),
  script: z.object({ script: planSchema.shape.script }),
  scenes: z.object({ scenes: planSchema.shape.scenes }),
  shotList: z.object({ shotList: planSchema.shape.shotList }),
  editingGuide: z.object({ editingGuide: editingGuideSchema }),
  ctas: z.object({ ctas: planSchema.shape.ctas }),
  caption: z.object({ caption: planSchema.shape.caption, hashtags: planSchema.shape.hashtags }),
  scriptScenes: z.object({ script: planSchema.shape.script, scenes: planSchema.shape.scenes }),
};

const idd = z.object({ id: z.string().min(1).max(64) });
/** Plan as edited by the user (ids + selections). Length minimums relaxed so rows can be deleted. Used to validate every client-supplied plan. */
export const planEditSchema = z.object({
  concept: conceptSchema,
  hooks: z.array(hookSchema.merge(idd)).max(10),
  selectedHookId: z.string().nullable(),
  script: z.array(scriptSegmentSchema.merge(idd)).max(30),
  scenes: z.array(sceneSchema.merge(idd)).max(40),
  shotList: z.array(shotSchema.merge(idd)).max(60),
  editingGuide: editingGuideSchema,
  ctas: z.array(ctaSchema.merge(idd)).max(6),
  selectedCtaId: z.string().nullable(),
  caption: z.string().max(4000),
  hashtags: z.array(z.string().max(60)).max(40),
  assumptions: z.array(z.string().max(500)).max(20),
});
