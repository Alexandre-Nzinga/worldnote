import { CARD_TYPE_LABELS } from "@worldnote/shared";
import type { NewCardType } from "../crudWorldCard/cardTemplates.js";
import type { StarterCardDef, StarterPack } from "../starterPacks/types.js";

const TUTORIAL_ANCHOR = (anchor: string) => ({ tutorial_anchor: anchor });

function sampleCardDef(
  type: NewCardType,
  name: string,
  position: { x: number; y: number },
): StarterCardDef {
  return {
    key: `type-${type}`,
    cardType: type,
    name,
    position,
    subtitle: CARD_TYPE_LABELS[type],
    lore: `# ${name}\n\nA sample **${CARD_TYPE_LABELS[type]}** card in the WorldNote tutorial world.`,
    tags: ["tutorial", type],
  };
}

const tutorialCards: StarterCardDef[] = [
  {
    key: "hero-character",
    cardType: "character",
    name: "Aria Vale",
    position: { x: -520, y: -180 },
    subtitle: "Tutorial highlight",
    lore: "# Aria Vale\n\nA diplomat and explorer at the heart of this tutorial world.",
    tags: ["tutorial", "character"],
    customProperties: TUTORIAL_ANCHOR("hero-character"),
    fields: {
      gender: "female",
      race: "Human",
      appearance: "Silver-streaked hair, travel-worn cloak",
      personality: "Curious, warm, quick to connect ideas",
    },
  },
  {
    key: "hero-location",
    cardType: "location",
    name: "Lumengarde",
    position: { x: -260, y: -180 },
    subtitle: "Tutorial highlight",
    lore: "# Lumengarde\n\nCapital city and crossroads of the Concord.",
    tags: ["tutorial", "location"],
    customProperties: TUTORIAL_ANCHOR("hero-location"),
  },
  {
    key: "hero-polity",
    cardType: "polity",
    name: "The Concord of Realms",
    position: { x: 0, y: -180 },
    subtitle: "Tutorial highlight",
    lore: "# The Concord of Realms\n\nA federation of allied realms.",
    tags: ["tutorial", "polity"],
    customProperties: TUTORIAL_ANCHOR("hero-polity"),
  },
  sampleCardDef("item", "Sample Item", { x: 260, y: -180 }),
  {
    key: "hero-group",
    cardType: "group",
    name: "The Starbound Company",
    position: { x: -520, y: 20 },
    subtitle: "Tutorial highlight",
    lore: "# The Starbound Company\n\nA guild of scouts and cartographers.",
    tags: ["tutorial", "group"],
    customProperties: TUTORIAL_ANCHOR("hero-group"),
  },
  {
    key: "hero-family",
    cardType: "family",
    name: "House Vale",
    position: { x: -260, y: 20 },
    subtitle: "Tutorial highlight",
    lore: "# House Vale\n\nAn old noble house tied to Lumengarde.",
    tags: ["tutorial", "family"],
    customProperties: TUTORIAL_ANCHOR("hero-family"),
    fields: { motto: "Light the path" },
  },
  {
    key: "hero-event",
    cardType: "event",
    name: "The Concord Summit",
    position: { x: 0, y: 20 },
    subtitle: "Tutorial highlight",
    lore: "# The Concord Summit\n\nA gathering of realm leaders in Lumengarde.",
    tags: ["tutorial", "event"],
    customProperties: TUTORIAL_ANCHOR("hero-event"),
  },
  sampleCardDef("species", "Sample Species", { x: 260, y: 20 }),
  sampleCardDef("organization", "Sample Organization", { x: -260, y: 220 }),
  sampleCardDef("law", "Sample Law", { x: 0, y: 220 }),
];

export const TUTORIAL_WORLD_PACK: StarterPack = {
  id: "worldnote-tutorial",
  name: "WorldNote Tutorial",
  description:
    "A compact guided world with linked characters, locations, polities, and sample card types.",
  icon: "school",
  cards: tutorialCards,
  links: [
    { source: "hero-polity", sourceSocket: "capital", target: "hero-location" },
    { source: "hero-location", sourceSocket: "polity", target: "hero-polity" },
    {
      source: "hero-character",
      sourceSocket: "affiliations",
      target: "hero-polity",
    },
    {
      source: "hero-character",
      sourceSocket: "birthplace",
      target: "hero-location",
    },
    {
      source: "hero-character",
      sourceSocket: "affiliations",
      target: "hero-family",
    },
    {
      source: "hero-character",
      sourceSocket: "affiliations",
      target: "hero-group",
    },
    {
      source: "hero-event",
      sourceSocket: "event_location",
      target: "hero-location",
    },
    {
      source: "hero-event",
      sourceSocket: "participants",
      target: "hero-character",
    },
  ],
  stickyNotes: [
    {
      key: "tutorial-note",
      tutorialAnchor: "sample-note",
      x: 520,
      y: -80,
      heading: "Tutorial note",
      content:
        "Sticky notes are freeform canvas annotations — great for reminders and draft ideas.",
      width: 240,
      height: 200,
    },
  ],
  canvasImages: [
    {
      key: "tutorial-image",
      x: 520,
      y: 180,
      publicAssetPath: "/starter-packs/fantasy-kingdom-cover.png",
      width: 260,
      height: 160,
    },
  ],
};
