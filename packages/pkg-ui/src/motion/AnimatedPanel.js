import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { panelSlideRight } from "./presets.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
export function AnimatedPanel({ isOpen, children, className, role = "complementary", }) {
    const reducedMotion = usePrefersReducedMotion();
    const variants = reducedMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : panelSlideRight;
    return (_jsx(AnimatePresence, { children: isOpen ? (_jsx(motion.aside, { role: role, className: clsx(className), variants: variants, initial: "hidden", animate: "visible", exit: "exit", children: children }, "animated-panel")) : null }));
}
