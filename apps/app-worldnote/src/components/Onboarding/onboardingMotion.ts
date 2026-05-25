export type StepDirection = 1 | -1;

export const stepTransitionVariants = {
  enter: (direction: StepDirection) => ({
    x: direction > 0 ? 56 : -56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: StepDirection) => ({
    x: direction > 0 ? -56 : 56,
    opacity: 0,
  }),
};

export const stepTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 38,
  mass: 0.85,
};

export const contentStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const contentItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 480,
      damping: 32,
    },
  },
};

/** Ensures the primary action stays visible even if stagger is interrupted. */
export const actionItemVariants = {
  hidden: { opacity: 1, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 480,
      damping: 32,
    },
  },
};
