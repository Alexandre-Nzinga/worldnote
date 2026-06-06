import type { Variants } from "framer-motion";
import { springSnappy, springSoft, staggerFast } from "./tokens.js";

export type StepDirection = 1 | -1;

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: { duration: 0.15 },
  },
};

export const panelSlideRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: 0.15 },
  },
};

export const popoverScale: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 2,
    transition: { duration: 0.12 },
  },
};

export const cardEnter: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
};

export const screenFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

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

export const contentStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerFast,
  },
};

export const contentItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
};

/** Ensures the primary action stays visible even if stagger is interrupted. */
export const actionItemVariants: Variants = {
  hidden: { opacity: 1, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
};

export const pressableTap = {
  scale: 0.97,
};

export const pressableHover = {
  scale: 1.01,
};
