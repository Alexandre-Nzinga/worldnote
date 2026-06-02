import type { WorldCard } from "@worldnote/shared";

export type WizardActionKind = "chat" | "generate-card";

export type WizardActionPreset = {
  id: string;
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  kind: WizardActionKind;
  /** For `generate-card` actions, the card type the LLM should produce. */
  targetCardType?: WorldCard["card_type"];
  /** Builds the user prompt from the dropped cards. */
  buildPrompt: (cards: WorldCard[]) => string;
  /** Whether this preset applies to the current set of dropped card types. */
  isAvailable: (cardTypes: string[]) => boolean;
};

function countOf(cardTypes: string[], type: string): number {
  return cardTypes.filter((cardType) => cardType === type).length;
}

function names(cards: WorldCard[]): string {
  return cards.map((card) => card.name).join(" and ");
}

export const WIZARD_ACTION_PRESETS: WizardActionPreset[] = [
  {
    id: "simulate-battle",
    label: "Simulate Battle",
    icon: "swords",
    kind: "chat",
    isAvailable: (types) => countOf(types, "character") >= 2,
    buildPrompt: (cards) =>
      `Simulate a realistic, vivid battle between ${names(cards)} based strictly on their traits, combat styles, and gear. Narrate the exchange beat by beat with dialogue and decisive moments. Conclude with a plausible outcome.`,
  },
  {
    id: "generate-dialogue",
    label: "Generate Dialogue",
    icon: "forum",
    kind: "chat",
    isAvailable: (types) => countOf(types, "character") >= 2,
    buildPrompt: (cards) =>
      `Write a believable conversation between ${names(cards)}. Stay true to each character's personality, background, and relationships. Format it as a back-and-forth script.`,
  },
  {
    id: "breed-child",
    label: "Breed Child",
    icon: "child_care",
    kind: "generate-card",
    targetCardType: "character",
    isAvailable: (types) => countOf(types, "character") >= 2,
    buildPrompt: (cards) =>
      `Generate a single child character that could plausibly be the offspring of ${names(cards)}. Blend their appearance, race, and personality traits. Invent a fitting name. Return only the structured character data.`,
  },
  {
    id: "explore-location",
    label: "Explore Location",
    icon: "explore",
    kind: "chat",
    isAvailable: (types) =>
      countOf(types, "character") >= 1 &&
      (countOf(types, "location") >= 1 ||
        countOf(types, "building") >= 1 ||
        countOf(types, "structure") >= 1),
    buildPrompt: (cards) =>
      `Narrate ${names(cards.filter((c) => c.card_type === "character"))} exploring this place. Describe what they notice, feel, and do, grounded in the provided details.`,
  },
];

/** Returns the presets that apply to the currently dropped cards. */
export function getAvailableActions(cards: WorldCard[]): WizardActionPreset[] {
  const types = cards.map((card) => card.card_type);
  return WIZARD_ACTION_PRESETS.filter((preset) => preset.isAvailable(types));
}

/** The WorldWizard persona / system prompt for free-form simulations. */
export function buildSystemPrompt(): string {
  return [
    "You are WorldWizard, a local simulation engine for fiction authors and worldbuilders.",
    "Each conversation includes a [CURRENT WORLD] message with the open world's card catalog from the user's local lore folder and SQLite index, plus optional focus cards loaded into the wizard.",
    "Use that data to answer questions about what exists in the world, simulate scenes, and stay grounded in established facts.",
    "Never say you lack access to databases, folders, or real-time data when [CURRENT WORLD] is provided — that block is your authoritative snapshot for this session.",
    "Stay in character as a vivid, immersive narrator. Do not invent facts that contradict the provided card data, but you may extrapolate plausibly from it.",
    "Do not mention that you are an AI or reference JSON/schemas directly. Never break character.",
  ].join(" ");
}
