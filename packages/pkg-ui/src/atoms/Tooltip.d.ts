import type { ReactNode } from "react";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipProps = {
    /** Tooltip message */
    content: ReactNode;
    /** Plain-text trigger when `children` is omitted */
    label?: string;
    /** Custom trigger element (must be focusable or use a focusable child) */
    children?: ReactNode;
    placement?: TooltipPlacement;
    showArrow?: boolean;
    /** Distance from trigger in px */
    offset?: number;
    isDisabled?: boolean;
    className?: string;
    classNames?: {
        base?: string;
        content?: string;
        arrow?: string;
    };
};
/** Dark tooltip shown on hover or keyboard focus of the trigger. */
export declare function Tooltip({ content, label, children, placement, showArrow, offset, isDisabled, className, classNames, }: TooltipProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Tooltip.d.ts.map