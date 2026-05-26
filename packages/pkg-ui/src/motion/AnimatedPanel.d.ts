import type { ReactNode } from "react";
export type AnimatedPanelProps = {
    isOpen: boolean;
    children: ReactNode;
    className?: string;
    role?: "complementary" | "dialog";
};
export declare function AnimatedPanel({ isOpen, children, className, role, }: AnimatedPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AnimatedPanel.d.ts.map