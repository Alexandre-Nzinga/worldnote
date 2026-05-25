import type { Variants } from "framer-motion";

/** Instant opacity-only variants when user prefers reduced motion. */
export function reducedMotionVariants(
  reduced: boolean,
  full: Variants,
  instant: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
): Variants {
  return reduced ? instant : full;
}
