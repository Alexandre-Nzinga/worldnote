import {
  hasCreativeGaps,
  isFieldEmpty,
  listEmptyGeneratableFields,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { formatSocketId } from "../settings/visibleSocketSettings.js";

export type WizardSuggestionAction = "fill-gaps" | "expand";

export type WizardSuggestion = {
  id: string;
  /** Short button label, e.g. "Generate lore". */
  label: string;
  /** Full context shown in tooltip. */
  message: string;
  /** Primary empty field driving this suggestion. */
  gapLabel: string;
  targetCardId: string;
  action: WizardSuggestionAction;
  priority: number;
  /** Inspector-selected card that motivated this suggestion. */
  sourceCardId: string;
  /** Socket label when suggestion is link-driven. */
  socketId?: string;
  socketLabel?: string;
};

const MAX_SUGGESTIONS = 5;

const LINKED_GAP_PRIORITY = 10;
const SELF_GAP_PRIORITY = 5;

type AnalyzeSuggestionsInput = {
  selectedCard: WorldCard;
  cardsById: Record<string, WorldCard>;
  links: Link[];
};

function suggestionKey(
  targetCardId: string,
  action: WizardSuggestionAction,
): string {
  return `${targetCardId}:${action}`;
}

function primaryGapLabel(card: WorldCard): string | null {
  if (isFieldEmpty(card, "lore")) return "lore";
  if (isFieldEmpty(card, "description")) return "description";
  if (isFieldEmpty(card, "subtitle")) return "subtitle";
  const emptyTypeFields = listEmptyGeneratableFields(card).filter(
    (key) => !["lore", "description", "subtitle", "tags"].includes(key),
  );
  if (emptyTypeFields.length > 0) {
    return emptyTypeFields[0]?.replace(/_/g, " ") ?? null;
  }
  return null;
}

const GENERATE_FIELDS = new Set(["lore", "description", "subtitle"]);

/** Compact inspector chip label, e.g. "Generate lore" or "Fill race". */
export function buildSuggestionLabel(gapLabel: string): string {
  const normalized = gapLabel.trim().toLowerCase();
  const verb = GENERATE_FIELDS.has(normalized) ? "Generate" : "Fill";
  return `${verb} ${normalized}`;
}

function linkedGapMessage(
  sourceName: string,
  targetName: string,
  gapLabel: string,
  socketLabel: string,
): string {
  return `You linked ${sourceName} to ${targetName} (${socketLabel}), but ${targetName}'s ${gapLabel} is empty — generate?`;
}

function selfGapMessage(cardName: string, gapLabel: string): string {
  return `${cardName} is missing ${gapLabel} — fill gaps?`;
}

function addSuggestion(
  suggestions: WizardSuggestion[],
  seen: Set<string>,
  suggestion: WizardSuggestion,
): void {
  const key = suggestionKey(suggestion.targetCardId, suggestion.action);
  if (seen.has(key)) return;
  seen.add(key);
  suggestions.push(suggestion);
}

/**
 * Detects fill-gaps opportunities on the selected card and its linked cards.
 */
export function analyzeWizardSuggestions(
  input: AnalyzeSuggestionsInput,
): WizardSuggestion[] {
  const { selectedCard, cardsById, links } = input;
  const suggestions: WizardSuggestion[] = [];
  const seen = new Set<string>();

  // Linked-card gaps (outgoing links)
  for (const link of links) {
    if (link.source_card !== selectedCard.id) continue;
    const target = cardsById[link.target_card];
    if (!target) continue;

    const gapLabel = primaryGapLabel(target);
    if (!gapLabel) continue;

    const socketLabel = formatSocketId(link.source_socket);
    addSuggestion(suggestions, seen, {
      id: crypto.randomUUID(),
      label: buildSuggestionLabel(gapLabel),
      message: linkedGapMessage(
        selectedCard.name,
        target.name,
        gapLabel,
        socketLabel,
      ),
      gapLabel,
      targetCardId: target.id,
      action: "fill-gaps",
      priority: LINKED_GAP_PRIORITY,
      sourceCardId: selectedCard.id,
      socketId: link.source_socket,
      socketLabel,
    });
  }

  // Self gaps
  if (hasCreativeGaps(selectedCard)) {
    const gapLabel = primaryGapLabel(selectedCard);
    if (gapLabel) {
      addSuggestion(suggestions, seen, {
        id: crypto.randomUUID(),
        label: buildSuggestionLabel(gapLabel),
        message: selfGapMessage(selectedCard.name, gapLabel),
        gapLabel,
        targetCardId: selectedCard.id,
        action: "fill-gaps",
        priority: SELF_GAP_PRIORITY,
        sourceCardId: selectedCard.id,
      });
    }
  }

  suggestions.sort((a, b) => b.priority - a.priority);
  return suggestions.slice(0, MAX_SUGGESTIONS);
}
