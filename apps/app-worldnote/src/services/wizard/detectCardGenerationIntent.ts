import { CARD_TYPE_LABELS, type WorldCard } from "@worldnote/shared";
import type { NewCardType } from "../crudWorldCard/cardTemplates.js";
import { CREATABLE_CARD_TYPES } from "../crudWorldCard/creatableCardTypes.js";

export type CardGenerationIntent = {
  cardType: NewCardType;
  /** Creative brief passed to the structured card generator. */
  prompt: string;
};

const CREATION_VERB_PATTERN =
  /\b(?:create|make|generate|add|spawn|build|breed|invent|design|write)\b/i;

const CREATION_PHRASE_PATTERN =
  /\b(?:give me|i want(?:\s+a)?|i need(?:\s+a)?|can you (?:create|make|generate))\b/i;

/** Roles and archetypes that imply a character card when the user wants something new. */
const CHARACTER_ARCHETYPE_PATTERN =
  /\b(?:wizard|mage|sorcerer|witch|warlock|knight|warrior|rogue|thief|priest|cleric|druid|ranger|bard|king|queen|prince|princess|noble|peasant|merchant|soldier|archer|assassin|healer|necromancer|paladin|monk|villain|hero|protagonist|antagonist|npc|person|people|character)\b/i;

const CARD_WORD_PATTERN = /\bcard\b/i;

const TYPE_LOOKUP: Array<{ type: NewCardType; pattern: RegExp }> =
  CREATABLE_CARD_TYPES.map((type) => {
    const label = CARD_TYPE_LABELS[type];
    const typePattern = type.replace(/_/g, "[ _]");
    const labelPattern = label.replace(/\s+/g, "[ _]?");
    return {
      type,
      pattern: new RegExp(`\\b(?:${typePattern}|${labelPattern})\\b`, "i"),
    };
  });

function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function resolveCardType(text: string): NewCardType | null {
  for (const entry of TYPE_LOOKUP) {
    if (entry.pattern.test(text)) {
      return entry.type;
    }
  }
  if (CHARACTER_ARCHETYPE_PATTERN.test(text)) {
    return "character";
  }
  return null;
}

function wantsCardCreation(text: string): boolean {
  if (CREATION_VERB_PATTERN.test(text) || CREATION_PHRASE_PATTERN.test(text)) {
    return true;
  }
  return false;
}

/** Builds the creative brief for structured card generation. */
export function buildCardCreationPrompt(
  userMessage: string,
  droppedCards: WorldCard[],
): string {
  const trimmed = normalizeWhitespace(userMessage);
  const contextPart =
    droppedCards.length > 0
      ? `Use the dropped cards (${droppedCards.map((card) => card.name).join(", ")}) as context for relationships and world consistency.\n`
      : "";

  return `${contextPart}Create a new card based on this request: ${trimmed}

Invent every missing detail yourself — name, lore, appearance, personality, and all other creative fields. Do not ask the user for more information. Match the tone and setting of the current world.`;
}

type PriorWizardMessage = {
  role: "user" | "assistant";
  content: string;
  generatedCard?: unknown;
};

/**
 * When the user adds details after a card-creation request (e.g. "male, 300 years old"),
 * merge them into the pending brief if no card was generated yet.
 */
export function detectCardGenerationFollowUp(
  text: string,
  priorMessages: PriorWizardMessage[],
): CardGenerationIntent | null {
  const trimmed = normalizeWhitespace(text);
  if (!trimmed || wantsCardCreation(trimmed)) {
    return null;
  }

  for (let index = priorMessages.length - 1; index >= 0; index -= 1) {
    const message = priorMessages[index];
    if (message.role !== "user") {
      continue;
    }

    const baseIntent = detectCardGenerationIntent(message.content);
    if (!baseIntent) {
      return null;
    }

    const cardGenerated = priorMessages
      .slice(index + 1)
      .some(
        (later) => later.role === "assistant" && later.generatedCard != null,
      );
    if (cardGenerated) {
      return null;
    }

    return {
      cardType: baseIntent.cardType,
      prompt: `${baseIntent.prompt}. ${trimmed}`,
    };
  }

  return null;
}

/**
 * Detects when freeform chat should create a new lore card instead of a prose reply.
 * Returns null for simulations, questions, and patch-style requests.
 */
export function detectCardGenerationIntent(
  text: string,
): CardGenerationIntent | null {
  const trimmed = normalizeWhitespace(text);
  if (!trimmed || !wantsCardCreation(trimmed)) {
    return null;
  }

  const cardType = resolveCardType(trimmed);
  if (!cardType && !CARD_WORD_PATTERN.test(trimmed)) {
    return null;
  }

  return {
    cardType: cardType ?? "character",
    prompt: trimmed,
  };
}
