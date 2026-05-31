import { Button as HeroUIButton } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "white" | "link" | "danger";
export type ButtonSize = "sm" | "base";
export type ButtonProps = Omit<ComponentProps<typeof HeroUIButton>, "variant" | "color" | "size" | "radius" | "children"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: ReactNode;
};
/** HeroUI button styled with WorldNote design tokens. */
export declare function Button({ variant, size, children, className, isDisabled, isIconOnly, fullWidth, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Button.d.ts.map