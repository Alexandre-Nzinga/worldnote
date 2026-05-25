import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { popoverScale } from "./presets.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

export type AnimatedPopoverProps = {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
};

export function AnimatedPopover({
  isOpen,
  children,
  className,
}: AnimatedPopoverProps) {
  const reducedMotion = usePrefersReducedMotion();
  const variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : popoverScale;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="animated-popover"
          className={clsx(className)}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
