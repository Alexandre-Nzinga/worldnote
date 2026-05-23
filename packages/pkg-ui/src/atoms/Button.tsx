import { Button as HeroUIButton } from "@heroui/react";
import clsx from "clsx";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  /** Visual style mapped to WorldNote color tokens. */
  variant?: ButtonVariant;
  /** Height, padding, and type scale. */
  size?: ButtonSize;
  /** Button label or icon content. */
  children: ReactNode;
  /** Disables interaction and lowers opacity. */
  isDisabled?: boolean;
  /** Stretches the button to the width of its container. */
  fullWidth?: boolean;
  /** Square icon-only layout; pair with `aria-label`. */
  isIconOnly?: boolean;
  onPress?: () => void;
  className?: string;
  /** Required for meaningful `isIconOnly` buttons (screen readers). */
  "aria-label"?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border border-wn-mono-800 bg-gradient-to-b from-wn-indigo-950 to-wn-mono-950 text-wn-mono-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(2,6,23,0.45)] hover:brightness-110 data-[hover=true]:brightness-110",
  secondary:
    "border border-wn-mono-700 bg-wn-mono-950 text-wn-mono-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-wn-mono-900 data-[hover=true]:bg-wn-mono-900",
  ghost:
    "border border-wn-mono-700 bg-transparent text-wn-mono-300 hover:bg-wn-mono-300/10 data-[hover=true]:bg-wn-mono-300/10",
  danger:
    "bg-wn-red-500 text-wn-mono-50 hover:bg-wn-red-600 data-[hover=true]:bg-wn-red-600",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 min-h-9 rounded-full px-4 text-sm font-medium",
  md: "h-11 min-h-11 rounded-full px-6 text-base font-semibold",
  lg: "h-12 min-h-12 rounded-full px-7 text-lg font-semibold tracking-tight",
};

/** HeroUI button with WorldNote variants (mono / red scales). */
export function Button({
  variant = "primary",
  size = "md",
  children,
  isDisabled,
  fullWidth,
  isIconOnly,
  className,
  onPress,
  "aria-label": ariaLabel,
}: ButtonProps) {
  return (
    <HeroUIButton
      size={size}
      radius="full"
      isDisabled={isDisabled}
      fullWidth={fullWidth}
      isIconOnly={isIconOnly}
      variant="solid"
      className={clsx(sizeClass[size], variantClass[variant], className)}
      onPress={onPress}
      aria-label={ariaLabel}
    >
      {children}
    </HeroUIButton>
  );
}
