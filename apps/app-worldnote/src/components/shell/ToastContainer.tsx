import {
  MaterialSymbol,
  getBodyTextStyle,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import type { ToastItem, ToastKind } from "../../services/notifications/toast.js";
import { useToastStore } from "../../services/notifications/toast.js";

const toastMotion = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
};

const toastShellClass: Record<ToastKind, string> = {
  info: "border border-wn-border bg-wn-surface/95 text-wn-text",
  success: "border border-wn-lime-500/30 bg-wn-lime-950/90 text-wn-lime-100",
  warning: "border border-wn-amber-500/35 bg-wn-amber-950/90 text-wn-amber-100",
  error: "border border-wn-red-400/35 bg-wn-red-950/90 text-wn-red-100",
};

const toastIconName: Record<ToastKind, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
};

function ToastEntry({
  toast,
  onDismiss,
  reducedMotion,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      layout={!reducedMotion}
      className={`pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl px-3.5 py-2.5 shadow-lg backdrop-blur-sm ${toastShellClass[toast.kind]}`}
      initial={reducedMotion ? false : toastMotion.initial}
      animate={toastMotion.animate}
      exit={reducedMotion ? undefined : toastMotion.exit}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <MaterialSymbol
        name={toastIconName[toast.kind]}
        className="mt-0.5 shrink-0 text-base"
        aria-hidden
      />
      <p className="min-w-0 flex-1" style={getBodyTextStyle("small")}>
        {toast.message}
      </p>
      <button
        type="button"
        className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <MaterialSymbol name="close" className="text-base" />
      </button>
    </motion.div>
  );
}

/** Global toast stack for transient feedback (pin limits, wizard errors, etc.). */
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastEntry
            key={item.id}
            toast={item}
            onDismiss={dismiss}
            reducedMotion={reducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
