import {
  CARD_TYPE_LABELS,
  listGeneratableFields,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import {
  serializeCardForLlm,
  serializeCardsForLlm,
} from "./serializeCardForLlm.js";

type LinkedContext = {
  sourceCardName: string;
  socketLabel: string;
};

function existingContentBlock(card: WorldCard): string {
  const lines: string[] = [`Current card: ${card.name}`];
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  lines.push(`Type: ${typeLabel}`);

  for (const key of listGeneratableFields(card.card_type)) {
    const value = card[key as keyof WorldCard];
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim().length === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "string") {
      lines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join("\n");
}

function linkedContextBlock(context?: LinkedContext): string {
  if (!context) return "";
  return `The author is viewing ${context.sourceCardName}, which links to this card via ${context.socketLabel}. Generate content for this card informed by that relationship.\n\n`;
}

/** Prompt for fill-gaps mode: only empty schema fields. */
export function buildFillGapsPrompt(
  card: WorldCard,
  fields: string[],
  linkedContext?: LinkedContext,
): string {
  const fieldList = fields.join(", ");
  return `${linkedContextBlock(linkedContext)}Fill only the empty fields on this card: ${fieldList}.

Rules:
- Do not change fields that already have content.
- Stay consistent with linked cards and relationships in the world context.
- Invent plausible details that fit the established lore.

${existingContentBlock(card)}`;
}

/** Prompt for expand mode: enrich all generatable fields in place. */
export function buildExpandPrompt(
  card: WorldCard,
  linkedContext?: LinkedContext,
): string {
  return `${linkedContextBlock(linkedContext)}Enrich and extend this card's creative content.

Rules:
- Preserve all established facts from the existing content below.
- Deepen lore, description, subtitle, and type-specific details.
- Do not contradict provided data; extrapolate plausibly from it.
- Return all generatable fields with enriched content.

${existingContentBlock(card)}`;
}

/** Builds linked-context metadata for suggestion-driven generation. */
export function buildLinkedSuggestionPrompt(
  sourceCard: WorldCard,
  targetCard: WorldCard,
  socketLabel: string,
  cardsById: Record<string, WorldCard>,
  links: Link[],
): string {
  const context = {
    cardsById,
    links,
  };
  const sourceBlock = serializeCardForLlm(sourceCard, context);
  const targetBlock = serializeCardForLlm(targetCard, context);
  return `Relationship context:\n${sourceBlock}\n\nTarget card to enrich:\n${targetBlock}\n\nSocket: ${socketLabel}`;
}

/** Serializes cards for patch generation context. */
export function buildPatchContextMessage(
  cards: WorldCard[],
  cardsById: Record<string, WorldCard>,
  links: Link[],
  worldName: string,
): string {
  const serialized = serializeCardsForLlm(cards, { cardsById, links });
  return `[CURRENT WORLD]\nWorld: ${worldName}\n\n${serialized}`;
}
