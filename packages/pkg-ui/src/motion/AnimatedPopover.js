import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { popoverScale } from "./presets.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
export function AnimatedPopover({ isOpen, children, className, }) {
    const reducedMotion = usePrefersReducedMotion();
    const variants = reducedMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : popoverScale;
    return (_jsx(AnimatePresence, { children: isOpen ? (_jsx(motion.div, { className: clsx(className), variants: variants, initial: "hidden", animate: "visible", exit: "exit", children: children }, "animated-popover")) : null }));
}
