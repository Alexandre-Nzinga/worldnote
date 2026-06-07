import type { WorldCard } from "@worldnote/shared";
import {
  BUILTIN_WIZARD_QUICK_COMMANDS,
  buildPromptFromTemplate,
  isQuickCommandAvailable,
  resolveWizardQuickCommands,
  type WizardQuickCommandConfig,
} from "../settings/wizardQuickCommands.js";

export type WizardActionKind = "chat" | "generate-card" | "patch-card";

export type CardPatchMode = "expand" | "fill-gaps";

export type WizardActionPreset = {
  id: string;
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  kind: WizardActionKind;
  /** For `generate-card` actions, the card type the LLM should produce. */
  targetCardType?: WorldCard["card_type"];
  /** For `patch-card` actions, which enrichment mode to use. */
  patchMode?: CardPatchMode;
  /** Builds the user prompt from the dropped cards. */
  buildPrompt: (cards: WorldCard[]) => string;
  /** Whether this preset applies to the current set of dropped card types. */
  isAvailable: (cardTypes: string[]) => boolean;
};

function quickCommandToPreset(
  command: WizardQuickCommandConfig,
): WizardActionPreset {
  return {
    id: command.id,
    label: command.label,
    icon: command.icon,
    kind: command.kind,
    targetCardType: command.targetCardType,
    patchMode: command.patchMode,
    buildPrompt: (cards) => buildPromptFromTemplate(command.promptTemplate, cards),
    isAvailable: (types) =>
      isQuickCommandAvailable(command.availability, types),
  };
}

/** @deprecated Use settings-backed quick commands via getAvailableActions. */
export const WIZARD_ACTION_PRESETS: WizardActionPreset[] =
  resolveWizardQuickCommands(BUILTIN_WIZARD_QUICK_COMMANDS).map(
    quickCommandToPreset,
  );

/** Returns enabled quick commands that apply to the currently dropped cards. */
export function getAvailableActions(
  cards: WorldCard[],
  commands?: WizardQuickCommandConfig[],
): WizardActionPreset[] {
  const types = cards.map((card) => card.card_type);
  const resolved = resolveWizardQuickCommands(commands);
  return resolved
    .filter((command) => command.enabled)
    .map(quickCommandToPreset)
    .filter((preset) => preset.isAvailable(types));
}

const BASE_WIZARD_SYSTEM_PROMPT = [
  "You are WorldWizard, a local simulation engine for fiction authors and worldbuilders.",
  "Each conversation includes a [CURRENT WORLD] message with the open world's card catalog from the user's local lore folder and SQLite index, plus optional focus cards loaded into the wizard.",
  "Use that data to answer questions about what exists in the world, simulate scenes, and stay grounded in established facts.",
  "Never say you lack access to databases, folders, or real-time data when [CURRENT WORLD] is provided — that block is your authoritative snapshot for this session.",
  "Numeric measurements use canonical metric storage: weight in kilograms (kg), height in centimeters (cm), temperature in degrees Celsius (°C), distance in meters (m), speed in kilometers per hour (km/h).",
  "Stay in character as a vivid, immersive narrator. Do not invent facts that contradict the provided card data, but you may extrapolate plausibly from it.",
  "When the user asks you to create, make, or generate a lore card, do not ask them for more details — invent plausible names, lore, and traits that fit the request and the current world.",
  "Do not mention that you are an AI or reference JSON/schemas directly. Never break character.",
] as const;

/** Default WorldWizard persona when the user has not added custom guidelines. */
export function defaultWizardSystemPrompt(): string {
  return BASE_WIZARD_SYSTEM_PROMPT.join(" ");
}

/** Builds the WorldWizard system prompt, optionally extended with author guidelines. */
export function buildSystemPrompt(userGuidelines?: string): string {
  const extra = userGuidelines?.trim();
  if (!extra) {
    return defaultWizardSystemPrompt();
  }
  return `${defaultWizardSystemPrompt()}\n\nAdditional instructions from the author:\n${extra}`;
}
