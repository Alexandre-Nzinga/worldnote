/** Primary spring for overlays, panels, and screen transitions. */
export const springSnappy = {
    type: "spring",
    stiffness: 420,
    damping: 38,
    mass: 0.85,
};
/** Softer spring for staggered content and list items. */
export const springSoft = {
    type: "spring",
    stiffness: 480,
    damping: 32,
};
/** Step transitions (onboarding horizontal slides). */
export const stepTransition = springSnappy;
export const staggerFast = {
    staggerChildren: 0.07,
    delayChildren: 0.04,
};
/** Tap / press micro-interaction. */
export const tapTransition = {
    type: "spring",
    stiffness: 600,
    damping: 28,
};
