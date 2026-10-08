// Single source of truth for pricing. Edit here (or load from DB later) — never hardcode prices in components.
export type PlanId = "free" | "creator" | "pro" | "agency";

export interface PricingPlan {
  id: PlanId;
  name: string;
  priceIdr: number;
  creditsPerMonth: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PricingPlan[] = [
  { id: "free", name: "Free", priceIdr: 0, creditsPerMonth: 5, tagline: "Coba dulu, tanpa kartu kredit",
    features: ["5 video plan / bulan", "Hook, script & scene", "Shot list checklist", "Regenerate per section"] },
  { id: "creator", name: "Creator", priceIdr: 29000, creditsPerMonth: 40, tagline: "Untuk creator yang rutin posting", highlight: true,
    features: ["40 video plan / bulan", "Semua fitur Free", "Caption & hashtag per platform", "Riwayat generate"] },
  { id: "pro", name: "Pro", priceIdr: 59000, creditsPerMonth: 120, tagline: "Untuk creator & affiliate serius",
    features: ["120 video plan / bulan", "Semua fitur Creator", "Prioritas generate", "Template eksklusif"] },
  { id: "agency", name: "Agency", priceIdr: 149000, creditsPerMonth: 400, tagline: "Untuk tim & social media manager",
    features: ["400 video plan / bulan", "Semua fitur Pro", "Multi brand (segera)", "Kolaborasi tim (segera)"] },
];

export const DEFAULT_PLAN: PlanId = "free";
export const getPlan = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[0];
export const formatIdr = (n: number) => (n === 0 ? "Rp0" : "Rp" + n.toLocaleString("id-ID"));
