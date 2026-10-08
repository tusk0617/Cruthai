import type { AIProvider, AIRequest } from "./provider";

/**
 * Offline provider so the whole product works without an API key.
 * It never invents product claims: benefits come only from the brief.
 */
const slug = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();
const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const r = Math.round;

export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  async generate(req: AIRequest): Promise<string> {
    const { brief: b, strategy: st, section, plan } = req.task;
    const L = (a: string, e: string) => (b.language === "id" ? a : e);
    const seed = Math.floor(Math.random() * 1000);
    const name = b.productName;
    const aud = b.targetAudience;
    const D = b.duration;
    const benefits = st.benefits.slice(0, 3);

    // ---- Hooks
    const hookBank: Record<string, { text: string; visual: string }[]> = {
      Curiosity: [
        { text: L(`Ternyata ${name} ini beda dari yang gue kira.`, `${name} wasn't what I expected.`), visual: L("Close-up produk, perlahan diputar ke kamera", "Slow close-up of the product turning toward camera") },
        { text: L(`Gue penasaran banget sama ${name}, jadi gue coba.`, `I got curious about ${name}, so I tried it.`), visual: L("Creator memegang produk sambil menaikkan alis ke kamera", "Creator holds product, eyebrow raised at camera") },
      ],
      Problem: [
        { text: b.category ? L(`Bingung milih ${b.category} yang pas?`, `Confused picking the right ${b.category}?`) : L("Sering bingung milih yang pas? Lihat ini dulu.", "Always unsure what to pick? Watch this first."), visual: L("Creator menggaruk kepala di depan beberapa pilihan", "Creator scratching head in front of several options") },
        { text: L("Masalah yang sering kejadian, dan gue baru nemu ini.", "A problem we all have, and I just found this."), visual: L("Medium shot creator menunjuk teks 'masalah' di layar", "Medium shot, creator points to on-screen 'problem' text") },
      ],
      FOMO: [
        { text: L(`Sebelum ikut-ikutan beli, lihat ${name} dulu.`, `Before you buy anything, look at ${name} first.`), visual: L("Produk di tengah frame, tangan terangkat isyarat 'tunggu dulu'", "Product centered, hand up in a 'wait' gesture") },
      ],
      Controversy: [
        { text: L(`Gue nggak setuju sama yang bilang ${name} biasa aja.`, `I disagree with people calling ${name} average.`), visual: L("Creator menggeleng lalu mengangkat produk", "Creator shakes head then lifts the product") },
      ],
      Relatable: [
        { text: aud ? L(`Buat kamu yang ${aud}, ini relate banget.`, `If you're ${aud}, this is for you.`) : L(`Siapa di sini yang kepo sama ${name}?`, `Who else is curious about ${name}?`), visual: L("Selfie shot, creator tersenyum sambil mengangkat produk", "Selfie shot, creator smiles holding the product") },
      ],
      Storytelling: [
        { text: L(`Awalnya gue skeptis sama ${name}...`, `I was skeptical about ${name} at first...`), visual: L("Produk di meja, tangan ragu-ragu mengambilnya", "Product on a table, hand hesitantly picking it up") },
      ],
      "Direct selling": [
        { text: L(`${name}: ini yang perlu kamu tahu dalam ${D} detik.`, `${name}: everything you need to know in ${D} seconds.`), visual: L("Hero shot produk dengan teks nama besar", "Hero shot of product with big title text") },
      ],
    };
    const order = [...st.preferredHookTypes, ...Object.keys(hookBank).filter((k) => !st.preferredHookTypes.includes(k))];
    const hooks = order.slice(0, 5).map((type, i) => {
      const o = pick(hookBank[type], seed + i);
      return { text: o.text, visual: o.visual, voiceOver: o.text, type };
    });
    const hook = plan?.hooks.find((h) => h.id === plan.selectedHookId) ?? hooks[0];

    // ---- CTAs
    const ctas = [
      { style: "Soft Selling", text: L(`Kalau penasaran sama ${name}, cek link di bio.`, `If you're curious about ${name}, check the link in bio.`) },
      { style: "Direct Selling", text: L("Klik link sekarang dan cobain sendiri.", "Tap the link now and try it yourself.") },
      { style: "Engagement", text: L("Menurut kamu, worth it nggak? Tulis di komentar.", "Is it worth it? Tell me in the comments.") },
    ];
    const cta = (plan?.ctas.find((c) => c.id === plan.selectedCtaId) ?? ctas.find((c) => c.style === b.ctaStyle) ?? ctas[1]).text;

    // ---- Script (timeline split)
    const bnd = [0, 3, Math.max(4, r(D * 0.25)), r(D * 0.6), r(D * 0.88), D];
    const firstSentence = b.description.split(/(?<=[.!?])\s/)[0] ?? "";
    const script = [
      { label: "HOOK", voiceOver: hook.voiceOver, onScreenText: `${name}?!` },
      { label: "PROBLEM", voiceOver: aud ? L(`Buat kita yang ${aud}, kadang bingung nentuin pilihan yang cocok.`, `For ${aud}, picking the right one isn't always easy.`) : L("Jujur, kadang bingung nentuin pilihan yang cocok.", "Honestly, picking the right one isn't always easy."), onScreenText: L("Masalahnya...", "The problem...") },
      { label: "PRODUCT", voiceOver: L(`Makanya gue coba ${name}.`, `So I tried ${name}.`) + (firstSentence ? " " + firstSentence : ""), onScreenText: name },
      { label: "BENEFIT", voiceOver: benefits.length ? L(`Yang gue perhatiin: ${benefits.join(", ")}.`, `What stood out: ${benefits.join(", ")}.`) : L("Ini kesan pertama gue. Nilai sendiri ya di video ini.", "That's my first impression. Judge for yourself in this video."), onScreenText: benefits.length ? benefits.join(" • ") : "First impression" },
      { label: "CTA", voiceOver: cta, onScreenText: L("Cek link di bio", "Link in bio") },
    ].map((s, i) => ({ ...s, startSec: bnd[i], endSec: bnd[i + 1] }));

    // ---- Scenes
    const bank = [
      { scene: "Hook — hero shot", visual: hook.visual, cameraShot: "Close-up", cameraMovement: L("Push-in cepat", "Fast push-in"), transition: "Hard cut", sfx: "Bass hit", b: L("Detail tekstur/kemasan produk", "Texture / packaging detail"), n: L("Zoom 110% di beat pertama", "110% zoom on first beat") },
      { scene: L("Masalah / konteks", "Problem / context"), visual: L("Creator bicara ke kamera, ekspresi relatable", "Creator talks to camera, relatable expression"), cameraShot: "Medium shot", cameraMovement: L("Handheld stabil", "Steady handheld"), transition: "Hard cut", sfx: "Whoosh", b: L("Situasi sehari-hari terkait masalah", "Everyday situation tied to the problem"), n: L("Jump cut untuk menghapus jeda napas", "Jump cuts to remove pauses") },
      { scene: L("Reveal produk", "Product reveal"), visual: L("Produk dipegang, label menghadap kamera", "Product held, label facing camera"), cameraShot: "Close-up", cameraMovement: "Tilt", transition: "Swipe", sfx: "Click", b: "Unboxing", n: L("Teks nama produk muncul (pop)", "Product name text pops in") },
      { scene: L("Detail produk", "Product detail"), visual: L("Close-up detail yang sesuai benefit yang disebut", "Close-up of details matching the stated benefits"), cameraShot: "Macro", cameraMovement: L("Slider kiri ke kanan", "Slider left to right"), transition: "Match cut", sfx: "Click", b: L("Detail tambahan produk", "Extra product details"), n: L("Speed ramp di momen detail", "Speed ramp on the detail moment") },
      { scene: L("Demo penggunaan", "Usage demo"), visual: L("Creator memakai/mendemokan produk", "Creator demonstrates the product"), cameraShot: "Over-the-shoulder", cameraMovement: L("Handheld mengikuti tangan", "Handheld following hands"), transition: "Hard cut", sfx: "Pop", b: L("Reaksi kecil saat memakai", "Small reaction while using"), n: L("Potong tiap 1–2 detik", "Cut every 1–2 seconds") },
      { scene: "Lifestyle", visual: L("Produk dipakai dalam aktivitas nyata", "Product used in a real-life moment"), cameraShot: "Wide shot", cameraMovement: "Gimbal", transition: "Zoom", sfx: "Whoosh", b: L("Suasana sekitar", "Ambient shots"), n: L("Warna sedikit hangat", "Slightly warm grade") },
      { scene: L("Reaksi creator", "Creator reaction"), visual: L("Creator memberi reaksi jujur ke kamera", "Creator gives an honest reaction to camera"), cameraShot: "Selfie medium close-up", cameraMovement: "Static", transition: "Hard cut", sfx: "Pop", b: L("Cutaway produk", "Cutaway to product"), n: L("Subtitle besar, ritme cepat", "Big subtitles, fast rhythm") },
      { scene: "Recap benefit", visual: L("Produk di tengah frame, teks benefit bergantian", "Product centered, benefit texts appear in turn"), cameraShot: "Hero shot", cameraMovement: L("Orbit pelan", "Slow orbit"), transition: "Swipe", sfx: "Click", b: L("Detail produk", "Product detail"), n: L("Text pop berurutan sesuai VO", "Text pops in sync with VO") },
      { scene: L("Produk + suasana", "Product + mood"), visual: L("Produk di setting rapi, cahaya lembut", "Product in a clean setting, soft light"), cameraShot: "Medium", cameraMovement: L("Slider pelan", "Slow slider"), transition: "Match cut", sfx: "Riser", b: "Ambient", n: L("Perlambat sedikit sebelum CTA", "Ease the pace before CTA") },
      { scene: L("CTA penutup", "Closing CTA"), visual: L("Creator menunjuk ke bawah / link, produk di tangan", "Creator points to the link, product in hand"), cameraShot: "Medium close-up", cameraMovement: "Static", transition: "Hard cut", sfx: "Pop", b: L("Hero shot produk terakhir", "Final product hero shot"), n: L("Teks CTA tampil di 2 detik terakhir", "CTA text on the last 2 seconds") },
    ];
    const pickIdx: Record<number, number[]> = { 4: [0, 1, 3, 9], 6: [0, 1, 2, 3, 6, 9], 8: [0, 1, 2, 3, 4, 6, 7, 9], 10: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] };
    const idxs = pickIdx[st.sceneCount] ?? pickIdx[6];
    const N = idxs.length;
    const edges = [0, 3, ...Array.from({ length: N - 1 }, (_, i) => r(3 + ((D - 3) * (i + 1)) / (N - 1)))];
    const used = new Set<number>();
    const scenes = idxs.map((bi, i) => {
      const t = bank[bi];
      const start = edges[i];
      const end = i === N - 1 ? D : edges[i + 1];
      const segIdx = Math.max(0, script.findIndex((s) => start >= s.startSec && start < s.endSec));
      const first = !used.has(segIdx);
      used.add(segIdx);
      const seg = script[segIdx];
      return {
        startSec: start, endSec: end, scene: t.scene, visual: t.visual, cameraShot: t.cameraShot, cameraMovement: t.cameraMovement,
        voiceOver: first ? seg.voiceOver : "—", onScreenText: first ? seg.onScreenText : "", bRoll: t.b, transition: t.transition, sfx: t.sfx, editingNotes: t.n,
      };
    });

    // ---- Shot list
    const shotBank: [string, string, string, number, string][] = [
      ["Product hero shot", "Hero", L("Pembuka & thumbnail", "Opener & thumbnail"), 3, "Eye level"],
      ["Product close-up", "Close-up", L("Detail & hook visual", "Detail & hook visual"), 2, L("45° dari atas", "45° from above")],
      ["Product in hand", "Medium close-up", "Reveal / first impression", 3, "Eye level"],
      ["Product detail / macro", "Macro", L("Tunjukkan detail yang relevan", "Show relevant details"), 3, L("Dekat, sedikit miring", "Close, slightly tilted")],
      ["Unboxing", "Overhead", L("Momen buka kemasan", "Unboxing moment"), 4, "Top-down"],
      ["Creator reaction", "Selfie medium", L("Reaksi jujur", "Honest reaction"), 3, "Eye level"],
      ["Product demonstration", "OTS", L("Tunjukkan cara pakai", "Show how it's used"), 5, "Over-the-shoulder"],
      ["Lifestyle shot", "Wide", L("Konteks pemakaian nyata", "Real-life context"), 4, "Eye level / gimbal"],
      ["Final CTA shot", "Medium close-up", L("Penutup & ajakan", "Closing & call to action"), 3, "Eye level"],
    ];
    const count = Math.min(9, Math.max(6, N + 2));
    const chosenShots = [...shotBank.slice(0, count - 1), shotBank[8]];
    const shotList = chosenShots.map(([n, t, p, d, a]) => ({ name: n, shotType: t, purpose: p, durationSec: d, cameraAngle: a, done: false }));

    // ---- Editing guide
    const editingGuide = {
      pacing: st.pacing, cutFrequency: st.cutFrequency,
      transition: b.style === "Cinematic" ? "Hard cut + match cut, zoom di beat" : "Hard cut + swipe",
      textAnimation: st.pacing === "Fast" ? "Pop" : "Slide",
      subtitle: L("Teks tebal putih outline gelap, 1–2 baris, area aman tengah-bawah", "Bold white text with dark outline, 1–2 lines, lower-middle safe area"),
      bRoll: L("Sisipkan saat VO menyebut produk/benefit; maks 2 detik per klip", "Insert when VO mentions product/benefits; max 2s per clip"),
      sfx: "Whoosh, Click, Bass hit, Pop",
      music: b.style === "Cinematic" ? "Cinematic bass / ambient build-up" : b.style === "Aesthetic" ? "Lo-fi / soft chill" : L("Upbeat trending, volume rendah di bawah VO", "Upbeat trending, low under VO"),
      color: b.style === "Cinematic" ? "High contrast" : b.style === "Aesthetic" ? "Warm" : "Natural",
    };

    // ---- Concept / caption
    const concept = {
      title: `${name} — ${b.style} ${b.platform} ${D}s`,
      concept: L(`Video ${D} detik bergaya ${b.style.toLowerCase()} yang memperkenalkan ${name} lewat hook kuat, lalu alur masalah → produk → benefit → CTA.`, `A ${D}-second ${b.style.toLowerCase()} video introducing ${name}: strong hook, then problem → product → benefit → CTA.`),
      targetAudience: aud || L("Audiens umum " + b.platform, "General " + b.platform + " audience"),
      objective: b.objective, tone: b.style,
      angle: b.objective === "Sales" ? L("First impression jujur → ajak coba sendiri", "Honest first impression → invite to try") : b.objective === "Engagement" ? L("Pertanyaan relatable yang memancing komentar", "Relatable question that drives comments") : L("Edukasi singkat lalu soft CTA", "Quick education then soft CTA"),
    };
    const tags = [name, b.category, b.platform === "TikTok" ? "fyp" : b.platform === "Instagram Reels" ? "reels" : "shorts", "rekomendasi", "contentcreator"]
      .map(slug).filter(Boolean).map((t) => "#" + t);
    const caption = b.platform === "Instagram Reels"
      ? `${hook.text}\n\n${L(`Cerita singkat: gue coba ${name} dan ini kesan pertama gue, berdasarkan info produk yang ada.`, `Quick story: I tried ${name} and this is my first impression, based on the product info I have.`)}\n\n${cta}`
      : `${hook.text}\n\n${cta}`;

    const out: Record<string, unknown> = { concept, hooks, script, scenes, shotList, editingGuide, ctas, caption, hashtags: [...new Set(tags)], assumptions: st.assumptions };
    const keys = section === "all" ? Object.keys(out) : section === "scriptScenes" ? ["script", "scenes"] : section === "caption" ? ["caption", "hashtags"] : [section];
    return JSON.stringify(Object.fromEntries(keys.map((k) => [k, out[k]])));
  }
}
