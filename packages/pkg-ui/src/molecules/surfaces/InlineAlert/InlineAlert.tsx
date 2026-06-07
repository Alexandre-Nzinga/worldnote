import clsx from "clsx";
import type { ReactNode } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";

export type InlineAlertTone = "warning" | "danger" | "info";

export type InlineAlertProps = {
  tone?: InlineAlertTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

const toneConfig: Record<
  InlineAlertTone,
  {
    container: string;
    icon: string;
    iconName: "warning" | "error" | "info";
  }
> = {
  warning: {
    container: "border-wn-amber-500/35 bg-wn-amber-500/10 text-wn-text",
    icon: "text-wn-amber-400",
    iconName: "warning",
  },
  danger: {
    container: "border-wn-red-500/35 bg-wn-red-500/10 text-wn-text",
    icon: "text-wn-red-400",
    iconName: "error",
  },
  info: {
    container: "border-wn-border-strong bg-wn-surface-sunken text-wn-text",
    icon: "text-wn-text-muted",
    iconName: "info",
  },
};

/** Bordered inline notice for warnings, errors, and contextual hints. */
export function InlineAlert({
  tone = "warning",
  title,
  children,
  className,
}: InlineAlertProps) {
  const config = toneConfig[tone];

  return (
    <div
      role="alert"
      className={clsx(
        "flex gap-3 rounded-xl border px-4 py-3.5",
        config.container,
        className,
      )}
    >
      <MaterialSymbol
        name={config.iconName}
        className={clsx("mt-0.5 shrink-0 text-xl", config.icon)}
        aria-hidden
      />
      <div className="min-w-0 flex flex-col gap-1">
        {title ? (
          <p className="text-sm font-wn-semibold text-wn-text">{title}</p>
        ) : null}
        <div className="text-sm leading-relaxed text-wn-text-muted [&_strong]:font-wn-medium [&_strong]:text-wn-text">
          {children}
        </div>
      </div>
    </div>
  );
}
