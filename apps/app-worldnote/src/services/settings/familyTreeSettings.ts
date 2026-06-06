export type FamilyTreeUnrelatedMode = "hide" | "dim";

const FAMILY_TREE_UNRELATED_MODES: Record<FamilyTreeUnrelatedMode, true> = {
  hide: true,
  dim: true,
};

export const DEFAULT_FAMILY_TREE_UNRELATED_MODE: FamilyTreeUnrelatedMode = "dim";

export function isFamilyTreeUnrelatedMode(
  value: string,
): value is FamilyTreeUnrelatedMode {
  return Object.hasOwn(FAMILY_TREE_UNRELATED_MODES, value);
}

export function normalizeFamilyTreeUnrelatedMode(
  value: string | undefined,
): FamilyTreeUnrelatedMode {
  if (value && isFamilyTreeUnrelatedMode(value)) {
    return value;
  }
  return DEFAULT_FAMILY_TREE_UNRELATED_MODE;
}

export function familyTreeUnrelatedModeLabel(
  mode: FamilyTreeUnrelatedMode,
): string {
  return mode === "hide" ? "Hide" : "Dim";
}
