import type { Brief, Plan, Section } from "./schema";
import { HOOK_TYPES, CTA_STYLES } from "./schema";
import type { Strategy } from "./strategy";

const SYSTEM = `Kamu adalah ClipPlan: Scriptwriter profesional yang ahli membuat konten viral di TikTok, Instagram Reels, dan YouTube Shorts, sekaligus content strategist, video director, dan asisten video editor.
Kamu TIDAK membuat video. Kamu membuat rencana pra-produksi + skrip yang siap dipakai untuk shooting dan editing, berdasarkan produk/topik, target audiens, dan tone dari user.

ATURAN SKRIP (patuhi dengan ketat):
1. HOOK (0–3 detik): kalimat pembuka yang sangat memikat, memicu rasa penasaran, atau langsung menjawab masalah utama audiens. JANGAN mulai dengan sapaan klise seperti "Halo guys", "Hai semuanya", atau "Selamat datang". Hook harus berbeda satu sama lain (tipe berbeda).
2. ISI (BODY): poin penting yang padat, to-the-point, dan dinamis. Hindari kalimat bertele-tele; satu ide per scene. Ucapan (voiceOver) harus enak diucapkan dengan lisan.
3. VISUAL CUE: arahan visual untuk editor TIDAK boleh dicampur ke dalam voiceOver. Taruh di field "visual", "bRoll", dan "editingNotes". voiceOver hanya berisi kalimat yang diucapkan.
4. CALL TO ACTION (CTA): akhiri dengan ajakan bertindak yang halus namun kuat (mis. "Follow untuk tips berikutnya", "Komen di bawah kalau kamu setuju"), sesuai tujuan marketing.

ATURAN UMUM:
- Gunakan bahasa natural, tidak formal, sesuaikan dengan target audiens, tone, dan bahasa output yang diminta.
- Jumlah scene HARUS sesuai instruksi dan total durasi HARUS sesuai durasi video (timestamp berurutan, tanpa celah, endSec scene terakhir = durasi).
- Visual harus realistis untuk shooting dengan smartphone.
- JANGAN membuat klaim produk, angka, harga, hasil, atau testimoni yang tidak diberikan user. JANGAN mengarang benefit.
- JANGAN clickbait yang menyesatkan. Hook harus relevan dengan produk.
- Prioritaskan retention di 3 detik pertama; sesuaikan hook dengan platform.
- Jika informasi kurang, tulis asumsi secara eksplisit di "assumptions".
- Output praktis untuk creator dan editor.
- Balas HANYA dengan satu objek JSON valid. Tanpa teks pengantar atau penutup, tanpa markdown, tanpa komentar.`;

const SHAPES: Record<string, string> = {
  concept: `"concept": {"title":"","concept":"","targetAudience":"","objective":"","tone":"","angle":""}`,
  hooks: `"hooks": [ {"text":"","visual":"","voiceOver":"","type":"${HOOK_TYPES.join("|")}"} ]  // 4-5 item, tipe bervariasi`,
  script: `"script": [ {"label":"HOOK|PROBLEM|PRODUCT|BENEFIT|CTA","startSec":0,"endSec":3,"voiceOver":"","onScreenText":""} ]`,
  scenes: `"scenes": [ {"startSec":0,"endSec":3,"scene":"","visual":"","cameraShot":"","cameraMovement":"","voiceOver":"","onScreenText":"","bRoll":"","transition":"","sfx":"","editingNotes":""} ]`,
  shotList: `"shotList": [ {"name":"","shotType":"","purpose":"","durationSec":3,"cameraAngle":"","done":false} ]`,
  editingGuide: `"editingGuide": {"pacing":"Fast|Medium|Slow","cutFrequency":"","transition":"","textAnimation":"","subtitle":"","bRoll":"","sfx":"","music":"","color":""}`,
  ctas: `"ctas": [ {"style":"${CTA_STYLES.join("|")}","text":""} ]  // tepat 3 item, satu per style`,
  caption: `"caption": "", "hashtags": ["#..."]`,
};

function shapeFor(section: Section | "all"): string {
  const keys = section === "all"
    ? ["concept", "hooks", "script", "scenes", "shotList", "editingGuide", "ctas", "caption"]
    : section === "scriptScenes" ? ["script", "scenes"] : [section];
  const body = keys.map((k) => SHAPES[k]).join(",\n  ");
  return `{\n  ${body}${section === "all" ? ',\n  "assumptions": ["..."]' : ""}\n}`;
}

function briefBlock(b: Brief, s: Strategy): string {
  return `BRIEF
- Produk/topik: ${b.productName}
- Deskripsi: ${b.description || "(kosong)"}
- Kategori: ${b.category || "(kosong)"}
- Benefit (HANYA ini yang boleh diklaim): ${b.benefits || "(kosong)"}
- Target audiens: ${b.targetAudience || "(kosong)"}
- Platform: ${b.platform}
- Durasi: ${b.duration} detik
- Gaya: ${b.style}
- Tujuan: ${b.objective}
- Bahasa output: ${b.language === "id" ? "Bahasa Indonesia (santai)" : "English (casual)"}
- Gaya CTA: ${b.ctaStyle}

STRATEGI
- Jumlah scene: ${s.sceneCount}
- Hook window: ${s.hookWindowSec} detik pertama
- Pacing: ${s.pacing}; cut: ${s.cutFrequency}
- Tipe hook prioritas: ${s.preferredHookTypes.join(", ")}
- Fokus CTA: ${s.ctaFocus}
- Aturan caption: ${s.captionRules}`;
}

export function buildPrompt(section: Section | "all", b: Brief, s: Strategy, plan?: Plan) {
  const hook = plan?.hooks.find((h) => h.id === plan.selectedHookId);
  const context = plan
    ? `\nPLAN SAAT INI (konteks; ubah HANYA bagian yang diminta)\n${JSON.stringify(
        { concept: plan.concept, selectedHook: hook ?? null, script: plan.script, scenes: plan.scenes, ctas: plan.ctas }, null, 1)}\n`
    : "";
  const hookRule = hook && (section === "scriptScenes" || section === "script" || section === "scenes")
    ? `\nGunakan hook terpilih ini sebagai pembuka (0–${s.hookWindowSec} detik) dan selaraskan seluruh alur: "${hook.text}"\n` : "";
  const task = section === "all"
    ? "Buat video production plan lengkap."
    : `Buat ulang HANYA bagian "${section}". Variasikan dari versi sebelumnya.`;
  const user = `${task}\n\n${briefBlock(b, s)}\n${context}${hookRule}\nFORMAT JSON YANG HARUS DIIKUTI:\n${shapeFor(section)}`;
  return { system: SYSTEM, user };
}

export function buildRepairPrompt(previousUser: string, rawOutput: string, errors: string) {
  return `${previousUser}\n\nOUTPUT SEBELUMNYA TIDAK VALID.\nError: ${errors}\nOutput sebelumnya (dipotong): ${rawOutput.slice(0, 1500)}\n\nPerbaiki dan kembalikan HANYA JSON valid sesuai format.`;
}
