import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { panelSlideRight } from "./presets.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

export type AnimatedPanelProps = {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  role?: "complementary" | "dialog";
};

export function AnimatedPanel({
  isOpen,
  children,
  className,
  role = "complementary",
}: AnimatedPanelProps) {
  const reducedMotion = usePrefersReducedMotion();
  const variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : panelSlideRight;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="animated-panel"
          role={role}
          className={clsx(className)}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
