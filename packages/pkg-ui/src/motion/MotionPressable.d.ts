import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
export type MotionPressableProps = ComponentProps<typeof motion.button> & {
    children: ReactNode;
    /** Enable subtle hover scale (default true for card-like surfaces). */
    enableHover?: boolean;
};
/**
 * Native button with tap (and optional hover) scale feedback.
 * Use for custom press targets; prefer {@link Button} for HeroUI-styled actions.
 */
export declare function MotionPressable({ children, className, disabled, enableHover, ...props }: MotionPressableProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MotionPressable.d.ts.map