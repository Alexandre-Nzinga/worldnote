import { invoke } from "@tauri-apps/api/core";

/** Per card type, which socket handles are shown on the canvas. */
export type VisibleSocketsByCardType = Record<string, Record<string, boolean>>;

export type AppSettings = {
  username: string;
  worldnoteRoot: string;
  onboardedAt: number;
  visibleSockets?: VisibleSocketsByCardType;
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
