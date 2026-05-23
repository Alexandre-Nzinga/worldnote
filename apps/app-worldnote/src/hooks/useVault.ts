import { create } from "zustand";

type VaultState = {
  currentVaultPath: string | null;
  setCurrentVaultPath: (path: string | null) => void;
};

export const useVault = create<VaultState>((set) => ({
  currentVaultPath: null,
  setCurrentVaultPath: (path) => set({ currentVaultPath: path }),
}));
