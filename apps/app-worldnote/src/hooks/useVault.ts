import { create } from "zustand";

export type StarterAction = "add-character" | "add-location" | "create-world";

type VaultState = {
  currentVaultPath: string | null;
  currentWorldName: string | null;
  pendingStarterAction: StarterAction | null;
  setCurrentVault: (path: string | null, name?: string | null) => void;
  requestStarterAction: (action: StarterAction) => void;
  clearStarterAction: () => void;
};

export const useVault = create<VaultState>((set) => ({
  currentVaultPath: null,
  currentWorldName: null,
  pendingStarterAction: null,
  setCurrentVault: (path, name = null) =>
    set({
      currentVaultPath: path,
      currentWorldName: path ? name : null,
    }),
  requestStarterAction: (action) => set({ pendingStarterAction: action }),
  clearStarterAction: () => set({ pendingStarterAction: null }),
}));
