import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { modalPanel, overlayFade } from "./presets.js";
import { springSnappy } from "./tokens.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

export type AnimatedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Disables backdrop click (e.g. while submitting). */
  closeDisabled?: boolean;
  /** Backdrop button aria-label. */
  backdropLabel?: string;
  /** id for aria-labelledby on dialog. */
  labelledBy?: string;
  className?: string;
  panelClassName?: string;
};

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  closeDisabled = false,
  backdropLabel = "Close dialog",
  labelledBy,
  className,
  panelClassName,
}: AnimatedModalProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <dialog
          key="animated-modal"
          open
          aria-labelledby={labelledBy}
          className={
            className ??
            "fixed inset-0 z-100 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
          }
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-wn-mono-950/80 backdrop-blur-sm"
            aria-label={backdropLabel}
            disabled={closeDisabled}
            onClick={onClose}
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={reducedMotion ? { duration: 0 } : springSnappy}
          />
          <motion.div
            className={
              panelClassName ??
              "relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl"
            }
            variants={
              reducedMotion
                ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
                : modalPanel
            }
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </dialog>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
