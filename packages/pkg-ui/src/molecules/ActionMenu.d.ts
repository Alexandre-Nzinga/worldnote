import type { Key, ReactNode } from "react";
export type ActionMenuPlacement = "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end" | "right-start" | "right-end";
export type ActionMenuItem = {
    id: string;
    label: string;
    /** Shown before the label (HeroUI v2 `startContent`; v3 uses a child icon). */
    icon?: ReactNode;
    variant?: "default" | "danger";
};
export type ActionMenuProps = {
    /** Accessible name for the menu list. */
    ariaLabel: string;
    /** Pressable element that opens the menu (e.g. HeroUI `Button`). */
    trigger: ReactNode;
    items: ActionMenuItem[];
    placement?: ActionMenuPlacement;
    onAction: (key: Key) => void;
};
/**
 * HeroUI dropdown menu on `wn-mono-800` surface (WorldNote dark theme).
 */
export declare function ActionMenu({ ariaLabel, trigger, items, placement, onAction, }: ActionMenuProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ActionMenu.d.ts.map