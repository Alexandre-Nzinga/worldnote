import { create } from "zustand";

export type ToastKind = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastState = {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string) => string;
  dismiss: (id: string) => void;
};

const DEFAULT_DURATION_MS: Record<ToastKind, number> = {
  info: 3500,
  success: 3000,
  warning: 4500,
  error: 5000,
};

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleDismiss(id: string, kind: ToastKind, dismiss: (id: string) => void) {
  const existing = dismissTimers.get(id);
  if (existing) {
    clearTimeout(existing);
  }
  const timer = setTimeout(() => {
    dismissTimers.delete(id);
    dismiss(id);
  }, DEFAULT_DURATION_MS[kind]);
  dismissTimers.set(id, timer);
}

let toastCounter = 0;

function nextToastId(): string {
  toastCounter += 1;
  return `toast-${toastCounter}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return "";
    }
    const id = nextToastId();
    set((state) => ({
      toasts: [...state.toasts, { id, kind, message: trimmed }],
    }));
    scheduleDismiss(id, kind, get().dismiss);
    return id;
  },
  dismiss: (id) => {
    const timer = dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const toast = {
  info: (message: string) => useToastStore.getState().push("info", message),
  success: (message: string) => useToastStore.getState().push("success", message),
  warning: (message: string) => useToastStore.getState().push("warning", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
