import type { ComponentProps, ReactNode } from "react";
/** Preset fills for card-type badges, tags, and metadata chips. */
export type PillTone = "mono" | "mono-dark" | "azure" | "indigo" | "amber" | "lime" | "rose" | "outline";
export type PillSize = "sm" | "md";
export type PillProps = ComponentProps<"span"> & {
    children: ReactNode;
    /** Optional preset background + text colors from design tokens. */
    tone?: PillTone;
    size?: PillSize;
    /** Text color when using a custom `className` background (default: dark on light fills). */
    textClassName?: string;
};
/** Rounded pill label for card types, tags, and compact metadata. */
export declare function Pill({ children, tone, size, textClassName, className, ...props }: PillProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Pill.d.ts.map