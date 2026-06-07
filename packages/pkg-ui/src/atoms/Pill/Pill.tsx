import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/** Preset fills for card-type badges, tags, and metadata chips. */
export type PillTone =
  | "mono"
  | "mono-dark"
  | "azure"
  | "indigo"
  | "amber"
  | "lime"
  | "rose"
  | "outline";

export type PillSize = "sm" | "md";

export type PillProps = ComponentProps<"span"> & {
  children: ReactNode;
  /** Optional preset background + text colors from design tokens. */
  tone?: PillTone;
  size?: PillSize;
  /** Text color when using a custom `className` background (default: dark on light fills). */
  textClassName?: string;
};

const pillToneClassNames: Record<PillTone, string> = {
  mono: "bg-wn-mono-300 text-wn-mono-950",
  "mono-dark": "bg-wn-mono-800 text-wn-mono-50",
  azure: "bg-wn-azure-200 text-wn-mono-950",
  indigo: "bg-wn-indigo-200 text-wn-mono-950",
  amber: "bg-wn-amber-200 text-wn-mono-950",
  lime: "bg-wn-lime-300 text-wn-mono-950",
  rose: "bg-wn-rose-300 text-wn-mono-950",
  outline: "border border-wn-mono-700 bg-wn-mono-950 text-wn-mono-400",
};

const pillSizeClassNames: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

/** Rounded pill label for card types, tags, and compact metadata. */
export function Pill({
  children,
  tone,
  size = "md",
  textClassName,
  className,
  ...props
}: PillProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-full font-semibold",
        pillSizeClassNames[size],
        tone ? pillToneClassNames[tone] : (textClassName ?? "text-wn-mono-950"),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
