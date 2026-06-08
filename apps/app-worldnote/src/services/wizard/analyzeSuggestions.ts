import {
  hasWizardCreativeGaps,
  isFieldEmpty,
  type WorldCard,
} from "@worldnote/shared";

export type WizardSuggestionAction = "fill-gaps" | "expand";

export type WizardSuggestion = {
  id: string;
  /** Short button label, e.g. "Generate lore". */
  label: string;
  /** Full context shown in tooltip. */
  message: string;
  /** Primary empty field driving this suggestion. */
  gapLabel: string;
  /** Schema field key to generate (e.g. `lore`, `max_speed`). */
  fieldKey: string;
  targetCardId: string;
  action: WizardSuggestionAction;
  priority: number;
};

const MAX_SUGGESTIONS = 5;

const SELF_GAP_PRIORITY = 5;

type AnalyzeSuggestionsInput = {
  selectedCard: WorldCard;
};

function suggestionKey(
  targetCardId: string,
  action: WizardSuggestionAction,
): string {
  return `${targetCardId}:${action}`;
}

function primaryGap(
  card: WorldCard,
): { fieldKey: string; gapLabel: string } | null {
  if (isFieldEmpty(card, "lore")) {
    return { fieldKey: "lore", gapLabel: "lore" };
  }
  if (isFieldEmpty(card, "subtitle")) {
    return { fieldKey: "subtitle", gapLabel: "subtitle" };
  }
  return null;
}

const GENERATE_FIELDS = new Set(["lore", "subtitle"]);

/** Compact inspector chip label, e.g. "Generate lore" or "Fill race". */
export function buildSuggestionLabel(gapLabel: string): string {
  const normalized = gapLabel.trim().toLowerCase();
  const verb = GENERATE_FIELDS.has(normalized) ? "Generate" : "Fill";
  return `${verb} ${normalized}`;
}

function selfGapMessage(cardName: string, gapLabel: string): string {
  return `${cardName} is missing ${gapLabel} — fill gaps?`;
}

/**
 * Detects fill-gaps opportunities on the selected card only.
 */
export function analyzeWizardSuggestions(
  input: AnalyzeSuggestionsInput,
): WizardSuggestion[] {
  const { selectedCard } = input;
  const suggestions: WizardSuggestion[] = [];
  const seen = new Set<string>();

  if (!hasWizardCreativeGaps(selectedCard)) {
    return suggestions;
  }

  const gap = primaryGap(selectedCard);
  if (!gap) {
    return suggestions;
  }

  const key = suggestionKey(selectedCard.id, "fill-gaps");
  if (seen.has(key)) {
    return suggestions;
  }
  seen.add(key);

  suggestions.push({
    id: crypto.randomUUID(),
    label: buildSuggestionLabel(gap.gapLabel),
    message: selfGapMessage(selectedCard.name, gap.gapLabel),
    gapLabel: gap.gapLabel,
    fieldKey: gap.fieldKey,
    targetCardId: selectedCard.id,
    action: "fill-gaps",
    priority: SELF_GAP_PRIORITY,
  });

  suggestions.sort((a, b) => b.priority - a.priority);
  return suggestions.slice(0, MAX_SUGGESTIONS);
}
