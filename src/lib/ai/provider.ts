import type { Brief, Plan, Section } from "./schema";
import type { Strategy } from "./strategy";

export interface AITask {
  section: Section | "all";
  brief: Brief;
  strategy: Strategy;
  /** Current plan (for section regeneration / hook adaptation). */
  plan?: Plan;
}

export interface AIRequest {
  system: string;
  user: string;
  task: AITask;
}

/** Providers return raw text that should contain a single JSON object. Validation happens in the engine. */
export interface AIProvider {
  readonly name: string;
  generate(req: AIRequest): Promise<string>;
}
