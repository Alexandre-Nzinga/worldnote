import type { ReactNode } from "react";
export type AnimatedModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    /** Disables backdrop click (e.g. while submitting). */
    closeDisabled?: boolean;
    /** Backdrop button aria-label. */
    backdropLabel?: string;
    /** id for aria-labelledby on dialog. */
    labelledBy?: string;
    className?: string;
    panelClassName?: string;
};
export declare function AnimatedModal({ isOpen, onClose, children, closeDisabled, backdropLabel, labelledBy, className, panelClassName, }: AnimatedModalProps): import("react").ReactPortal | null;
//# sourceMappingURL=AnimatedModal.d.ts.map