import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { PillTone } from "../Pill/Pill.js";
import { Pill } from "../Pill/Pill.js";

export type TagProps = {
  children: ReactNode;
  tone?: PillTone;
  /** Renders as a button for filter/tag clusters. */
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
} & Omit<ComponentProps<"span">, "children" | "className">;

const interactiveBaseClassName =
  "cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wn-azure-500 focus-visible:ring-offset-2 focus-visible:ring-offset-wn-mono-950 disabled:cursor-not-allowed disabled:opacity-50";

const selectedClassName =
  "ring-2 ring-wn-azure-500 ring-offset-2 ring-offset-wn-mono-950";

/** Compact pill tag for metadata and filter clusters (Alture-style). */
export function Tag({
  children,
  tone = "mono-dark",
  interactive = false,
  selected = false,
  disabled = false,
  onPress,
  className,
  ...props
}: TagProps) {
  const pillClassName = clsx(
    interactive && interactiveBaseClassName,
    selected && selectedClassName,
    className,
  );

  if (interactive) {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={selected}
        onClick={onPress}
        className={clsx("inline-flex shrink-0 border-0 bg-transparent p-0")}
      >
        <Pill tone={tone} size="md" className={pillClassName}>
          {children}
        </Pill>
      </button>
    );
  }

  return (
    <Pill tone={tone} size="md" className={pillClassName} {...props}>
      {children}
    </Pill>
  );
}
