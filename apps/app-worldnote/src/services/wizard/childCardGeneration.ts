import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { createCardTemplate } from "../crudWorldCard/cardTemplates.js";
import { streamWizardChat, type WizardChatMessage } from "./ollamaClient.js";

type JsonSchema = Record<string, unknown>;

type Position = { x: number; y: number };

/** Creative fields every generated card may include. */
const BASE_GEN_PROPERTIES: Record<string, JsonSchema> = {
  name: { type: "string" },
  subtitle: { type: "string" },
  description: { type: "string" },
  lore: { type: "string" },
  tags: { type: "array", items: { type: "string" } },
};

/** Type-specific creative fields the LLM is allowed to fill. */
const TYPE_GEN_PROPERTIES: Partial<
  Record<WorldCard["card_type"], Record<string, JsonSchema>>
> = {
  character: {
    race: { type: "string" },
    gender: { type: "string", enum: ["male", "female", "x"] },
    appearance: { type: "string" },
    personality: { type: "string" },
  },
};

/** Builds a reduced Ollama JSON schema for the creative subset of a card type. */
export function buildGenerationSchema(
  cardType: WorldCard["card_type"],
): JsonSchema {
  const properties = {
    ...BASE_GEN_PROPERTIES,
    ...(TYPE_GEN_PROPERTIES[cardType] ?? {}),
  };
  return {
    type: "object",
    properties,
    required: ["name"],
  };
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  const tryParse = (text: string): Record<string, unknown> | null => {
    try {
      const value = JSON.parse(text);
      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw.trim());
  if (direct) return direct;

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    const parsed = tryParse(fenced[1].trim());
    if (parsed) return parsed;
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return tryParse(raw.slice(start, end + 1));
  }
  return null;
}

const STRUCTURAL_KEYS = new Set([
  "id",
  "card_type",
  "parent_id",
  "position",
  "custom_properties",
]);

function mergeIntoTemplate(
  cardType: WorldCard["card_type"],
  position: Position,
  data: Record<string, unknown>,
): unknown {
  const name = typeof data.name === "string" ? data.name : undefined;
  const template = createCardTemplate(cardType, position, name) as Record<
    string,
    unknown
  >;
  const merged: Record<string, unknown> = { ...template };

  for (const [key, value] of Object.entries(data)) {
    if (STRUCTURAL_KEYS.has(key) || value === null || value === undefined) {
      continue;
    }
    if (key === "tags") {
      merged.tags = Array.isArray(value)
        ? value.filter((tag): tag is string => typeof tag === "string")
        : [];
      continue;
    }
    merged[key] = value;
  }

  return merged;
}

export type GenerateCardOptions = {
  host?: string;
  model: string;
  cardType: WorldCard["card_type"];
  systemPrompt: string;
  contextMessage: string;
  userPrompt: string;
  position: Position;
};

/**
 * Asks the local model for a structured card, validates it against the Zod
 * contract, and retries once silently if the first attempt is invalid.
 */
export async function generateCard(
  options: GenerateCardOptions,
): Promise<WorldCard> {
  const schema = buildGenerationSchema(options.cardType);
  const messages: WizardChatMessage[] = [
    {
      role: "system",
      content: `${options.systemPrompt}\nYou must respond with ONLY valid JSON that matches the provided schema. Do not include any prose, explanation, or markdown.`,
    },
    {
      role: "user",
      content: `${options.contextMessage}\n\n[TASK]\n${options.userPrompt}`,
    },
  ];

  const attempt = async (): Promise<WorldCard | null> => {
    const raw = await streamWizardChat({
      host: options.host,
      model: options.model,
      messages,
      format: schema,
    });
    const parsed = safeParseJson(raw);
    if (!parsed) return null;
    const merged = mergeIntoTemplate(options.cardType, options.position, parsed);
    const result = WorldCardSchema.safeParse(merged);
    return result.success ? result.data : null;
  };

  let card = await attempt();
  if (!card) {
    card = await attempt();
  }
  if (!card) {
    throw new Error("WorldWizard could not generate a valid card. Try again.");
  }
  return card;
}
