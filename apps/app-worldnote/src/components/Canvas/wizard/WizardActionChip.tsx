import { MaterialSymbol, Tooltip } from "@worldnote/ui";
import type { ReactNode } from "react";
import { cx } from "./cx.js";

export const wizardActionChipClassName = cx(
  "inline-flex items-center gap-1.5 rounded-full border border-wn-mono-700 bg-wn-mono-950 px-3 py-1.5",
  "text-xs font-medium text-wn-mono-200 transition-colors",
  "hover:border-wn-mono-50 hover:text-wn-mono-50",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type WizardActionChipProps = {
  icon: string;
  label: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  tooltip?: ReactNode;
  "aria-label"?: string;
  onClick: () => void;
};

export function WizardActionChipSpinner() {
  return (
    <span
      aria-hidden
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-wn-mono-600 border-t-wn-mono-200" />
    </span>
  );
}

function WizardActionChipIcon({ name }: { name: string }) {
  return (
    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
      <MaterialSymbol name={name} filled className="text-sm leading-none" />
    </span>
  );
}

export function WizardActionChip({
  icon,
  label,
  disabled = false,
  busy = false,
  tooltip,
  "aria-label": ariaLabel,
  onClick,
}: WizardActionChipProps) {
  const button = (
    <button
      type="button"
      className={wizardActionChipClassName}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={busy}
    >
      {busy ? <WizardActionChipSpinner /> : <WizardActionChipIcon name={icon} />}
      {label}
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip content={tooltip} placement="top">
      <span className="inline-flex">{button}</span>
    </Tooltip>
  );
}
