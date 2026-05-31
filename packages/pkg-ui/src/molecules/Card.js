import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
/** Card with an optional bordered header section separated from the body. */
export function Card({ title, subtitle, children, className }) {
    const hasHeader = Boolean(title);
    const hasBody = children != null && children !== false;
    return (_jsxs("article", { className: clsx("overflow-hidden rounded-wn-card border border-wn-mono-200 bg-wn-mono-50 text-wn-mono-950", className), children: [hasHeader ? (_jsxs("header", { className: clsx("px-4 py-3", hasBody && "border-b border-wn-mono-200"), children: [_jsx("h3", { className: "text-wn-body font-wn-semibold leading-snug text-wn-mono-950", children: title }), subtitle ? (_jsx("p", { className: "mt-1 text-wn-small leading-snug text-wn-mono-500", children: subtitle })) : null] })) : null, hasBody ? (_jsx("div", { className: "px-4 py-3 text-wn-small leading-relaxed text-wn-mono-900", children: children })) : null] }));
}
