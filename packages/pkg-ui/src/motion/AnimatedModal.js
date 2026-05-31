import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { modalPanel, overlayFade } from "./presets.js";
import { springSnappy } from "./tokens.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
const defaultDialogClassName = "fixed inset-0 z-modal m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4";
const defaultPanelClassName = "relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl";
export function AnimatedModal({ isOpen, onClose, children, closeDisabled = false, backdropLabel = "Close dialog", labelledBy, className, panelClassName, }) {
    const reducedMotion = usePrefersReducedMotion();
    const dialogRef = useRef(null);
    useLayoutEffect(() => {
        const node = dialogRef.current;
        if (!node || !isOpen) {
            return;
        }
        if (!node.open) {
            node.showModal();
        }
    }, [isOpen]);
    useLayoutEffect(() => () => {
        const node = dialogRef.current;
        if (node?.open) {
            node.close();
        }
    }, []);
    const requestClose = () => {
        if (!closeDisabled) {
            onClose();
        }
    };
    const handleDialogClose = (event) => {
        event.preventDefault();
        requestClose();
    };
    const handleExitComplete = () => {
        const node = dialogRef.current;
        if (node?.open) {
            node.close();
        }
    };
    if (typeof document === "undefined") {
        return null;
    }
    return createPortal(_jsx(AnimatePresence, { onExitComplete: handleExitComplete, children: isOpen ? (_jsxs("dialog", { ref: dialogRef, "aria-labelledby": labelledBy, className: className ?? defaultDialogClassName, onClose: handleDialogClose, onCancel: handleDialogClose, children: [_jsx(motion.button, { type: "button", className: "absolute inset-0 bg-wn-mono-950/80 backdrop-blur-sm", "aria-label": backdropLabel, disabled: closeDisabled, onClick: requestClose, variants: overlayFade, initial: "hidden", animate: "visible", exit: "exit", transition: reducedMotion ? { duration: 0 } : springSnappy }), _jsx(motion.div, { className: panelClassName ?? defaultPanelClassName, variants: reducedMotion
                        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
                        : modalPanel, initial: "hidden", animate: "visible", exit: "exit", children: children })] }, "animated-modal")) : null }), document.body);
}
