import type { AIProvider, AIRequest } from "./provider";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  constructor(private cfg: { key?: string; model: string }) {}

  async generate(req: AIRequest): Promise<string> {
    if (!this.cfg.key) throw new Error("API key Gemini belum diisi");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.cfg.model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.cfg.key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts: [{ text: req.user }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  }
}
