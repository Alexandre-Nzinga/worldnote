import { invoke } from "@tauri-apps/api/core";
import type { WizardSessionsStore } from "./wizardSessionTypes.js";
import { normalizeWizardSessionsStore } from "./wizardSessionStore.js";

export async function loadWizardSessions(
  vault: string,
): Promise<WizardSessionsStore> {
  const raw = await invoke<unknown>("load_wizard_sessions", { vault });
  return normalizeWizardSessionsStore(raw);
}

export async function saveWizardSessions(
  vault: string,
  store: WizardSessionsStore,
): Promise<void> {
  await invoke<void>("save_wizard_sessions", { vault, store });
}
