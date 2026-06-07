import {
  BASE_GEN_FIELDS,
  NAME_GEN_FIELD,
  TYPE_GEN_FIELDS,
  WorldCardSchema,
  type WorldCard,
} from "@worldnote/shared";
import { createCardTemplate } from "../crudWorldCard/cardTemplates.js";
import { withCardPatch } from "../crudWorldCard/withCardPatch.js";
import { streamWizardChat, type WizardChatMessage } from "./ollamaClient.js";
import { buildExpandPrompt, buildFillGapsPrompt } from "./expandPrompts.js";

type JsonSchema = Record<string, unknown>;

export const CARD_GENERATION_SYSTEM_SUFFIX = [
  "You must respond with ONLY valid JSON that matches the provided schema.",
  "Do not include any prose, explanation, or markdown.",
  "Invent all missing creative details yourself — names, lore, appearance, personality, and every other field.",
  "Never ask the user for more information or say you cannot complete the request.",
] as const;

type Position = { x: number; y: number };

export type CardGenerationMode = "expand" | "fill-gaps";

export type BuildGenerationSchemaOptions = {
  /** When true, include `name` (new-card generation). */
  includeName?: boolean;
  /** Restrict output to these field keys only. */
  fields?: string[];
};

/** Builds a reduced Ollama JSON schema for the creative subset of a card type. */
export function buildGenerationSchema(
  cardType: WorldCard["card_type"],
  options?: BuildGenerationSchemaOptions,
): JsonSchema {
  const typeFields = TYPE_GEN_FIELDS[cardType] ?? {};
  const allProperties: Record<string, JsonSchema> = {
    ...(options?.includeName ? { name: NAME_GEN_FIELD } : {}),
    ...BASE_GEN_FIELDS,
    ...typeFields,
  };

  const fields = options?.fields;
  const properties =
    fields && fields.length > 0
      ? Object.fromEntries(
          fields
            .filter((key) => key in allProperties)
            .map((key) => [key, allProperties[key]]),
        )
      : allProperties;

  const required = options?.includeName ? ["name"] : [];

  return {
    type: "object",
    properties,
    required,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  const tryParse = (text: string): Record<string, unknown> | null => {
    try {
      const value: unknown = JSON.parse(text);
      return isRecord(value) ? value : null;
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
  "image_path",
  "image_fit",
  "image_position",
  "crest_path",
]);

function mergeParsedIntoCard(
  card: WorldCard,
  data: Record<string, unknown>,
): unknown {
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (STRUCTURAL_KEYS.has(key) || value === null || value === undefined) {
      continue;
    }
    if (key === "tags") {
      patch.tags = Array.isArray(value)
        ? value.filter((tag): tag is string => typeof tag === "string")
        : [];
      continue;
    }
    patch[key] = value;
  }

  return withCardPatch(card, patch);
}

function mergeIntoTemplate(
  cardType: WorldCard["card_type"],
  position: Position,
  data: Record<string, unknown>,
): unknown {
  const name = typeof data.name === "string" ? data.name : undefined;
  const template = createCardTemplate(cardType, position, name);
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
  const schema = buildGenerationSchema(options.cardType, { includeName: true });
  const messages: WizardChatMessage[] = [
    {
      role: "system",
      content: `${options.systemPrompt}\n${CARD_GENERATION_SYSTEM_SUFFIX.join(" ")}`,
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
    const merged = mergeIntoTemplate(
      options.cardType,
      options.position,
      parsed,
    );
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

export type GenerateCardPatchOptions = {
  host?: string;
  model: string;
  card: WorldCard;
  mode: CardGenerationMode;
  systemPrompt: string;
  contextMessage: string;
  /** Field keys to include in the schema (expand: all generatable; fill-gaps: empty only). */
  fields: string[];
  /** Optional relationship context for linked-card suggestions. */
  linkedContext?: {
    sourceCardName: string;
    socketLabel: string;
  };
};

/**
 * Generates a partial update for an existing card. Preserves structural fields
 * and merges creative output into the card.
 */
export async function generateCardPatch(
  options: GenerateCardPatchOptions,
): Promise<WorldCard> {
  if (options.fields.length === 0) {
    throw new Error("No empty fields to fill on this card.");
  }

  const schema = buildGenerationSchema(options.card.card_type, {
    fields: options.fields,
  });

  const userPrompt =
    options.mode === "fill-gaps"
      ? buildFillGapsPrompt(options.card, options.fields, options.linkedContext)
      : buildExpandPrompt(options.card, options.linkedContext);

  const messages: WizardChatMessage[] = [
    {
      role: "system",
      content: `${options.systemPrompt}\n${CARD_GENERATION_SYSTEM_SUFFIX.join(" ")}`,
    },
    {
      role: "user",
      content: `${options.contextMessage}\n\n[TASK]\n${userPrompt}`,
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
    const merged = mergeParsedIntoCard(options.card, parsed);
    const result = WorldCardSchema.safeParse(merged);
    return result.success ? result.data : null;
  };

  let card = await attempt();
  if (!card) {
    card = await attempt();
  }
  if (!card) {
    throw new Error(
      "WorldWizard could not generate a valid update. Try again.",
    );
  }
  return card;
}
