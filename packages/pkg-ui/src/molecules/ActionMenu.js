import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, } from "@heroui/react";
const menuPopoverClassName = "rounded-xl border border-wn-mono-700 bg-wn-mono-800 p-1 shadow-lg";
const menuListClassName = "bg-wn-mono-800";
const menuItemClassName = "text-wn-mono-100 data-[hover=true]:bg-wn-mono-700 data-[focus=true]:bg-wn-mono-700";
/**
 * HeroUI dropdown menu on `wn-mono-800` surface (WorldNote dark theme).
 */
export function ActionMenu({ ariaLabel, trigger, items, placement = "bottom-start", onAction, }) {
    return (_jsxs(Dropdown, { placement: placement, classNames: {
            content: menuPopoverClassName,
        }, children: [_jsx(DropdownTrigger, { children: trigger }), _jsx(DropdownMenu, { "aria-label": ariaLabel, onAction: onAction, classNames: {
                    base: menuListClassName,
                }, itemClasses: {
                    base: menuItemClassName,
                }, children: items.map((item) => (_jsx(DropdownItem, { startContent: item.icon, color: item.variant === "danger" ? "danger" : undefined, className: item.variant === "danger" ? "text-danger" : undefined, children: item.label }, item.id))) })] }));
}
