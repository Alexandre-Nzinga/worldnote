import {
  BUILTIN_MODULES,
  isRegisteredModuleId,
  type BuiltinModuleId,
} from "../modules/moduleRegistry.js";
import type { ModulesSettings, VisibleSocketsByCardType } from "./settings.js";
import { enableFamilyTreeKinshipSockets } from "./visibleSocketSettings.js";

export type { ModulesSettings };

export function normalizeModulesSettings(
  raw: ModulesSettings | undefined,
): ModulesSettings {
  const enabled = raw?.enabled ?? [];
  const seen = new Set<BuiltinModuleId>();
  const normalized: BuiltinModuleId[] = [];

  for (const id of enabled) {
    if (!isRegisteredModuleId(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push(id);
  }

  return { enabled: normalized };
}

export function isModuleEnabledInSettings(
  settings: ModulesSettings | undefined,
  moduleId: BuiltinModuleId,
): boolean {
  const normalized = normalizeModulesSettings(settings);
  return normalized.enabled?.includes(moduleId) ?? false;
}

/** Applies module side effects (e.g. kinship socket visibility) when toggling modules. */
export function applyModuleSettingsChange(
  previous: ModulesSettings,
  next: ModulesSettings,
  visibleSockets: VisibleSocketsByCardType,
): {
  modules: ModulesSettings;
  visibleSockets: VisibleSocketsByCardType;
} {
  const enablingFamilyTree =
    isModuleEnabledInSettings(next, "familyTree") &&
    !isModuleEnabledInSettings(previous, "familyTree");

  return {
    modules: next,
    visibleSockets: enablingFamilyTree
      ? enableFamilyTreeKinshipSockets(visibleSockets)
      : visibleSockets,
  };
}

export function setModuleEnabled(
  settings: ModulesSettings | undefined,
  moduleId: BuiltinModuleId,
  enabled: boolean,
): ModulesSettings {
  const normalized = normalizeModulesSettings(settings);
  const current = new Set(normalized.enabled ?? []);

  if (enabled) {
    current.add(moduleId);
  } else {
    current.delete(moduleId);
  }

  return {
    enabled: BUILTIN_MODULES.filter((entry) => current.has(entry.id)).map(
      (entry) => entry.id,
    ),
  };
}
