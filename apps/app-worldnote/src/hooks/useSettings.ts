import { create } from "zustand";
import {
  type AppSettings,
  getSettings,
  saveSettings as persistSettings,
} from "../services/settings/settings.js";

type SettingsStatus = "loading" | "ready";

type SettingsState = {
  status: SettingsStatus;
  settings: AppSettings | null;
  load: () => Promise<void>;
  save: (settings: AppSettings) => Promise<void>;
};

export const useSettings = create<SettingsState>((set) => ({
  status: "loading",
  settings: null,
  load: async () => {
    set({ status: "loading" });
    try {
      const settings = await getSettings();
      set({ status: "ready", settings });
    } catch {
      set({ status: "ready", settings: null });
    }
  },
  save: async (settings) => {
    set({ status: "ready", settings });
    await persistSettings(settings);
  },
}));

export function isOnboardingComplete(settings: AppSettings | null): boolean {
  return !!settings?.username?.trim() && !!settings?.worldnoteRoot?.trim();
}
