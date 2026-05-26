/** Primary spring for overlays, panels, and screen transitions. */
export declare const springSnappy: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
};
/** Softer spring for staggered content and list items. */
export declare const springSoft: {
    type: "spring";
    stiffness: number;
    damping: number;
};
/** Step transitions (onboarding horizontal slides). */
export declare const stepTransition: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
};
export declare const staggerFast: {
    staggerChildren: number;
    delayChildren: number;
};
/** Tap / press micro-interaction. */
export declare const tapTransition: {
    type: "spring";
    stiffness: number;
    damping: number;
};
//# sourceMappingURL=tokens.d.ts.map