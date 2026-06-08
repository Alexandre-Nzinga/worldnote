import {
  MAX_TIMELINE_YEAR,
  MIN_TIMELINE_YEAR,
  TIMELINE_YEAR_GENERATION_HINT,
} from "../timeline/timeline-year.js";
import { MEASUREMENT_GENERATION_HINT } from "../../units/measurements.js";
import { FaunaDietSchema } from "./atoms/fauna.js";
import { FloraToxicitySchema } from "./atoms/flora.js";
import { ItemRaritySchema } from "./atoms/item.js";
import { StructureConditionSchema } from "./atoms/structure.js";
import { VEHICLE_SUB_TYPE_VALUES } from "./atoms/vehicle.js";
import type { WorldCard } from "./world-card.js";

export type JsonSchemaProperty = Record<string, unknown>;

/** Guidance for LLM subtitle generation (schema + prompts). */
export const SUBTITLE_GENERATION_HINT =
  'Very short label or epithet (about 1-5 words). Not a sentence or description. Examples: "Desert planet", "Evocation", "Spice trader".';

/** Creative base fields every card type may generate (excludes structural keys). */
export const BASE_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  subtitle: { type: "string", description: SUBTITLE_GENERATION_HINT },
  description: { type: "string" },
  lore: { type: "string" },
  tags: {
    type: "array",
    items: { type: "string" },
    description:
      "Short topical labels using spaces between words (e.g. \"spice melange\"), never underscores.",
  },
};

/** Name is required only when creating a new card from scratch. */
export const NAME_GEN_FIELD: JsonSchemaProperty = { type: "string" };

function timelineYearField(label: string): JsonSchemaProperty {
  return {
    type: "integer",
    minimum: MIN_TIMELINE_YEAR,
    maximum: MAX_TIMELINE_YEAR,
    description: `${label}. ${TIMELINE_YEAR_GENERATION_HINT}`,
  };
}

const CHARACTER_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  race: { type: "string" },
  gender: { type: "string", enum: ["male", "female", "x"] },
  appearance: { type: "string" },
  personality: { type: "string" },
  start_year: timelineYearField("Birth year on the world timeline"),
  end_year: timelineYearField("Death year on the world timeline"),
};

const ITEM_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  weight: {
    type: "number",
    minimum: 0,
    description: `Mass in kilograms (kg). ${MEASUREMENT_GENERATION_HINT}`,
  },
  rarity: { type: "string", enum: ItemRaritySchema.options },
};

const VEHICLE_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  sub_type: { type: "string", enum: [...VEHICLE_SUB_TYPE_VALUES] },
  max_speed: {
    type: "number",
    minimum: 0,
    description: `Top speed in km/h. ${MEASUREMENT_GENERATION_HINT}`,
  },
};

const FLORA_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  toxicity_level: { type: "string", enum: FloraToxicitySchema.options },
};

const FAUNA_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  diet: { type: "string", enum: FaunaDietSchema.options },
};

const STRUCTURE_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  condition: { type: "string", enum: StructureConditionSchema.options },
};

const LOCATION_GEN_FIELDS: Record<string, JsonSchemaProperty> = {};

const SPECIES_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  average_lifespan: { type: "string" },
};

const PLANET_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  planet_type: { type: "string" },
};

const ORGANIZATION_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  founding_date: { type: "string" },
};

const POLITY_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  government_type: { type: "string" },
};

const EVENT_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  start_year: timelineYearField("Event start year on the world timeline"),
  end_year: timelineYearField("Event end year for ranged events"),
};

const FAMILY_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  motto: { type: "string" },
};

const GROUP_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  group_type: { type: "string" },
};

const STAR_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  spectral_class: { type: "string" },
};

const MOON_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  orbital_period: { type: "string" },
};

const ASTEROID_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  composition: { type: "string" },
};

const SATELLITE_GEN_FIELDS: Record<string, JsonSchemaProperty> = {
  orbit_type: { type: "string" },
};

/** Type-specific creative fields per card type (excludes base fields). */
export const TYPE_GEN_FIELDS: Record<
  WorldCard["card_type"],
  Record<string, JsonSchemaProperty>
> = {
  character: CHARACTER_GEN_FIELDS,
  location: LOCATION_GEN_FIELDS,
  item: ITEM_GEN_FIELDS,
  vehicle: VEHICLE_GEN_FIELDS,
  flora: FLORA_GEN_FIELDS,
  fauna: FAUNA_GEN_FIELDS,
  building: {},
  structure: STRUCTURE_GEN_FIELDS,
  species: SPECIES_GEN_FIELDS,
  planet: PLANET_GEN_FIELDS,
  organization: ORGANIZATION_GEN_FIELDS,
  polity: POLITY_GEN_FIELDS,
  event: EVENT_GEN_FIELDS,
  family: FAMILY_GEN_FIELDS,
  group: GROUP_GEN_FIELDS,
  star: STAR_GEN_FIELDS,
  moon: MOON_GEN_FIELDS,
  asteroid: ASTEROID_GEN_FIELDS,
  satellite: SATELLITE_GEN_FIELDS,
  law: {},
  religion: {},
  language: {},
  culture: {},
  spell: {},
  disease: {},
  disaster: {},
  combat_style: {},
};

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

/** Type-specific property field keys for a card type (Properties tab). */
export function listTypePropertyFields(
  cardType: WorldCard["card_type"],
): string[] {
  return Object.keys(TYPE_GEN_FIELDS[cardType]);
}

/** All generatable field keys for a card type (base + type-specific). */
export function listGeneratableFields(
  cardType: WorldCard["card_type"],
  options?: { includeName?: boolean },
): string[] {
  const fields = [
    ...(options?.includeName ? ["name"] : []),
    ...Object.keys(BASE_GEN_FIELDS),
    ...listTypePropertyFields(cardType),
  ];
  return fields;
}

/** Whether a field on a card is empty and eligible for fill-gaps generation. */
export function isFieldEmpty(card: WorldCard, fieldKey: string): boolean {
  if (STRUCTURAL_KEYS.has(fieldKey)) {
    return false;
  }

  const value = card[fieldKey as keyof WorldCard];

  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (typeof value === "number") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

/**
 * Fields the wizard generates directly. `description` is excluded — it is
 * derived from lore when the card is saved.
 */
export const WIZARD_EXCLUDED_GEN_FIELDS = new Set(["description"]);

/** Generatable fields the wizard may fill or expand. */
export function listWizardGeneratableFields(
  cardType: WorldCard["card_type"],
  options?: { includeName?: boolean },
): string[] {
  return listGeneratableFields(cardType, options).filter(
    (key) => !WIZARD_EXCLUDED_GEN_FIELDS.has(key),
  );
}

/** Returns empty generatable fields on a card. */
export function listEmptyGeneratableFields(card: WorldCard): string[] {
  return listGeneratableFields(card.card_type).filter((key) =>
    isFieldEmpty(card, key),
  );
}

/** Returns empty wizard-generatable fields on a card. */
export function listEmptyWizardGeneratableFields(card: WorldCard): string[] {
  return listWizardGeneratableFields(card.card_type).filter((key) =>
    isFieldEmpty(card, key),
  );
}

/** Returns empty type-specific property fields on a card. */
export function listEmptyTypePropertyFields(card: WorldCard): string[] {
  return listTypePropertyFields(card.card_type).filter((key) =>
    isFieldEmpty(card, key),
  );
}

/** Whether a card has empty type-specific property fields to generate. */
export function hasEmptyTypeProperties(card: WorldCard): boolean {
  return listEmptyTypePropertyFields(card).length > 0;
}

/** Whether a card has meaningful creative content gaps. */
export function hasCreativeGaps(card: WorldCard): boolean {
  return listEmptyGeneratableFields(card).length > 0;
}

/** Whether a card has gaps the inspector wizard should suggest filling. */
export function hasWizardCreativeGaps(card: WorldCard): boolean {
  return listEmptyWizardGeneratableFields(card).length > 0;
}
