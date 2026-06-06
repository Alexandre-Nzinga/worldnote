import type { UnitSystem } from "@worldnote/shared";

export type { UnitSystem };

const UNIT_SYSTEMS = new Set<UnitSystem>(["metric", "imperial"]);

export const DEFAULT_UNIT_SYSTEM: UnitSystem = "metric";

export function normalizeUnitSystem(value: string | undefined): UnitSystem {
  if (value && UNIT_SYSTEMS.has(value as UnitSystem)) {
    return value as UnitSystem;
  }
  return DEFAULT_UNIT_SYSTEM;
}
