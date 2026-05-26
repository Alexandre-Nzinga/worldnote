import { create } from "zustand";

type VaultState = {
  currentVaultPath: string | null;
  currentWorldName: string | null;
  setCurrentVault: (path: string | null, name?: string | null) => void;
};

export const useVault = create<VaultState>((set) => ({
  currentVaultPath: null,
  currentWorldName: null,
  setCurrentVault: (path, name = null) =>
    set({
      currentVaultPath: path,
      currentWorldName: path ? name : null,
    }),
}));
