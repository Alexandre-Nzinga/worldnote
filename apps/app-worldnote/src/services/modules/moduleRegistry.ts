/** Built-in module identifiers. Extend as new modules ship. */
export type BuiltinModuleId = "familyTree";

export type ModuleRegistryEntry = {
  id: BuiltinModuleId;
  name: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
};

export const BUILTIN_MODULES: readonly ModuleRegistryEntry[] = [
  {
    id: "familyTree",
    name: "Family Tree",
    description:
      "Select a character on the canvas to reveal kinship labels on related characters and dim or hide unrelated ones.",
    icon: "account_tree",
    defaultEnabled: false,
  },
] as const;

const moduleIds = new Set<string>(BUILTIN_MODULES.map((entry) => entry.id));

export function isRegisteredModuleId(id: string): id is BuiltinModuleId {
  return moduleIds.has(id);
}

export function getModuleEntry(id: BuiltinModuleId): ModuleRegistryEntry {
  const entry = BUILTIN_MODULES.find((item) => item.id === id);
  if (!entry) {
    throw new Error(`Unknown module: ${id}`);
  }
  return entry;
}
