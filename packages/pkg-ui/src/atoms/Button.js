import { jsx as _jsx } from "react/jsx-runtime";
import { Button as HeroUIButton } from "@heroui/react";
import clsx from "clsx";
/** WorldNote button variants — all colors/radii from design tokens (tailwind.css). */
const variantConfig = {
    primary: {
        heroVariant: "solid",
        heroColor: "primary",
        className: "border-0 bg-wn-azure-500 font-semibold text-wn-mono-50 shadow-none hover:bg-wn-azure-600 data-[hover=true]:bg-wn-azure-600",
    },
    white: {
        heroVariant: "solid",
        className: "border-0 bg-wn-mono-50 font-semibold text-wn-mono-950 shadow-none hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100",
    },
    secondary: {
        heroVariant: "bordered",
        className: "border-wn-mono-700 bg-wn-mono-950 font-semibold text-wn-mono-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-wn-mono-900 data-[hover=true]:bg-wn-mono-900",
    },
    tertiary: {
        heroVariant: "bordered",
        className: "border-wn-mono-700 bg-wn-mono-900 font-semibold text-wn-mono-200 hover:bg-wn-mono-800 data-[hover=true]:bg-wn-mono-800",
    },
    outline: {
        heroVariant: "bordered",
        className: "border-wn-mono-200 bg-wn-mono-50 font-medium text-wn-mono-700 hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100",
    },
    ghost: {
        heroVariant: "ghost",
        className: "border border-wn-mono-700 bg-transparent font-medium text-wn-mono-300 hover:bg-wn-mono-300/10 data-[hover=true]:bg-wn-mono-300/10",
    },
    link: {
        heroVariant: "light",
        className: "h-auto min-h-0 min-w-0 border-0 bg-transparent px-0 font-medium text-wn-mono-300 underline-offset-4 shadow-none hover:text-wn-mono-50 hover:underline data-[hover=true]:text-wn-mono-50 data-[hover=true]:underline",
    },
    danger: {
        heroVariant: "solid",
        heroColor: "danger",
        className: "border-0 bg-wn-red-500 font-semibold text-wn-mono-50 hover:bg-wn-red-600 data-[hover=true]:bg-wn-red-600",
    },
};
const sizeClass = {
    sm: "h-9 min-h-9 rounded-full px-6 text-sm",
    base: "h-10 min-h-10 rounded-full px-8 text-base leading-normal",
};
const heroUiSize = {
    sm: "sm",
    base: "md",
};
/** HeroUI button styled with WorldNote design tokens. */
export function Button({ variant = "primary", size = "base", children, className, ...props }) {
    const config = variantConfig[variant];
    const isLink = variant === "link";
    return (_jsx(HeroUIButton, { ...props, variant: config.heroVariant, color: config.heroColor, size: heroUiSize[size], radius: "full", className: clsx(!isLink && sizeClass[size], config.className, className), children: children }));
}
