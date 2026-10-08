import type { Brief } from "./schema";

/** Content Strategy Processor: turns a raw brief into decisions the prompt builder / providers rely on. */
export interface Strategy {
  sceneCount: number;
  hookWindowSec: number;
  pacing: "Fast" | "Medium" | "Slow";
  cutFrequency: string;
  preferredHookTypes: string[];
  ctaFocus: string;
  benefits: string[];
  assumptions: string[];
  captionRules: string;
}

const splitList = (s: string) =>
  s.split(/\n|;|•|(?:^|\s)-\s|,(?=\s*[A-ZÀ-Ža-z])/).map((x) => x.trim()).filter((x) => x.length > 1);

export function buildStrategy(b: Brief): Strategy {
  const sceneCount = b.duration <= 15 ? 4 : b.duration <= 30 ? 6 : b.duration <= 45 ? 8 : 10;
  const pacing = b.style === "Cinematic" || b.style === "Storytelling" ? (b.duration <= 15 ? "Fast" : "Medium")
    : b.style === "Aesthetic" ? "Slow" : "Fast";
  const cut = pacing === "Fast" ? "Setiap 1–2 detik" : pacing === "Medium" ? "Setiap 2–3 detik" : "Setiap 3–5 detik";

  const preferredHookTypes =
    b.objective === "Sales" ? ["Curiosity", "Problem", "Direct selling", "FOMO"]
    : b.objective === "Engagement" ? ["Controversy", "Relatable", "Curiosity"]
    : b.objective === "Edukasi" ? ["Problem", "Curiosity", "Storytelling"]
    : ["Storytelling", "Curiosity", "Relatable"];

  const benefits = splitList(b.benefits);
  const assumptions: string[] = [];
  if (!b.description) assumptions.push("Deskripsi produk tidak diisi — plan dibuat dari nama produk saja, tanpa klaim spesifik.");
  if (benefits.length === 0) assumptions.push("Benefit produk tidak diisi — script memakai framing pengalaman/first impression, bukan klaim manfaat. Tambahkan benefit asli untuk hasil lebih tajam.");
  if (!b.targetAudience) assumptions.push("Target audiens tidak diisi — diasumsikan audiens umum pengguna " + b.platform + ".");

  return {
    sceneCount, hookWindowSec: 3, pacing, cutFrequency: cut, preferredHookTypes,
    ctaFocus: b.objective === "Sales" ? "konversi / klik link" : b.objective === "Engagement" ? "komentar & share" : "follow / simpan",
    benefits, assumptions,
    captionRules: b.platform === "Instagram Reels"
      ? "Sedikit lebih panjang, storytelling, CTA, hashtag" : "Pendek, conversational, baris pertama kuat, CTA, hashtag",
  };
}
