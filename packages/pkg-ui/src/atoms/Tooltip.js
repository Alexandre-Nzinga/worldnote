import { jsx as _jsx } from "react/jsx-runtime";
import { Tooltip as HeroUITooltip } from "@heroui/react";
import clsx from "clsx";
const tooltipBaseClass = "!rounded-md !border-0 !bg-wn-mono-950 !px-3 !py-1.5 !text-sm !font-semibold !text-wn-mono-50";
const tooltipArrowClass = "!bg-wn-mono-950 !fill-wn-mono-950";
const textTriggerClass = "cursor-default border-0 bg-transparent p-0 font-inherit text-wn-mono-950 outline-none focus-visible:ring-2 focus-visible:ring-wn-indigo-500 focus-visible:ring-offset-2";
/** Dark tooltip shown on hover or keyboard focus of the trigger. */
export function Tooltip({ content, label = "Hover or focus me", children, placement = "top", showArrow = true, offset = 10, isDisabled, className, classNames, }) {
    const trigger = children ??
        (label ? (_jsx("button", { type: "button", className: textTriggerClass, children: label })) : null);
    return (_jsx(HeroUITooltip, { content: content, placement: placement, showArrow: showArrow, offset: offset, radius: "md", shadow: "none", color: "default", isDisabled: isDisabled, closeDelay: 0, className: className, classNames: {
            base: clsx(tooltipBaseClass, classNames?.base),
            content: clsx("!font-semibold !text-wn-mono-50", classNames?.content),
            arrow: clsx(tooltipArrowClass, classNames?.arrow),
        }, children: trigger }));
}
