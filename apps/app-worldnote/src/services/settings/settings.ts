import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";
import type { CanvasKeyboardShortcuts } from "./keyboardShortcuts.js";
import type { WizardQuickCommandConfig } from "./wizardQuickCommands.js";

/** Per card type, which socket handles are shown on the canvas. */
export type VisibleSocketsByCardType = Record<string, Record<string, boolean>>;

/** Per card type badge color overrides for canvas pills. */
export type CardTypeBadgeOverride = {
  badgeClassName?: string;
  badgeTextColor?: string;
};

export type CardTypeBadgeOverrides = Record<string, CardTypeBadgeOverride>;

/** User overrides for Family Tree kinship label pill colors. */
export type KinshipBadgeOverride = CardTypeBadgeOverride;

/** Local LLM (Ollama) connection config for the WorldWizard. */
export type WizardSettings = {
  host: string;
  defaultModel: string;
  /** Optional author instructions appended to the WorldWizard system prompt. */
  guidelines?: string;
  /** Quick command chips shown in the wizard (built-in + custom). */
  quickCommands?: WizardQuickCommandConfig[];
};

/** Display preference for weight, height, and temperature fields. */
export type UnitSystemPreference = "metric" | "imperial";

/** Toggleable feature modules (built-in today; installable later). */
export type ModulesSettings = {
  enabled?: string[];
};

/** How unrelated characters appear when Family Tree anchor is selected. */
export type FamilyTreeUnrelatedMode = "hide" | "dim";

export type AppSettings = {
  username: string;
  worldnoteRoot: string;
  onboardedAt: number;
  visibleSockets?: VisibleSocketsByCardType;
  /** User overrides for card-type badge colors. */
  cardTypeBadgeColors?: CardTypeBadgeOverrides;
  /** User overrides for Family Tree kinship label pill colors. */
  kinshipLabelColors?: KinshipBadgeOverride;
  /** Home-only; world folder paths, max 3. */
  pinnedWorldPaths?: string[];
  /** Local LLM (Ollama) connection config for the WorldWizard. */
  wizard?: WizardSettings;
  /** Accent color for primary CTAs (e.g. "azure-500"); defaults to mono-50. */
  primaryColor?: string;
  /** Profile avatar gradient preset; defaults to "mono". */
  avatarColor?: string;
  /** Canvas copy / paste / duplicate shortcuts. */
  canvasShortcuts?: CanvasKeyboardShortcuts;
  /** Measurement display: metric (kg, cm, °C) or imperial (lb, ft/in, °F). */
  unitSystem?: UnitSystemPreference;
  /** Enabled feature modules (see moduleRegistry). */
  modules?: ModulesSettings;
  /** Family Tree: hide or dim characters unrelated to the selected anchor. */
  familyTreeUnrelatedMode?: FamilyTreeUnrelatedMode;
  /** Timeline: suffix appended to year labels (e.g. "AG" → "10191 AG"). */
  timelineEraSuffix?: string;
};

export async function getSettings(): Promise<AppSettings | null> {
  return invoke<AppSettings | null>("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return trackPersist(() => invoke<void>("save_settings", { settings }));
}

export async function ensureWorldnoteRoot(parent: string): Promise<string> {
  return invoke<string>("ensure_worldnote_root", { parent });
}
