import type { WorldCard } from "@worldnote/shared";
import type { NewCardType } from "../crudWorldCard/cardTemplates.js";
import type { CardPatchMode, WizardActionKind } from "../wizard/prompts.js";

export type WizardQuickCommandAvailability = {
  minCards?: number;
  maxCards?: number;
  requireTypes?: Record<string, number>;
  requireAnyOf?: Array<Record<string, number>>;
};

export type WizardQuickCommandConfig = {
  id: string;
  label: string;
  icon: string;
  kind: WizardActionKind;
  targetCardType?: NewCardType;
  patchMode?: CardPatchMode;
  promptTemplate: string;
  enabled: boolean;
  builtIn?: boolean;
  availability: WizardQuickCommandAvailability;
};

/** Short hover description for wizard quick-command chips. */
export function describeWizardQuickCommand(
  command: Pick<WizardQuickCommandConfig, "id" | "label">,
): string {
  switch (command.id) {
    case "simulate-battle":
      return "Simulate a vivid battle between the dropped characters.";
    case "generate-dialogue":
      return "Write a conversation between the dropped characters.";
    case "breed-child":
      return "Generate a child character from two parent characters.";
    case "explore-location":
      return "Narrate characters exploring the dropped location.";
    case "fill-gaps":
      return "Fill only empty creative fields. Existing content stays unchanged.";
    case "expand-card":
      return "Enrich and extend creative content. Preserves established facts.";
    default:
      return command.label;
  }
}

export function describeInspectorFillGapsAction(cardName: string): string {
  return `Fill only empty creative fields on ${cardName}. Existing content stays unchanged.`;
}

export function describeInspectorExpandAction(cardName: string): string {
  return `Enrich and extend creative content on ${cardName}. Preserves established facts.`;
}

const NAMES_PLACEHOLDER = "{{names}}";

function countOf(cardTypes: string[], type: string): number {
  return cardTypes.filter((cardType) => cardType === type).length;
}

function cardNames(cards: WorldCard[]): string {
  return cards.map((card) => card.name).join(" and ");
}

export function buildPromptFromTemplate(
  template: string,
  cards: WorldCard[],
): string {
  return template.split(NAMES_PLACEHOLDER).join(cardNames(cards));
}

export function isQuickCommandAvailable(
  availability: WizardQuickCommandAvailability,
  cardTypes: string[],
): boolean {
  if (
    availability.minCards !== undefined &&
    cardTypes.length < availability.minCards
  ) {
    return false;
  }

  if (
    availability.maxCards !== undefined &&
    cardTypes.length > availability.maxCards
  ) {
    return false;
  }

  if (availability.requireTypes) {
    for (const [type, min] of Object.entries(availability.requireTypes)) {
      if (countOf(cardTypes, type) < min) {
        return false;
      }
    }
  }

  if (availability.requireAnyOf && availability.requireAnyOf.length > 0) {
    const matched = availability.requireAnyOf.some((group) =>
      Object.entries(group).every(
        ([type, min]) => countOf(cardTypes, type) >= min,
      ),
    );
    if (!matched) {
      return false;
    }
  }

  return true;
}

export const BUILTIN_WIZARD_QUICK_COMMANDS: WizardQuickCommandConfig[] = [
  {
    id: "simulate-battle",
    label: "Simulate Battle",
    icon: "swords",
    kind: "chat",
    builtIn: true,
    enabled: true,
    availability: { requireTypes: { character: 2 } },
    promptTemplate: `Simulate a realistic, vivid battle between ${NAMES_PLACEHOLDER} based strictly on their traits, combat styles, and gear. Narrate the exchange beat by beat with dialogue and decisive moments. Conclude with a plausible outcome.`,
  },
  {
    id: "generate-dialogue",
    label: "Generate Dialogue",
    icon: "forum",
    kind: "chat",
    builtIn: true,
    enabled: true,
    availability: { requireTypes: { character: 2 } },
    promptTemplate: `Write a believable conversation between ${NAMES_PLACEHOLDER}. Stay true to each character's personality, background, and relationships. Format it as a back-and-forth script.`,
  },
  {
    id: "breed-child",
    label: "Breed Child",
    icon: "child_care",
    kind: "generate-card",
    targetCardType: "character",
    builtIn: true,
    enabled: true,
    availability: { requireTypes: { character: 2 } },
    promptTemplate: `Generate a single child character that could plausibly be the offspring of ${NAMES_PLACEHOLDER}. Blend their appearance, race, and personality traits. Invent a fitting name. Return only the structured character data.`,
  },
  {
    id: "explore-location",
    label: "Explore Location",
    icon: "explore",
    kind: "chat",
    builtIn: true,
    enabled: true,
    availability: {
      requireTypes: { character: 1 },
      requireAnyOf: [{ location: 1 }, { building: 1 }, { structure: 1 }],
    },
    promptTemplate: `Narrate characters exploring this place. Describe what they notice, feel, and do, grounded in the provided details. Focus on ${NAMES_PLACEHOLDER}.`,
  },
  {
    id: "fill-gaps",
    label: "Fill gaps",
    icon: "auto_fix_high",
    kind: "patch-card",
    patchMode: "fill-gaps",
    builtIn: true,
    enabled: true,
    availability: { minCards: 1, maxCards: 1 },
    promptTemplate: `Fill only the empty creative fields on ${NAMES_PLACEHOLDER}. Do not change fields that already have content.`,
  },
  {
    id: "expand-card",
    label: "Expand card",
    icon: "auto_awesome",
    kind: "patch-card",
    patchMode: "expand",
    builtIn: true,
    enabled: true,
    availability: { minCards: 1, maxCards: 1 },
    promptTemplate: `Enrich and extend the creative content on ${NAMES_PLACEHOLDER}. Preserve established facts; deepen lore and details.`,
  },
];

const builtinById = new Map(
  BUILTIN_WIZARD_QUICK_COMMANDS.map((command) => [command.id, command]),
);

function normalizeAvailability(
  raw: WizardQuickCommandAvailability | undefined,
): WizardQuickCommandAvailability {
  const requireTypes: Record<string, number> = {};
  if (raw?.requireTypes) {
    for (const [type, min] of Object.entries(raw.requireTypes)) {
      if (min > 0) {
        requireTypes[type] = min;
      }
    }
  }

  const requireAnyOf =
    raw?.requireAnyOf
      ?.map((group) => {
        const normalized: Record<string, number> = {};
        for (const [type, min] of Object.entries(group)) {
          if (min > 0) {
            normalized[type] = min;
          }
        }
        return normalized;
      })
      .filter((group) => Object.keys(group).length > 0) ?? [];

  const availability: WizardQuickCommandAvailability = {};
  if (raw?.minCards !== undefined && raw.minCards > 0) {
    availability.minCards = raw.minCards;
  }
  if (raw?.maxCards !== undefined && raw.maxCards > 0) {
    availability.maxCards = raw.maxCards;
  }
  if (Object.keys(requireTypes).length > 0) {
    availability.requireTypes = requireTypes;
  }
  if (requireAnyOf.length > 0) {
    availability.requireAnyOf = requireAnyOf;
  }
  return availability;
}

function normalizeCommand(
  raw: WizardQuickCommandConfig,
): WizardQuickCommandConfig | null {
  const id = raw.id.trim();
  const label = raw.label.trim();
  const icon = raw.icon.trim() || "auto_awesome";
  const promptTemplate = raw.promptTemplate.trim();
  if (!id || !label || !promptTemplate) {
    return null;
  }

  const kind: WizardActionKind =
    raw.kind === "generate-card"
      ? "generate-card"
      : raw.kind === "patch-card"
        ? "patch-card"
        : "chat";

  return {
    id,
    label,
    icon,
    kind,
    targetCardType:
      kind === "generate-card"
        ? (raw.targetCardType ?? "character")
        : undefined,
    patchMode:
      kind === "patch-card" ? (raw.patchMode ?? "fill-gaps") : undefined,
    promptTemplate,
    enabled: raw.enabled !== false,
    builtIn: raw.builtIn === true || builtinById.has(id),
    availability: normalizeAvailability(raw.availability),
  };
}

function mergeWithBuiltin(
  saved: WizardQuickCommandConfig,
): WizardQuickCommandConfig {
  const builtin = builtinById.get(saved.id);
  if (!builtin) {
    return saved;
  }
  return {
    ...builtin,
    ...saved,
    builtIn: true,
    availability: normalizeAvailability(
      Object.keys(saved.availability).length > 0
        ? saved.availability
        : builtin.availability,
    ),
  };
}

/** Merges saved commands with built-in defaults and keeps custom commands. */
export function resolveWizardQuickCommands(
  saved: WizardQuickCommandConfig[] | undefined,
): WizardQuickCommandConfig[] {
  if (!saved || saved.length === 0) {
    return BUILTIN_WIZARD_QUICK_COMMANDS.map((command) => ({ ...command }));
  }

  const normalized = saved
    .map((command) => normalizeCommand(command))
    .filter((command): command is WizardQuickCommandConfig => command != null);

  const savedById = new Map(
    normalized.map((command) => [command.id, mergeWithBuiltin(command)]),
  );

  const builtins = BUILTIN_WIZARD_QUICK_COMMANDS.map(
    (command) => savedById.get(command.id) ?? { ...command },
  );

  const customs = normalized.filter((command) => !builtinById.has(command.id));

  return [...builtins, ...customs];
}

export function normalizeWizardQuickCommands(
  raw: WizardQuickCommandConfig[] | undefined,
): WizardQuickCommandConfig[] {
  return resolveWizardQuickCommands(raw);
}

export function createCustomWizardQuickCommand(): WizardQuickCommandConfig {
  return {
    id: `custom-${crypto.randomUUID()}`,
    label: "New command",
    icon: "auto_awesome",
    kind: "chat",
    promptTemplate: `Using ${NAMES_PLACEHOLDER} as context, `,
    enabled: true,
    builtIn: false,
    availability: { minCards: 1 },
  };
}

export function describeQuickCommandAvailability(
  availability: WizardQuickCommandAvailability,
): string {
  const parts: string[] = [];
  if (availability.minCards !== undefined) {
    parts.push(`≥${availability.minCards} card(s)`);
  }
  if (availability.maxCards !== undefined) {
    parts.push(`≤${availability.maxCards} card(s)`);
  }
  if (availability.requireTypes) {
    for (const [type, min] of Object.entries(availability.requireTypes)) {
      parts.push(`≥${min} ${type}`);
    }
  }
  if (availability.requireAnyOf && availability.requireAnyOf.length > 0) {
    const any = availability.requireAnyOf
      .map((group) =>
        Object.entries(group)
          .map(([type, min]) => `≥${min} ${type}`)
          .join(" + "),
      )
      .join(" OR ");
    parts.push(`(${any})`);
  }
  return parts.length > 0 ? parts.join(", ") : "Any cards";
}
