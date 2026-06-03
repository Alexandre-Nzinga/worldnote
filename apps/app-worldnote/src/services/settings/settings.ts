import { invoke } from "@tauri-apps/api/core";
import type { CanvasKeyboardShortcuts } from "./keyboardShortcuts.js";

/** Per card type, which socket handles are shown on the canvas. */
export type VisibleSocketsByCardType = Record<string, Record<string, boolean>>;

/** Local LLM (Ollama) connection config for the WorldWizard. */
export type WizardSettings = {
  host: string;
  defaultModel: string;
};

/** User-facing theme preference. "system" follows the OS appearance. */
export type ThemePreference = "light" | "dark" | "system";

export type AppSettings = {
  username: string;
  worldnoteRoot: string;
  onboardedAt: number;
  visibleSockets?: VisibleSocketsByCardType;
  /** Home-only; world folder paths, max 3. */
  pinnedWorldPaths?: string[];
  /** Local LLM (Ollama) connection config for the WorldWizard. */
  wizard?: WizardSettings;
  /** Appearance preference; defaults to "system" when unset. */
  theme?: ThemePreference;
  /** Canvas copy / paste / duplicate shortcuts. */
  canvasShortcuts?: CanvasKeyboardShortcuts;
};

export async function getSettings(): Promise<AppSettings | null> {
  return invoke<AppSettings | null>("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke<void>("save_settings", { settings });
}

export async function ensureWorldnoteRoot(parent: string): Promise<string> {
  return invoke<string>("ensure_worldnote_root", { parent });
}
