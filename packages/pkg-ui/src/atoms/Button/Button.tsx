import { Button as HeroUIButton } from "@heroui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type HeroUIButtonProps = ComponentProps<typeof import("@heroui/react").Button>;
import { pressableTap } from "../../motion/presets.js";
import { tapTransition } from "../../motion/tokens.js";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion.js";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "white"
  | "link"
  | "danger";

export type ButtonSize = "sm" | "base";

export type ButtonIconChipPlacement = "start" | "end";

export type ButtonProps = Omit<
  HeroUIButtonProps,
  "variant" | "color" | "size" | "radius" | "children"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  /**
   * Circular icon badge inside the pill (Alture-style play/arrow affordance).
   * Rendered before/after label per `iconChipPlacement`. Also supports HeroUI
   * `startContent` / `endContent` for icons outside the chip.
   */
  iconChip?: ReactNode;
  iconChipPlacement?: ButtonIconChipPlacement;
};

type VariantConfig = {
  heroVariant: HeroUIButtonProps["variant"];
  heroColor?: HeroUIButtonProps["color"];
  className: string;
};

/** WorldNote button variants — all colors/radii from design tokens (tailwind.css). */
const variantConfig: Record<ButtonVariant, VariantConfig> = {
  primary: {
    heroVariant: "solid",
    heroColor: "primary",
    className:
      "border-0 bg-wn-azure-500 font-semibold text-wn-mono-50 shadow-none hover:bg-wn-azure-600 data-[hover=true]:bg-wn-azure-600",
  },
  white: {
    heroVariant: "solid",
    className:
      "border-0 bg-wn-mono-50 font-semibold text-wn-mono-950 shadow-none hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100",
  },
  secondary: {
    heroVariant: "bordered",
    className:
      "border-wn-mono-700 bg-wn-mono-950 font-semibold text-wn-mono-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-wn-mono-900 data-[hover=true]:bg-wn-mono-900",
  },
  tertiary: {
    heroVariant: "bordered",
    className:
      "border-wn-mono-700 bg-wn-mono-900 font-semibold text-wn-mono-200 hover:bg-wn-mono-800 data-[hover=true]:bg-wn-mono-800",
  },
  outline: {
    heroVariant: "bordered",
    className:
      "border-wn-mono-200 bg-wn-mono-50 font-medium text-wn-mono-700 hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100",
  },
  ghost: {
    heroVariant: "ghost",
    className:
      "border border-wn-mono-700 bg-transparent font-medium text-wn-mono-300 hover:bg-wn-mono-300/10 data-[hover=true]:bg-wn-mono-300/10",
  },
  link: {
    heroVariant: "light",
    className:
      "h-auto min-h-0 min-w-0 border-0 bg-transparent px-0 font-medium text-wn-mono-300 underline-offset-4 shadow-none hover:text-wn-mono-50 hover:underline data-[hover=true]:text-wn-mono-50 data-[hover=true]:underline",
  },
  danger: {
    heroVariant: "solid",
    heroColor: "danger",
    className:
      "border-0 !bg-wn-red-500 font-semibold text-wn-mono-50 shadow-none hover:!bg-wn-red-600 data-[hover=true]:!bg-wn-red-600",
  },
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "!h-auto min-h-9 rounded-full px-6 py-2 text-sm leading-normal",
  base: "!h-auto min-h-10 rounded-full px-8 py-2.5 text-base leading-normal",
};

const heroUiSize: Record<ButtonSize, "sm" | "md"> = {
  sm: "sm",
  base: "md",
};

const iconChipShellClassName =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wn-mono-50/15 text-current";

function renderIconChip(
  chip: ReactNode,
  placement: ButtonIconChipPlacement,
): ReactNode {
  return (
    <span className={iconChipShellClassName} data-placement={placement}>
      {chip}
    </span>
  );
}

/** HeroUI button styled with WorldNote design tokens. */
export function Button({
  variant = "primary",
  size = "base",
  children,
  className,
  isDisabled,
  isIconOnly,
  fullWidth,
  iconChip,
  iconChipPlacement = "start",
  startContent,
  endContent,
  ...props
}: ButtonProps) {
  const config = variantConfig[variant];
  const isLink = variant === "link";
  const reducedMotion = usePrefersReducedMotion();
  const canAnimate = !isDisabled && !isLink && !reducedMotion;
  const isFullWidth = Boolean(fullWidth) && !isLink && !isIconOnly;

  const chipAtStart =
    iconChip && iconChipPlacement === "start"
      ? renderIconChip(iconChip, "start")
      : null;
  const chipAtEnd =
    iconChip && iconChipPlacement === "end"
      ? renderIconChip(iconChip, "end")
      : null;

  const resolvedStartContent = chipAtStart ?? startContent;
  const resolvedEndContent = chipAtEnd ?? endContent;

  return (
    <motion.span
      className={clsx(
        "inline-flex shrink-0",
        isLink && "w-auto",
        isFullWidth && "w-full max-w-full",
      )}
      whileTap={canAnimate ? pressableTap : undefined}
      transition={tapTransition}
    >
      <HeroUIButton
        {...props}
        fullWidth={fullWidth}
        isDisabled={isDisabled}
        variant={config.heroVariant}
        color={config.heroColor}
        size={heroUiSize[size]}
        radius="full"
        startContent={resolvedStartContent}
        endContent={resolvedEndContent}
        classNames={{
          base: "gap-2",
        }}
        className={clsx(
          !isLink && sizeClass[size],
          config.className,
          className,
        )}
      >
        {children}
      </HeroUIButton>
    </motion.span>
  );
}
