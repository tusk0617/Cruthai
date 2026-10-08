import type { Brief } from "@/lib/ai/schema";

export interface Template { id: string; name: string; description: string; brief: Partial<Brief> }

export const TEMPLATES: Template[] = [
  { id: "affiliate-review", name: "Affiliate First Impression", description: "Review jujur dengan hook rasa penasaran, cocok untuk affiliate TikTok Shop.",
    brief: { platform: "TikTok", duration: 30, style: "Casual / UGC", objective: "Sales", ctaStyle: "Direct Selling" } },
  { id: "cinematic-product", name: "Cinematic Product Reveal", description: "Reveal produk sinematik pendek untuk brand lokal.",
    brief: { platform: "Instagram Reels", duration: 15, style: "Cinematic", objective: "Awareness", ctaStyle: "Soft Selling" } },
  { id: "edu-tips", name: "Edukasi 3 Tips", description: "Konten edukasi singkat yang menempatkan produk sebagai bagian solusi.",
    brief: { platform: "YouTube Shorts", duration: 45, style: "Edukatif", objective: "Edukasi", ctaStyle: "Engagement" } },
  { id: "umkm-story", name: "UMKM Behind the Scenes", description: "Cerita di balik usaha kecil untuk membangun kedekatan dengan audiens.",
    brief: { platform: "Instagram Reels", duration: 30, style: "Storytelling", objective: "Engagement", ctaStyle: "Engagement" } },
  { id: "funny-relatable", name: "Humor Relatable", description: "Skenario relatable yang lucu dan mudah dibagikan.",
    brief: { platform: "TikTok", duration: 15, style: "Humor", objective: "Engagement", ctaStyle: "Engagement" } },
  { id: "aesthetic-routine", name: "Aesthetic Routine", description: "Rutinitas estetik dengan produk sebagai bagian dari hari.",
    brief: { platform: "Instagram Reels", duration: 30, style: "Aesthetic", objective: "Awareness", ctaStyle: "Soft Selling" } },
];
