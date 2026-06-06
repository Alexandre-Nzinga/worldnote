import {
  isModuleEnabledInSettings,
  normalizeModulesSettings,
} from "../settings/modulesSettings.js";
import type { AppSettings } from "../settings/settings.js";
import type { BuiltinModuleId } from "./moduleRegistry.js";

export function isModuleEnabled(
  settings: AppSettings | null | undefined,
  moduleId: BuiltinModuleId,
): boolean {
  return isModuleEnabledInSettings(
    normalizeModulesSettings(settings?.modules),
    moduleId,
  );
}
