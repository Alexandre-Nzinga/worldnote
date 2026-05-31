import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
/** Google Material Symbols Outlined icon (ligature font). */
export function MaterialSymbol({ name, className, filled = false, }) {
    return (_jsx("span", { className: clsx("material-symbols-outlined select-none leading-none", className), style: {
            fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        }, "aria-hidden": true, children: name }));
}
