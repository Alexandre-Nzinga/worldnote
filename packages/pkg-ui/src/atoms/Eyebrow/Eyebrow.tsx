import clsx from "clsx";
import type { ComponentProps, ElementType, ReactNode } from "react";

export type EyebrowTone = "azure" | "mono";

export type EyebrowProps<T extends ElementType = "span"> = {
  children: ReactNode;
  /** Accent color for the leading dot. */
  tone?: EyebrowTone;
  /** Show a small dot before the label (Alture-style section marker). */
  showDot?: boolean;
  as?: T;
  className?: string;
} & Omit<ComponentProps<T>, "as" | "children" | "className">;

const dotToneClassNames: Record<EyebrowTone, string> = {
  azure: "bg-wn-azure-500",
  mono: "bg-wn-mono-400",
};

/** Base classes for uppercase monospace section labels (see 00-brand/Typography). */
export const eyebrowClassName =
  "inline-flex items-center gap-2 font-mono text-wn-xs font-wn-medium uppercase tracking-[0.12em] text-wn-mono-500";

/** Uppercase monospace section label with optional leading dot. */
export function Eyebrow<T extends ElementType = "span">({
  children,
  tone = "mono",
  showDot = true,
  as,
  className,
  ...props
}: EyebrowProps<T>) {
  const Component: ElementType = as ?? "span";

  return (
    <Component className={clsx(eyebrowClassName, className)} {...props}>
      {showDot ? (
        <span
          className={clsx(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dotToneClassNames[tone],
          )}
          aria-hidden
        />
      ) : null}
      {children}
    </Component>
  );
}
