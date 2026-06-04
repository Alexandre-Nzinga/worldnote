import type { NewCardType } from "./cardTemplates.js";

/** Card types users can create or switch to from the canvas. */
export const CREATABLE_CARD_TYPES: readonly NewCardType[] = [
  "character",
  "location",
  "item",
  "vehicle",
  "flora",
  "fauna",
  "building",
  "structure",
  "species",
  "planet",
  "organization",
  "polity",
  "event",
  "family",
  "group",
  "star",
  "moon",
  "asteroid",
  "satellite",
  "law",
  "religion",
  "language",
  "culture",
  "spell",
  "disease",
  "disaster",
  "combat_style",
] as const;

export function isNewCardType(value: string): value is NewCardType {
  return CREATABLE_CARD_TYPES.some((type) => type === value);
}
