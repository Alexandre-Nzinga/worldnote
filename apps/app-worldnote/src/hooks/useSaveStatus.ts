import { create } from "zustand";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVED_VISIBLE_MS = 2000;
const ERROR_VISIBLE_MS = 4000;

type SaveStatusState = {
  status: SaveStatus;
  activeSaves: number;
  beginSave: () => void;
  endSave: (success: boolean) => void;
};

let savedTimer: ReturnType<typeof setTimeout> | undefined;
let errorTimer: ReturnType<typeof setTimeout> | undefined;

function clearStatusTimers() {
  if (savedTimer) {
    clearTimeout(savedTimer);
    savedTimer = undefined;
  }
  if (errorTimer) {
    clearTimeout(errorTimer);
    errorTimer = undefined;
  }
}

export const useSaveStatus = create<SaveStatusState>((set, get) => ({
  status: "idle",
  activeSaves: 0,
  beginSave: () => {
    clearStatusTimers();
    const next = get().activeSaves + 1;
    set({ activeSaves: next, status: "saving" });
  },
  endSave: (success) => {
    const next = Math.max(0, get().activeSaves - 1);
    set({ activeSaves: next });

    if (next > 0) {
      set({ status: "saving" });
      return;
    }

    if (success) {
      set({ status: "saved" });
      savedTimer = setTimeout(() => {
        if (get().status === "saved") {
          set({ status: "idle" });
        }
      }, SAVED_VISIBLE_MS);
      return;
    }

    set({ status: "error" });
    errorTimer = setTimeout(() => {
      if (get().status === "error") {
        set({ status: "idle" });
      }
    }, ERROR_VISIBLE_MS);
  },
}));

export type PersistOptions = {
  /** When false, writes to disk without updating the global save indicator. */
  notify?: boolean;
};

/** Wraps a disk write so the global save indicator reflects in-flight work. */
export async function trackPersist<T>(
  operation: () => Promise<T>,
  options?: PersistOptions,
): Promise<T> {
  const notify = options?.notify !== false;
  const { beginSave, endSave } = useSaveStatus.getState();
  if (notify) {
    beginSave();
  }
  try {
    const result = await operation();
    if (notify) {
      endSave(true);
    }
    return result;
  } catch (error) {
    if (notify) {
      endSave(false);
    }
    throw error;
  }
}
