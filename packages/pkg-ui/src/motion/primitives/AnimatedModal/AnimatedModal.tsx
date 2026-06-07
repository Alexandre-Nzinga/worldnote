import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode, SyntheticEvent } from "react";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { modalPanel, overlayFade } from "../../foundation/presets.js";
import { springSnappy } from "../../foundation/tokens.js";
import { usePrefersReducedMotion } from "../../foundation/usePrefersReducedMotion.js";

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
  /** Ignore backdrop dismiss for this many ms after open (avoids same-gesture close). */
  backdropDismissGuardMs?: number;
};

const defaultDialogClassName =
  "fixed inset-0 z-modal m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4";

const defaultPanelClassName =
  "relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl";

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  closeDisabled = false,
  backdropLabel = "Close dialog",
  labelledBy,
  className,
  panelClassName,
  backdropDismissGuardMs = 0,
}: AnimatedModalProps) {
  const reducedMotion = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedAtRef = useRef(0);

  useLayoutEffect(() => {
    const node = dialogRef.current;
    if (!node || !isOpen) {
      return;
    }
    openedAtRef.current = Date.now();
    if (!node.open) {
      node.showModal();
    }
  }, [isOpen]);

  useLayoutEffect(
    () => () => {
      const node = dialogRef.current;
      if (node?.open) {
        node.close();
      }
    },
    [],
  );

  const requestClose = () => {
    if (closeDisabled) {
      return;
    }
    if (
      backdropDismissGuardMs > 0 &&
      Date.now() - openedAtRef.current < backdropDismissGuardMs
    ) {
      return;
    }
    onClose();
  };

  const handleDialogClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (
      backdropDismissGuardMs > 0 &&
      Date.now() - openedAtRef.current < backdropDismissGuardMs
    ) {
      return;
    }
    requestClose();
  };

  const handleExitComplete = () => {
    const node = dialogRef.current;
    if (node?.open) {
      node.close();
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen ? (
        <dialog
          ref={dialogRef}
          key="animated-modal"
          aria-labelledby={labelledBy}
          className={className ?? defaultDialogClassName}
          onClose={handleDialogClose}
          onCancel={handleDialogClose}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-wn-mono-950/80 backdrop-blur-sm"
            aria-label={backdropLabel}
            disabled={closeDisabled}
            onClick={requestClose}
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={reducedMotion ? { duration: 0 } : springSnappy}
          />
          <motion.div
            className={panelClassName ?? defaultPanelClassName}
            variants={
              reducedMotion
                ? {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                    exit: { opacity: 0 },
                  }
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
