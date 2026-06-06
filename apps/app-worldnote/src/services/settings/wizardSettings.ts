import { DEFAULT_OLLAMA_HOST } from "../wizard/ollamaClient.js";
import type { WizardSettings } from "./settings.js";
import { normalizeWizardQuickCommands } from "./wizardQuickCommands.js";

export function normalizeWizardSettings(
  raw: WizardSettings | undefined,
): WizardSettings {
  return {
    host: raw?.host?.trim() || DEFAULT_OLLAMA_HOST,
    defaultModel: raw?.defaultModel?.trim() || "",
    guidelines: raw?.guidelines?.trim() || "",
    quickCommands: normalizeWizardQuickCommands(raw?.quickCommands),
  };
}
