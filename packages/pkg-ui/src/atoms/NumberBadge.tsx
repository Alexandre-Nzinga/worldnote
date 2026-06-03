import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export type NumberBadgeTone = "azure" | "mono";
export type NumberBadgeSize = "sm" | "md";

export type NumberBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  value: ReactNode;
  tone?: NumberBadgeTone;
  size?: NumberBadgeSize;
};

const toneClassNames: Record<NumberBadgeTone, string> = {
  azure: "bg-wn-azure-500 text-wn-mono-50",
  mono: "bg-wn-mono-800 text-wn-mono-50",
};

const sizeClassNames: Record<NumberBadgeSize, string> = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
};

/** Circular index badge for numbered lists and FAQ items. */
export function NumberBadge({
  value,
  tone = "azure",
  size = "md",
  className,
  ...props
}: NumberBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums",
        toneClassNames[tone],
        sizeClassNames[size],
        className,
      )}
      {...props}
    >
      {value}
    </span>
  );
}
