import type { Variants } from "framer-motion";
export type StepDirection = 1 | -1;
export declare const overlayFade: Variants;
export declare const modalPanel: Variants;
export declare const panelSlideRight: Variants;
export declare const popoverScale: Variants;
export declare const cardEnter: Variants;
export declare const screenFade: Variants;
export declare const stepTransitionVariants: {
    enter: (direction: StepDirection) => {
        x: number;
        opacity: number;
    };
    center: {
        x: number;
        opacity: number;
    };
    exit: (direction: StepDirection) => {
        x: number;
        opacity: number;
    };
};
export declare const contentStaggerVariants: Variants;
export declare const contentItemVariants: Variants;
/** Ensures the primary action stays visible even if stagger is interrupted. */
export declare const actionItemVariants: Variants;
export declare const pressableTap: {
    scale: number;
};
export declare const pressableHover: {
    scale: number;
};
//# sourceMappingURL=presets.d.ts.map