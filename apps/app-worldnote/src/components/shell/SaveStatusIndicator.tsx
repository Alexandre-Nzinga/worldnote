import {
  MaterialSymbol,
  getBodyTextStyle,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useSaveStatus } from "../../hooks/useSaveStatus.js";

const indicatorMotion = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.96 },
};

const statusCopy = {
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save",
} as const;

const statusShellClass = {
  saving:
    "border border-wn-border bg-wn-surface/95 px-3 py-1.5 shadow-sm backdrop-blur-sm",
  saved: "bg-wn-lime-600/90 px-4 py-2 shadow-lg",
  error:
    "border border-wn-red-400/40 bg-wn-surface/95 px-3 py-1.5 shadow-sm backdrop-blur-sm",
} as const;

const statusTextClass = {
  saving: "text-wn-text-muted",
  saved: "text-white",
  error: "text-wn-text-muted",
} as const;

function StatusIcon({ status }: { status: "saving" | "saved" | "error" }) {
  if (status === "saving") {
    return (
      <span
        aria-hidden
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
      >
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-wn-mono-500 border-t-wn-mono-200" />
      </span>
    );
  }

  if (status === "saved") {
    return (
      <MaterialSymbol
        name="check_circle"
        className="shrink-0 text-lg text-white"
        aria-hidden
      />
    );
  }

  return (
    <MaterialSymbol
      name="error"
      className="shrink-0 text-base text-wn-red-400"
      aria-hidden
    />
  );
}

/** Global feedback when card or world content is written to disk. */
export function SaveStatusIndicator() {
  const status = useSaveStatus((state) => state.status);
  const reducedMotion = usePrefersReducedMotion();
  const visible = status !== "idle";

  return (
    <div
      className="pointer-events-none fixed top-4 left-1/2 z-50 -translate-x-1/2"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {visible ? (
          <motion.output
            key={status}
            className={`flex items-center gap-2 rounded-full ${statusShellClass[status]}`}
            initial={reducedMotion ? false : indicatorMotion.initial}
            animate={indicatorMotion.animate}
            exit={reducedMotion ? undefined : indicatorMotion.exit}
            transition={{
              duration: reducedMotion ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <StatusIcon status={status} />
            <span
              style={getBodyTextStyle(status === "saved" ? "body" : "small")}
              className={statusTextClass[status]}
            >
              {statusCopy[status]}
            </span>
          </motion.output>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
