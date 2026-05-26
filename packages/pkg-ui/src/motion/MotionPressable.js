import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import clsx from "clsx";
import { pressableHover, pressableTap } from "./presets.js";
import { tapTransition } from "./tokens.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
/**
 * Native button with tap (and optional hover) scale feedback.
 * Use for custom press targets; prefer {@link Button} for HeroUI-styled actions.
 */
export function MotionPressable({ children, className, disabled, enableHover = false, ...props }) {
    const reducedMotion = usePrefersReducedMotion();
    const canAnimate = !disabled && !reducedMotion;
    return (_jsx(motion.button, { type: "button", disabled: disabled, className: clsx(className), whileTap: canAnimate ? pressableTap : undefined, whileHover: canAnimate && enableHover ? pressableHover : undefined, transition: tapTransition, ...props, children: children }));
}
