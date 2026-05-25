import type { WorldCard } from "./world-card.js";

/** Human-readable labels for canvas UI, settings, and templates. */
export const CARD_TYPE_LABELS: Record<WorldCard["card_type"], string> = {
  character: "Character",
  location: "Location",
  item: "Item",
  vehicle: "Vehicle",
  flora: "Flora",
  fauna: "Fauna",
  building: "Building",
  structure: "Structure",
  species: "Species",
};

/** Default display name when creating a new card of each type. */
export const NEW_CARD_DEFAULT_NAMES: Record<WorldCard["card_type"], string> = {
  character: "New Character",
  location: "New Location",
  item: "New Item",
  vehicle: "New Vehicle",
  flora: "New Flora",
  fauna: "New Fauna",
  building: "New Building",
  structure: "New Structure",
  species: "New Species",
};
