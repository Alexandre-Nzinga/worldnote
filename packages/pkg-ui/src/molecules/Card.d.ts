import type { ReactNode } from "react";
export type CardProps = {
    /** Header title */
    title?: string;
    /** Optional supporting line in the header */
    subtitle?: string;
    /** Body content below the header divider */
    children?: ReactNode;
    className?: string;
};
/** Card with an optional bordered header section separated from the body. */
export declare function Card({ title, subtitle, children, className }: CardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Card.d.ts.map