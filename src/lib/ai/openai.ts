import type { AIProvider, AIRequest } from "./provider";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  constructor(private cfg: { key?: string; model: string }) {}

  async generate(req: AIRequest): Promise<string> {
    if (!this.cfg.key) throw new Error("API key OpenAI belum diisi");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.cfg.key}` },
      body: JSON.stringify({
        model: this.cfg.model,
        response_format: { type: "json_object" },
        temperature: 0.8,
        messages: [{ role: "system", content: req.system }, { role: "user", content: req.user }],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}
